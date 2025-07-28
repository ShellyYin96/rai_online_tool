import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer
      style={{
        width: '100vw',
        left: 0,
        right: 0,
        margin: 0,
        background: '#2d3748', // or your color
        color: '#fff',
        // ...other styles
      }}
    >
      <div className="footer-content">
        {/* Left Section - University Information */}
        <div className="footer-section university-info">
          <div className="university-logo">
            <div className="w-crest">W</div>
            <div className="university-text">
              <p>UNIVERSITY OF WISCONSIN-MADISON</p>
            </div>
          </div>
        </div>



        {/* Middle Section - Affiliations */}
        <div className="footer-section affiliations">
          <h4>AFFILIATIONS</h4>
          <ul className="affiliations-list">
            <li>American Educational Research Association (AERA)</li>
            <li>European Association of Technology Enhanced Learning (EATEL)</li>
            <li>European Science Education Research Association (ESERA)</li>
            <li>International Artificial Intelligence in Education Society (IAIEDS)</li>
            <li>International Educational Data Mining Society (IEDMS)</li>
            <li>International Society of the Learning Sciences (ISLS)</li>
            <li>Multilingual Learning Research Center (MLRC)</li>
            <li>Society for Learning Analytics Research (SOLAR)</li>
          </ul>
        </div>

        {/* Right Section - Contact Information */}
        <div className="footer-section contact-info">
          <h4>CONTACT US</h4>
          <div className="address">
            <p>1025 W Johnson St</p>
            <p>Madison, WI 53706</p>
          </div>
          <a href="https://maps.google.com/?q=1025+W+Johnson+St+Madison+WI+53706" 
             target="_blank" 
             rel="noopener noreferrer" 
             className="maps-link">
            <i className="fas fa-map-marker-alt"></i>
            View on Google Maps
          </a>
          
          <div className="social-icons">
            <div className="icon-row" style={{ justifyContent: 'flex-start', marginLeft: '20px', display: 'flex' }}>
              <a href="mailto:shamya.karumbaiah@wisc.edu" className="social-icon">
                <i className="fas fa-envelope"></i>
              </a>
              <a href="https://scholar.google.com/citations?user=5w4I9VMAAAAJ" className="social-icon">
                <i className="fas fa-graduation-cap"></i>
              </a>


            </div>

          </div>
        </div>
      </div>

      {/* Bottom Section - Feedback and Copyright */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="feedback-text">
            Feedback, questions or accessibility issues: 
            <a href="mailto:shamya.karumbaiah@wisc.edu"> shamya.karumbaiah@wisc.edu</a>
          </p>
          <p className="copyright-text">© 2025 TRAIL Lab, All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 