/**
 * =================================================
 * Author: Marshall A Burns
 * GitHub: @SchoolyB
 *           
 * Contributors:
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    This file contains the NLP interface component
 * =================================================
**/
 
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, CheckCircle, AlertTriangle, Loader2, X, Lightbulb, ArrowLeft, HelpCircle, Eye, Code } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

// Greeting configurations
const GREETINGS = [
  "Hello {username}, how can I assist you {timeOfDay}?",
  "Hi there {username}! What would you like to do {timeOfDay}?",
  "Welcome back {username}! How can I help {timeOfDay}?",
  "Hey {username}! Ready to work with your data {timeOfDay}?",
  "Good {timeOfDay} {username}! What can I help you accomplish?",
  "Hi {username}! Let's get something done {timeOfDay}!",
  "Hello {username}! What database magic shall we perform {timeOfDay}?",
];

const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'this morning';
  if (hour < 17) return 'this afternoon';
  return 'this evening';
};

const getRandomGreeting = (username: string): string => {
  const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
  const timeOfDay = getTimeOfDay();
  return greeting
    .replace('{username}', username)
    .replace('{timeOfDay}', timeOfDay);
};

// Typing animation hook
const useTypewriter = (text: string, speed: number = 30) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      return;
    }

    setIsTyping(true);
    setDisplayText('');
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isTyping };
};

interface NLPResponse {
  summary?: string;
  command?: string;
  is_batch_request?: boolean;
  batch_data_structures?: any[];
  total_collection_count?: number;
  total_cluster_count?: number;
  total_record_count?: number;
  clusters_per_collection?: number;
  records_per_cluster?: number;
  collection_names?: string[];
  cluster_names?: string[];
  record_names?: string[];
  record_types?: string[];
  record_values?: string[];
}

const NLPInterface = () => {
  const { projectName } = useParams<{ projectName: string }>();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [nlpResponse, setNlpResponse] = useState<NLPResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [finalResult, setFinalResult] = useState('');
  const [error, setError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  // Typewriter effect for the summary
  const { displayText: typedSummary, isTyping } = useTypewriter(
    showConfirmation && nlpResponse?.summary ? nlpResponse.summary : '', 
    25
  );

  // Typewriter effect for confirmation message
  const { displayText: typedConfirmation, isTyping: isTypingConfirmation } = useTypewriter(
    showConfirmationMessage ? confirmationMessage : '', 
    30
  );

  // Set greeting when component mounts
  useEffect(() => {
    if (user?.firstName) {
      setGreeting(getRandomGreeting(user.firstName));
    }
  }, [user]);

  const handleSubmitPrompt = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');
    setShowConfirmation(false);
    setFinalResult('');
    setShowRawResponse(false);

    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const encodedPrompt = encodeURIComponent(prompt);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectName}/nlp/chat?value=${encodedPrompt}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      
      try {
        const parsedData = JSON.parse(responseText);
        
        // Handle case where response is an array with the actual response as first element
        let parsedResponse: NLPResponse;
        
        if (Array.isArray(parsedData)) {
          //In the event that the array is empty
          parsedResponse = parsedData.length > 0 ? parsedData : [{ summary: 'No response data available' }];
        } else if (parsedData && typeof parsedData === 'object') { //If the response is an object, wrap it in an array
          parsedResponse = [parsedData];
        } else { // If the response is not an array or object, wrap it in an array
          parsedResponse = [{ summary: String(parsedData) || 'Invalid response format' }];
        }  

        //Note: Sometimes the API we are using for the NLP response doesnt always return the JSON format we expect.
        //So in the event the summary is'nt present, show a default message
        if (!parsedResponse.summary) {// TODO: summary is fucked up after commenting line 173
          parsedResponse.summary = 'Response received but no summary available';
        }
        
        setNlpResponse(parsedResponse);
        setShowConfirmation(true);
      } catch (parseError) {
        // If JSON parsing fails, treat as plain text
        setNlpResponse({ summary: responseText });
        setShowConfirmation(true);
      }
    } catch (err) {
      setError(`Failed to process request: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!nlpResponse) return;
  
    setIsConfirming(true);
    setError('');
  
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
  
      // Show immediate acknowledgment
      setConfirmationMessage("Perfect! I'll take care of that for you right away... 🚀");
      setShowConfirmationMessage(true);
      setShowConfirmation(false); // Hide the confirmation dialog
  
      const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectName}/nlp/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nlpResponse)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.text();
      
      // Update to success message
      setConfirmationMessage("All done! ✨ Your request has been completed successfully.");
      setFinalResult(result);
      
      // Clear the prompt and response
      setPrompt('');
      setNlpResponse(null);
  
      // Auto-hide the confirmation message after 5 seconds
      setTimeout(() => {
        setShowConfirmationMessage(false);
        setConfirmationMessage('');
      }, 5000);
  
    } catch (err) {
      setError(`Failed to execute action: ${err.message}`);
      setConfirmationMessage('');
      setShowConfirmationMessage(false);
    } finally {
      setIsConfirming(false);
    }
  };
  
  const handleCancel = () => {
    setShowConfirmation(false);
    setNlpResponse(null);
    setShowRawResponse(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitPrompt();
    }
  };

  const navigateToProject = () => {
    navigate(`/dashboard/projects/${encodeURIComponent(projectName!)}/collections`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={navigateToProject}
                className="flex items-center gap-2 text-sb-amber hover:text-sb-amber-dark transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Project
              </button>
              <div className="h-6 w-px" style={{ backgroundColor: 'var(--border-color)' }}></div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-sb-amber">{projectName}</span>
                <span style={{ color: 'var(--text-secondary)' }}>/</span>
                <span style={{ color: 'var(--text-primary)' }}>Natural Language Interface</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHelpModal(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 rounded-lg hover:border-sb-amber transition-colors"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                <HelpCircle size={16} />
                Help & Examples
              </button>
            </div>
          </div>
          
          {showConfirmationMessage && (
            <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  {isConfirming ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-white text-sm">✓</span>
                  )}
                </div>
                <div>
                  <div className="text-blue-400 font-medium text-lg">
                    {typedConfirmation}
                    {isTypingConfirmation && <span className="animate-pulse">|</span>}
                  </div>
                  {isConfirming && (
                    <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Processing your request...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-red-400 font-medium">Error</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</div>
              </div>
              <button onClick={() => setError('')} className="ml-auto">
                <X size={16} className="text-red-400 hover:text-red-300" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Dynamic Greeting */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {greeting || 'Natural Language Data Management'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Describe what you want to do with your data in plain English
            </p>
          </div>

          {/* Input Section - Hide when showing confirmation */}
          {!showConfirmation && (
            <div 
              className="rounded-lg border p-6"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Enter your command
                  </label>
                  <div className="relative">
                    <textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="e.g., Create a new collection called 'user-data' or Delete all records in the 'temp' cluster"
                      className="w-full p-4 border-2 border-gray-400 rounded-lg focus:border-sb-amber focus:outline-none resize-none transition-colors"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      }}
                      rows={3}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSubmitPrompt}
                      disabled={isLoading || !prompt.trim()}
                      className="absolute bottom-3 right-3 p-2 bg-sb-amber hover:bg-sb-amber-dark text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <MessageSquare className="w-4 h-4" />
                  <span>Press Enter to send, or Shift+Enter for new line</span>
                </div>
              </div>
            </div>
          )}

          {/* Large Summary Display */}
          {showConfirmation && nlpResponse && (
            <div className="space-y-6">
              {/* Original Query Context */}
              <div 
                className="rounded-lg border p-4"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={16} style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Your Request</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{prompt}</p>
              </div>

              {/* Large Summary Response */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-blue-400" />
                    <span className="text-xl font-semibold text-blue-400">Understanding Your Request</span>
                  </div>
                  
                  {/* Raw Response Toggle */}
                  <button
                    onClick={() => setShowRawResponse(!showRawResponse)}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                    title="Toggle raw JSON response (dev/testing)"
                  >
                    <Code size={14} />
                    {showRawResponse ? 'Hide Raw' : 'Show Raw'}
                  </button>
                </div>
                
                {/* Typed Summary */}
                <div 
                  className="rounded-md p-6 mb-6 border text-lg leading-relaxed min-h-[120px] flex items-center"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className="w-full">
                    {typedSummary}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </div>
                </div>

                {/* Raw Response (hidden by default) */}
                {showRawResponse && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2 text-yellow-400">Raw JSON Response (Development/Testing)</h4>
                    <div 
                      className="p-4 rounded text-sm font-mono border overflow-auto max-h-60"
                      style={{ 
                        backgroundColor: 'var(--bg-secondary)', 
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <pre className="whitespace-pre-wrap">{JSON.stringify(nlpResponse, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmAction}
                    disabled={isConfirming || isTyping}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                  >
                    {isConfirming ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    {isConfirming ? 'Executing...' : 'Confirm & Execute'}
                  </button>
                  
                  <button
                    onClick={handleCancel}
                    disabled={isConfirming}
                    className="px-6 py-3 border-2 border-gray-400 rounded-lg hover:border-sb-amber transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Result */}
          {finalResult && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
              <div className="flex items-center gap-2 text-green-400 mb-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Action Completed Successfully</span>
              </div>
              <div 
                className="rounded-md p-4 border"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
              >
                <pre className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{finalResult}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* ... existing help modal content ... */}
        </div>
      )}
    </div>
  );
};

export default NLPInterface;