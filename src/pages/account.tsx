/**
 * =================================================
 * Author: Marshall A Burns
 * GitHub: @SchoolyB
 * Contributors:
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    User account management page with logout, logs viewing, and account deletion
 * =================================================
 **/

import React, { useState } from "react";
import { useAuth, useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Settings, Trash2, FileText, Server, LogOut, AlertTriangle, Download } from "lucide-react";
import { API_BASE_URL } from "../config/api";

const AccountPage: React.FC = () => {
  const { getToken, signOut } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [errorLogs, setErrorLogs] = useState<string>("");
  const [serverLogs, setServerLogs] = useState<string>("");
  const [loadingErrorLogs, setLoadingErrorLogs] = useState(false);
  const [loadingServerLogs, setLoadingServerLogs] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogout = () => {
    signOut(() => navigate("/"));
  };

  const fetchErrorLogs = async () => {
    if (!user?.id) return;
    
    setLoadingErrorLogs(true);
    setErrorMessage("");
    
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/v1/user/${user.id}/logs/errors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch error logs: ${response.status}`);
      }

      const logsText = await response.text();
      setErrorLogs(logsText);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch error logs');
    } finally {
      setLoadingErrorLogs(false);
    }
  };

  const fetchServerLogs = async () => {
    if (!user?.id) return;
    
    setLoadingServerLogs(true);
    setErrorMessage("");
    
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/v1/user/${user.id}/logs/server`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch server logs: ${response.status}`);
      }

      const logsText = await response.text();
      setServerLogs(logsText);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch server logs');
    } finally {
      setLoadingServerLogs(false);
    }
  };

  const deleteAccount = async () => {
    if (!user?.id) return;
    
    setDeletingAccount(true);
    setErrorMessage("");
    
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/v1/user/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete account: ${response.status}`);
      }

      signOut(() => navigate("/"));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete account');
      setDeletingAccount(false);
    }
  };

  const downloadLogs = (logs: string, filename: string) => {
    if (!logs || logs.trim().length === 0) {
      setErrorMessage("No logs available to download");
      return;
    }

    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const LogsSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    logs: string;
    loading: boolean;
    onRefresh: () => void;
    downloadFilename: string;
  }> = ({ title, icon, logs, loading, onRefresh, downloadFilename }) => (
    <div
      className="bg-white/5 rounded-lg p-6 border"
      style={{
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => downloadLogs(logs, downloadFilename)}
            disabled={!logs || logs.trim().length === 0}
            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <Download size={14} />
            <span>Download</span>
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-1 text-sm bg-sb-purple hover:bg-sb-purple/80 text-white rounded disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>
      
      {!logs || logs.trim().length === 0 ? (
        <p className="text-gray-400 text-sm">No logs available</p>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <pre
            className="text-sm whitespace-pre-wrap p-4 rounded font-mono leading-relaxed"
            style={{
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
          >
            {logs}
          </pre>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <Settings className="h-8 w-8" style={{ color: "var(--text-primary)" }} />
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Account Management
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LogsSection
            title="Error Logs"
            icon={<FileText className="h-5 w-5" style={{ color: "var(--text-primary)" }} />}
            logs={errorLogs}
            loading={loadingErrorLogs}
            onRefresh={fetchErrorLogs}
            downloadFilename="error_logs"
          />

          <LogsSection
            title="Server Logs"
            icon={<Server className="h-5 w-5" style={{ color: "var(--text-primary)" }} />}
            logs={serverLogs}
            loading={loadingServerLogs}
            onRefresh={fetchServerLogs}
            downloadFilename="server_logs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="bg-white/5 rounded-lg p-6 border"
            style={{
              borderColor: "var(--border-color, rgba(255,255,255,0.1))",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <LogOut className="h-5 w-5" style={{ color: "var(--text-primary)" }} />
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Logout
              </h3>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Sign out of your account and return to the home page.
            </p>
            <SignOutButton>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-sb-purple hover:bg-sb-purple/80 text-white rounded font-medium"
              >
                Sign Out
              </button>
            </SignOutButton>
          </div>

          <div
            className="bg-white/5 rounded-lg p-6 border border-red-500/20"
            style={{
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Trash2 className="h-5 w-5 text-red-400" />
              <h3 className="text-lg font-semibold text-red-400">
                Delete Account
              </h3>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium"
              >
                Delete Account
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 bg-red-500/10 rounded border border-red-500/20">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-400">This action is irreversible!</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={deleteAccount}
                    disabled={deletingAccount}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium disabled:opacity-50"
                  >
                    {deletingAccount ? "Deleting..." : "Confirm Delete"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;