/**
 * =================================================
 * Author: Marshall A Burns
 * GitHub: @SchoolyB
 * Contributors:
 *          @galessalazar
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Cluster editor component for managing data records
 * =================================================
 **/

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { API_BASE_URL } from "../../config/api";
import {
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ArrowLeft,
  HelpCircle,
  AlertTriangle,
  X,
  ChevronRight,
} from "lucide-react";
import {
  RecordDataType,
  getDataTypesByCategory,
  validateRecordName,
  validateRecordValue,
  getInputPropsForType,
  DATA_TYPE_DESCRIPTIONS,
  DATA_TYPE_EXAMPLES,
  formatValueForAPI,
} from "../../utils/recordDataTypes";

interface Record {
  id: string;
  serverId?: string; //This would come from the server if available: 1,2,3,4,etc.
  name: string;
  originalName?: string; // Track original name for renaming
  type: RecordDataType;
  originalType?: RecordDataType; // Track original type
  value: string;
  originalValue?: string; // Track original value
  isNew?: boolean;
  isModified?: boolean;
  isDeleted?: boolean; // Track records that need to be deleted
  hasError?: boolean;
  errorMessage?: string;
  modifiedFields?: Set<string>; // Track specific fields that changed
}

interface ClusterInfo {
  name: string;
  id: string;
  recordCount: number;
  size: string;
  createdAt: string;
  lastModified: string;
  encryption: boolean;
}

type SortDirection = "asc" | "desc";
type SortField = "name" | "type" | "value";

const ClusterEditor: React.FC = () => {
  const { projectName, collectionName, clusterName } = useParams<{
    projectName: string;
    collectionName: string;
    clusterName?: string;
  }>();

  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  // Component state
  const [records, setRecords] = useState<Record[]>([]);
  const [clusterInfo, setClusterInfo] = useState<ClusterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper function to clear messages after timeout
  const showSuccessMessage = (message: string) => {
    setError(null); // Clear any existing errors
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000); // Auto-clear after 3 seconds
  };

  // Cluster search/create state
  const [availableClusters, setAvailableClusters] = useState<ClusterInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newClusterName, setNewClusterName] = useState("");

  // UI state
  const [filterType, setFilterType] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set()
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showRawModal, setShowRawModal] = useState(false);
  
  // Record deletion confirmation state
  const [recordToDelete, setRecordToDelete] = useState<Record | null>(null);
  const [showDeleteRecordModal, setShowDeleteRecordModal] = useState(false);
  const [skipDeleteConfirmation, setSkipDeleteConfirmation] = useState(false);
  const [deleteRecordLoading, setDeleteRecordLoading] = useState(false);

  // Get categorized data types for the UI
  const dataTypeCategories = getDataTypesByCategory();

  // Determine if we're in search mode or editing a specific cluster
  const isSearchMode = !clusterName;
  const isEditMode = !!clusterName;

  const [clusterExists, setClusterExists] = useState<boolean | null>(null);
  const [originalClusterName, setOriginalClusterName] = useState<string>('');
  const [currentClusterName, setCurrentClusterName] = useState<string>('');
  
  const isNewCluster = isEditMode && clusterExists === false;

  // Generate raw format function
  const generateRawFormat = () => {
    if (!clusterInfo || !records.length) return "";

    let rawContent = "{\n";

    // Add cluster metadata
    rawContent += `\tcluster_name :identifier: ${clusterInfo.name}\n`;
    rawContent += `\tcluster_id :identifier: ${clusterInfo.id}\n\n`;

    // Add each record
    records.forEach((record, index) => {
      if (record.name && record.value) {
        rawContent += `\t${record.name} :${record.type}: ${record.value}`;
        if (index < records.length - 1) {
          rawContent += "\n";
        }
      }
    });

    rawContent += "\n},";

    return rawContent;
  };


  useEffect(() => {
    if (isSignedIn && user && projectName && collectionName) {
      if (isSearchMode) {
        fetchAvailableClusters();
      } else if (isEditMode) {
        // For edit mode, we need to check if the cluster exists first
        checkClusterExistsAndFetchData();
      }
    }
  }, [
    isSignedIn,
    user,
    projectName,
    collectionName,
    clusterName,
    isSearchMode,
    isEditMode,
  ]);

  const checkClusterExistsAndFetchData = async () => {
    try {
      const token = await getToken();
      setLoading(true);
      setError(null);

      // First, fetch available clusters to check if this cluster exists
      const clustersResponse = await fetch(
        `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(
          projectName!
        )}/collections/${encodeURIComponent(collectionName!)}/clusters`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const clustersText = await clustersResponse.text();
      let clustersData;
      
      try {
        clustersData = JSON.parse(clustersText);
      } catch {
        clustersData = clustersText;
      }

      if (!clustersResponse.ok) {
        throw new Error(
          (typeof clustersData === 'object' && clustersData?.message) || 
          clustersData || 
          "Failed to fetch clusters"
        );
      }

      const clusters = Array.isArray(clustersData?.clusters) ? clustersData.clusters : [];
      setAvailableClusters(clusters);
      
      // Check if the cluster exists
      const clusterExists = clusters.some((c: any) => c.name === clusterName);
      setClusterExists(clusterExists);

      if (clusterExists) {
        // Cluster exists, fetch its records
        setOriginalClusterName(clusterName!);
        setCurrentClusterName(clusterName!);
        fetchRecordsInCluster();
      } else {
        // New cluster, set up empty state
        setOriginalClusterName(clusterName!);
        setCurrentClusterName(clusterName!);
        setRecords([]);
        setClusterInfo({
          name: clusterName!,
          id: "unsaved",
          recordCount: 0,
          size: "0 records",
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          encryption: false,
        });
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cluster data");
      setClusterExists(false);
      setLoading(false);
    }
  };

  const fetchAvailableClusters = async () => {
    try {
      const token = await getToken();
      setLoading(true);
      setError(null);
  
      const clusters = await fetch(
        `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(
          projectName!
        )}/collections/${encodeURIComponent(collectionName!)}/clusters`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
  
      const clustersText = await clusters.text();
      let clustersData;
      
      try {
        clustersData = JSON.parse(clustersText);
      } catch {
        clustersData = clustersText;
      }
  
      if (!clusters.ok) {
        throw new Error(
          (typeof clustersData === 'object' && clustersData?.message) || 
          clustersData || 
          "Failed to fetch clusters"
        );
      }
  
      setAvailableClusters(
        Array.isArray(clustersData?.clusters) ? clustersData.clusters : []
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch clusters");
      setAvailableClusters([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordsInCluster = async () => {
    try {
      const token = await getToken();
      setLoading(true);
      setError(null);
      // First, fetch the cluster metadata from the clusters list

      const clustersResponse = await fetch(
        `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(
          projectName!
        )}/collections/${encodeURIComponent(collectionName!)}/clusters`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      let clusterMetadata = null;
      if (clustersResponse.ok) {
        const clustersData = await clustersResponse.json();
        if (clustersData.clusters && Array.isArray(clustersData.clusters)) {
          // Find the specific cluster we're editing
          const targetCluster = clustersData.clusters.find(
            (cluster: any) => cluster.name === clusterName
          );

          if (targetCluster) {
            clusterMetadata = {
              name: targetCluster.name,
              id: targetCluster.id.toString(), // This is the actual cluster ID
              recordCount: targetCluster.record_count,
              size: "Unknown", // You can update this if the API provides size
              lastModified: "Unknown", // You can update this if the API provides lastModified
              createdAt: "Unknown", // You can update this if the API provides createdAt
              encryption: true, // Default or from API if available
            };
          }
        }
      }

      // Then fetch all the records for the selected cluster
      const response = await fetch(
        `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(
          projectName!
        )}/collections/${encodeURIComponent(
          collectionName!
        )}/clusters/${encodeURIComponent(clusterName!)}/records`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const recordsText = await response.text();
      let recordsData;
      
      try {
        recordsData = JSON.parse(recordsText);
      } catch {
        recordsData = recordsText;
      }

      if (!response.ok) {
        throw new Error((typeof recordsData === 'object' && recordsData?.message) || recordsData || "Failed to fetch records");
      }

      let recordsArray = [];

      if (Array.isArray(recordsData)) {
        recordsArray = recordsData;
      } else if (recordsData && Array.isArray(recordsData.records)) {
        recordsArray = recordsData.records;
      } else if (recordsData && typeof recordsData === "object") {
        recordsArray = [];
      }

      const transformedRecords = recordsArray.map(
        (
          record: { id: any; name: any; type: any; value: any; typeAsString?: any },
          index: number
        ) => {

          return ({
          id: `client_${Date.now()}_${index}_${Math.random()
            .toString(36)
            .substr(2, 9)}`, // Always unique client ID
          serverId: record.id, // Keep server ID for reference if needed
          name: record.name || "",
          originalName: record.name || "",
          type: record.typeAsString || (record.type && record.type !== "INVALID" ? record.type : "STRING"),
          originalType: record.typeAsString || (record.type && record.type !== "INVALID" ? record.type : "STRING"),
          value: decodeURIComponent(record.value || ""),
          originalValue: decodeURIComponent(record.value || ""),
          isNew: false,
          isModified: false,
          hasError: false,
          modifiedFields: new Set<string>(),
        });
        }
      );
      setRecords(transformedRecords);

      // Set cluster info using the fetched metadata
      if (clusterMetadata) {
        // Update record count with actual count from records
        clusterMetadata.recordCount = transformedRecords.length;
        setClusterInfo(clusterMetadata);
      } else {
        // Fallback if cluster metadata wasn't found
        setClusterInfo({
          name: clusterName!,
          id: "unknown", // This will only happen if the cluster wasn't found in the list
          recordCount: transformedRecords.length,
          size: `${transformedRecords.length} records`,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          encryption: false,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch cluster data"
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };
  const handleClusterSelect = (selectedClusterName: string) => {
    navigate(
      `/dashboard/projects/${encodeURIComponent(
        projectName!
      )}/collections/${encodeURIComponent(
        collectionName!
      )}/cluster-editor/${encodeURIComponent(selectedClusterName)}`
    );
  };

  // Handle creating new cluster
  const handleCreateNewCluster = () => {
    if (!newClusterName.trim()) {
      setError("Cluster name is required");
      return;
    }

    // Validate cluster name
    const nameValidation = validateRecordName(newClusterName);
    if (!nameValidation.isValid) {
      setError(nameValidation.errorMessage || "Invalid cluster name");
      return;
    }

    // Check for duplicates
    if (
      availableClusters.some(
        (cluster) => cluster.name.toLowerCase() === newClusterName.toLowerCase()
      )
    ) {
      setError("A cluster with this name already exists");
      return;
    }

    // Navigate to new cluster
    navigate(
      `/dashboard/projects/${encodeURIComponent(
        projectName!
      )}/collections/${encodeURIComponent(
        collectionName!
      )}/cluster-editor/${encodeURIComponent(newClusterName)}`
    );
  };

  // Navigation functions
  const navigateToProjects = () => {
    navigate(
      `/dashboard/projects/${encodeURIComponent(projectName!)}/collections`
    );
  };

  const navigateToCollection = () => {
    navigate(
      `/dashboard/projects/${encodeURIComponent(
        projectName!
      )}/collections/${encodeURIComponent(collectionName!)}`
    );
  };

  const handleRefresh = () => {
    if (isSearchMode) {
      fetchAvailableClusters();
    } else {
      fetchRecordsInCluster();
    }
  };

  // Filter clusters based on search term
  // const filteredClusters = availableClusters.filter(cluster =>
  //   cluster.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const filteredClusters = Array.isArray(availableClusters)
    ? availableClusters.filter((cluster) =>
        cluster.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Validate cluster name
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

  // Validate record value based on type
  const validateRecord = (
    record: Record
  ): { isValid: boolean; errorMessage?: string } => {
    // Validate name
    const nameValidation = validateRecordName(record.name);
    if (!nameValidation.isValid) {
      return nameValidation;
    }

    // Validate value
    const valueValidation = validateRecordValue(record.value, record.type);
    if (!valueValidation.isValid) {
      return valueValidation;
    }

    return { isValid: true };
  };

  const addRecord = () => {
    const newRecord: Record = {
      id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // generate a unique client-side only ID for each new record
      name: "",
      type: "STRING",
      value: "",
      isNew: true,
      originalName: "",
      originalType: "STRING",
      originalValue: "",
      modifiedFields: new Set<string>(),
    };
    setRecords((prev) => [...prev, newRecord]);
  };

  const updateRecord = (id: string, field: keyof Record, value: string) => {
    setRecords((prevRecords) =>
      prevRecords.map((record) => {
        if (record.id === id) {
          const updatedRecord = {
            ...record,
            [field]: value,
            isModified: !record.isNew,
          };

          // Track which fields have been modified
          if (!record.isNew) {
            const modifiedFields = new Set(record.modifiedFields || []);
            
            // Check if the field actually changed from its original value
            if (field === "name" && value !== record.originalName) {
              modifiedFields.add("name");
            } else if (field === "type" && value !== record.originalType) {
              modifiedFields.add("type");
            } else if (field === "value" && value !== record.originalValue) {
              modifiedFields.add("value");
            }
            
            // Remove from modified fields if it matches original
            if (field === "name" && value === record.originalName) {
              modifiedFields.delete("name");
            } else if (field === "type" && value === record.originalType) {
              modifiedFields.delete("type");
            } else if (field === "value" && value === record.originalValue) {
              modifiedFields.delete("value");
            }
            
            updatedRecord.modifiedFields = modifiedFields;
            updatedRecord.isModified = modifiedFields.size > 0;
          }

          // If type changed, clear the value so placeholder shows
          if (field === "type") {
            updatedRecord.value = "";
            // Also track value modification if type changed
            if (!record.isNew && updatedRecord.modifiedFields) {
              updatedRecord.modifiedFields.add("value");
              updatedRecord.originalValue = record.originalValue || record.value;
            }
          }

          // Validate the record if we're updating critical fields
          if (field === "name" || field === "type" || field === "value") {
            const validation = validateRecord(updatedRecord);
            updatedRecord.hasError = !validation.isValid;
            updatedRecord.errorMessage = validation.errorMessage;
          }

          return updatedRecord;
        }
        return record;
      })
    );
  };

  // Check if delete confirmation should be skipped (24 hour rule)
  const shouldSkipDeleteConfirmation = () => {
    const lastSkipTime = localStorage.getItem('skipRecordDeleteConfirmation');
    if (!lastSkipTime) return false;
    
    const now = new Date().getTime();
    const skipTime = parseInt(lastSkipTime);
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    return (now - skipTime) < twentyFourHours;
  };

  // Handle record deletion with confirmation
  const handleDeleteRecord = (id: string) => {
    const record = records.find(r => r.id === id);
    if (!record) return;

    // Check if we should skip confirmation
    if (shouldSkipDeleteConfirmation()) {
      confirmDeleteRecord(record);
      return;
    }

    // Show confirmation modal
    setRecordToDelete(record);
    setShowDeleteRecordModal(true);
  };

  // Confirm record deletion
  const confirmDeleteRecord = async (record: Record) => {
    try {
      setDeleteRecordLoading(true);
      
      // If it's an existing record (not new), mark it for deletion but keep it in records array
      if (!record.isNew) {
        // Add a flag to track records that need to be deleted on the server
        setRecords(prevRecords => 
          prevRecords.map(r => 
            r.id === record.id 
              ? { ...r, isDeleted: true } 
              : r
          )
        );
      } else {
        // For new records, just remove from UI completely
        setRecords(prevRecords => prevRecords.filter(r => r.id !== record.id));
      }
      
      // Remove from selected records
      setSelectedRecords(prev => {
        const newSet = new Set(prev);
        newSet.delete(record.id);
        return newSet;
      });
      
      showSuccessMessage(`Record "${record.name}" deleted successfully!`);
      
      // Close modal and reset state
      setShowDeleteRecordModal(false);
      setRecordToDelete(null);
      setSkipDeleteConfirmation(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
    } finally {
      setDeleteRecordLoading(false);
    }
  };

  // Handle the confirmation modal
  const handleConfirmDeleteRecord = () => {
    if (!recordToDelete) return;

    // Save skip preference if checked
    if (skipDeleteConfirmation) {
      localStorage.setItem('skipRecordDeleteConfirmation', new Date().getTime().toString());
    }

    confirmDeleteRecord(recordToDelete);
  };

  // Legacy delete record function (kept for compatibility)
  const deleteRecord = (id: string) => {
    handleDeleteRecord(id);
  };

  // Delete selected records
  const deleteSelectedRecords = () => {
    setRecords(records.filter((record) => !selectedRecords.has(record.id)));
    setSelectedRecords(new Set());
  };

  // Toggle record selection
  const toggleRecordSelection = (id: string) => {
    setSelectedRecords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Select all visible records
  const selectAllRecords = () => {
    const visibleRecordIds = filteredAndSortedRecords.map(
      (record) => record.id
    );
    setSelectedRecords(new Set(visibleRecordIds));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedRecords(new Set());
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort records (only for edit mode, exclude deleted records)
  const filteredAndSortedRecords = isEditMode
    ? records
        .filter((record) => {
          // First filter out deleted records
          if (record.isDeleted) return false;
          
          const recordSearchTerm = isEditMode ? searchTerm : ""; // Use different search for records vs clusters
          const matchesSearch =
            record.name
              .toLowerCase()
              .includes(recordSearchTerm.toLowerCase()) ||
            record.value.toLowerCase().includes(recordSearchTerm.toLowerCase());
          const matchesFilter =
            filterType === "all" || record.type === filterType;
          return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
          let aValue = a[sortField];
          let bValue = b[sortField];

          if (typeof aValue === "string") aValue = aValue.toLowerCase();
          if (typeof bValue === "string") bValue = bValue.toLowerCase();

          if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
          if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
          return 0;
        })
    : [];

  // Calculate statistics (only for active records)
  const activeRecords = records.filter(r => !r.isDeleted);
  const stats = {
    total: activeRecords.length,
    modified: activeRecords.filter((r) => r.isModified).length,
    new: activeRecords.filter((r) => r.isNew).length,
    errors: activeRecords.filter((r) => r.hasError).length,
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-40">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sb-amber"></div>
        <p className="mt-4 text-lg" style={{ color: "var(--text-secondary)" }}>
          {isSearchMode
            ? "Loading available clusters..."
            : "Loading cluster data..."}
        </p>
      </div>
    );
  }

  // Render search/create interface
  if (isSearchMode) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        {/* Header */}
        <div
          className="border-b"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    navigate(
                      `/dashboard/projects/${encodeURIComponent(
                        projectName!
                      )}/collections/${encodeURIComponent(collectionName!)}`
                    )
                  }
                  className="flex items-center gap-2 text-sb-amber hover:text-sb-amber-dark transition-colors"
                >
                  <ArrowLeft size={20} />
                  Back to Collection
                </button>
                <div className="h-6 w-px"></div>

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={navigateToProjects}
                    className="text-sb-amber hover:text-sb-amber-dark transition-colors"
                  >
                    {projectName}
                  </button>
                  <ChevronRight
                    size={16}
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <button
                    onClick={navigateToCollection}
                    className="text-sb-amber hover:text-sb-amber-dark transition-colors"
                  >
                    {collectionName}
                  </button>
                  <ChevronRight
                    size={16}
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <span style={{ color: "var(--text-secondary)" }}>
                    Cluster Editor
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="p-2 rounded-lg border-2 border-gray-400 hover:border-sb-amber transition-colors"
                  style={{ backgroundColor: "var(--bg-primary)" }}
                  title="Help"
                >
                  <HelpCircle
                    size={16}
                    style={{ color: "var(--text-secondary)" }}
                  />
                </button>

                <button
                  onClick={fetchAvailableClusters}
                  className="p-2 rounded-lg border-2 border-gray-400 hover:border-sb-amber transition-colors"
                  style={{ backgroundColor: "var(--bg-primary)" }}
                  title="Refresh"
                >
                  <RefreshCw
                    size={16}
                    style={{ color: "var(--text-secondary)" }}
                  />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle
                  size={20}
                  className="text-red-400 flex-shrink-0 mt-0.5"
                />
                <div>
                  <div className="text-red-400 font-medium">Error</div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {error}
                  </div>
                </div>
                <button onClick={() => setError(null)} className="ml-auto">
                  <X size={16} className="text-red-400 hover:text-red-300" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Interface */}
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Select or Create a Cluster
              </h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Search for an existing cluster to edit, or create a new one
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
                style={{ color: "var(--text-secondary)" }}
              />
              <input
                type="text"
                placeholder="Search existing clusters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-lg border-2 border-gray-400 rounded-lg focus:border-sb-amber focus:outline-none transition-colors"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Create New Section */}
            <div className="mb-6">
              <button
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                className="w-full flex items-center justify-between p-4 border-2 border-dashed border-gray-400 rounded-lg hover:border-sb-amber transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Plus size={20} className="text-sb-amber" />
                  <span
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Create New Cluster
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isCreatingNew ? "rotate-180" : ""
                  }`}
                  style={{ color: "var(--text-secondary)" }}
                />
              </button>

              {isCreatingNew && (
                <div
                  className="mt-4 p-4 border rounded-lg"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter cluster name..."
                      value={newClusterName}
                      onChange={(e) => setNewClusterName(e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-400 rounded focus:border-sb-amber focus:outline-none transition-colors"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCreateNewCluster()
                      }
                    />
                    <button
                      onClick={handleCreateNewCluster}
                      disabled={!newClusterName.trim()}
                      className="px-4 py-2 bg-sb-amber hover:bg-sb-amber-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
                    >
                      Create
                    </button>
                  </div>
                  <p
                    className="text-xs mt-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Cluster names can only contain letters, numbers, underscores
                    (_), and hyphens (-)
                  </p>
                </div>
              )}
            </div>

            {/* Existing Clusters */}
            {filteredClusters.length > 0 && (
              <div>
                <h3
                  className="font-medium mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Existing Clusters ({filteredClusters.length})
                </h3>
                <div className="space-y-2">
                  {filteredClusters.map((cluster) => (
                    <button
                      key={cluster.id}
                      onClick={() => handleClusterSelect(cluster.name)}
                      className="w-full p-4 text-left border-2 border-gray-400 rounded-lg hover:border-sb-amber hover:bg-sb-amber hover:bg-opacity-10 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4
                            className="font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {cluster.name}
                          </h4>
                          <p
                            className="text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Records: {cluster.recordCount} ID: {cluster.id}
                          </p>
                        </div>
                        <div className="text-sb-amber">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No clusters found */}
            {searchTerm && filteredClusters.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔍</div>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  No clusters found
                </h3>
                <p style={{ color: "var(--text-secondary)" }}>
                  No clusters match "{searchTerm}". Try creating a new one
                  instead.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  async function handleConfirmClusterCreation(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    event.preventDefault();
    setError(null);

    // Validate all records before sending
    const invalidRecords = records.filter((record) => {
      const validation = validateRecord(record);
      return !validation.isValid;
    });

    if (!clusterInfo?.name) {
      setError("Cluster name is required.");
      return;
    }

    if (invalidRecords.length > 0) {
      setError(
        "Please fix errors in your records before creating the cluster."
      );
      return;
    }

    try {
      setSaveLoading(true);
      const token = await getToken();

      // Prepare the record payload
      const payload = {
        records: records.map((r) => ({
          name: r.name,
          type: r.type,
          value: r.value,
        })),
      };


      // STEP 1: First create the Cluster (MUST complete before any record operations)
      const clusterCreationResponse = await fetch(
        `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(
          projectName!
        )}/collections/${encodeURIComponent(
          collectionName!
        )}/clusters/${encodeURIComponent(clusterInfo.name)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // Ensure cluster creation succeeded before proceeding
      if (!clusterCreationResponse.ok) {
        const errorText = await clusterCreationResponse.text();
        setError(`Failed to create cluster: ${errorText || clusterCreationResponse.statusText}`);
        return;
      }

      // STEP 2: Only after cluster creation succeeds, add records sequentially
      // Process records one by one to maintain order and handle errors properly
      for (let i = 0; i < payload.records.length; i++) {
        const record = payload.records[i];
        
        try {
          const formattedValue = formatValueForAPI(record.value, record.type);
          const typeParam = record.type;
          
          const requestUrl = `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(
            projectName!
          )}/collections/${encodeURIComponent(
            collectionName!
          )}/clusters/${encodeURIComponent(
            clusterInfo.name
          )}/records/${encodeURIComponent(
            record.name
          )}?type=${typeParam}&value=${encodeURIComponent(formattedValue)}`;

          const recordCreationResponse = await fetch(requestUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          });

          if (!recordCreationResponse.ok) {
            const errorText = await recordCreationResponse.text();
            setError(`Failed to add record "${record.name}" to cluster: ${errorText || recordCreationResponse.statusText}`);
            return;
          }
        } catch (error) {
          setError(`Network error while adding record "${record.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
          return;
        }
      }

      // Show success message and navigate
      showSuccessMessage(`Cluster "${clusterInfo.name}" created successfully with ${payload.records.length} records!`);
      
      // Navigate to the new cluster's edit page with its real ID
      navigate(
        `/dashboard/projects/${encodeURIComponent(
          projectName!
        )}/collections/${encodeURIComponent(
          collectionName!
        )}/cluster-editor/${encodeURIComponent(clusterInfo.name)}`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create cluster."
      );
    } finally {
      setSaveLoading(false);
    }
  }
  // PUT method for renaming a record
  const renameRecord = async (oldRecordName: string, newRecordName: string) => {
    try {
      const token = await getToken();
      const url = `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(
        projectName!
      )}/collections/${encodeURIComponent(
        collectionName!
      )}/clusters/${encodeURIComponent(
        clusterName!
      )}/records/${encodeURIComponent(oldRecordName)}`;
      
      
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          rename: newRecordName
        }),
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      if (!response.ok) {
        throw new Error(`Failed to rename record: ${response.status} ${typeof responseData === 'object' && responseData?.message || responseData || 'Unknown error'}`);
      }

      return true;
    } catch (err) {
      throw err;
    }
  };

  // PUT method for updating record type
  const updateRecordType = async (recordName: string, newType: string) => {
    try {
      const token = await getToken();
      const url = `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(
        projectName!
      )}/collections/${encodeURIComponent(
        collectionName!
      )}/clusters/${encodeURIComponent(
        clusterName!
      )}/records/${encodeURIComponent(recordName)}?type=${encodeURIComponent(newType)}`;
      
      
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      if (!response.ok) {
        throw new Error(`Failed to update record type: ${response.status} ${typeof responseData === 'object' && responseData?.message || responseData || 'Unknown error'}`);
      }

      return true;
    } catch (err) {
      throw err;
    }
  };

  // PUT method for updating record value
  const updateRecordValue = async (recordName: string, newValue: string, recordType: string) => {
    try {
      const token = await getToken();
      
      // Special handling for records with reserved names like "name"
      const encodedRecordName = encodeURIComponent(recordName);
      const formattedValue = formatValueForAPI(newValue, recordType as RecordDataType);
      
      const url = `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(
        projectName!
      )}/collections/${encodeURIComponent(
        collectionName!
      )}/clusters/${encodeURIComponent(
        clusterName!
      )}/records/${encodedRecordName}?value=${encodeURIComponent(formattedValue)}`;
      
      
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }


      if (!response.ok) {
        throw new Error(`Failed to update record value: ${response.status} ${typeof responseData === 'object' && responseData?.message || responseData || 'Unknown error'}`);
      }

      return true;
    } catch (err) {
      throw err;
    }
  };

  const handleConfirmClusterUpdate = async () => {
    try {
      setSaveLoading(true);
      setError(null);

      // Check if cluster name changed
      const clusterNameChanged = currentClusterName !== originalClusterName;
      
      if (clusterNameChanged) {
        // Validate new cluster name
        const nameError = validateClusterName(currentClusterName);
        if (nameError) {
          setError(nameError);
          setSaveLoading(false);
          return;
        }

        // Check for duplicate names by fetching available clusters
        try {
          const token = await getToken();
          const clustersResponse = await fetch(
            `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(
              projectName!
            )}/collections/${encodeURIComponent(collectionName!)}/clusters`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );

          if (clustersResponse.ok) {
            const clustersText = await clustersResponse.text();
            let clustersData;
            try {
              clustersData = JSON.parse(clustersText);
            } catch {
              clustersData = clustersText;
            }

            const clusters = Array.isArray(clustersData?.clusters) ? clustersData.clusters : [];
            const duplicateExists = clusters.some((c: any) => 
              c.name.toLowerCase() === currentClusterName.toLowerCase() && c.name !== originalClusterName
            );

            if (duplicateExists) {
              setError('A cluster with this name already exists');
              setSaveLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error('Error checking for duplicate cluster names:', err);
        }

        // Rename the cluster first
        try {
          const token = await getToken();
          const renameResponse = await fetch(
            `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(
              projectName!
            )}/collections/${encodeURIComponent(
              collectionName!
            )}/clusters/${encodeURIComponent(originalClusterName)}?rename=${encodeURIComponent(currentClusterName)}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );

          if (!renameResponse.ok) {
            const errorText = await renameResponse.text();
            throw new Error(`Failed to rename cluster: ${errorText}`);
          }

          // Update the original name and cluster info after successful rename
          setOriginalClusterName(currentClusterName);
          if (clusterInfo) {
            setClusterInfo({
              ...clusterInfo,
              name: currentClusterName
            });
          }

          // Update the URL to reflect the new cluster name
          navigate(
            `/dashboard/projects/${encodeURIComponent(
              projectName!
            )}/collections/${encodeURIComponent(
              collectionName!
            )}/cluster-editor/${encodeURIComponent(currentClusterName)}`
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to rename cluster');
          setSaveLoading(false);
          return;
        }
      }
      
      // Handle deleted records first
      const deletedRecords = records.filter(r => r.isDeleted && !r.isNew);
      for (const record of deletedRecords) {
        try {
          const token = await getToken();
          const deleteResponse = await fetch(
            `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(
              projectName!
            )}/collections/${encodeURIComponent(
              collectionName!
            )}/clusters/${encodeURIComponent(
              currentClusterName
            )}/records/${encodeURIComponent(record.originalName || record.name)}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );

          if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            throw new Error(`Failed to delete record "${record.name}": ${errorText}`);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : `Failed to delete record "${record.name}"`);
          setSaveLoading(false);
          return;
        }
      }

      // Handle remaining records (new and modified)
      const activeRecords = records.filter(r => !r.isDeleted);
      for (const record of activeRecords) {
        if (record.isNew) {
          const token = await getToken();
          const formattedValue = formatValueForAPI(record.value, record.type);
          
          // Don't encode square brackets for array types - backend might expect literal []
          const typeParam = record.type;
          
          const requestUrl = `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(
            projectName!
          )}/collections/${encodeURIComponent(
            collectionName!
          )}/clusters/${encodeURIComponent(
            clusterName!
          )}/records/${encodeURIComponent(record.name)}?type=${typeParam}&value=${encodeURIComponent(formattedValue)}`;

          const response = await fetch(requestUrl,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

          const responseText = await response.text();
          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = responseText;
          }

          if (!response.ok) {
            throw new Error(`Failed to create record: ${response.status} ${typeof responseData === 'object' && responseData?.message || responseData || 'Unknown error'}`);
          }
        } else if (record.isModified && record.modifiedFields) {
          // For modified records, use specific PUT methods based on what changed
          const modifiedFields = record.modifiedFields;
          
          // Handle renaming first (if name changed)
          if (modifiedFields.has("name") && record.originalName) {
            await renameRecord(record.originalName, record.name);
            // Update the original name after successful rename
            record.originalName = record.name;
          }
          
          // Handle type change
          if (modifiedFields.has("type")) {
            await updateRecordType(record.name, record.type);
            // Update the original type after successful update
            record.originalType = record.type;
          }
          
          // Handle value change
          if (modifiedFields.has("value")) {
            await updateRecordValue(record.name, record.value, record.type);
            // Update the original value after successful update
            record.originalValue = record.value;
          }
        }
      }
      
      // Update records state to reflect successful save
      setRecords((prev) =>
        prev
          .filter(record => !record.isDeleted) // Remove deleted records
          .map((record) => ({
            ...record,
            isNew: false,
            isModified: false,
            isDeleted: false,
            modifiedFields: new Set<string>(),
            originalName: record.name,
            originalType: record.type,
            originalValue: record.value,
        }))
      );
      
      showSuccessMessage("Changes saved successfully!");
      fetchRecordsInCluster();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Header */}
      <div className="border-b" style={{ borderColor: "var(--border-color)" }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={navigateToCollection}
                className="flex items-center gap-2 text-sb-amber hover:text-sb-amber-dark transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Collection
              </button>
              <div className="h-6 w-px"></div>

              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={navigateToProjects}
                  className="text-sb-amber hover:text-sb-amber-dark transition-colors"
                >
                  {projectName}
                </button>
                <ChevronRight
                  size={16}
                  style={{ color: "var(--text-secondary)" }}
                />
                <button
                  onClick={navigateToCollection}
                  className="text-sb-amber hover:text-sb-amber-dark transition-colors"
                >
                  {collectionName}
                </button>
                <ChevronRight
                  size={16}
                  style={{ color: "var(--text-secondary)" }}
                />
                <span style={{ color: "var(--text-primary)" }}>
                  {clusterInfo?.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-2 rounded-lg border-2 border-gray-400 hover:border-sb-amber transition-colors"
                style={{ backgroundColor: "var(--bg-primary)" }}
                title="Help"
              >
                <HelpCircle
                  size={16}
                  style={{ color: "var(--text-secondary)" }}
                />
              </button>

              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg border-2 border-gray-400 hover:border-sb-amber transition-colors"
                style={{ backgroundColor: "var(--bg-primary)" }}
                title="Refresh"
              >
                <RefreshCw
                  size={16}
                  style={{ color: "var(--text-secondary)" }}
                />
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="text-red-400 flex-shrink-0 mt-0.5"
              />
              <div>
                <div className="text-red-400 font-medium">Error</div>
                <div
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {error}
                </div>
              </div>
              <button onClick={() => setError(null)} className="ml-auto">
                <X size={16} className="text-red-400 hover:text-red-300" />
              </button>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <div className="text-green-400 font-medium">Success</div>
                <div
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {successMessage}
                </div>
              </div>
              <button onClick={() => setSuccessMessage(null)} className="ml-auto">
                <X size={16} className="text-green-400 hover:text-green-300" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Cluster Information Section */}
      <div
        className="border-b px-6 py-4"
        style={{ borderColor: "var(--border-color)" }}
      >
        <div className="max-w-4xl">
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Cluster Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Cluster Name
              </label>
              <input
                type="text"
                value={currentClusterName}
                onChange={(e) => setCurrentClusterName(e.target.value)}
                readOnly={isNewCluster}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                  isNewCluster
                    ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                    : "border-gray-400 focus:border-sb-amber"
                }`}
                style={{
                  backgroundColor: isNewCluster
                    ? "var(--bg-primary)"
                    : "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
                placeholder="Enter cluster name..."
                maxLength={32}
              />
              {isNewCluster ? (
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Cluster name cannot be changed after creation
                </p>
              ) : (
                <div>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {currentClusterName.length}/32 characters • Only letters, numbers, underscores (_), and hyphens (-) allowed
                  </p>
                  {currentClusterName !== originalClusterName && (
                    <p
                      className="text-xs mt-1 text-sb-amber"
                    >
                      Cluster will be renamed when you confirm changes
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Cluster ID
              </label>
              <input
                type="text"
                value={clusterInfo?.id || "Will be assigned after creation"}
                readOnly
                className="w-full px-4 py-2 border-2 border-gray-300 bg-gray-100 rounded-lg cursor-not-allowed"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-secondary)",
                }}
              />
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Unique identifier assigned by the system
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar with Search, Filter, and Action Buttons */}
      <div
        className="border-b px-6 py-4"
        style={{ borderColor: "var(--border-color)" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: "var(--text-secondary)" }}
              />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border-2 border-gray-400 rounded-lg focus:border-sb-amber focus:outline-none transition-colors"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 rounded-lg hover:border-sb-amber transition-colors"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              >
                <Filter size={16} />
                <span>
                  Filter: {filterType === "all" ? "All Types" : filterType}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isFilterOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-48 border-2 border-gray-400 rounded-lg shadow-lg z-10"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  <button
                    onClick={() => {
                      setFilterType("all");
                      setIsFilterOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-sb-amber hover:text-black transition-colors first:rounded-t-md"
                    style={{ color: "var(--text-primary)" }}
                  >
                    All Types
                  </button>
                  {Object.entries(dataTypeCategories).map(
                    ([category, types]) => (
                      <div key={category}>
                        <div
                          className="px-4 py-2 text-xs font-medium text-gray-500 border-t first:border-t-0"
                          style={{ borderColor: "var(--border-color)" }}
                        >
                          {category}
                        </div>
                        {types.map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              setFilterType(type);
                              setIsFilterOpen(false);
                            }}
                            className="w-full text-left px-6 py-2 hover:bg-sb-amber hover:text-black transition-colors text-sm"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-4 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              <span>{stats.total} total</span>
              {stats.new > 0 && (
                <span className="text-blue-400">{stats.new} new</span>
              )}
              {stats.modified > 0 && (
                <span className="text-yellow-400">
                  {stats.modified} modified
                </span>
              )}
              {stats.errors > 0 && (
                <span className="text-red-400">{stats.errors} errors</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Selection actions */}
            {selectedRecords.size > 0 && (
              <>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {selectedRecords.size} selected
                </span>
                <button
                  onClick={deleteSelectedRecords}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Delete Selected
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-medium hover:border-sb-amber transition-colors"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  Clear Selection
                </button>
              </>
            )}

            {/* Action buttons */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-lg border-2 border-gray-400 hover:border-sb-amber transition-colors"
              style={{ backgroundColor: "var(--bg-primary)" }}
              title="Help"
            >
              <HelpCircle
                size={16}
                style={{ color: "var(--text-secondary)" }}
              />
            </button>

            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg border-2 border-gray-400 hover:border-sb-amber transition-colors"
              style={{ backgroundColor: "var(--bg-primary)" }}
              title="Refresh"
            >
              <RefreshCw size={16} style={{ color: "var(--text-secondary)" }} />
            </button>

            <button
              onClick={() => setShowRawModal(true)}
              className="flex items-center gap-2 px-3 py-2 border-2 border-gray-400 hover:border-sb-amber transition-colors rounded-lg"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
              title="View Raw Format"
            >
              <span className="text-xs font-mono">{}</span>
              <span className="text-sm">Raw</span>
            </button>

            <button
              onClick={addRecord}
              className="flex items-center gap-2 px-4 py-2 bg-sb-amber hover:bg-sb-amber-dark text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={16} />
              Add Record
            </button>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-4">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border-color)" }}
          >
            {/* Table Header */}
            <div
              className="border-b"
              style={{
                borderColor: "var(--border-color)",
                backgroundColor: "var(--bg-secondary)",
              }}
            >
              <div
                className="grid grid-cols-12 gap-4 p-4 font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedRecords.size ===
                        filteredAndSortedRecords.length &&
                      filteredAndSortedRecords.length > 0
                    }
                    onChange={
                      selectedRecords.size === filteredAndSortedRecords.length
                        ? clearSelection
                        : selectAllRecords
                    }
                    className="rounded"
                  />
                </div>
                <div className="col-span-3">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1 hover:text-sb-amber transition-colors"
                  >
                    Record Name
                    {sortField === "name" && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleSort("type")}
                    className="flex items-center gap-1 hover:text-sb-amber transition-colors"
                  >
                    Type
                    {sortField === "type" && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                </div>
                <div className="col-span-5">
                  <button
                    onClick={() => handleSort("value")}
                    className="flex items-center gap-1 hover:text-sb-amber transition-colors"
                  >
                    Value
                    {sortField === "value" && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                </div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div style={{ backgroundColor: "var(--bg-primary)" }}>
              {filteredAndSortedRecords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    No records found
                  </h3>
                  <p
                    className="text-lg mb-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {searchTerm || filterType !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Add your first record to get started"}
                  </p>
                  {!searchTerm && filterType === "all" && (
                    <button onClick={addRecord} className="btn btn-primary">
                      Add First Record
                    </button>
                  )}
                </div>
              ) : (
                filteredAndSortedRecords.map((record) => (
                  <div
                    key={record.id}
                    className={`grid grid-cols-12 gap-4 p-4 border-b transition-colors ${
                      record.hasError
                        ? "bg-red-900/10 border-red-500/20"
                        : record.isNew
                        ? "bg-blue-900/10 border-blue-500/20"
                        : record.isModified
                        ? "bg-yellow-900/10 border-yellow-500/20"
                        : ""
                    }`}
                    style={{ borderBottomColor: "var(--border-color)" }}
                  >
                    {/* Checkbox */}
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedRecords.has(record.id)}
                        onChange={() => toggleRecordSelection(record.id)}
                        className="rounded"
                      />
                    </div>

                    {/* Record Name */}
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={record.name}
                        onChange={(e) =>
                          updateRecord(record.id, "name", e.target.value)
                        }
                        placeholder="record_name"
                        className={`w-full px-3 py-2 border rounded focus:outline-none transition-colors ${
                          record.hasError &&
                          record.errorMessage?.includes("name")
                            ? "border-red-500 focus:border-red-400"
                            : "border-gray-400 focus:border-sb-amber"
                        }`}
                        style={{
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>

                    {/* Record Type */}
                    <div className="col-span-2">
                      <select
                        value={record.type}
                        onChange={(e) =>
                          updateRecord(record.id, "type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-400 rounded focus:border-sb-amber focus:outline-none transition-colors"
                        style={{
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {Object.entries(dataTypeCategories).map(
                          ([category, types]) => (
                            <optgroup key={category} label={category}>
                              {types.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </optgroup>
                          )
                        )}
                      </select>
                    </div>

                    {/* Record Value */}
                    <div className="col-span-5">
                      <input
                        {...getInputPropsForType(record.type)}
                        value={record.value}
                        onChange={(e) =>
                          updateRecord(record.id, "value", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded focus:outline-none transition-colors ${
                          record.hasError &&
                          record.errorMessage?.includes("Value")
                            ? "border-red-500 focus:border-red-400"
                            : "border-gray-400 focus:border-sb-amber"
                        }`}
                        style={{
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                        }}
                      />
                      {record.hasError && record.errorMessage && (
                        <div className="text-xs text-red-400 mt-1">
                          {record.errorMessage}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

     {/* Help Modal */}
     {showHelpModal && (
       <div 
         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
         onClick={() => setShowHelpModal(false)}
       >
         <div
           className="max-w-2xl w-full rounded-lg p-6 max-h-[80vh] overflow-y-auto"
           style={{
             backgroundColor: "var(--bg-primary)",
             borderColor: "var(--border-color)",
           }}
           onClick={(e) => e.stopPropagation()}
         >
           <div className="flex items-center justify-between mb-6">
             <h2
               className="text-xl font-bold"
               style={{ color: "var(--text-primary)" }}
             >
               Cluster Editor Help
             </h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>

            <div
              className="space-y-6"
              style={{ color: "var(--text-secondary)" }}
            >
              <div>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Saving Changes
                </h3>
                <p className="text-sm mb-2">
                  Changes are saved when you click the "Confirm Changes" or "Confirm Cluster Creation" button at the bottom of the page. Make sure all validation errors are fixed before saving.
                </p>
              </div>

              <div>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Data Types
                </h3>
                <div className="space-y-4">
                  {Object.entries(dataTypeCategories).map(
                    ([category, types]) => (
                      <div key={category}>
                        <h4 className="font-medium text-sb-amber mb-2">
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {types.map((type) => (
                            <div key={type} className="flex justify-between">
                              <span className="font-mono">{type}</span>
                              <span className="text-xs">
                                {DATA_TYPE_DESCRIPTIONS[type]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Examples
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-mono">STRING:</span>{" "}
                    {DATA_TYPE_EXAMPLES.STRING}
                  </div>
                  <div>
                    <span className="font-mono">INTEGER:</span>{" "}
                    {DATA_TYPE_EXAMPLES.INTEGER}
                  </div>
                  <div>
                    <span className="font-mono">BOOLEAN:</span>{" "}
                    {DATA_TYPE_EXAMPLES.BOOLEAN}
                  </div>
                  <div>
                    <span className="font-mono">DATE:</span>{" "}
                    {DATA_TYPE_EXAMPLES.DATE}
                  </div>
                  <div>
                    <span className="font-mono">TIME:</span>{" "}
                    {DATA_TYPE_EXAMPLES.TIME}
                  </div>
                  <div>
                    <span className="font-mono">DATETIME:</span>{" "}
                    {DATA_TYPE_EXAMPLES.DATETIME}
                  </div>
                  <div>
                    <span className="font-mono">UUID:</span>{" "}
                    {DATA_TYPE_EXAMPLES.UUID}
                  </div>
                  <div>
                    <span className="font-mono">[]STRING:</span>{" "}
                    {DATA_TYPE_EXAMPLES["[]STRING"]}
                  </div>
                </div>
              </div>

              <div>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Tips
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>
                    Record names can only contain letters, numbers, underscores
                    (_), and hyphens (-)
                  </li>
                  <li>Array values must be valid JSON arrays</li>
                  <li>Boolean values must be exactly "true" or "false"</li>
                  <li>Dates use YYYY-MM-DD format</li>
                  <li>Times use HH:MM:SS format (24-hour)</li>
                  <li>DateTime combines both with a T separator</li>
                  <li>UUIDs must follow standard format with hyphens</li>
                  <li>
                    Click "Confirm Changes" to save your modifications
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full px-4 py-2 bg-sb-amber hover:bg-sb-amber-dark text-white rounded-lg font-medium transition-colors"
              >
                Close Help
              </button>
            </div>

            <div
              className="mt-6 text-sm text-center"
              style={{ color: "var(--text-secondary)" }}
            >
              Need more help? Contact support or check our{" "}
              <a href="/docs" className="text-sb-amber hover:underline">
                documentation
              </a>
              .
            </div>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Modal */}
      {showDeleteRecordModal && recordToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg w-full max-w-md border-2 shadow-xl animate-slide-up"
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border-color, #374151)' 
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Delete Record
            </h2>

            <div className="mb-6">
              <div 
                className="border-l-4 border-red-500 p-4 mb-4"
                style={{ backgroundColor: 'var(--warning-bg, #fef2f2)' }}
              >
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm" style={{ color: 'var(--warning-text, #dc2626)' }}>
                      <strong>Warning:</strong> This action cannot be undone. The record will be permanently deleted from the cluster.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Record to delete: <span className="font-semibold font-mono">{recordToDelete.name}</span>
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Value: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>{recordToDelete.value}</span>
              </p>

              {/* Skip confirmation checkbox */}
              <div className="mt-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={skipDeleteConfirmation}
                    onChange={(e) => setSkipDeleteConfirmation(e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Skip this confirmation for the next 24 hours
                    </span>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Future record deletions will happen immediately without this dialog
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteRecordModal(false);
                  setRecordToDelete(null);
                  setSkipDeleteConfirmation(false);
                }}
                className="px-4 py-2 border-2 rounded-xl transition-all duration-200 hover:opacity-80"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color, #374151)',
                  color: 'var(--text-secondary)'
                }}
                disabled={deleteRecordLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteRecord}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleteRecordLoading}
              >
                {deleteRecordLoading ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}

  {/* Raw View Modal */}
  {showRawModal && (
       <div 
         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
         onClick={() => setShowRawModal(false)}
       >
         <div
           className="max-w-4xl w-full rounded-lg p-6 max-h-[80vh] overflow-y-auto"
           style={{
             backgroundColor: "var(--bg-primary)",
             borderColor: "var(--border-color)",
           }}
           onClick={(e) => e.stopPropagation()}
         >
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <h2
                 className="text-xl font-bold"
                 style={{ color: "var(--text-primary)" }}
               >
                  Raw Cluster Format
                </h2>
                <span className="text-sm px-2 py-1 bg-sb-amber text-black rounded font-mono">
                  {clusterInfo?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateRawFormat());
                  }}
                  className="px-3 py-1 text-sm bg-sb-amber hover:bg-sb-amber-dark text-black rounded font-medium transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => setShowRawModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} style={{ color: "var(--text-secondary)" }} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Physical File Representation
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  This is how your cluster data appears in the actual file
                  structure. Each record follows the format:{" "}
                  <span
                    className="px-1 rounded"
                    style={{ background: "var(--bg-secondary)" }}
                  >
                    name :TYPE: value
                  </span>
                </p>
              </div>

              <div className="relative">
                <pre
                  className="p-4 rounded-lg border-2 text-sm font-mono overflow-x-auto whitespace-pre"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  {generateRawFormat()}
                </pre>

                {/* Syntax highlighting overlay could go here in the future */}
                <div className="absolute top-2 right-2">
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {records.length} records
                  </span>
                </div>
              </div>

              <div
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                <p>
                  <strong>Format Rules:</strong>
                </p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>
                    Cluster metadata uses <code>:identifier:</code> type
                  </li>
                  <li>
                    Each record follows <code>name :TYPE: value</code> pattern
                  </li>
                  <li>
                    Array values are displayed as comma-separated lists in
                    brackets
                  </li>
                  <li>Empty or invalid records are automatically excluded</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowRawModal(false)}
                className="flex-1 px-4 py-2 bg-sb-amber hover:bg-sb-amber-dark text-black rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation button */}
      {isEditMode && (
        <div className="p-6 flex justify-center max-w-2xl mx-auto  ">
          <button
            onClick={
              isNewCluster
                ? handleConfirmClusterCreation
                : handleConfirmClusterUpdate
            }
            className="mt-6 px-6 py-3 bg-sb-amber hover:bg-sb-amber-dark text-white rounded font-medium transition-colors"
            disabled={saveLoading}
          >
            {saveLoading
              ? "Saving..."
              : isNewCluster
              ? "Confirm Cluster Creation"
              : "Confirm Changes"}
          </button>
          {error && <div className="mt-4 text-red-500">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default ClusterEditor;