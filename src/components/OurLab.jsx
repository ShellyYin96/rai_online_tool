import React from 'react';
import './OurLab.css';

const OurLab = () => {
  const handleVisitLab = () => {
    window.open('https://trail.wcer.wisc.edu/', '_blank');
  };

  return (
    <div className="our-lab-container">
      {/* Hero Section */}
      <div className="lab-hero">
        <h1 className="lab-title">Our Lab</h1>
        <p className="lab-subtitle">
          Connecting with the TRAIL Lab at University of Wisconsin–Madison
        </p>
      </div>

      {/* Lab Information */}
      <div className="lab-content">
        <div className="lab-info-card">
          <div className="lab-header">
            <h2 className="lab-name">TRAIL Lab: The Responsible AI for Learning Lab</h2>
            <p className="lab-mission">
              We study where AI fits in diverse classrooms, or if it should.
            </p>
          </div>
          
          <div className="lab-description">
            <p>
              Housed at the University of Wisconsin–Madison, TRAIL Lab conducts interdisciplinary research 
              in learning sciences, learning analytics, AI, and human-centered design to develop scientific 
              understanding on responsible use of AI for teaching and learning in real-world contexts.
            </p>
          </div>

          <div className="lab-highlights">
            <div className="highlight-item">
              <i className="fas fa-university"></i>
              <div>
                <h4>University of Wisconsin–Madison</h4>
                <p>Department of Educational Psychology</p>
              </div>
            </div>
            
            <div className="highlight-item">
              <i className="fas fa-microscope"></i>
              <div>
                <h4>Research Focus</h4>
                <p>Learning Sciences, Learning Analytics, AI, Human-Centered Design</p>
              </div>
            </div>
            
            <div className="highlight-item">
              <i className="fas fa-users"></i>
              <div>
                <h4>Lab Director</h4>
                <p>Shamya Karumbaiah</p>
              </div>
            </div>
          </div>

          <div className="lab-cta">
            <button className="visit-lab-btn" onClick={handleVisitLab}>
              <i className="fas fa-external-link-alt"></i>
              Visit TRAIL Lab Website
            </button>
            <p className="lab-note">
              Explore their research, publications, and latest updates on responsible AI for learning
            </p>
          </div>

          {/* Contact Information */}
          <div className="lab-contact">
            <h4>Contact Information</h4>
            <div className="contact-details">
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <p><strong>Address:</strong> 1025 W Johnson St, Madison, WI 53706</p>
                  <p><strong>Email:</strong> shamya.karumbaiah@wisc.edu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Affiliations */}
          <div className="lab-affiliations">
            <h4>Affiliations</h4>
            <div className="affiliation-list">
              <span className="affiliation-tag">Data Science Institute</span>
              <span className="affiliation-tag">Department of Curriculum & Instruction</span>
              <span className="affiliation-tag">Holtz Center</span>
              <span className="affiliation-tag">Institute for Diversity Science</span>
              <span className="affiliation-tag">Multilingual Learning Research Center (MLRC)</span>
            </div>
          </div>
        </div>

        {/* Recent News Preview */}
        <div className="news-preview">
          <h3>Latest from TRAIL Lab</h3>
          <div className="news-items">
            <div className="news-item">
              <span className="news-date">Jun 27, 2025</span>
              <p>Shamya Karumbaiah was an invited speaker at the "AI and Society" event hosted by the Wisconsin International Resource Consortium.</p>
            </div>
            <div className="news-item">
              <span className="news-date">Mar 24, 2025</span>
              <p>Shamya Karumbaiah joined a post-grad panel on academia hosted by Penn GSE - LST/TLL.</p>
            </div>
            <div className="news-item">
              <span className="news-date">Feb 21, 2025</span>
              <p>Shamya Karumbaiah participated in the "AI & Learning" panel hosted by Phi Beta Kappa, UW-Madison.</p>
            </div>
            <div className="news-item">
              <span className="news-date">Jan 27, 2025</span>
              <p>Shamya Karumbaiah delivered a talk on "Bias in LLMs" for the Smart Cookie Visiting Professor Series at American Family Insurance.</p>
            </div>
            <div className="news-item">
              <span className="news-date">Nov 13, 2024</span>
              <p>Shamya Karumbaiah joined a panel on "Deliberation Dinners" at the UW-Madison Diversity Forum.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurLab; 