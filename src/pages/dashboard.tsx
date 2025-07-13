/**
 * =================================================
 * Author: Feda Elvis
 * GitHub: @FedaElvis
 *           
 * Contributors:
 *           @SchoolyB
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
  *    The main dynamic dashboard page. Renders the following components:
 *    - ProjectsComponent: Displays the user's projects.
 *    - CollectionsComponent: Displays the user's collections within projects.
 *    - ClusterEditorComponent: Allows users to edit clusters
 *    - ManualQueryEditorComponent: Provides a manual query editor for advanced users.
 *    - NaturalLanguageQueryComponent: Allows users to query their data using natural language.
 * =================================================
 **/

import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProjectsComponent from '../components/dashboard/ProjectsComponent';
import CollectionsComponent from '../components/dashboard/CollectionsComponent';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import NLPInterface from '../components/dashboard/NLP';

const Dashboard: React.FC = () => {

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <main className='flex-1'>
        <Navbar />
        <Routes>
          {/* Default dashboard route is ProjectsComponent */}
          <Route path="/" element={<ProjectsComponent />} />
          
          {/* Collections route for a specific project */}
          <Route path="/projects/:projectName/collections" element={<CollectionsComponent />} />
          
          {/* Individual collection route */}
          <Route path="/projects/:projectName/collections/:collectionName" element={
            <div className="flex flex-col items-center justify-center mt-40">
              <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Collection Editor
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Individual collection view - to be implemented
              </p>
            </div>
          } />
            //The NLP interface component can be added here
          <Route path="/projects/:projectName/nlp" element={<NLPInterface />} />

        </Routes>
      </main>
      <Footer />  
    </div>
  );
};

export default Dashboard;