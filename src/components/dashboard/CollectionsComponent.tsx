/**
 * =================================================
 * Author: Marshall Burns
 * GitHub: @SchoolyB
 * Contributors:
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    The component for managing a user's collections within a project.
 * =================================================
 **/

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { API_BASE_URL } from '../../config/api';
import { ArrowLeft, Database, Plus, Filter, ChevronDown, MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface Collection {
  name: string;
  createdAt?: string;
  lastModified?: string;
  size?: string;
  description?: string;
  encryption: boolean;
}

type SortOption = 'alphabetical' | 'size' | 'dateCreated' | 'dateModified';

// Utility function to format ISO date string to readable format
const formatDate = (dateString: string): string => {
  if (!dateString || dateString === 'Unknown' || dateString === 'Recently') {
    return dateString;
  }

  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }

    // Format as M/D/YYYY
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  } catch (error) {
    console.warn('Error formatting date:', error);
    return dateString; // Return original if error
  }
};

const CollectionsComponent: React.FC = () => {
  const navigate = useNavigate();
  const { projectName } = useParams<{ projectName: string }>();
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [collectionData, setCollectionData] = useState<Collection>({
    name: '',
    description: '',
    encryption: true
  });
  
  // Collection options and rename/delete state
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirmationValue, setDeleteConfirmationValue] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const sortOptions = [
    { value: 'alphabetical', label: 'Alphabetical (A-Z)' },
    { value: 'size', label: 'Size' },
    { value: 'dateCreated', label: 'Date Created' },
    { value: 'dateModified', label: 'Last Modified' }
  ];

  // Collection name validation function
  const validateCollectionName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Collection name is required';
    }
    
    if (name.length > 32) {
      return 'Collection name must be 32 characters or less';
    }
    
    // Check for invalid characters (only letters, numbers, underscores, and hyphens allowed)
    const validNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validNameRegex.test(name)) {
      return 'Collection name can only contain letters, numbers, underscores (_), and hyphens (-)';
    }
    
    // Check for spaces
    if (name.includes(' ')) {
      return 'Collection name cannot contain spaces';
    }
    
    return null;
  };

  // Function to truncate collection names for display
  const truncateCollectionName = (name: string, maxLength: number = 18): string => {
    if (name.length <= maxLength) {
      return name;
    }
    return `${name.substring(0, maxLength - 3)}...`;
  };

  // Check for duplicate collection names
  const isDuplicateCollectionName = (name: string): boolean => {
    return collections.some(collection => 
      collection.name.toLowerCase() === name.toLowerCase()
    );
  };

  // Memoized sorted collections
  const sortedCollections = useMemo(() => {
    if (!collections.length) return collections;

    const sorted = [...collections].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        
        case 'size':
          // Extract numeric value from size string for comparison
          const getSizeValue = (sizeStr: string) => {
            if (!sizeStr || sizeStr === 'Unknown' || sizeStr === 'Calculating...') return 0;
            const match = sizeStr.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
          };
          return getSizeValue(b.size || '') - getSizeValue(a.size || '');
        
        case 'dateCreated':
          const getCreatedDate = (dateStr: string) => {
            if (!dateStr || dateStr === 'Unknown') return new Date(0);
            return new Date(dateStr);
          };
          return getCreatedDate(b.createdAt || '').getTime() - getCreatedDate(a.createdAt || '').getTime();
        
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
  }, [collections, sortBy]);

  useEffect(() => {
    if (isSignedIn && user && projectName) {
      fetchCollections();
    }
  }, [isSignedIn, user, projectName]);

  const fetchCollections = async () => {

    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/projects/${encodeURIComponent(projectName!)}/collections`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch collections: ${response.status}`);
      }

      const data = await response.text();
      try {
        const jsonData = JSON.parse(data);
        
        if (jsonData.collections && Array.isArray(jsonData.collections)) {
          // Handle both string arrays (old format) and object arrays (new format)
          const collectionsArray = jsonData.collections.map((item: string | Collection) => {
            if (typeof item === 'string') {
              
              return {
                name: item,
                description: 'Collection',
                lastModified: 'Recently',
                createdAt: 'Unknown',
                size: 'Unknown',
                encryption: true
              };
            } else {
              
              return {
                name: item.name,
                description: 'Collection',
                lastModified: item.lastModified || 'Unknown',
                createdAt: item.createdAt || 'Unknown',
                size: item.size || 'Unknown',
                encryption: true
              };
            }
          });
          setCollections(collectionsArray);
        } else {
          setCollections([]);
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Failed to parse response:', data);
        setCollections([]);
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCollectionData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setCollectionData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing in collection name field
    if (name === 'name' && error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate collection name
    const nameError = validateCollectionName(collectionData.name);
    if (nameError) {
      setError(nameError);
      return;
    }

    // Check for duplicate names
    if (isDuplicateCollectionName(collectionData.name)) {
      setError('A collection with this name already exists');
      return;
    }

    try {
      setCreateLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/projects/${encodeURIComponent(projectName!)}/collections/${encodeURIComponent(collectionData.name)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/text',
          'Accept': 'application/text',
        },
        body: JSON.stringify({
          description: collectionData.description,
          encryption: collectionData.encryption
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create collection: ${errorText}`);
      }

      // Success - refresh the collections list and close modal
      await fetchCollections();
      setIsModalOpen(false);
      setCollectionData({ name: '', description: '', encryption: true });

    } catch (err) {
      console.error('Error creating collection:', err);
      setError(err instanceof Error ? err.message : 'Failed to create collection');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCollectionClick = (collectionName: string) => {
    navigate(`/dashboard/projects/${encodeURIComponent(projectName!)}/collections/${encodeURIComponent(collectionName)}`);
  };

  const handleBackToProjects = () => {
    navigate('/dashboard');
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setIsFilterOpen(false);
  };

  // Collection options modal functions
  const openCollectionOptionsModal = (collection: Collection, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent collection click when clicking options
    setSelectedCollection(collection);
    setIsOptionsModalOpen(true);
  };

  const openRenameModal = () => {
    if (selectedCollection) {
      setRenameValue(selectedCollection.name);
      setIsOptionsModalOpen(false);
      setIsRenameModalOpen(true);
    }
  };

  const openDeleteModal = () => {
    setDeleteConfirmationValue('');
    setIsOptionsModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  // Handle collection rename
  const handleRenameCollection = async () => {
    if (!selectedCollection || !renameValue.trim()) return;

    // Validate new collection name
    const nameError = validateCollectionName(renameValue);
    if (nameError) {
      setError(nameError);
      return;
    }

    // Check if new name is different from current name
    if (renameValue === selectedCollection.name) {
      setError('New collection name must be different from the current name');
      return;
    }

    // Check for duplicate names
    if (isDuplicateCollectionName(renameValue)) {
      setError('A collection with this name already exists');
      return;
    }

    try {
      setRenameLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(projectName!)}/collections/${encodeURIComponent(selectedCollection.name)}?rename=${encodeURIComponent(renameValue)}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to rename collection: ${errorText}`);
      }

      // Success - refresh collections and close modal
      await fetchCollections();
      setIsRenameModalOpen(false);
      setRenameValue('');
      setSelectedCollection(null);

    } catch (err) {
      console.error('Error renaming collection:', err);
      setError(err instanceof Error ? err.message : 'Failed to rename collection');
    } finally {
      setRenameLoading(false);
    }
  };

  // Handle collection delete
  const handleDeleteCollection = async () => {
    if (!selectedCollection || deleteConfirmationValue !== selectedCollection.name) {
      setError('Please type the exact collection name to confirm deletion');
      return;
    }

    try {
      setDeleteLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(projectName!)}/collections/${encodeURIComponent(selectedCollection.name)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete collection: ${errorText}`);
      }

      // Success - refresh collections and close modal
      await fetchCollections();
      setIsDeleteModalOpen(false);
      setDeleteConfirmationValue('');
      setSelectedCollection(null);

    } catch (err) {
      console.error('Error deleting collection:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete collection');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-40">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sb-amber"></div>
        <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>
          Loading collections for {projectName}...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-40">
      {/* Production Warning */}
      <div className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">⚠️</span>
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">NOT FOR PRODUCTION USE</div>
              <div className="text-sm opacity-90 mt-1">
                This software is in early development. Using it for production workloads may result in data loss. 
                Please use only for testing, development, and evaluation purposes.
              </div>
            </div>
          </div>
        </div>
      </div>

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
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={handleBackToProjects}
            className="flex items-center gap-2 text-sb-amber hover:text-sb-amber-dark transition-colors mr-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Projects</span>
          </button>
        </div>
        
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Collections in "{projectName}"
        </h1>
        {collections.length === 0 ? (
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Get started by creating your first Collection
          </p>
        ) : collections.length >= 6 ? (
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            You have {collections.length} project{collections.length === 1 ? '' : 's'}
          </p>
        ) : null}
      </div>

      {/* Filter/Sort Section */}
      {collections.length > 0 && (
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

      {/* Collections Grid */}
      {sortedCollections.length > 0 && (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCollections.map((collection, index) => (
            <div
              key={`collection-${index}-${collection.name}`}
              onClick={() => handleCollectionClick(collection.name)}
              className="border-2 border-gray-400 p-6 rounded-lg hover:bg-white hover:border-sb-amber hover:shadow-lg hover:-translate-y-1 hover:text-black transition-all duration-300 cursor-pointer transform"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Database size={24} className="text-sb-amber flex-shrink-0" />
                  <h3 
                    className="text-xl font-semibold truncate" 
                    style={{ color: 'var(--text-primary)' }}
                    title={collection.name || 'Unnamed Collection'} // Show full name on hover
                  >
                    {truncateCollectionName(collection.name || 'Unnamed Collection')}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" title="Active"></div>
                  <button
                    onClick={(e) => openCollectionOptionsModal(collection, e)}
                    className="p-1 rounded hover:bg-gray-300 hover:bg-opacity-20 transition-colors flex-shrink-0"
                    title="Collection options"
                  >
                    <MoreVertical size={16} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
              </div>
              
              {collection.description && (
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {collection.description}
                </p>
              )}
              
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p>📅 Created: {formatDate(collection.createdAt || 'Unknown')}</p>
                <p>🕒 Last modified: {formatDate(collection.lastModified || 'Recently')}</p>
                <p>📁 Size: {collection.size !== 'Unknown' && collection.size !== '' ? collection.size : 'Calculating...'}</p>
                <p>🔒 Encrypted: Yes</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Collection Button */}
      <div className="w-full max-w-4xl">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full border-2 border-dashed border-gray-400 text-lg px-8 py-6 rounded-lg hover:bg-sb-amber hover:border-sb-amber hover:shadow-lg hover:-translate-y-1 hover:text-black transition-all duration-300 cursor-pointer transform flex items-center justify-center gap-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Plus size={24} />
          <span>Create New Collection</span>
        </button>
      </div>

      {/* Empty State */}
      {collections.length === 0 && !loading && !error && (
        <div className="w-full max-w-2xl text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            No collections yet
          </h3>
          <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
            Create your first collection to start organizing your data in "{projectName}"
          </p>
        </div>
      )}

      {/* Create Collection Modal */}
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
              Create New Collection
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
                  Collection Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={collectionData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border-2 rounded focus:border-sb-amber focus:outline-none transition-colors"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: 'var(--border-color, #374151)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="users-data"
                  required
                  disabled={createLoading}
                  maxLength={32}
                />
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {collectionData.name.length}/32 characters • Only letters, numbers, underscores (_), and hyphens (-) allowed
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError(null);
                    setCollectionData({ name: '', description: '', encryption: true });
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
                  disabled={createLoading || !collectionData.name.trim() || validateCollectionName(collectionData.name) !== null}
                >
                  {createLoading ? 'Creating...' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collection Options Modal */}
      {isOptionsModalOpen && selectedCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg w-full max-w-sm border-2 shadow-xl animate-slide-up"
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border-color, #374151)' 
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Collection Options
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              "{selectedCollection.name}"
            </p>

            <div className="space-y-3">
              <button
                onClick={openRenameModal}
                className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-400 rounded-lg hover:border-sb-amber hover:bg-white hover:text-black transition-all duration-200"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                <Edit2 size={20} className="text-sb-amber" />
                <span>Rename Collection</span>
              </button>
              
              <button
                onClick={openDeleteModal}
                className="w-full flex items-center gap-3 px-4 py-3 border-2 border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                <Trash2 size={20} className="text-red-500" />
                <span>Delete Collection</span>
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setIsOptionsModalOpen(false);
                  setSelectedCollection(null);
                }}
                className="px-4 py-2 border-2 rounded-xl transition-all duration-200 hover:opacity-80"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color, #374151)',
                  color: 'var(--text-secondary)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Collection Modal */}
      {isRenameModalOpen && selectedCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg w-full max-w-md border-2 shadow-xl animate-slide-up"
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border-color, #374151)' 
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Rename Collection
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

            <div className="mb-4">
              <label 
                className="block text-sm font-medium mb-1" 
                style={{ color: 'var(--text-primary)' }}
              >
                Current Name
              </label>
              <div 
                className="w-full p-2 border-2 rounded"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                {selectedCollection.name}
              </div>
            </div>

            <div className="mb-6">
              <label 
                className="block text-sm font-medium mb-1" 
                style={{ color: 'var(--text-primary)' }}
              >
                New Collection Name *
              </label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => {
                  setRenameValue(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full p-2 border-2 rounded focus:border-sb-amber focus:outline-none transition-colors"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color, #374151)',
                  color: 'var(--text-primary)'
                }}
                placeholder="new-collection-name"
                disabled={renameLoading}
                maxLength={32}
              />
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {renameValue.length}/32 characters • Only letters, numbers, underscores (_), and hyphens (-) allowed
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsRenameModalOpen(false);
                  setError(null);
                  setRenameValue('');
                  setSelectedCollection(null);
                }}
                className="px-4 py-2 border-2 rounded-xl transition-all duration-200 hover:opacity-80"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color, #374151)',
                  color: 'var(--text-secondary)'
                }}
                disabled={renameLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRenameCollection}
                className="px-6 py-2 bg-sb-amber hover:bg-sb-amber-dark text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={renameLoading || !renameValue.trim() || validateCollectionName(renameValue) !== null || renameValue === selectedCollection.name}
              >
                {renameLoading ? 'Renaming...' : 'Rename Collection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Collection Modal */}
      {isDeleteModalOpen && selectedCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg w-full max-w-md border-2 shadow-xl animate-slide-up"
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border-color, #374151)' 
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Delete Collection
            </h2>

            <div className="mb-6">
              <div 
                className="border-l-4 border-red-500 p-4 mb-4"
                style={{ backgroundColor: 'var(--warning-bg, #fef2f2)' }}
              >
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm" style={{ color: 'var(--warning-text, #dc2626)' }}>
                      <strong>Warning:</strong> This action cannot be undone. All clusters and records in this collection will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Collection to delete: <span className="font-semibold">{selectedCollection.name}</span>
              </p>

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

              <label 
                className="block text-sm font-medium mb-1" 
                style={{ color: 'var(--text-primary)' }}
              >
                Type "{selectedCollection.name}" to confirm deletion *
              </label>
              <input
                type="text"
                value={deleteConfirmationValue}
                onChange={(e) => {
                  setDeleteConfirmationValue(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full p-2 border-2 rounded focus:border-red-500 focus:outline-none transition-colors"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color, #374151)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Type collection name here..."
                disabled={deleteLoading}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setError(null);
                  setDeleteConfirmationValue('');
                  setSelectedCollection(null);
                }}
                className="px-4 py-2 border-2 rounded-xl transition-all duration-200 hover:opacity-80"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color, #374151)',
                  color: 'var(--text-secondary)'
                }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCollection}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleteLoading || deleteConfirmationValue !== selectedCollection.name}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Collection'}
              </button>
            </div>
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
};

export default CollectionsComponent;