/**
 * =================================================
 * Author: Marshall A Burns
 * GitHub: @SchoolyB
 * Contributors:
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Collection overview dashboard component for the dashboard.
 *    Displays collection statistics, clusters, recent activity,
 *    and health indicators.
 * =================================================
 **/

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { API_BASE_URL } from '../../config/api';
import { 
  ArrowLeft,
  RefreshCw,
  HelpCircle,
  Database,
  FileText,
  AlertTriangle,
  TrendingUp,
  Users,
  X,
  Lightbulb,
  Target,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  MoreVertical,
  Edit2,
  Trash2
} from 'lucide-react';

interface CollectionData {
  name?: string;
  cluster_count?: number;
  record_count?: number;
  size?: string;
  // Add other properties as needed
}

interface Cluster {
  name: string;
  id: string;
  recordCount: number;
  size: string;
  lastModified: string;
  createdAt: string;
}

type SortField = 'name' | 'id' | 'recordCount';
type SortDirection = 'asc' | 'desc';




const CollectionOverview: React.FC = () => {
  const { projectName, collectionName } = useParams<{
    projectName: string;
    collectionName: string;
  }>();
  
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  // Component state
  const [clusters, setClusters] = useState<Cluster[]>([]);
  // const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  // const [healthIndicators, setHealthIndicators] = useState<HealthIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showClusters, setShowClusters] = useState(true);
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  
  // Cluster filtering and sorting state
  const [clusterSearchTerm, setClusterSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Cluster options and rename/delete state
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirmationValue, setDeleteConfirmationValue] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Navigation functions
  const navigateToProjects = () => {
    navigate(`/dashboard/projects/${encodeURIComponent(projectName!)}/collections`);
  };

  const navigateToCollections = () => {
    navigate(`/dashboard/projects/${encodeURIComponent(projectName!)}/collections`);
  };

  const handleRefresh = () => {
    fetchCollectionOverview();
  };

  useEffect(() => {
    if (isSignedIn && user && projectName && collectionName) {
      fetchCollectionOverview();
    }
  }, [isSignedIn, user, projectName, collectionName]);
 
  const fetchCollectionOverview = async () => {
    try {
      const token = await getToken();
      setLoading(true);
      setError(null);
  
      // Fetch collection data
      const collectionResponse = await fetch(`${API_BASE_URL}/api/v1/projects/${encodeURIComponent(projectName!)}/collections/${encodeURIComponent(collectionName!)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (!collectionResponse.ok) { 
        throw new Error(`Failed to fetch collection data: ${collectionResponse.statusText}`);
      }
      
      // Get raw response text first
      const collectionText = await collectionResponse.text();
      
      
      // Smart parsing - try JSON first, fallback to string
      let collectionData;
      const contentType = collectionResponse.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          collectionData = JSON.parse(collectionText);
        } catch (parseError) {
          console.error('JSON parse failed despite content-type:', parseError);
          collectionData = collectionText;
        }
      } else {
        try {
          collectionData = JSON.parse(collectionText);
        } catch (parseError) {          
          collectionData = collectionText;
        }
      }
      
      setCollectionData(collectionData);
  
      // Fetch clusters data
      const clustersResponse = await fetch(`${API_BASE_URL}/api/v1/projects/${encodeURIComponent(projectName!)}/collections/${encodeURIComponent(collectionName!)}/clusters`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
  
      if (clustersResponse.ok) {
        // Get raw response text first
        const clustersText = await clustersResponse.text();
        
        
        if (clustersText.trim() === '') {
          
          setClusters([]);
          return;
        }
        
        // Smart parsing for clusters too
        let clustersData;
        const clustersContentType = clustersResponse.headers.get('content-type');
        
        
        if (clustersContentType && clustersContentType.includes('application/json')) {
          try {
            clustersData = JSON.parse(clustersText);
            
          } catch (parseError) {
            console.error('Clusters JSON parse failed:', parseError);
            clustersData = clustersText;
          }
        } else {
          try {
            clustersData = JSON.parse(clustersText);
            
          } catch (parseError) {
            
            clustersData = clustersText;
          }
        }
        
        // Only process if it's an object with clusters array
        if (typeof clustersData === 'object' && clustersData !== null && clustersData.clusters && Array.isArray(clustersData.clusters)) {
          const transformedClusters = clustersData.clusters.map((cluster) => ({
            name: cluster.name,
            id: cluster.id.toString(),
            recordCount: cluster.record_count,
            size: "Unknown", 
            lastModified: "Unknown",
            createdAt: "Unknown" 
          }));
          
          setClusters(transformedClusters);
        } else {
          setClusters([]);
        }
      } else if (clustersResponse.status === 204) {
        
        setClusters([]);
      } else {
        console.warn('Failed to fetch clusters:', clustersResponse.status, clustersResponse.statusText);
        setClusters([]);
      }
  
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      setError(err instanceof Error ? err.message : 'Failed to fetch collection data');
    } finally {
      setLoading(false);
    }
  };

  const handleClusterClick = (clusterName: string) => {
    navigate(`/dashboard/projects/${encodeURIComponent(projectName!)}/collections/${encodeURIComponent(collectionName!)}/cluster-editor/${encodeURIComponent(clusterName)}`);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Sorting function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort clusters
  const filteredAndSortedClusters = clusters
    .filter(cluster => {
      const matchesSearch = 
        cluster.name.toLowerCase().includes(clusterSearchTerm.toLowerCase()) ||
        cluster.id.toString().toLowerCase().includes(clusterSearchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];

      // Convert to appropriate type for comparison
      if (sortField === 'recordCount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Cluster name validation function
  const validateClusterName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Cluster name is required';
    }
    
    if (name.length > 32) {
      return 'Cluster name must be 32 characters or less';
    }
    
    // Check for invalid characters (only letters, numbers, underscores, and hyphens allowed)
    const validNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validNameRegex.test(name)) {
      return 'Cluster name can only contain letters, numbers, underscores (_), and hyphens (-)';
    }
    
    // Check for spaces
    if (name.includes(' ')) {
      return 'Cluster name cannot contain spaces';
    }
    
    return null;
  };

  // Check for duplicate cluster names
  const isDuplicateClusterName = (name: string): boolean => {
    return clusters.some(cluster => 
      cluster.name.toLowerCase() === name.toLowerCase()
    );
  };

  // Cluster options modal functions
  const openClusterOptionsModal = (cluster: Cluster, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent cluster click when clicking options
    setSelectedCluster(cluster);
    setIsOptionsModalOpen(true);
  };

  const openRenameModal = () => {
    if (selectedCluster) {
      setRenameValue(selectedCluster.name);
      setIsOptionsModalOpen(false);
      setIsRenameModalOpen(true);
    }
  };

  const openDeleteModal = () => {
    setDeleteConfirmationValue('');
    setIsOptionsModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  // Handle cluster rename
  const handleRenameCluster = async () => {
    if (!selectedCluster || !renameValue.trim()) return;

    // Validate new cluster name
    const nameError = validateClusterName(renameValue);
    if (nameError) {
      setError(nameError);
      return;
    }

    // Check if new name is different from current name
    if (renameValue === selectedCluster.name) {
      setError('New cluster name must be different from the current name');
      return;
    }

    // Check for duplicate names
    if (isDuplicateClusterName(renameValue)) {
      setError('A cluster with this name already exists');
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
        `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(projectName!)}/collections/${encodeURIComponent(collectionName!)}/clusters/${encodeURIComponent(selectedCluster.name)}?rename=${encodeURIComponent(renameValue)}`,
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
        throw new Error(`Failed to rename cluster: ${errorText}`);
      }

      // Success - refresh clusters and close modal
      await fetchCollectionOverview();
      setIsRenameModalOpen(false);
      setRenameValue('');
      setSelectedCluster(null);

    } catch (err) {
      console.error('Error renaming cluster:', err);
      setError(err instanceof Error ? err.message : 'Failed to rename cluster');
    } finally {
      setRenameLoading(false);
    }
  };

  // Handle cluster delete
  const handleDeleteCluster = async () => {
    if (!selectedCluster || deleteConfirmationValue !== selectedCluster.name) {
      setError('Please type the exact cluster name to confirm deletion');
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
        `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(projectName!)}/collections/${encodeURIComponent(collectionName!)}/clusters/${encodeURIComponent(selectedCluster.name)}`,
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
        throw new Error(`Failed to delete cluster: ${errorText}`);
      }

      // Success - refresh clusters and close modal
      await fetchCollectionOverview();
      setIsDeleteModalOpen(false);
      setDeleteConfirmationValue('');
      setSelectedCluster(null);

    } catch (err) {
      console.error('Error deleting cluster:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete cluster');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-40">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sb-amber"></div>
        <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>
          Loading collection overview...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={navigateToCollections}
                className="flex items-center gap-2 text-sb-amber hover:text-sb-amber-dark transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Collections
              </button>
              <div className="h-6 w-px" style={{ backgroundColor: 'var(--border-color)' }}></div>
              
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={navigateToProjects}
                  className="text-sb-amber hover:text-sb-amber-dark transition-colors"
                >
                  {projectName}
                </button>
                <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ color: 'var(--text-primary)' }}>{collectionName}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHelpModal(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 rounded-lg hover:border-sb-amber transition-colors"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                <HelpCircle size={16} />
                Help & Tips
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 rounded-lg border-2 border-gray-400 hover:border-sb-amber transition-colors"
                style={{ backgroundColor: 'var(--bg-primary)' }}
                title="Refresh"
              >
                <RefreshCw size={16} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-red-400 font-medium">Error</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</div>
              </div>
              <button onClick={() => setError(null)} className="ml-auto">
                <X size={16} className="text-red-400 hover:text-red-300" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Collection Statistics */}
          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Collection Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div 
                className="p-6 rounded-lg border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database size={20} className="text-blue-400" />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Total Clusters
                    </span>
                  </div>
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {collectionData?.cluster_count || 0}
                </div>
              </div>

              <div 
                className="p-6 rounded-lg border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-green-400" />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Total Records
                    </span>
                  </div>
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatNumber(collectionData?.record_count || 0)}
                </div>
              </div>

              <div 
                className="p-6 rounded-lg border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-purple-400" />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Bytes Used
                    </span>
                  </div>
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {collectionData?.size || '0 KB'}
                </div>
              </div>
              {/* TODO: Add recent activy stat? */}
            </div>
          </div>
          {/* Clusters Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Clusters ({filteredAndSortedClusters.length}{filteredAndSortedClusters.length !== clusters.length ? ` of ${clusters.length}` : ''})
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/dashboard/projects/${encodeURIComponent(projectName!)}/collections/${encodeURIComponent(collectionName!)}/cluster-editor`)}
                  className="flex items-center gap-2 px-4 py-2 bg-sb-amber hover:bg-sb-amber-dark text-white rounded-lg font-medium transition-colors"
                >
                  <Plus size={16} />
                  <span>Create Cluster</span>
                </button>
                <button
                  onClick={() => setShowClusters(!showClusters)}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 rounded-lg hover:border-sb-amber transition-colors"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  {showClusters ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span>{showClusters ? 'Hide' : 'Show'} Clusters</span>
                  {showClusters ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
            </div>

            {/* Search and Filter Controls */}
            {showClusters && clusters.length > 0 && (
              <div className="mb-4 flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                  <input
                    type="text"
                    placeholder="Search clusters by name or ID..."
                    value={clusterSearchTerm}
                    onChange={(e) => setClusterSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-400 rounded-lg focus:border-sb-amber focus:outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                {/* Sort Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSort('name')}
                    className={`flex items-center gap-2 px-3 py-2 border-2 rounded-lg transition-colors ${
                      sortField === 'name' ? 'border-sb-amber bg-sb-amber text-black' : 'border-gray-400 hover:border-sb-amber'
                    }`}
                    style={{ 
                      backgroundColor: sortField === 'name' ? '' : 'var(--bg-secondary)',
                      color: sortField === 'name' ? 'black' : 'var(--text-primary)'
                    }}
                  >
                    <span>Name</span>
                    {sortField === 'name' && (
                      <ArrowUpDown size={14} className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleSort('id')}
                    className={`flex items-center gap-2 px-3 py-2 border-2 rounded-lg transition-colors ${
                      sortField === 'id' ? 'border-sb-amber bg-sb-amber text-black' : 'border-gray-400 hover:border-sb-amber'
                    }`}
                    style={{ 
                      backgroundColor: sortField === 'id' ? '' : 'var(--bg-secondary)',
                      color: sortField === 'id' ? 'black' : 'var(--text-primary)'
                    }}
                  >
                    <span>ID</span>
                    {sortField === 'id' && (
                      <ArrowUpDown size={14} className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleSort('recordCount')}
                    className={`flex items-center gap-2 px-3 py-2 border-2 rounded-lg transition-colors ${
                      sortField === 'recordCount' ? 'border-sb-amber bg-sb-amber text-black' : 'border-gray-400 hover:border-sb-amber'
                    }`}
                    style={{ 
                      backgroundColor: sortField === 'recordCount' ? '' : 'var(--bg-secondary)',
                      color: sortField === 'recordCount' ? 'black' : 'var(--text-primary)'
                    }}
                  >
                    <span>Records</span>
                    {sortField === 'recordCount' && (
                      <ArrowUpDown size={14} className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {showClusters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clusters.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      No clusters yet
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Create your first cluster to organize your data
                    </p>
                    <button
                      onClick={() => navigate(`/dashboard/projects/${encodeURIComponent(projectName!)}/collections/${encodeURIComponent(collectionName!)}/cluster-editor`)}
                      className="bg-sb-amber hover:bg-sb-amber-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Create First Cluster
                    </button>
                  </div>
                ) : filteredAndSortedClusters.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      No clusters found
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                      No clusters match your search criteria. Try adjusting your search term.
                    </p>
                    <button
                      onClick={() => setClusterSearchTerm('')}
                      className="bg-sb-amber hover:bg-sb-amber-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>
                ) : (
                  // This is where your filtered and sorted clusters will be displayed
                  filteredAndSortedClusters.map((cluster) => (
                    <div
                      key={cluster.id}
                      onClick={() => handleClusterClick(cluster.name)}
                      className="p-4 rounded-lg border-2 border-gray-400 hover:bg-white hover:border-sb-amber hover:shadow-lg hover:-translate-y-1 hover:text-black transition-all duration-300 cursor-pointer transform"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Database size={20} className="text-sb-amber flex-shrink-0" />
                          <h3 
                            className="font-semibold truncate" 
                            style={{ color: 'var(--text-primary)' }}
                            title={cluster.name}
                          >
                            {cluster.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Active"></div>
                          <button
                            onClick={(e) => openClusterOptionsModal(cluster, e)}
                            className="p-1 rounded hover:bg-gray-300 hover:bg-opacity-20 transition-colors flex-shrink-0"
                            title="Cluster options"
                          >
                            <MoreVertical size={16} style={{ color: 'var(--text-secondary)' }} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <p className="text-lg"> ID: {cluster.id}</p>
                        <p>📝 Records: {formatNumber(cluster.recordCount)}</p>
                        {/* <p>📊 Size: {cluster.size}</p>  */}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>               
        {/* TODO: Add Recent Activity Section */}
        </div>
      </div>

    {/* Help Modal */}
    {showHelpModal &&   (
       
       <div 
         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
         onClick={() => setShowHelpModal(false)}
       >
         <div 
           className="max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-lg border"
           style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
           onClick={(e) => e.stopPropagation()}
         >
           <div className="sticky top-0 bg-inherit border-b px-6 py-4" style={{ borderColor: 'var(--border-color)' }}>
             <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                 Collection Help & Tips
               </h2>
               <button 
                 onClick={() => setShowHelpModal(false)}
                 className="p-2 hover:bg-gray-700 rounded-lg transition-colors" 
               >
                 <X size={20} style={{ color: 'var(--text-secondary)' }} />
               </button>
             </div>
           </div>
            
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={20} className="text-yellow-400" />
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Getting Started Tips
                  </h3>
                </div>
                <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-sb-amber rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Create your first cluster:</strong> Think of clusters as folders that group related data together. For example, create a "users" cluster for all user information.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-sb-amber rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Use the Cluster Editor:</strong> Perfect for building and organizing your data structure visually, just like a spreadsheet.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-sb-amber rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Try Natural Language Queries:</strong> Ask questions like "Show me all users created this month" or "Find records where status is active".</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-sb-amber rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Export your data anytime:</strong> Download your collection data in CSV, JSON, or Excel format with one click.</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target size={20} className="text-green-400" />
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Best Practices
                  </h3>
                </div>
                <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Keep clusters focused:</strong> Group related data together, but don't make clusters too large. Consider splitting if you have 50+ different record types.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Regular backups:</strong> Export your important data regularly, especially before major changes.</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={20} className="text-blue-400" />
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Common Use Cases
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Customer Management</h4>
                    <p style={{ color: 'var(--text-secondary)' }}>Create clusters for customers, orders, and support tickets. Link them together with shared IDs.</p>
                  </div>
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Content Management</h4>
                    <p style={{ color: 'var(--text-secondary)' }}>Store blog posts, pages, and media. Use DATE fields for publish dates and BOOLEAN for published status.</p>
                  </div>
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Inventory Tracking</h4>
                    <p style={{ color: 'var(--text-secondary)' }}>Track products, quantities, and suppliers. Use INTEGER for stock counts and FLOAT for prices.</p>
                  </div>
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Event Management</h4>
                    <p style={{ color: 'var(--text-secondary)' }}>Organize events, attendees, and schedules. Use DATETIME for precise timing and []STRING for attendee lists.</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Users size={20} className="text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Need More Help?</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Check out our documentation or join our community for support. We're here to help you succeed with OstrichDB!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cluster Options Modal */}
      {isOptionsModalOpen && selectedCluster && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg w-full max-w-sm border-2 shadow-xl animate-slide-up"
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border-color, #374151)' 
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Cluster Options
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              "{selectedCluster.name}"
            </p>

            <div className="space-y-3">
              <button
                onClick={openRenameModal}
                className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-400 rounded-lg hover:border-sb-amber hover:bg-white hover:text-black transition-all duration-200"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                <Edit2 size={20} className="text-sb-amber" />
                <span>Rename Cluster</span>
              </button>
              
              <button
                onClick={openDeleteModal}
                className="w-full flex items-center gap-3 px-4 py-3 border-2 border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                <Trash2 size={20} className="text-red-500" />
                <span>Delete Cluster</span>
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setIsOptionsModalOpen(false);
                  setSelectedCluster(null);
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

      {/* Rename Cluster Modal */}
      {isRenameModalOpen && selectedCluster && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg w-full max-w-md border-2 shadow-xl animate-slide-up"
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border-color, #374151)' 
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Rename Cluster
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
                {selectedCluster.name}
              </div>
            </div>

            <div className="mb-6">
              <label 
                className="block text-sm font-medium mb-1" 
                style={{ color: 'var(--text-primary)' }}
              >
                New Cluster Name *
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
                placeholder="new-cluster-name"
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
                  setSelectedCluster(null);
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
                onClick={handleRenameCluster}
                className="px-6 py-2 bg-sb-amber hover:bg-sb-amber-dark text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={renameLoading || !renameValue.trim() || validateClusterName(renameValue) !== null || renameValue === selectedCluster.name}
              >
                {renameLoading ? 'Renaming...' : 'Rename Cluster'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Cluster Modal */}
      {isDeleteModalOpen && selectedCluster && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg w-full max-w-md border-2 shadow-xl animate-slide-up"
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border-color, #374151)' 
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Delete Cluster
            </h2>

            <div className="mb-6">
              <div 
                className="border-l-4 border-red-500 p-4 mb-4"
                style={{ backgroundColor: 'var(--warning-bg, #fef2f2)' }}
              >
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm" style={{ color: 'var(--warning-text, #dc2626)' }}>
                      <strong>Warning:</strong> This action cannot be undone. All records in this cluster will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Cluster to delete: <span className="font-semibold">{selectedCluster.name}</span>
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
                Type "{selectedCluster.name}" to confirm deletion *
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
                placeholder="Type cluster name here..."
                disabled={deleteLoading}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setError(null);
                  setDeleteConfirmationValue('');
                  setSelectedCluster(null);
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
                onClick={handleDeleteCluster}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleteLoading || deleteConfirmationValue !== selectedCluster.name}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Cluster'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionOverview;