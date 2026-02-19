import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="container" style={{ padding: '0px var(--spacing-lg)', paddingTop: '80px', paddingBottom: '100px' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
