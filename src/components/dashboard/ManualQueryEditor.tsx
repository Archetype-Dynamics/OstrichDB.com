/**
 * =================================================
 * Author: Marshall A Burns
 * GitHub: @SchoolyB
 * 
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Manual query editor component with REPL-like interface
 * =================================================
 **/

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { API_BASE_URL } from '../../config/api';
import { ArrowLeft, Play, Terminal, Copy, Trash2, History, HelpCircle } from 'lucide-react';

interface QueryResult {
  query: string;
  result: unknown;
  timestamp: Date;
  success: boolean;
  error?: string;
}

const ManualQueryEditor: React.FC = () => {
  const { projectName } = useParams<{ projectName: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  
  const [query, setQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [results]);

  const executeQuery = async () => {
    if (!query.trim() || !projectName) return;
    
    setIsExecuting(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const encodedQuery = encodeURIComponent(query.trim());
      const response = await fetch(
        `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(projectName)}/manual_query?value=${encodedQuery}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      const responseText = await response.text();
      let parsedResult = JSON.parse(responseText);

      // Make second request with method and path from backend
      const secondResponse = await fetch(`${API_BASE_URL}/${parsedResult.path}`, {
        method: parsedResult.method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const secondResponseText = await secondResponse.text();
      let finalResult;
      try {
        finalResult = JSON.parse(secondResponseText);
      } catch {
        finalResult = secondResponseText;
      }

      const queryResult: QueryResult = {
        query: query.trim(),
        result: finalResult,
        timestamp: new Date(),
        success: secondResponse.ok,
        error: secondResponse.ok ? undefined : `HTTP ${secondResponse.status}: ${secondResponseText}`
      };

      setResults(prev => [...prev, queryResult]);
      setQuery('');
      
    } catch (err) {
      const queryResult: QueryResult = {
        query: query.trim(),
        result: null,
        timestamp: new Date(),
        success: false,
        error: err instanceof Error ? err.message : 'An unknown error occurred'
      };
      
      setResults(prev => [...prev, queryResult]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      executeQuery();
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const copyResult = (result: unknown) => {
    const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(text);
  };

  const insertSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
    textareaRef.current?.focus();
  };

  const sampleQueries = [
    'NEW foo.bar.baz OF_TYPE []INT WITH 1,2,3,4,5',
    'FETCH foo.bar',
    'RENAME foo.bar.baz TO goob',
    'ERASE foo.bar.baz',
    'SET foo.bar.baz TO 5,4,3,2,1',
  ];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border-color, #374151)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/dashboard/projects/${projectName}/collections`)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-gray-400 hover:border-sb-amber transition-colors"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={16} />
              Back to Collections
            </button>
            
            <div className="flex items-center gap-2">
              <Terminal size={24} className="text-sb-amber" />
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Manual Query Editor
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 rounded-lg border-2 border-gray-400 hover:border-sb-amber transition-colors"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
              title="Help & Query Examples"
            >
              <HelpCircle size={16} style={{ color: 'var(--text-secondary)' }} />
            </button>
            
            <button
              onClick={clearResults}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-gray-400 hover:border-red-500 hover:text-red-400 transition-colors"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              disabled={results.length === 0}
            >
              <Trash2 size={16} />
              Clear Results
            </button>
          </div>
        </div>
        
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Project: <span className="font-medium text-sb-amber">{projectName}</span>
          {results.length > 0 && (
            <span className="ml-4">
              Query History: {results.length} {results.length === 1 ? 'query' : 'queries'}
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Query Input Panel */}
        <div className="flex-1 flex flex-col p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              OstrichDB Query
            </label>
            
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-32 p-4 border-2 rounded-lg resize-none font-mono text-sm focus:border-sb-amber focus:outline-none transition-colors"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color, #374151)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Enter your OstrichDB query here...
Example: SELECT * FROM users WHERE active = true

Use Ctrl+Enter (or Cmd+Enter on Mac) to execute"
                disabled={isExecuting}
              />
              
              <button
                onClick={executeQuery}
                disabled={isExecuting || !query.trim()}
                className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2 bg-sb-amber hover:bg-sb-amber-dark text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play size={16} />
                {isExecuting ? 'Executing...' : 'Execute'}
              </button>
            </div>
            
            <div className="mt-2 text-xs flex items-center gap-4" style={{ color: 'var(--text-secondary)' }}>
              <span>Press Ctrl+Enter (Cmd+Enter) to execute</span>
              <span>"</span>
              <span>Query will be sent to: /api/v1/projects/{projectName}/manual_query</span>
            </div>
          </div>

          {/* Sample Queries */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Quick Start Examples
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sampleQueries.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => insertSampleQuery(sample)}
                  className="text-left p-2 text-xs font-mono border rounded hover:bg-sb-amber hover:text-black transition-colors"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color, #374151)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="flex-1 flex flex-col p-6 border-l" style={{ borderColor: 'var(--border-color, #374151)' }}>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Query Results & History
            </label>
            <div className="flex items-center gap-2">
              <History size={16} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto border-2 rounded-lg p-4 space-y-4" style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderColor: 'var(--border-color, #374151)'
          }}>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <Terminal size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  No queries executed yet
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Enter a query above and click Execute to see results here
                </p>
              </div>
            ) : (
              <>
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4" style={{ borderColor: 'var(--border-color, #374151)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {result.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <code className="text-sm font-mono p-2 rounded block" style={{ 
                          backgroundColor: 'var(--bg-primary)', 
                          color: 'var(--text-primary)'
                        }}>
                          {result.query}
                        </code>
                      </div>
                      <button
                        onClick={() => copyResult(result.result)}
                        className="p-1 hover:bg-gray-200 hover:bg-opacity-20 rounded transition-colors"
                        title="Copy result"
                      >
                        <Copy size={16} style={{ color: 'var(--text-secondary)' }} />
                      </button>
                    </div>
                    
                    <div className="mt-2">
                      {result.success ? (
                        <pre className="text-xs overflow-x-auto p-2 rounded" style={{ 
                          backgroundColor: 'var(--bg-primary)', 
                          color: 'var(--text-primary)'
                        }}>
                          {typeof result.result === 'string' 
                            ? result.result 
                            : JSON.stringify(result.result, null, 2)
                          }
                        </pre>
                      ) : (
                        <div className="text-xs p-2 rounded border-l-4 border-red-500" style={{ 
                          backgroundColor: 'var(--bg-primary)', 
                          color: 'var(--text-red, #ef4444)'
                        }}>
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={resultsEndRef} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-lg border-2 p-6"
            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color, #374151)' }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Manual Query Editor Help
              </h2>
              <button
                onClick={() => setShowHelp(false)}
                className="p-2 hover:bg-gray-200 hover:bg-opacity-20 rounded transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                �
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  =� Getting Started
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li>" Type your OstrichDB query in the text area</li>
                  <li>" Click "Execute" or press Ctrl+Enter (Cmd+Enter on Mac) to run</li>
                  <li>" Results appear in the right panel with timestamps</li>
                  <li>" Use sample queries to get started quickly</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  =' Common Query Types
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Select Data:</strong>
                    <code className="ml-2 p-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      SELECT * FROM collection_name WHERE condition
                    </code>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Insert Data:</strong>
                    <code className="ml-2 p-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      INSERT INTO collection (field1, field2) VALUES ("value1", "value2")
                    </code>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Update Data:</strong>
                    <code className="ml-2 p-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      UPDATE collection SET field = "new_value" WHERE id = 123
                    </code>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Delete Data:</strong>
                    <code className="ml-2 p-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      DELETE FROM collection WHERE condition
                    </code>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  ( Keyboard Shortcuts
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li>" <strong>Ctrl+Enter</strong> (or <strong>Cmd+Enter</strong>): Execute query</li>
                  <li>" Click on sample queries to insert them quickly</li>
                  <li>" Use the Copy button to copy results to clipboard</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border-l-4 border-yellow-500" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  � Important Notes
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li>" Queries are executed directly against your OstrichDB project</li>
                  <li>" Be careful with UPDATE and DELETE operations</li>
                  <li>" All queries are logged in the results history</li>
                  <li>" Results are automatically formatted as JSON when possible</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowHelp(false)}
                className="px-6 py-2 bg-sb-amber hover:bg-sb-amber-dark text-white rounded-xl transition-all duration-200"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-900/20 border border-red-500/30 rounded-lg p-4 max-w-md">
          <div className="text-red-400 text-sm font-medium mb-1">Error</div>
          <div className="text-xs text-red-300">{error}</div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default ManualQueryEditor;