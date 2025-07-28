import React from 'react';
import ValueCard from './ValueCard';

const ValuesGrid = ({ userState, onFavorite, onUnfavorite, onQuestion }) => {
  const values = [
    {
      id: 'fairness',
      name: 'Fairness',
      icon: 'fas fa-balance-scale',
      description: 'AI systems should treat all individuals and groups fairly, without bias or discrimination based on race, gender, age, or other characteristics.',
      whyMatters: [
        'Prevents discrimination in hiring, lending, and other decisions',
        'Ensures equal opportunities for all students',
        'Builds trust in AI systems',
        'Reflects our commitment to social justice'
      ],
      classroomApplications: [
        'Discuss bias in AI-powered tools',
        'Analyze diverse datasets',
        'Teach critical thinking about AI decisions'
      ]
    },
    {
      id: 'transparency',
      name: 'Transparency',
      icon: 'fas fa-eye',
      description: 'AI systems should be understandable and explainable, allowing users to know how and why decisions are made.',
      whyMatters: [
        'Enables accountability and trust',
        'Helps identify and fix problems',
        'Allows for informed decision-making',
        'Promotes ethical AI development'
      ],
      classroomApplications: [
        'Explain how AI tools work',
        'Show decision-making processes',
        'Discuss the "black box" problem'
      ]
    },
    {
      id: 'privacy',
      name: 'Privacy',
      icon: 'fas fa-shield-alt',
      description: 'AI systems should respect and protect personal information, ensuring data security and user confidentiality.',
      whyMatters: [
        'Protects personal information',
        'Prevents data misuse',
        'Maintains student confidentiality',
        'Builds trust with users'
      ],
      classroomApplications: [
        'Discuss data collection practices',
        'Teach digital privacy skills',
        'Review privacy policies together'
      ]
    },
    {
      id: 'accountability',
      name: 'Accountability',
      icon: 'fas fa-gavel',
      description: 'There should be clear responsibility for AI system outcomes, with mechanisms for addressing errors and harms.',
      whyMatters: [
        'Ensures responsibility for AI decisions',
        'Provides recourse when things go wrong',
        'Encourages careful development',
        'Protects against harm'
      ],
      classroomApplications: [
        'Discuss who is responsible for AI errors',
        'Explore real-world AI failures',
        'Teach about liability and responsibility'
      ]
    },
    {
      id: 'safety',
      name: 'Safety',
      icon: 'fas fa-safety-vest',
      description: 'AI systems should be designed to prevent harm and operate safely in all intended environments.',
      whyMatters: [
        'Prevents physical and digital harm',
        'Protects users and bystanders',
        'Ensures reliable operation',
        'Builds confidence in AI systems'
      ],
      classroomApplications: [
        'Discuss AI safety protocols',
        'Explore fail-safe mechanisms',
        'Teach about risk assessment'
      ]
    },
    {
      id: 'inclusivity',
      name: 'Inclusivity',
      icon: 'fas fa-users',
      description: 'AI systems should be accessible and beneficial to diverse populations, including people with disabilities and from different backgrounds.',
      whyMatters: [
        'Ensures AI benefits everyone',
        'Addresses diverse needs and abilities',
        'Prevents exclusion and discrimination',
        'Creates more robust AI systems'
      ],
      classroomApplications: [
        'Design accessible AI projects',
        'Discuss diverse user needs',
        'Explore universal design principles'
      ]
    }
  ];

  return (
    <section className="values-grid">
      {values.map((value) => (
        <ValueCard
          key={value.id}
          value={value}
          userState={userState}
          onFavorite={onFavorite}
          onUnfavorite={onUnfavorite}
          onQuestion={onQuestion}
        />
      ))}
    </section>
  );
};

export default ValuesGrid; 