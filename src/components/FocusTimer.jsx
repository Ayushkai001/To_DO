import React, { useState, useEffect } from 'react';
import { Play, Pause, X } from 'lucide-react';

const FocusTimer = ({ onClose, activeTaskTitle }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Zen Mode: very subtle background
            animation: 'fadeIn 0.5s ease'
        }}>
            <div className="glass" style={{
                padding: '40px',
                borderRadius: '30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                minWidth: '320px'
            }}>
                {/* Active Task Title - Zen Mode Focus */}
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    marginBottom: '30px',
                    textAlign: 'center',
                    color: 'var(--color-text-primary)'
                }}>
                    {activeTaskTitle || "Deep Work Session"}
                </h2>

                {/* Circular Timer */}
                <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '30px' }}>
                    <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke="#E5E5EA"
                            strokeWidth="6"
                        />
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke="var(--color-accent)"
                            strokeWidth="6"
                            strokeDasharray="565"
                            strokeDashoffset={565 - (565 * timeLeft) / (25 * 60)}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '48px',
                        fontWeight: 200,
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--color-text-primary)'
                    }}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className="icon-btn"
                        style={{
                            backgroundColor: 'var(--color-accent)',
                            color: 'white',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,122,255,0.3)'
                        }}
                    >
                        {isActive ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" style={{ marginLeft: '4px' }} />}
                    </button>

                    <button
                        onClick={onClose}
                        className="icon-btn"
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={28} color="var(--color-text-secondary)" />
                    </button>
                </div>
            </div>

            <p style={{
                marginTop: '30px',
                color: 'var(--color-text-secondary)',
                fontSize: '14px',
                opacity: 0.6,
                letterSpacing: '1px',
                textTransform: 'uppercase'
            }}>
                Zen Mode Active
            </p>
        </div>
    );
};

export default FocusTimer;
