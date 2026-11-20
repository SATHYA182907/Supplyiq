import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search, Bell, HelpCircle, Layers, Shield, User, ChevronDown, CheckCircle,
  ExternalLink, Sparkles, Database, RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const {
    role, setRole, workspace, setWorkspace, isDemoMode,
    globalSearch, setGlobalSearch, notifications, markNotificationRead,
    openHelpModal, setOpenHelpModal
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Generate dynamic breadcrumb segments
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const formatBreadcrumb = (seg: string) => {
    return seg
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="h-16 bg-white border-b border-border sticky top-0 z-30 px-6 flex items-center justify-between shadow-soft">
      {/* Left: Breadcrumbs & Current Location */}
      <div className="flex items-center space-x-3 text-sm">
        <div className="flex items-center space-x-1.5 text-ink-secondary">
          <span className="font-semibold text-ink-primary">SupplyIQ</span>
          <span>/</span>
          {pathSegments.length === 0 ? (
            <span className="text-primary font-medium">Overview</span>
          ) : (
            pathSegments.map((seg, idx) => (
              <React.Fragment key={seg}>
                <span className={idx === pathSegments.length - 1 ? "text-primary font-medium" : "text-ink-secondary"}>
                  {formatBreadcrumb(seg)}
                </span>
                {idx < pathSegments.length - 1 && <span>/</span>}
              </React.Fragment>
            ))
          )}
        </div>

        {/* Live Simulation Banner Pill */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-beige-100 border border-beige-300 text-primary">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>Demo Engine Active (5 Suppliers, 800 Recs)</span>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hotels, sightseeing, suppliers, or canonical IDs (⌘K)..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-beige-50 border border-border rounded-lg focus:outline-none focus:border-primary focus:bg-white text-ink-primary placeholder:text-ink-muted transition-all"
          />
          <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-white border border-border px-1.5 py-0.5 rounded text-ink-secondary">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border border-border hover:bg-beige-50 text-xs font-medium text-ink-primary transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline truncate max-w-[140px]">{workspace}</span>
            <ChevronDown className="w-3 h-3 text-ink-secondary" />
          </button>

          {showWorkspaceMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-border rounded-xl shadow-dropdown py-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                Select Workspace
              </div>
              <button
                onClick={() => { setWorkspace('TBO Global Inventory Production'); setShowWorkspaceMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-beige-50 text-ink-primary"
              >
                <div>
                  <div className="font-medium">TBO Global Inventory</div>
                  <div className="text-[11px] text-ink-secondary">Active Production Pipeline</div>
                </div>
                {workspace === 'TBO Global Inventory Production' && <CheckCircle className="w-4 h-4 text-status-success" />}
              </button>
              <button
                onClick={() => { setWorkspace('Demo Sandbox Environment'); setShowWorkspaceMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-beige-50 text-ink-primary"
              >
                <div>
                  <div className="font-medium">Demo Sandbox Environment</div>
                  <div className="text-[11px] text-ink-secondary">Isolated Synthetic Sandbox</div>
                </div>
                {workspace === 'Demo Sandbox Environment' && <CheckCircle className="w-4 h-4 text-status-success" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-beige-50 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-xl shadow-dropdown py-2 z-50">
              <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-primary">Platform Notifications</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-beige-100 text-primary">
                  {unreadCount} new
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-border-subtle">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`px-4 py-3 hover:bg-beige-50 cursor-pointer transition-colors ${n.unread ? 'bg-beige-50/50' : ''}`}
                  >
                    <div className="text-xs font-medium text-ink-primary">{n.title}</div>
                    <div className="text-[10px] text-ink-secondary mt-1">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help / Guide */}
        <button
          onClick={() => setOpenHelpModal(true)}
          className="p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-beige-50 transition-colors"
          title="Architecture Guide & Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Role Selector & Profile */}
        <div className="relative border-l border-border pl-3">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-beige-200 border border-beige-300 flex items-center justify-center text-primary font-semibold text-xs">
              {role[0]}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-ink-primary flex items-center space-x-1">
                <span>{role === 'ADMIN' ? 'Admin User' : role === 'ANALYST' ? 'Lead Analyst' : 'Reviewer'}</span>
                <ChevronDown className="w-3 h-3 text-ink-secondary" />
              </div>
              <div className="text-[10px] text-primary font-medium tracking-wide">
                Role: {role}
              </div>
            </div>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-border rounded-xl shadow-dropdown py-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                Switch Role Permission
              </div>
              {(['ADMIN', 'ANALYST', 'REVIEWER'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setShowRoleMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-beige-50 text-ink-primary"
                >
                  <span className={role === r ? "font-semibold text-primary" : ""}>
                    {r === 'ADMIN' ? '👑 Administrator' : r === 'ANALYST' ? '📊 Senior Analyst' : '🔍 Match Reviewer'}
                  </span>
                  {role === r && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
