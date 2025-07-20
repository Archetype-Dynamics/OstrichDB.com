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
 *    The component for managing a users projects in the dashboard.
 * =================================================
 **/

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { API_BASE_URL } from '../../config/api';
import { Filter, ChevronDown, FolderOpen } from 'lucide-react';

interface Project {
  name: string;
  projectID?: string;
  userID?: string;
  createdAt?: string;
  version?: string;
  collectionCount?: number;
  lastModified?: string;
  size?: string;
}

interface ProjectData {
  name: string;
  collaborators: string; // Not yet implemented in the backend, just a placeholder for now
  password: string; // Not yet implemented in the backend, just a placeholder for now
}

interface Collection {
  name: string;
  lastModified?: string;
  size?: string;
}

type SortOption = 'alphabetical' | 'size' | 'dateModified' | 'collectionCount';

const ProjectsComponent: React.FC = () => {
  
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    collaborators: '',
    password: ''
  });

  const sortOptions = [
    { value: 'alphabetical', label: 'Alphabetical (A-Z)' },
    { value: 'collectionCount', label: 'Number of Collections' },
    { value: 'size', label: 'Project Size' },
    { value: 'dateModified', label: 'Last Modified' }
  ];

  // Project name validation function
  const validateProjectName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Project name is required';
    }
    
    if (name.length > 32) {
      return 'Project name must be 32 characters or less';
    }
    
    // Check for invalid characters (only letters, numbers, underscores, and hyphens allowed)
    const validNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validNameRegex.test(name)) {
      return 'Project name can only contain letters, numbers, underscores (_), and hyphens (-)';
    }
    
    // Check for spaces
    if (name.includes(' ')) {
      return 'Project name cannot contain spaces';
    }
    
    return null;
  };

  // Function to truncate project names for display
  const truncateProjectName = (name: string, maxLength: number = 18): string => {
    if (name.length <= maxLength) {
      return name;
    }
    return `${name.substring(0, maxLength - 3)}...`;
  };

  // Check for duplicate project names
  const isDuplicateProjectName = (name: string): boolean => {
    return projects.some(project => 
      project.name.toLowerCase() === name.toLowerCase()
    );
  };

  // Memoized sorted projects
  const sortedProjects = useMemo(() => {
    if (!projects.length) return projects;

    const sorted = [...projects].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        
        case 'collectionCount':
          return (b.collectionCount || 0) - (a.collectionCount || 0);
        
        case 'size':
          // Extract numeric value from size string for comparison
          const getSizeValue = (sizeStr: string) => {
            if (!sizeStr || sizeStr === 'Unknown' || sizeStr === 'Calculating...') return 0;
            const match = sizeStr.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
          };
          return getSizeValue(b.size || '') - getSizeValue(a.size || '');
        
        case 'dateModified':
          const getModifiedDate = (dateStr: string) => {
            if (!dateStr || dateStr === 'Unknown' || dateStr === 'Recently') return new Date();
            return new Date(dateStr);
          };
          return getModifiedDate(b.lastModified || '').getTime() - getModifiedDate(a.lastModified || '').getTime();
        
        default:
          return 0;
      }
    });

    return sorted;
  }, [projects, sortBy]);

  useEffect(() => {
    
    if (isSignedIn && user) {
      fetchProjects();
    } else {
    }
  }, [isSignedIn, user]);

  const fetchProjectMetadata = async (projectName: string, token: string) => {
    try {
      // Fetch collections for this project
      const collectionsResponse = await fetch(
        `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(projectName)}/collections`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      if (!collectionsResponse.ok) {
        return {
          collectionCount: 0,
          lastModified: 'Unknown',
          size: 'Unknown'
        };
      }

      const collectionsData = await collectionsResponse.text();
      let collections: Collection[] = [];
      let totalSize = 0;
      let latestModified = new Date(0);

      try {
        const jsonData = JSON.parse(collectionsData);
        if (jsonData.collections && Array.isArray(jsonData.collections)) {
          collections = jsonData.collections.map((item: string | Collection) => {
            if (typeof item === 'string') {
              return {
                name: item,
                lastModified: 'Unknown',
                size: 'Unknown'
              };
            }
            return item;
          });

          // Calculate total size and latest modification
          collections.forEach(collection => {
            // Parse size
            if (collection.size && collection.size !== 'Unknown') {
              const sizeMatch = collection.size.match(/(\d+)/);
              if (sizeMatch) {
                totalSize += parseInt(sizeMatch[1]);
              }
            }

            // Find latest modification
            if (collection.lastModified && collection.lastModified !== 'Unknown') {
              const modDate = new Date(collection.lastModified);
              if (modDate > latestModified) {
                latestModified = modDate;
              }
            }
          });
        }
      } catch (parseError) {
      }

      return {
        collectionCount: collections.length,
        lastModified: latestModified.getTime() > 0 ? latestModified.toLocaleDateString() : 'Recently',
        size: totalSize > 0 ? `${totalSize} MB` : 'Empty'
      };

    } catch (error) {
      return {
        collectionCount: 0,
        lastModified: 'Unknown',
        size: 'Unknown'
      };
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Get list of all projects
      const response = await fetch(`${API_BASE_URL}/api/v1/projects`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      const data = await response.text();

      try {
        const jsonData = JSON.parse(data);
       
        if (jsonData.projects && Array.isArray(jsonData.projects)) {
          // Fetch metadata for each project in parallel
          const projectsWithMetadata = await Promise.all(
            jsonData.projects.map(async (name: string) => {
              const metadata = await fetchProjectMetadata(name, token);
              return {
                name,
                ...metadata
              };
            })
          );
          
          setProjects(projectsWithMetadata);
        } else {
          setProjects([]);
        }
      } catch (parseError) {
        setProjects([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing in project name field
    if (name === 'name' && error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate project name
    const nameError = validateProjectName(projectData.name);
    if (nameError) {
      setError(nameError);
      return;
    }

    // Check for duplicate names
    if (isDuplicateProjectName(projectData.name)) {
      setError('A project with this name already exists');
      return;
    }

    try {
      setCreateLoading(true);
      setError(null);
  
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/projects/${encodeURIComponent(projectData.name)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create project: ${errorText}`);
      }

      // Success - refresh the projects list and close modal
      await fetchProjects();
      setIsModalOpen(false);
      setProjectData({ name: '', collaborators: '', password: '' });
  
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleProjectClick = (projectName: string) => {
    navigate(`/dashboard/projects/${encodeURIComponent(projectName)}/collections`);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setIsFilterOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-40">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sb-amber"></div>
        <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>
          Loading {user?.firstName}'s projects...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-40">
      {error && (
        <div className="w-full max-w-2xl bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
          <div className="text-red-400 text-sm font-medium mb-1">Error</div>
          <div className="text-xs text-red-300 whitespace-pre-wrap">{error}</div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}

     {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {user?.firstName}'s Projects
        </h1>
        {projects.length === 0 ? (
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Get started by creating your first project
          </p>
        ) : projects.length >= 6 ? (
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            You have {projects.length} project{projects.length === 1 ? '' : 's'}
          </p>
        ) : null}
      </div>

      {/* Filter/Sort Section */}
      {projects.length > 0 && (
        <div className="w-full max-w-4xl flex justify-end mb-4">
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 rounded-lg hover:border-sb-amber transition-colors"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <Filter size={16} />
              <span>Sort by: {sortOptions.find(option => option.value === sortBy)?.label}</span>
              <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 border-2 border-gray-400 rounded-lg shadow-lg z-10"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value as SortOption)}
                    className={`w-full text-left px-4 py-3 hover:bg-sb-amber hover:text-black transition-colors first:rounded-t-md last:rounded-b-md ${
                      sortBy === option.value ? 'bg-sb-amber text-black' : ''
                    }`}
                    style={{ color: sortBy === option.value ? 'black' : 'var(--text-primary)' }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {sortedProjects.length > 0 && (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((project, index) => (
            <div
              key={`project-${index}-${project.name}`}
              onClick={() => handleProjectClick(project.name)}
              className="border-2 border-gray-400 p-6 rounded-lg hover:bg-white hover:border-sb-amber hover:shadow-lg hover:-translate-y-1 hover:text-black transition-all duration-300 cursor-pointer transform"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FolderOpen size={24} className="text-sb-amber flex-shrink-0" />
                  <h3 
                    className="text-xl font-semibold truncate" 
                    style={{ color: 'var(--text-primary)' }}
                    title={project.name || 'Unnamed Project'} // Show full name on hover
                  >
                    {truncateProjectName(project.name || 'Unnamed Project')}
                  </h3>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" title="Active"></div>
              </div>          
              
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p>📁 Collections: {project.collectionCount !== undefined ? project.collectionCount : 'Loading...'}</p>
                <p>🕒 Last modified: {project.lastModified || 'Recently'}</p>
                <p>📊 Size: {project.size || 'Calculating...'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Button */}
      <div className="w-full max-w-4xl">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full border-2 border-dashed border-gray-400 text-lg px-8 py-6 rounded-lg hover:bg-sb-amber hover:border-sb-amber hover:shadow-lg hover:-translate-y-1 hover:text-black transition-all duration-300 cursor-pointer transform"
          style={{ color: 'var(--text-secondary)' }}
        >
          + Create New Project
        </button>
      </div>

      {/* Empty State */}
      {projects.length === 0 && !loading && !error && (
        <div className="w-full max-w-2xl text-center py-12">
          <div className="text-6xl mb-4">🗂️</div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            No projects yet
          </h3>
          <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
            Create your first project to start building with OstrichDB
          </p>
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg w-full max-w-md border-2 shadow-xl animate-slide-up"
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border-color, #374151)' 
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Create New Project
            </h2>
        
            {error && (
              <div 
                className="border px-4 py-3 rounded mb-4"
                style={{ 
                  backgroundColor: 'var(--error-bg, #fef2f2)', 
                  borderColor: 'var(--error-border, #fca5a5)',
                  color: 'var(--error-text, #dc2626)'
                }}
              >
                {error}
              </div>
            )}
        
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label 
                  className="block text-sm font-medium mb-1" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={projectData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border-2 rounded focus:border-sb-amber focus:outline-none transition-colors"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: 'var(--border-color, #374151)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="my-awesome-project"
                  required
                  disabled={createLoading}
                  maxLength={32}
                />
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {projectData.name.length}/32 characters • Only letters, numbers, underscores (_), and hyphens (-) allowed
                </div>
              </div>
          
              <div className="mb-4">
                <label 
                  className="block text-sm font-medium mb-1" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  Add Collaborator (Email)
                </label>
                <input
                  type="email"
                  name="collaborators"
                  value={projectData.collaborators}
                  onChange={handleInputChange}
                  className="w-full p-2 border-2 rounded focus:border-sb-amber focus:outline-none transition-colors"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: 'var(--border-color, #374151)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="colleague@example.com (optional)"
                  disabled={createLoading}
                />
              </div>
          
              <div className="mb-6">
                <label 
                  className="block text-sm font-medium mb-1" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  Project Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={projectData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border-2 rounded focus:border-sb-amber focus:outline-none transition-colors"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: 'var(--border-color, #374151)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Enter password for project (optional)"
                  disabled={createLoading}
                />
              </div>
          
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError(null);
                    setProjectData({ name: '', collaborators: '', password: '' });
                  }}
                  className="px-4 py-2 border-2 rounded-xl transition-all duration-200 hover:opacity-80"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: 'var(--border-color, #374151)',
                    color: 'var(--text-secondary)'
                  }}
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sb-amber hover:bg-sb-amber-dark text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={createLoading || !projectData.name.trim() || validateProjectName(projectData.name) !== null}
                >
                  {createLoading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Click outside to close filter dropdown */}
      {isFilterOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
}

export default ProjectsComponent;