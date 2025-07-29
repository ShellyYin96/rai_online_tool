import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Hero from './components/Hero';
import Principles from './components/Principles';
import CaseStudies from './components/CaseStudies';
import CaseContributionForm from './components/CaseContributionForm';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import AuthModal from './components/auth/AuthModal';
import { Routes, Route, useParams } from 'react-router-dom';
import FocusGroupPage from './components/FocusGroupPage';
import MySubmissions from './components/MySubmissions';
import GroupSubmissions from './components/GroupSubmissions';
import ConnectionTest from './components/ConnectionTest';

function GroupCaseContributionPage() {
  const { groupName } = useParams();
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 22, boxShadow: '0 8px 32px rgba(34,197,94,0.13)', padding: '2.8rem 2.5rem 2.5rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ color: '#16a34a', fontWeight: 800, fontSize: '2rem', marginBottom: 24, textAlign: 'center', letterSpacing: '-0.5px' }}>Contribute a Group Case</h2>
        <CaseContributionForm
          requireLogin={true}
          mode="group"
          group={groupName}
          hideBackToMainPage={false}
          showReviewGroupSubs={true}
        />
      </div>
    </div>
  );
}

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [topBarSection, setTopBarSection] = useState('About');
  const [showChat, setShowChat] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuth();

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setShowChat(false); // Hide chat when changing sections
    // Reset top bar section when changing main sections
    if (sectionId === 'principles') {
      setTopBarSection('Principles');
    } else if (sectionId === 'case-studies') {
      setTopBarSection('Case Studies');
    } else {
      setTopBarSection('About');
    }
  };

  const handleTopBarChange = (section) => {
    setTopBarSection(section);
  };

  const handleShowChat = () => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      setShowChat(true);
    }
  };

  const handleHideChat = () => {
    setShowChat(false);
  };

  const renderContent = () => {
    if (activeSection === 'principles' && topBarSection === 'Principles') {
      return <Principles />;
    }
    
    if (activeSection === 'case-studies') {
      if (showChat) {
        return (
          <div className="chat-overlay">
            <div className="chat-overlay-header">
              <button onClick={handleHideChat} className="back-btn">
                <i className="fas fa-arrow-left"></i>
                Back to Case Studies
              </button>
            </div>
            <CaseContributionForm onSubmitSuccess={handleHideChat} />
          </div>
        );
      }
      return <CaseStudies onShowChat={handleShowChat} />;
    }
    
    // Default content for other sections
    return (
      <>
        <Hero />
        <div className="main-content-placeholder">
          <div style={{marginTop: '2rem', color: '#888', textAlign: 'center'}}>
            <h2>Placeholder for {activeSection} content</h2>
            <p>Add your content for the {activeSection} section here.</p>
          </div>
        </div>
      </>
    );
  };

  return (
    <Routes>
      <Route path="/focus-group/:groupName" element={
        <div className="app-layout">
          <Sidebar 
            activeSection="case-studies" 
            onSectionChange={handleSectionChange} 
          />
          <div className="main-area">
            <TopBar 
              activeSection="Case Studies" 
              onSectionChange={handleTopBarChange} 
            />
            <div className="main-content">
              {/* Temporary: Add ConnectionTest for debugging */}
              <ConnectionTest />
              <FocusGroupPage />
            </div>
            <Footer />
          </div>
          <AuthModal 
            isOpen={authModalOpen} 
            onClose={() => setAuthModalOpen(false)} 
            onAuthSuccess={() => {
              setAuthModalOpen(false);
              setShowChat(true);
            }}
          />
        </div>
      } />
      <Route path="/focus-group/:groupName/contribute" element={
        <div className="app-layout">
          <Sidebar 
            activeSection="case-studies" 
            onSectionChange={handleSectionChange} 
          />
          <div className="main-area">
            <TopBar 
              activeSection="Case Studies" 
              onSectionChange={handleTopBarChange} 
            />
            <div className="main-content">
              <GroupCaseContributionPage />
            </div>
            <Footer />
          </div>
          <AuthModal 
            isOpen={authModalOpen} 
            onClose={() => setAuthModalOpen(false)} 
            onAuthSuccess={() => {
              setAuthModalOpen(false);
              setShowChat(true);
            }}
          />
        </div>
      } />
      <Route path="/my-submissions" element={
        <div className="app-layout">
          <Sidebar 
            activeSection="case-studies" 
            onSectionChange={handleSectionChange} 
          />
          <div className="main-area">
            <TopBar 
              activeSection="Case Studies" 
              onSectionChange={handleTopBarChange} 
            />
            <div className="main-content">
              <MySubmissions />
            </div>
            <Footer />
          </div>
          <AuthModal 
            isOpen={authModalOpen} 
            onClose={() => setAuthModalOpen(false)} 
            onAuthSuccess={() => {
              setAuthModalOpen(false);
              setShowChat(true);
            }}
          />
        </div>
      } />
      <Route path="/group-submissions/:groupName" element={
        <div className="app-layout">
          <Sidebar 
            activeSection="case-studies" 
            onSectionChange={handleSectionChange} 
          />
          <div className="main-area">
            <TopBar 
              activeSection="Case Studies" 
              onSectionChange={handleTopBarChange} 
            />
            <div className="main-content">
              <GroupSubmissions />
            </div>
            <Footer />
          </div>
          <AuthModal 
            isOpen={authModalOpen} 
            onClose={() => setAuthModalOpen(false)} 
            onAuthSuccess={() => {
              setAuthModalOpen(false);
              setShowChat(true);
            }}
          />
        </div>
      } />
      <Route path="/*" element={
        <div className="app-layout">
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange} 
          />
          <div className="main-area">
            <TopBar 
              activeSection={topBarSection} 
              onSectionChange={handleTopBarChange} 
            />
            <div className="main-content">
              {renderContent()}
            </div>
            <Footer />
          </div>
          <AuthModal 
            isOpen={authModalOpen} 
            onClose={() => setAuthModalOpen(false)} 
            onAuthSuccess={() => {
              setAuthModalOpen(false);
              setShowChat(true);
            }}
          />
        </div>
      } />
    </Routes>
  );
}

export default App;
