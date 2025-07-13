/**
 * =================================================
 * Author: Kasi Reeves
 * GitHub: @Kasirocswell
 * Contributors:
 *           @SchoolyB
 *           @GaleSSalazar
 *           @FedaElvis
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Main application component
 * =================================================
 **/

import React, { useEffect, useState } from "react";
import { KindeProvider } from "@kinde-oss/kinde-auth-react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import DashboardSideNavbar from "./components/layout/DashboardSideNavbar";
import Hero from "./components/home/Hero";
import CTA from "./components/home/CTA";
import Features from "./components/home/Features";
import CodeShowcase from "./components/home/InteractiveShowcase";
import CodeComparison from "./components/home/ProblemSolution";
import Dashboard from "./pages/dashboard";
import CollectionsComponent from "./components/dashboard/CollectionsComponent";
import CollectionOverview from "./components/dashboard/CollectionOverview";
import ClusterEditor from "./components/dashboard/ClusterEditor";
import NotFound from './components/NotFound';
import  DashboardTopNavbarb from "./components/layout/DashboardTopNavbar";
import { ThemeProvider } from "./context/ThemeContext";
import NLPInterface from "./components/dashboard/NLP";
import Contributors from "./pages/contributors";

// Kinde authentication .env variables
const clientId = import.meta.env.VITE_KINDE_CLIENT_ID;
const domain = import.meta.env.VITE_KINDE_DOMAIN;
const logoutUri = import.meta.env.VITE_KINDE_LOGOUT_URL;
const redirectUri = import.meta.env.VITE_KINDE_REDIRECT_URL;

// Mantine theme configuration
const theme = createTheme({
  colors: {
    sbPurple: [
      "#f3e8ff",
      "#e9d5ff",
      "#d8b4fe",
      "#c084fc",
      "#a855f7",
      "#9333ea",
      "#7e22ce",
      "#6b21a8",
      "#581c87",
      "#4c1d95"
    ],
  },
  primaryColor: "sbPurple",
  fontFamily: "Inter, sans-serif",
  headings: { fontFamily: "Inter, sans-serif" },
  defaultRadius: "md",
  components: {
    Button: {
      defaultProps: {
        variant: "filled",
      },
    },
  },
});

// Dashboard Layout Component
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
    <DashboardTopNavbarb/>
    <div className="flex flex-1" style={{ paddingTop: '64px' }}> {/* Add padding for top navbar */}
      <DashboardSideNavbar />
      <main className="flex-1" style={{ marginLeft: '80px' }}> 
        {children}
      </main>
    </div>
  </div>
);

// Placeholder components for manual query editor
const ManualQueryEditor: React.FC = () => {
  
  return (
    <div className="flex flex-col items-center justify-center mt-40">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Manual Query Editor
        </h1>
    
        <div className="text-6xl mb-4">💻</div>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Manual query editor interface coming soon...
        </p>
        <p className="text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          Write and execute OstrichDB queries directly.
        </p>
      </div>
    </div>
  );
};


function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-sb-purple/30 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <KindeProvider
      clientId={clientId}
      domain={domain}
      redirectUri={redirectUri}
      logoutUri={logoutUri}
    >
      <MantineProvider theme={theme}>
        <ThemeProvider>
          <Router>
            <Routes>
              {/* Kinde Auth Callback */}
              <Route 
                path="/api/auth/kinde_callback" 
                element={
                  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
                    <div className="animate-pulse">
                      <div className="h-8 w-32 bg-sb-purple/30 rounded-md"></div>
                    </div>
                  </div>
                } 
              />

              {/* Contributors Page - MOVED INSIDE Routes */}
              <Route 
                path="/contributors" 
                element={
                  <div
                    className="min-h-screen flex flex-col"
                    style={{ backgroundColor: "var(--bg-primary)" }}
                  >
                    <Navbar />
                    <main className="flex-1">
                      <Contributors />
                    </main>
                    <Footer />
                  </div>
                } 
              />

              {/* Dashboard - Project Selection */}
              <Route 
                path="/dashboard/*" 
                element={
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                } 
              />
              
              {/* Collections for a specific project */}
              <Route 
                path="/dashboard/projects/:projectName/collections" 
                element={
                  <DashboardLayout>
                    <CollectionsComponent />
                  </DashboardLayout>
                } 
              />
              
              {/* Collection Overview - Default view when entering a collection */}
              <Route 
                path="/dashboard/projects/:projectName/collections/:collectionName" 
                element={
                  <DashboardLayout>
                    <CollectionOverview />
                  </DashboardLayout>
                } 
              />
              
              {/* Collection Management Tools */}
              <Route 
                path="/dashboard/projects/:projectName/collections/:collectionName/cluster-editor/:clusterName?" 
                element={
                  <DashboardLayout>
                    <ClusterEditor />
                  </DashboardLayout>
                } 
              />
              
              <Route 
                path="/dashboard/projects/:projectName/manual-query" 
                element={
                  
                  <DashboardLayout>
                    <ManualQueryEditor />
                  </DashboardLayout>
                } 
              />
              
              <Route 
                path="/dashboard/projects/:projectName/nlp" 
                element={
                  <DashboardLayout>
                    <NLPInterface />
                  </DashboardLayout>
                } 
              />
              
              {/* Home page */}
              <Route
                path="/"
                element={
                  <div
                    className="min-h-screen flex flex-col"
                    style={{ backgroundColor: "var(--bg-primary)" }}
                  >
                    <Navbar />
                    <main className="flex-1">
                      <Hero />
                      <CodeComparison />
                      <CodeShowcase />
                      <Features />
                      <CTA />
                    </main>
                    <Footer />
                  </div>
                }
              />
              
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </MantineProvider>
    </KindeProvider>
  );
}

export default App;