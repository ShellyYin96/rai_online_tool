import React from 'react';
import './Sidebar.css';

const navLinks = [
  { icon: 'fas fa-home', label: 'Home', id: 'home' },
  { icon: 'fas fa-book', label: 'Chapters', id: 'chapters' },
  { icon: 'fas fa-cubes', label: 'Principles & Patterns', id: 'principles' },
  { icon: 'fas fa-briefcase', label: 'Case Studies', id: 'case-studies' },
  { icon: 'fas fa-flask', label: 'Our Lab', id: 'our-lab', external: true },
];

const Sidebar = ({ activeSection, onSectionChange }) => (
  <aside className="sidebar">
    <div className="sidebar-logo">
      <i className="fas fa-plus"></i>
    </div>
    <nav className="sidebar-nav">
      {navLinks.map((link) => (
        <a 
          href={link.external ? 'https://trail-lab-website-iyp4dxv5m-trail-websites-projects.vercel.app/' : '#'} 
          className={`sidebar-link${activeSection === link.id ? ' active' : ''}`} 
          key={link.id}
          target={link.external ? '_blank' : undefined}
          rel={link.external ? 'noopener noreferrer' : undefined}
          onClick={link.external ? undefined : (e) => {
            e.preventDefault();
            onSectionChange(link.id);
          }}
        >
          <i className={link.icon}></i>
          <span>{link.label}</span>
        </a>
      ))}
    </nav>
  </aside>
);

export default Sidebar; 