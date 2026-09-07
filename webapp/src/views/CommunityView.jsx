import React, { useState } from 'react';
import { 
  Users2, 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Share2, 
  Send, 
  BadgeCheck, 
  Plus, 
  Filter 
} from 'lucide-react';
import { audioService } from '../services/audioService';
import { mockCommunityFeed } from '../mock/mockData';

export default function CommunityView() {
  const [posts, setPosts] = useState(mockCommunityFeed);
  const [selectedTag, setSelectedTag] = useState('All');
  const [newPostContent, setNewPostContent] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const tags = ['All', 'Sensory Regulation', 'Daily Routine', 'AAC & Speech', 'IEP & Schooling'];

  const filteredPosts = posts.filter(
    (post) => selectedTag === 'All' || post.tag === selectedTag
  );

  const handleLikePost = (postId) => {
    audioService.playClick();
    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          const isLiked = p.userLiked;
          return {
            ...p,
            userLiked: !isLiked,
            likes: isLiked ? p.likes - 1 : p.likes + 1,
          };
        }
        return p;
      })
    );
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    audioService.playSuccessChime();

    const newPost = {
      id: 'post-' + Date.now(),
      author: {
        name: 'Caregiver Meera',
        role: 'Parent of Aarav',
        avatar: '👩🏽',
        verified: false,
      },
      tag: selectedTag === 'All' ? 'Daily Routine' : selectedTag,
      title: 'Parent Discussion',
      content: newPostContent,
      timestamp: 'Just now',
      likes: 1,
      comments: 0,
      userLiked: true,
      saved: false,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setShowCreatePost(false);
  };

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Caregiver Support Network & Discussions</h2>
          <p className="section-subtitle">
            Connect with certified therapists, special educators, and experienced neurodivergent families
          </p>
        </div>

        <button
          onClick={() => setShowCreatePost(!showCreatePost)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--gradient-brand)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            fontWeight: '800',
            fontSize: '13px',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <Plus size={16} />
          {showCreatePost ? 'Cancel' : 'Create Discussion'}
        </button>
      </div>

      {/* Filter Tags */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              audioService.playClick();
              setSelectedTag(tag);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: '700',
              background: selectedTag === tag ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: selectedTag === tag ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Create Discussion Form */}
      {showCreatePost && (
        <form onSubmit={handleCreatePost} className="glass-card animate-fade-in" style={{ padding: '20px', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px' }}>Start a Community Discussion</h4>
          <textarea
            rows="3"
            placeholder="Share a sensory calming idea, routine tip, or question with fellow caregivers..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              resize: 'none',
              marginBottom: '12px',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setShowCreatePost(false)}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: '600' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '8px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-success)', color: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={14} /> Post
            </button>
          </div>
        </form>
      )}

      {/* Main Feed Grid */}
      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        {/* Posts Feed */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredPosts.map((post) => (
            <div key={post.id} className="glass-card" style={{ padding: '24px' }}>
              {/* Post Author */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '32px' }}>{post.author.avatar}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{post.author.name}</strong>
                      {post.author.verified && <BadgeCheck size={16} color="var(--accent-cyan)" />}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {post.author.role} • {post.timestamp}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {post.tag}
                </span>
              </div>

              {/* Title & Body */}
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {post.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {post.content}
              </p>

              {/* Interactions Footer */}
              <div style={{ display: 'flex', gap: '20px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => handleLikePost(post.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: post.userLiked ? 'var(--accent-danger)' : 'var(--text-muted)',
                    fontWeight: '700',
                    fontSize: '13px',
                  }}
                >
                  <Heart size={16} fill={post.userLiked ? 'var(--accent-danger)' : 'none'} />
                  <span>{post.likes}</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>
                  <MessageSquare size={16} />
                  <span>{post.comments} comments</span>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                  <button style={{ color: 'var(--text-muted)' }}>
                    <Share2 size={16} />
                  </button>
                  <button style={{ color: post.saved ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                    <Bookmark size={16} fill={post.saved ? 'var(--accent-cyan)' : 'none'} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Info & Resources */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px' }}>Upcoming Caregiver Circles</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-xs)' }}>
                <strong>Navigating Sensory Meltdowns</strong>
                <div style={{ color: 'var(--accent-cyan)', fontSize: '11px', marginTop: '4px' }}>Tomorrow at 6:00 PM • Virtual</div>
              </div>
              <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-xs)' }}>
                <strong>Speech AAC Sentence Construction</strong>
                <div style={{ color: 'var(--accent-cyan)', fontSize: '11px', marginTop: '4px' }}>Saturday at 11:00 AM • Live Webinar</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
