import React, { useState } from 'react';
import { Clock, Check, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

const TopicCard = ({ topic, onToggle, onExpand }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCompleted, setIsCompleted] = useState(topic.completed);

    const handleToggle = (e) => {
        e.stopPropagation();
        setIsCompleted(!isCompleted);
        // Trigger haptic feedback if available
        if (navigator.vibrate) navigator.vibrate(10);
        onToggle(topic.id);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'learned': return '#34C759'; // Apple Green
            case 'review_due': return '#FF9500'; // Apple Orange
            case 'new': return '#007AFF'; // Apple Blue
            default: return '#8E8E93'; // Apple Gray
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'learned': return 'Learned';
            case 'review_due': return 'Review';
            case 'new': return 'New';
            default: return '';
        }
    };

    return (
        <div
            className="glass"
            style={{
                marginBottom: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md)',
                transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden'
            }}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            {/* Hierarchy / Breadcrumbs */}
            {topic.path && topic.path.length > 0 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '8px',
                    opacity: 0.8
                }}>
                    {topic.path.map((item, index) => (
                        <React.Fragment key={index}>
                            <span>{item}</span>
                            {index < topic.path.length - 1 && <ChevronRight size={10} />}
                        </React.Fragment>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <div
                        onClick={handleToggle}
                        style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: `2px solid ${isCompleted ? 'var(--color-accent)' : '#C7C7CC'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            backgroundColor: isCompleted ? 'var(--color-accent)' : 'transparent',
                            flexShrink: 0
                        }}
                    >
                        {isCompleted && <Check size={14} color="white" strokeWidth={3} />}
                    </div>

                    <div style={{
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        opacity: isCompleted ? 0.4 : 1,
                        transition: 'all 0.3s ease',
                        color: 'var(--color-text-primary)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 500 }}>{topic.title}</h3>
                            {topic.status && (
                                <span style={{
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    borderRadius: '99px',
                                    backgroundColor: `${getStatusColor(topic.status)}20`, // 20% opacity
                                    color: getStatusColor(topic.status),
                                    fontWeight: 600,
                                    textTransform: 'uppercase'
                                }}>
                                    {getStatusLabel(topic.status)}
                                </span>
                            )}
                        </div>

                        {topic.nextReview && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <Clock size={12} color="var(--color-text-secondary)" />
                                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                    {topic.nextReview}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ color: 'var(--color-text-secondary)' }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            <div style={{
                maxHeight: isExpanded ? '200px' : '0',
                opacity: isExpanded ? 1 : 0,
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
                marginTop: isExpanded ? 'var(--spacing-md)' : '0'
            }}>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {topic.details || "No additional details for this topic."}
                </p>
            </div>
        </div>
    );
};

export default TopicCard;
