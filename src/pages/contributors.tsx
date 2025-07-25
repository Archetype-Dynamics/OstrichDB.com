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

import React, { useState, useRef, useEffect } from 'react';
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoLinkedin } from "react-icons/io5";
import abLogo from "../images/ab-logo.png";
import { FaGithub } from "react-icons/fa";
import { X, BookOpen } from 'lucide-react';


const DescriptionModal = ({ contributor, onClose }) => {
  const modalRef = useRef(null);
  const isFounder = contributor.founderRole;
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="border rounded-lg shadow-lg p-6 max-w-md w-full relative"
        style={{ 
          backgroundColor: 'var(--bg-primary)', 
          borderColor: 'var(--border-color, #e5e7eb)' 
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ 
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <BookOpen size={24} className="text-sb-amber" style={{ color: 'var(--logo-primary)' }} />
          <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            About {contributor.displayName || contributor.name}
          </h3>
        </div>
        
        {isFounder && (
          <div className="flex items-center gap-2 mb-3">
            <img src={abLogo} alt="Archetype Dynamics" className="w-4 h-4" />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Founder</span>
          </div>
        )}
        
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {contributor.personalNote}
        </p>
      </div>
    </div>
  );
};

const ContributorCard = ({ contributor, onShowDescription }) => {
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
      <div className="relative mb-4">
        {renderProfileImage()}
        {contributor.personalNote && (
          <button
            onClick={() => onShowDescription(contributor)}
            className="absolute -bottom-2 -right-2 bg-white border-2 border-gray-300 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            style={{ borderColor: 'var(--logo-primary)' }}
            title="Read about this contributor"
          >
            <BookOpen size={16} style={{ color: 'var(--logo-primary)' }} />
          </button>
        )}
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
  const [selectedContributor, setSelectedContributor] = useState(null);

  const marshall = {
    name: "Marshall A Burns",
    displayName: "Marshall Burns",
    githubUsername: "SchoolyB",
    founderRole: "CEO",
    primaryContribution: "Lead Developer",
    xLink: "https://x.com/TheSegfaultChef",
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
                onShowDescription={setSelectedContributor}
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
                onShowDescription={setSelectedContributor}
              />
            ))}
          </div>
        </div>

        {selectedContributor && (
          <DescriptionModal 
            contributor={selectedContributor}
            onClose={() => setSelectedContributor(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Contributors;