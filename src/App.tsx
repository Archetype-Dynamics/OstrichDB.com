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
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import ManualQueryEditor from "./components/dashboard/ManualQueryEditor";
import NotFound from './components/NotFound';
import  DashboardTopNavbarb from "./components/layout/DashboardTopNavbar";
import { ThemeProvider } from "./context/ThemeContext";
import NLPInterface from "./components/dashboard/NLP";
import Contributors from "./pages/contributors";
import PricingPage from "./pages/pricing";
import Contact from "./pages/contact";

// Clerk authentication .env variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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
    <ClerkProvider publishableKey={clerkPubKey}>
      <MantineProvider theme={theme}>
        <ThemeProvider>
          <Router>
            <Routes>
              {/* Contributors Page */}
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

              {/* Pricing Page */}
              <Route 
                path="/pricing" 
                element={
                  <div
                    className="min-h-screen flex flex-col"
                    style={{ backgroundColor: "var(--bg-primary)" }}
                  >
                    <Navbar />
                    <main className="flex-1">
                      <PricingPage />
                    </main>
                    <Footer />
                  </div>
                } 
              />

              {/* Contact Page */}
              <Route 
                path="/contact" 
                element={
                  <div
                    className="min-h-screen flex flex-col"
                    style={{ backgroundColor: "var(--bg-primary)" }}
                  >
                    <Navbar />
                    <main className="flex-1">
                      <Contact />
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
    </ClerkProvider>
  );
}

export default App;