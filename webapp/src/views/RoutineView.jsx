import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  CalendarDays, 
  Sun, 
  Moon, 
  CloudSun, 
  Award, 
  Sparkles, 
  BookOpen, 
  Star,
  Check
} from 'lucide-react';
import { audioService } from '../services/audioService';
import { mockRoutines } from '../mock/mockData';

export default function RoutineView({ child }) {
  const [activeTab, setActiveTab] = useState('morning');
  const [routines, setRoutines] = useState(mockRoutines);
  const [totalStars, setTotalStars] = useState(140);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);

  // Toggle routine item completion
  const handleToggleTask = (period, taskId) => {
    const updatedPeriod = routines[period].map((task) => {
      if (task.id === taskId) {
        const nextState = !task.completed;
        if (nextState) {
          audioService.playSuccessChime();
          setTotalStars((s) => s + task.points);
          // Confetti particle burst!
          confetti({
            particleCount: 55,
            spread: 70,
            origin: { y: 0.65 },
            colors: ['#6366F1', '#38BDF8', '#10B981', '#F59E0B', '#EC4899'],
          });
        } else {
          audioService.playClick();
          setTotalStars((s) => Math.max(0, s - task.points));
        }
        return { ...task, completed: nextState };
      }
      return task;
    });

    setRoutines({ ...routines, [period]: updatedPeriod });
  };

  const currentTasks = routines[activeTab] || [];
  const completedCount = currentTasks.filter((t) => t.completed).length;
  const progressPercent = currentTasks.length > 0 ? Math.round((completedCount / currentTasks.length) * 100) : 0;

  // Social Stories
  const socialStories = [
    {
      id: 'story-1',
      title: 'Taking the School Bus Safely',
      desc: 'Step-by-step visual sequence for boarding, sitting with seatbelt, and greeting the driver.',
      icon: '🚌',
      steps: [
        'Wait on the footpath holding hands until the bus stops completely.',
        'Step up the stairs one at a time and smile at the driver.',
        'Sit down in assigned seat and click the safety belt.',
        'Look out the window or listen with headphones until school arrives.',
      ],
    },
    {
      id: 'story-2',
      title: 'Loud Alarms and Fire Drills',
      desc: 'Understanding siren sounds so they do not feel scary.',
      icon: '🔔',
      steps: [
        'A loud bell rings to practice being safe. Everyone is okay.',
        'Put hands over ears or wear yellow headphones.',
        'Line up behind teacher and walk quietly into the open courtyard.',
        'Take 3 gentle deep breaths. The alarm turns off quickly.',
      ],
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Visual Daily Routines & Reward Tokens</h2>
          <p className="section-subtitle">
            Predictable visual checklists, positive reinforcement stars and calming social stories
          </p>
        </div>

        {/* Token Bank Pill */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '8px 20px', 
            borderRadius: 'var(--radius-full)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            border: '1px solid var(--accent-warning)',
            background: 'rgba(245, 158, 11, 0.12)'
          }}
        >
          <Star size={20} color="var(--accent-warning)" fill="var(--accent-warning)" />
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-warning)' }}>
              Token Bank
            </span>
            <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {totalStars} <span style={{ fontSize: '12px' }}>Stars</span>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {[
          { id: 'morning', label: 'Morning Routine', icon: Sun, color: '#F59E0B' },
          { id: 'afternoon', label: 'Afternoon Transition', icon: CloudSun, color: '#38BDF8' },
          { id: 'evening', label: 'Bedtime Wind-down', icon: Moon, color: '#A855F7' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                audioService.playClick();
                setActiveTab(tab.id);
              }}
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--bg-card)' : 'var(--bg-tertiary)',
                border: `1px solid ${isActive ? tab.color : 'var(--border-subtle)'}`,
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontWeight: '800',
                fontSize: '14px',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <Icon size={18} color={tab.color} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        {/* Left Column: Interactive Tasks Checklist */}
        <div className="col-8 glass-card" style={{ padding: '24px' }}>
          {/* Progress Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
              {activeTab === 'morning' ? 'Morning Checklist' : activeTab === 'afternoon' ? 'Afternoon Checklist' : 'Bedtime Checklist'}
            </h3>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-success)' }}>
              {completedCount} of {currentTasks.length} Done ({progressPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden', marginBottom: '24px' }}>
            <div 
              style={{ 
                width: `${progressPercent}%`, 
                height: '100%', 
                background: 'var(--gradient-safe)', 
                borderRadius: '999px',
                transition: 'width 0.4s ease'
              }} 
            />
          </div>

          {/* Task List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentTasks.map((task) => (
              <div
                key={task.id}
                className={`routine-task-row ${task.completed ? 'completed' : ''}`}
                onClick={() => handleToggleTask(activeTab, task.id)}
              >
                <div className={`routine-checkbox ${task.completed ? 'checked' : ''}`}>
                  {task.completed && <Check size={16} />}
                </div>
                <span style={{ fontSize: '24px' }}>{task.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className={`task-title ${task.completed ? 'done' : ''}`}>
                    {task.title}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-warning)', fontSize: '13px', fontWeight: '800' }}>
                  <Star size={14} fill="var(--accent-warning)" />
                  <span>+{task.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Social Stories Reader */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <BookOpen size={20} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Social Stories Library</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {socialStories.map((story, idx) => (
                <div
                  key={story.id}
                  style={{
                    padding: '14px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    audioService.playClick();
                    setActiveStoryIndex(activeStoryIndex === idx ? null : idx);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{story.icon}</span>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{story.title}</strong>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {story.desc}
                  </p>

                  {/* Expanded Sequence Steps */}
                  {activeStoryIndex === idx && (
                    <div className="animate-fade-in" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                      {story.steps.map((st, stepIdx) => (
                        <div key={stepIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <span style={{ fontWeight: '800', color: 'var(--accent-cyan)' }}>{stepIdx + 1}.</span>
                          <span>{st}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
