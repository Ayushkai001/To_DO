import React from 'react';
import TopicCard from './TopicCard';

const DailyFeed = ({ topics, onToggle }) => {
    return (
        <div style={{ paddingTop: 'var(--spacing-lg)' }}>
            <h2 style={{
                fontSize: '28px',
                marginBottom: 'var(--spacing-lg)',
                paddingLeft: 'var(--spacing-xs)',
                opacity: 0.9
            }}>
                Today
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {topics.map(topic => (
                    <TopicCard key={topic.id} topic={topic} onToggle={onToggle} />
                ))}
            </div>
        </div>
    );
};

export default DailyFeed;
