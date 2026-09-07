import json
import logging
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("nivara.call_socket")
router = APIRouter(tags=["WebRTC Calling"])

class CallRoomManager:
    def __init__(self):
        # room_id -> set of active WebSockets
        self.rooms: Dict[str, Set[WebSocket]] = {}

    async def join_room(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
        self.rooms[room_id].add(websocket)
        logger.info(f"Client joined call room: {room_id}, total participants: {len(self.rooms[room_id])}")

        # Notify existing participants in room
        await self.broadcast_to_room(
            room_id, 
            {"type": "PEER_JOINED", "room_id": room_id, "peer_count": len(self.rooms[room_id])},
            exclude=websocket
        )

    def leave_room(self, room_id: str, websocket: WebSocket):
        if room_id in self.rooms:
            self.rooms[room_id].discard(websocket)
            if not self.rooms[room_id]:
                del self.rooms[room_id]
            logger.info(f"Client left call room: {room_id}")

    async def broadcast_to_room(self, room_id: str, message: dict, exclude: WebSocket = None):
        if room_id in self.rooms:
            dead = set()
            for client in self.rooms[room_id]:
                if client != exclude:
                    try:
                        await client.send_json(message)
                    except Exception:
                        dead.add(client)
            for d in dead:
                self.rooms[room_id].discard(d)

call_room_manager = CallRoomManager()

@router.websocket("/ws/call/{room_id}")
async def call_signaling_endpoint(websocket: WebSocket, room_id: str):
    """
    WebRTC Signaling channel for Voice and Video Calling.
    Transfers SDP offers, answers, ICE candidates, and call lifecycle states.
    """
    await call_room_manager.join_room(room_id, websocket)
    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            msg_type = data.get("type")

            # Forward signaling packets to peer
            if msg_type in ["OFFER", "ANSWER", "ICE_CANDIDATE", "CALL_REQUEST", "CALL_ACCEPTED", "CALL_REJECTED", "HANGUP", "AI_CUE"]:
                await call_room_manager.broadcast_to_room(room_id, data, exclude=websocket)
            elif msg_type == "PING":
                await websocket.send_json({"type": "PONG"})
    except WebSocketDisconnect:
        call_room_manager.leave_room(room_id, websocket)
        await call_room_manager.broadcast_to_room(
            room_id, 
            {"type": "PEER_LEFT", "room_id": room_id}
        )
    except Exception as e:
        logger.error(f"Error in call socket: {e}")
        call_room_manager.leave_room(room_id, websocket)
