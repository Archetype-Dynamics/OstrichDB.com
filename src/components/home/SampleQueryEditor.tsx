/**
 * =================================================
 * Author: Marshall A Burns
 * GitHub: @SchoolyB
 * Contributors:
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Interactive query editor demo component for the homepage.
 * =================================================
 **/

import React, { useState, useRef, useEffect } from 'react';

interface QueryResult {
  type: 'success' | 'error' | 'info';
  message: string;
  data?: any;
}

interface HistoryEntry {
  query: string;
  result: QueryResult;
  timestamp: string;
}

const TerminalQueryEditor: React.FC = () => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample data structure for simulation
  const [dataStructure] = useState({
    collections: {
      'ecommerce': {
        clusters: {
          'products': {
            records: {
              'laptop-pro': { type: 'STRING', value: 'MacBook Pro' },
              'price': { type: 'INTEGER', value: 2499 },
              'category': { type: 'STRING', value: 'electronics' }
            }
          },
          'users': {
            records: {
              'user_count': { type: 'INTEGER', value: 1250 },
              'active_users': { type: 'INTEGER', value: 890 }
            }
          }
        }
      },
      'blog': {
        clusters: {
          'posts': {
            records: {
              'total_posts': { type: 'INTEGER', value: 45 },
              'featured_post': { type: 'STRING', value: 'Getting Started with OstrichDB' }
            }
          }
        }
      }
    }
  });

  // Scroll to bottom when history updates
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const simulateQuery = (queryStr: string): QueryResult => {
    const upperQuery = queryStr.toUpperCase().trim();
    const tokens = upperQuery.split(' ');

    if (!tokens.length) {
      return { type: 'error', message: 'Empty query' };
    }

    const command = tokens[0];

    try {
      switch (command) {
        case 'NEW':
          return handleNewCommand(tokens);
        case 'FETCH':
          return handleFetchCommand(tokens);
        case 'COUNT':
          return handleCountCommand(tokens);
        case 'HELP':
          return handleHelpCommand(tokens);
        case 'VERSION':
          return { type: 'info', message: 'OstrichDB CLI v2.1.0 - Built with Odin' };
        case 'CLEAR':
          setHistory([]);
          return { type: 'info', message: 'Terminal cleared' };
        case 'SIZE_OF':
          return handleSizeOfCommand(tokens);
        case 'TYPE_OF':
          return handleTypeOfCommand(tokens);
        default:
          return { type: 'error', message: `Unknown command: ${command}` };
      }
    } catch (error) {
      return { type: 'error', message: 'Query execution failed' };
    }
  };

  const handleNewCommand = (tokens: string[]): QueryResult => {
    if (tokens.length < 2) {
      return { type: 'error', message: 'NEW command requires a location' };
    }

    const location = tokens[1];
    const parts = location.split('.');

    if (parts.length === 1) {
      return { type: 'success', message: `Collection '${parts[0]}' created successfully` };
    } else if (parts.length === 2) {
      return { type: 'success', message: `Cluster '${parts[1]}' created in collection '${parts[0]}'` };
    } else if (parts.length === 3) {
      const typeIndex = tokens.indexOf('OF_TYPE');
      const withIndex = tokens.indexOf('WITH');
      
      if (typeIndex !== -1 && typeIndex + 1 < tokens.length) {
        const dataType = tokens[typeIndex + 1];
        let value = '';
        
        if (withIndex !== -1 && withIndex + 1 < tokens.length) {
          value = tokens.slice(withIndex + 1).join(' ');
          return { 
            type: 'success', 
            message: `Record '${parts[2]}' created with type ${dataType} and value "${value}"`,
            data: { location, type: dataType, value }
          };
        }
        
        return { 
          type: 'success', 
          message: `Record '${parts[2]}' created with type ${dataType}`,
          data: { location, type: dataType }
        };
      }
      
      return { type: 'error', message: 'Records require OF_TYPE parameter' };
    }

    return { type: 'error', message: 'Invalid location format' };
  };

  const handleFetchCommand = (tokens: string[]): QueryResult => {
    if (tokens.length < 2) {
      return { type: 'error', message: 'FETCH command requires a location' };
    }

    const location = tokens[1];
    const parts = location.split('.');

    // Simulate fetching from our mock data structure
    if (parts.length === 3) {
      const [collection, cluster, record] = parts;
      const data = dataStructure.collections[collection.toLowerCase()]?.clusters[cluster.toLowerCase()]?.records[record.toLowerCase()];
      
      if (data) {
        return { 
          type: 'success', 
          message: `${record} :${data.type}: ${data.value}`,
          data: data
        };
      }
    }

    // Default responses for demo purposes
    if (location.includes('laptop-pro')) {
      return { type: 'success', message: 'laptop-pro: STRING = "MacBook Pro"' };
    } else if (location.includes('price')) {
      return { type: 'success', message: 'price: INTEGER = 2499' };
    } else if (location.includes('user_count')) {
      return { type: 'success', message: 'user_count: INTEGER = 1250' };
    }

    return { type: 'error', message: `Record not found: ${location}` };
  };

  const handleCountCommand = (tokens: string[]): QueryResult => {
    if (tokens.length < 2) {
      return { type: 'error', message: 'COUNT command requires a target (COLLECTIONS, CLUSTERS, RECORDS)' };
    }

    const target = tokens[1];
    
    switch (target) {
      case 'COLLECTIONS':
        return { type: 'success', message: 'Total collections: 2' };
      case 'CLUSTERS':
        if (tokens.length > 2) {
          const collection = tokens[2];
          return { type: 'success', message: `Clusters in '${collection}': 2` };
        }
        return { type: 'success', message: 'Total clusters: 4' };
      case 'RECORDS':
        if (tokens.length > 2) {
          const location = tokens[2];
          return { type: 'success', message: `Records in '${location}': 3` };
        }
        return { type: 'success', message: 'Total records: 7' };
      default:
        return { type: 'error', message: `Invalid count target: ${target}` };
    }
  };

  const handleHelpCommand = (tokens: string[]): QueryResult => {
    if (tokens.length > 1) {
      const command = tokens[1];
      const helpText = getCommandHelp(command);
      return { type: 'info', message: helpText };
    }

    const generalHelp = `
OstrichDB CLI - Available Commands:

Core Operations:
  NEW <location> [OF_TYPE <type>] [WITH <value>]  - Create collections/clusters/records
  FETCH <location>                                - Retrieve data
  ERASE <location>                               - Delete data structures
  RENAME <old> TO <new>                          - Rename objects

Query & Info:
  COUNT <COLLECTIONS|CLUSTERS|RECORDS>           - Count objects
  SIZE_OF <location>                            - Get object size
  TYPE_OF <location>                            - Get record type

Utility:
  HELP [command]                                - Show help
  VERSION                                       - Show version
  CLEAR                                         - Clear terminal
  EXIT                                          - Exit CLI

Try: HELP <command> for detailed information about a specific command.`;

    return { type: 'info', message: generalHelp };
  };

  const handleSizeOfCommand = (tokens: string[]): QueryResult => {
    if (tokens.length < 2) {
      return { type: 'error', message: 'SIZE_OF command requires a location' };
    }
    const location = tokens[1];
    return { type: 'success', message: `Size of '${location}': 1.2 KB` };
  };

  const handleTypeOfCommand = (tokens: string[]): QueryResult => {
    if (tokens.length < 2) {
      return { type: 'error', message: 'TYPE_OF command requires a location' };
    }
    const location = tokens[1];
    const parts = location.split('.');
    
    if (parts.length === 3) {
      // Simulate type lookup
      if (location.includes('price')) {
        return { type: 'success', message: `Type of '${parts[2]}': INTEGER` };
      } else {
        return { type: 'success', message: `Type of '${parts[2]}': STRING` };
      }
    }
    
    return { type: 'error', message: 'TYPE_OF can only be used with records' };
  };

  const getCommandHelp = (command: string): string => {
    const helpTexts: { [key: string]: string } = {
      'NEW': `NEW - Create new data structures
Usage: 
  NEW <collection>                              - Create collection
  NEW <collection>.<cluster>                    - Create cluster
  NEW <collection>.<cluster>.<record> OF_TYPE <type> [WITH <value>]

Examples:
  NEW ecommerce
  NEW ecommerce.products
  NEW ecommerce.products.laptop OF_TYPE STRING WITH "MacBook Pro"`,

      'FETCH': `FETCH - Retrieve data from the database
Usage: FETCH <location>

Examples:
  FETCH ecommerce.products.laptop
  FETCH ecommerce.users`,

      'COUNT': `COUNT - Count objects in the database
Usage: COUNT <COLLECTIONS|CLUSTERS|RECORDS> [location]

Examples:
  COUNT COLLECTIONS
  COUNT CLUSTERS ecommerce
  COUNT RECORDS ecommerce.products`,

    };

    return helpTexts[command] || `No help available for command: ${command}`;
  };

  const executeQuery = () => {
    if (!query.trim()) return;

    setIsExecuting(true);
    
    // Simulate execution delay
    setTimeout(() => {
      const result = simulateQuery(query);
      const entry: HistoryEntry = {
        query,
        result,
        timestamp: new Date().toLocaleTimeString()
      };

      setHistory(prev => [...prev, entry]);
      setQuery('');
      setIsExecuting(false);
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeQuery();
    }
  };

  const getResultColor = (type: QueryResult['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-blue-400';
      default: return 'var(--text-primary)';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Manual Query Editor
        </h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Experience data manipulation via the CLI while your browser
        </p>
      </div>

      {/* Terminal Window */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{ borderColor: "var(--border-color)" }}
      >
        {/* Terminal Header */}
        <div 
          className="px-4 py-2 flex items-center"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div 
            className="ml-4 text-sm font-mono"
            style={{ color: "var(--text-primary)" }}
          >
            Manual Query Editor v1.0.0
          </div>
        </div>

        {/* Terminal Content */}
        <div 
          ref={terminalRef}
          className="p-4 h-80 overflow-y-auto font-mono text-sm"
          style={{ backgroundColor: "var(--bg-primary)" }}
        >
          {/* Welcome Message */}
          {history.length === 0 && (
            <div className="text-sb-amber mb-4">
              Welcome to The Manual Query Editor v1.0.0<br />
              Type 'HELP' for available command
            </div>
          )}

          {/* Command History */}
          {history.map((entry, index) => (
            <div key={index} className="mb-3">
              <div className="flex items-center">
                <span className="text-sb-amber mr-2">ostrichdb@demo:~$</span>
                <span style={{ color: "var(--text-primary)" }}>{entry.query}</span>
              </div>
              <div 
                className="mt-1 pl-4 whitespace-pre-wrap"
                style={{ color: getResultColor(entry.result.type) }}
              >
                {entry.result.message}
              </div>
            </div>
          ))}

          {/* Current Input Line */}
          <div className="flex items-center">
            <span className="text-sb-amber mr-2">ostrichdb@demo:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent outline-none"
              style={{ color: "var(--text-primary)" }}
              placeholder="Enter OstrichDB query..."
              disabled={isExecuting}
            />
            {isExecuting && (
              <span className="text-sb-amber animate-pulse ml-2">⏳</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div 
          className="px-4 py-2 flex justify-between items-center"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Press Enter to execute • Type 'HELP' for commands
          </div>
          <button
            onClick={executeQuery}
            disabled={!query.trim() || isExecuting}
            className="bg-sb-amber hover:bg-sb-amber-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs font-medium transition-colors"
          >
            {isExecuting ? 'Executing...' : 'Execute'}
          </button>
        </div>
      </div>

      {/* Quick Examples */}
      <div 
        className="rounded-lg p-4 border border-dashed"
        style={{ 
          backgroundColor: "var(--bg-secondary)", 
          borderColor: "var(--border-color)" 
        }}
      >
        <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
          Try these example queries:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button
            onClick={() => setQuery('COUNT COLLECTIONS')}
            className="text-left text-sm hover:text-sb-amber transition-colors p-1 rounded"
            style={{ 
              color: "var(--text-primary)",
              backgroundColor: "transparent"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            • COUNT COLLECTIONS
          </button>
          <button
            onClick={() => setQuery('FETCH ecommerce.products.laptop-pro')}
            className="text-left text-sm hover:text-sb-amber transition-colors p-1 rounded"
            style={{ 
              color: "var(--text-primary)",
              backgroundColor: "transparent"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            • FETCH ecommerce.products.laptop-pro
          </button>
          <button
            onClick={() => setQuery('NEW store.items.phone OF_TYPE STRING WITH "iPhone 15"')}
            className="text-left text-sm hover:text-sb-amber transition-colors p-1 rounded"
            style={{ 
              color: "var(--text-primary)",
              backgroundColor: "transparent"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            • NEW store.items.phone OF_TYPE STRING WITH "iPhone 15"
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerminalQueryEditor;