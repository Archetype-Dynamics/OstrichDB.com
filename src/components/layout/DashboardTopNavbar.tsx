import React from 'react';
import { Github } from 'lucide-react';
import ProfileDropdown from '../common/UserProfileDropdown';
import ThemeToggle from '../common/ThemeToggle';

const DashboardTopNavbar: React.FC = () => {
  return (
    <div 
      className="fixed top-0 right-0 z-50 flex items-center gap-4 px-6 py-4"
      style={{ 
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <ThemeToggle />
      <a
        href="https://github.com/Archetype-Dynamics/OstrichDB.com"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-sb-amber transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        title="View source on GitHub"
      >
        <Github size={20} />
      </a>
      <ProfileDropdown />
    </div>
  );
};

export default DashboardTopNavbar;