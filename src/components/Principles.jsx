import React, { useState } from 'react';
import './Principles.css';

const principles = [
  {
    id: 'user-autonomy',
    tag: 'USER AUTONOMY',
    title: 'Design for the appropriate level of user autonomy',
    description: 'AI systems should respect user control and decision-making, allowing users to maintain appropriate levels of autonomy over their interactions and outcomes.',
    details: [
      'AI-supported workflows should be designed for the appropriate level of user autonomy, considering different user tasks, expertise, and the overall effort required to steer the AI system.',
      'People expect tools and technologies to improve their efficiency and productivity. People also prefer to remain in control of which tasks tools should execute, how, and to what end.',
      'Knowing when a user is willing to delegate a task to an AI, how users can control the AI, and when to leave control with the user entirely is key for building helpful AI products.'
    ]
  },
  {
    id: 'fairness',
    tag: 'FAIRNESS',
    title: 'Ensure AI systems treat all individuals and groups fairly',
    description: 'AI systems should be designed to prevent bias and discrimination, ensuring equal treatment regardless of race, gender, age, or other characteristics.',
    details: [
      'AI systems must be trained on diverse, representative datasets to avoid perpetuating existing biases.',
      'Regular audits and testing should be conducted to identify and mitigate potential discrimination.',
      'Transparency in decision-making processes helps users understand how AI systems reach their conclusions.',
      'Fairness should be considered throughout the entire AI development lifecycle, from data collection to deployment.'
    ]
  },
  {
    id: 'transparency',
    tag: 'TRANSPARENCY',
    title: 'Make AI systems understandable and explainable',
    description: 'AI systems should provide clear explanations for their decisions, allowing users to understand how and why outcomes are reached.',
    details: [
      'Users should be able to understand the reasoning behind AI decisions that affect them.',
      'Explainable AI helps build trust and enables users to make informed decisions.',
      'Transparency includes being clear about AI capabilities, limitations, and potential biases.',
      'Documentation and user interfaces should make AI behavior predictable and understandable.'
    ]
  },
  {
    id: 'privacy',
    tag: 'PRIVACY',
    title: 'Protect personal information and user confidentiality',
    description: 'AI systems should respect and protect user privacy, ensuring data security and maintaining user trust.',
    details: [
      'Personal data should be collected, processed, and stored with appropriate security measures.',
      'Users should have control over their data and understand how it is being used.',
      'Privacy-by-design principles should be integrated into AI system development.',
      'Regular security audits and compliance with privacy regulations are essential.'
    ]
  },
  {
    id: 'accountability',
    tag: 'ACCOUNTABILITY',
    title: 'Establish clear responsibility for AI system outcomes',
    description: 'There should be clear mechanisms for addressing AI system errors and harms, with identifiable responsibility.',
    details: [
      'Clear ownership and responsibility for AI system behavior must be established.',
      'Mechanisms for reporting and addressing AI-related issues should be in place.',
      'Regular monitoring and evaluation of AI system performance is essential.',
      'Users should have recourse when AI systems cause harm or make errors.'
    ]
  },
  {
    id: 'safety',
    tag: 'SAFETY',
    title: 'Design AI systems to prevent harm and operate safely',
    description: 'AI systems should be designed with safety as a priority, preventing both physical and digital harm.',
    details: [
      'Safety considerations should be integrated throughout the AI development process.',
      'AI systems should have fail-safe mechanisms and emergency shutdown procedures.',
      'Regular safety testing and risk assessments should be conducted.',
      'AI systems should be designed to operate safely in their intended environments.'
    ]
  },
  {
    id: 'inclusivity',
    tag: 'INCLUSIVITY',
    title: 'Ensure AI systems are accessible to diverse populations',
    description: 'AI systems should be designed to benefit and be accessible to people from all backgrounds and abilities.',
    details: [
      'AI systems should be designed with accessibility in mind from the beginning.',
      'Diverse user needs and abilities should be considered during development.',
      'AI systems should work well for users with different languages, cultures, and abilities.',
      'Regular testing with diverse user groups helps ensure inclusivity.'
    ]
  }
];

const Principles = () => {
  const [expandedPrinciple, setExpandedPrinciple] = useState('user-autonomy');

  const togglePrinciple = (principleId) => {
    setExpandedPrinciple(expandedPrinciple === principleId ? null : principleId);
  };

  return (
    <div className="principles-container">
      <h1 className="principles-title">Principles</h1>
      <div className="principles-list">
        {principles.map((principle) => (
          <div key={principle.id} className="principle-card">
            <div 
              className="principle-header"
              onClick={() => togglePrinciple(principle.id)}
            >
              <div className="principle-tag">#{principle.tag}</div>
              <div className="principle-title">{principle.title}</div>
              <button className="principle-toggle">
                <i className={`fas fa-chevron-${expandedPrinciple === principle.id ? 'up' : 'down'}`}></i>
              </button>
            </div>
            {expandedPrinciple === principle.id && (
              <div className="principle-details">
                <p className="principle-description">{principle.description}</p>
                {principle.details.map((detail, index) => (
                  <p key={index} className="principle-detail">{detail}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Principles; 