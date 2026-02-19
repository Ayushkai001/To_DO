import React from 'react';
import { Menu, Plus } from 'lucide-react';

const Header = () => {
    return (
        <header className="glass" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--spacing-lg)',
            borderBottom: '1px solid var(--glass-border)'
        }}>
            <button className="icon-btn">
                <Menu size={24} color="var(--color-primary)" />
            </button>

            <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Cognitive</h1>

            <button className="icon-btn" style={{ color: 'var(--color-accent)' }}>
                <Plus size={24} />
            </button>
        </header>
    );
};

export default Header;
