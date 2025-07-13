/**
 * =================================================
 * Author: Marshall A Burns
 * GitHub: @SchoolyB
 *           
 * Contributors:
 *           Everyone who has contributed to OstrichDB :)
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *     An Ode to all contributors who have made this project possible.
 * =================================================
 **/

import React, { useState } from 'react';
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoLinkedin } from "react-icons/io5";
import abLogo from "../images/ab-logo.png";
import { FaGithub } from "react-icons/fa";
import { X } from 'lucide-react';
import { link } from 'fs';


const ContributorTooltip = ({ contributor, position }) => {
  const isFounder = contributor.founderRole;
  
  return (
    <div 
      className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs"
      style={{
        left: position.x,
        top: position.y + window.scrollY - 120,
        transform: 'translateX(-50%)'
      }}
    >
      {isFounder && (
        <div className="flex items-center gap-2 mb-2">
          <img src={abLogo} alt="Archetype Dynamics" className="w-4 h-4" />
          <span className="text-xs font-medium text-gray-600">Founder</span>
        </div>
      )}
      
      <p className="text-sm text-gray-800 leading-relaxed">
        {contributor.personalNote}
      </p>
      
      <div 
        className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid white'
        }}
      />
    </div>
  );
};

const ContributorCard = ({ contributor, setHoveredContributor }) => {
  const renderProfileImage = () => {
    if (contributor.useMonogram) {
      return (
        <div 
          className="w-24 h-24 rounded-full border-3 border-gray-400 border-sb-amber transition-all duration-300 scale-105 flex items-center justify-center text-3xl font-bold"
          style={{ 
            backgroundColor: 'var(--logo-primary)',
            color: 'white'
          }}
        >
          {contributor.monogramLetter}
        </div>
      );
    }
    
    return (
      <img
        src={`https://github.com/${contributor.githubUsername}.png`}
        alt={contributor.name}
        className="w-24 h-24 rounded-full border-3 border-gray-400 border-sb-amber transition-all duration-300 scale-105"
      />
    );
  };

  const getFounderBadgeStyle = (role) => {
  
    return {
      backgroundColor: '#e08a2c',
      background: '#e08a2c',
      color: '#1a1a1a',
      fontWeight: 'bold'
    };
  };

  return (
    <div className="flex flex-col items-center text-center p-6 group">
      <div 
        className="relative mb-4"
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setHoveredContributor({
            data: contributor,
            position: {
              x: rect.left + rect.width / 2,
              y: rect.top
            }
          });
        }}
        onMouseLeave={() => setHoveredContributor(null)}
      >
        {renderProfileImage()}
      </div>
      
      {contributor.githubUsername ? (
        <a 
          href={`https://github.com/${contributor.githubUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-medium mb-2 hover:text-sb-amber transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {contributor.displayName}
        </a>
      ) : (
        <div 
          className="text-lg font-medium mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {contributor.name}
        </div>
      )}

      {contributor.founderRole && (
        <div 
          className="text-sm font-bold mb-2 px-4 py-1 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
          style={getFounderBadgeStyle(contributor.founderRole)}
        >
          {contributor.founderRole}
        </div>
      )}

      <div 
        className="text-sm font-medium mb-4 px-3 py-1 rounded-full"
        style={{ 
          backgroundColor: 'rgba(224, 138, 44, 0.15)',
          color: 'var(--text-secondary)'
        }}
      >
        {contributor.primaryContribution}
      </div>

      <div className="flex items-center justify-center gap-4 mb-2">
        {contributor.linkedinUrl && (
          <a
            href={contributor.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 transition-colors"
            title={`${contributor.name} on LinkedIn`}
          >
            <IoLogoLinkedin size={26}/>
          </a>
        )}
        
        {contributor.xLink && (
          <a
            href={contributor.xLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 transition-colors"
            title={`${contributor.name} on X`}
          > 
            <FaXTwitter size={26}/>
          </a>
        )}
        
        
        {contributor.githubUsername && (
          <a
            href={`https://github.com/${contributor.githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 transition-colors"
            title={`${contributor.name} on GitHub`}
          >
            <FaGithub size={26}/>
          </a>
        )}
      </div>
    </div>
  );
};

const Contributors = () => {
  const [hoveredContributor, setHoveredContributor] = useState(null);

  const marshall = {
    name: "Marshall A Burns",
    displayName: "Marshall Burns",
    githubUsername: "SchoolyB",
    founderRole: "CEO",
    primaryContribution: "Lead Developer",
    xLink: "https://x.com/MarshallBCodes",
    linkedinUrl: "https://linkedin.com/in/marshallbcodes",
    personalNote: "Marshall is the creator of OstrichDB, leading the project from concept to execution. He has been instrumental in both frontend development as well as building the OstrichDB engine and backend infrastructure from scratch."

  };

  const kasi = {
    name: "Kasi Reeves",
    displayName: "Gregory \"Kasi\" Reeves",
    githubUsername: "kasirocswell",
    founderRole: "CTO",
    primaryContribution: "Frontend Developer",
    xLink: "https://x.com/RobotProxyWar",
    linkedinUrl: "https://linkedin.com/in/kasi-reeves",
    personalNote: "Kasi architected the technical foundation and led frontend development, ensuring OstrichDB's performance and user experience excellence."
  };

  const cobb = {
    name: "Isaac Cobb",
    displayName: "Isaac Cobb",
    githubUsername: "CobbCoding1",
    founderRole: "CPO",
    primaryContribution: "Backend Developer",
    xLink: "https://x.com/cobbcoding",
    linkedinUrl: "https://linkedin.com/in/isaac-cobb-06b78827a",
    personalNote: "Isaac crafted OstrichDB's Natural Language Processing capabilities and helped design backend architecture, enabling powerful data interactions."
  };

  const genesis = {
    name: "Genesis Sarabia",
    displayName: "Genesis Sarabia",
    githubUsername: "genesissarabia",
    primaryContribution: "Designer",
    linkedinUrl: "https://linkedin.com/in/genesis-sarabia",
    personalNote: "Genesis was a pivotal part in the UI/UX design process, bringing a keen eye for detail and user-centered design to the project. Her contributions helped shape the overall look and feel of OstrichDB."
  };

  const gale = {
    name: "Gale Salazar",
    displayName: "Gale Salazar",
    githubUsername: "galessalazar",
    primaryContribution: "Frontend Developer",
    linkedinUrl: "https://linkedin.com/in/gale-salazar",
    personalNote: "Gale brought tenacity and motivation to the team. She played a key role in building key frontend features such as authentication."
  };

  const elvis = {
    name: "Feda Elvis",
    displayName: "Feda Elvis",
    githubUsername: "FedaElvis",
    primaryContribution: "Frontend Developer",
    xLink: "https://x.com/FedaElvis",
    personalNote: "Elvis contributed significantly to the foundation of the OstrichDB UI, particularly the dashboard. He also greatly helped during the design phase, providing valuable feedback and suggestions."
  };

  const jodi = {
    name: "Jodi DeAngelis",
    displayName: "Jodi DeAngelis",
    githubUsername: "jodideangelis",
    primaryContribution: "Designer",
    useMonogram: true,
    monogramLetter: "JD",
    linkedinUrl: "https://linkedin.com/in/jodi-deangelis/",
    personalNote: "Jodi brought a fresh and creative perspective to the design process, making the OstrichDB UI more intuitive and visually appealing. Her contributions were invaluable in enhancing the overall user experience.",
  };

  const founders = [marshall, kasi, cobb];
  const externalContributors = [gale, elvis, genesis, jodi];

  return (
    <div 
      className="min-h-screen py-16"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span style={{ color: 'var(--text-primary)' }}>Meet The </span>
            <span style={{ color: 'var(--logo-primary)' }}>Ostrich</span>
            <span style={{ color: 'var(--logo-secondary)' }}>DB</span>
            <span style={{ color: 'var(--text-primary)' }}> Team</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            The passionate developers and designers who brought this project to life
          </p>
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span style={{ color: 'var(--logo-primary)' }}>Archetype</span>
              <span style={{ color: 'var(--text-primary)' }}> Dynamics</span>
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              The core team behind OstrichDB 
            </p>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
               All are founding members of Archetype Dynamics, Inc.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {founders.map((founder, index) => (
              <ContributorCard 
                key={index} 
                contributor={founder}
                setHoveredContributor={setHoveredContributor}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Open Source Contributors
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Developers and Designers who volunteered their time and skills to enhance OstrichDB
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {externalContributors.map((contributor, index) => (
              <ContributorCard 
                key={index} 
                contributor={contributor}
                setHoveredContributor={setHoveredContributor}
              />
            ))}
          </div>
        </div>

        {hoveredContributor && (
          <ContributorTooltip 
            contributor={hoveredContributor.data}
            position={hoveredContributor.position}
          />
        )}
      </div>
    </div>
  );
};

export default Contributors;