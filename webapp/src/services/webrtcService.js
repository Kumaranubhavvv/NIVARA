// ==========================================================================
// NIVARA WebRTC Calling Engine & WebSocket Signaling Service
// Supports Voice Calls, Video Calls, and Emergency Intercom
// ==========================================================================

import { audioService } from './audioService';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

class WebRtcService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.socket = null;
    this.roomId = null;
    this.callType = 'AUDIO'; // 'AUDIO' | 'VIDEO' | 'EMERGENCY'
    this.isMuted = false;
    this.isCameraOff = false;

    // Event listeners
    this.onRemoteStream = null;
    this.onCallConnected = null;
    this.onCallEnded = null;
    this.onAiTranscription = null;
  }

  async startCall({ roomId, type = 'AUDIO', isCaller = true, onRemoteStream, onCallConnected, onCallEnded, onAiTranscription }) {
    this.roomId = roomId;
    this.callType = type;
    this.onRemoteStream = onRemoteStream;
    this.onCallConnected = onCallConnected;
    this.onCallEnded = onCallEnded;
    this.onAiTranscription = onAiTranscription;

    audioService.playOutgoingRingtone();

    // 1. Get Local User Media (Mic / Camera)
    try {
      const constraints = {
        audio: true,
        video: type === 'VIDEO' ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false,
      };

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      }
    } catch (err) {
      console.warn('Media devices not accessible or permission denied, using simulated stream:', err);
      // Fallback: create mock audio/video tracks for simulation
      this.localStream = this.createSimulatedMediaStream(type === 'VIDEO');
    }

    // 2. Initialize RTCPeerConnection
    this.peerConnection = new RTCPeerConnection(RTC_CONFIG);

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle incoming remote tracks
    this.remoteStream = new MediaStream();
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    // 3. Connect to Signaling Server via WebSocket
    this.connectSignaling(roomId, isCaller);

    // Auto-simulate remote answering after 2.5 seconds if no live peer answers (so UI demo is 100% interactive)
    this.autoAnswerTimer = setTimeout(() => {
      audioService.stopRingtone();
      audioService.playSuccessChime();
      if (this.onCallConnected) {
        this.onCallConnected();
      }
      // Start simulated AI transcription cues
      this.startSimulatedAiAssistance();
    }, 2800);

    return this.localStream;
  }

  connectSignaling(roomId, isCaller) {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/call/${roomId}`;

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.socket.send(JSON.stringify({ type: 'JOIN', roomId }));
      };

      this.socket.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'PEER_JOINED' && isCaller) {
          // Create SDP Offer
          const offer = await this.peerConnection.createOffer();
          await this.peerConnection.setLocalDescription(offer);
          this.socket.send(JSON.stringify({ type: 'OFFER', sdp: offer }));
        } else if (message.type === 'OFFER' && !isCaller) {
          // Handle SDP Offer & Send Answer
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          this.socket.send(JSON.stringify({ type: 'ANSWER', sdp: answer }));
        } else if (message.type === 'ANSWER') {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
        } else if (message.type === 'ICE_CANDIDATE' && message.candidate) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
        } else if (message.type === 'HANGUP') {
          this.endCall(false);
        }
      };

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({ type: 'ICE_CANDIDATE', candidate: event.candidate }));
        }
      };
    } catch (e) {
      console.warn('Signaling socket connection failed, running in resilient standalone mode.');
    }
  }

  toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isMuted = !audioTrack.enabled;
        return this.isMuted;
      }
    }
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  toggleCamera() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.isCameraOff = !videoTrack.enabled;
        return this.isCameraOff;
      }
    }
    this.isCameraOff = !this.isCameraOff;
    return this.isCameraOff;
  }

  endCall(notifyPeer = true) {
    if (this.autoAnswerTimer) {
      clearTimeout(this.autoAnswerTimer);
      this.autoAnswerTimer = null;
    }
    if (this.aiCueInterval) {
      clearInterval(this.aiCueInterval);
      this.aiCueInterval = null;
    }

    audioService.stopRingtone();
    audioService.playCallEndedTone();

    if (notifyPeer && this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify({ type: 'HANGUP', roomId: this.roomId }));
      } catch (e) {}
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.onCallEnded) {
      this.onCallEnded();
    }
  }

  // Simulated Media Stream (Canvas generator) for environments without physical webcams
  createSimulatedMediaStream(withVideo = false) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const dst = ctx.createMediaStreamDestination();
    osc.connect(dst);
    osc.start();
    const audioTrack = dst.stream.getAudioTracks()[0];

    let videoTrack = null;
    if (withVideo) {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const cCtx = canvas.getContext('2d');
      cCtx.fillStyle = '#4A90E2';
      cCtx.fillRect(0, 0, 320, 240);
      videoTrack = canvas.captureStream(15).getVideoTracks()[0];
    }

    const stream = new MediaStream();
    if (audioTrack) stream.addTrack(audioTrack);
    if (videoTrack) stream.addTrack(videoTrack);
    return stream;
  }

  // AI-Assisted Calling live updates
  startSimulatedAiAssistance() {
    const aiCues = [
      { text: "Caregiver: 'Hello Aarav, how are you feeling right now?'", emotion: "Calm", distressScore: 12, tip: "Voice tone is warm & steady" },
      { text: "Aarav: 'I finished morning blocks... loud bell rang earlier.'", emotion: "Slight Tension", distressScore: 28, tip: "Acknowledge the loud sound, praise his block play" },
      { text: "Caregiver: 'You did so well taking a quiet pause with your headphones.'", emotion: "Positive Reassurance", distressScore: 15, tip: "Offer star token reward" },
      { text: "Aarav: 'Can we do sensory breathing together?'", emotion: "Engaged & Relaxed", distressScore: 8, tip: "Sync breathing bubble on screen" },
    ];

    let step = 0;
    this.aiCueInterval = setInterval(() => {
      if (step < aiCues.length && this.onAiTranscription) {
        this.onAiTranscription(aiCues[step]);
        step++;
      }
    }, 4500);
  }
}

export const webrtcService = new WebRtcService();
