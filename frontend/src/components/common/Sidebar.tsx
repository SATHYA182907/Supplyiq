import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, Hotel, Compass, Brain,
  Copy, GitMerge, BedDouble, Sparkles, Scale, Trophy,
  BarChart3, Lightbulb, CheckSquare, History, Settings,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Plane
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();
  const location = useLocation();

  // Sub-menu open/close state
  const [openInventory, setOpenInventory] = useState(true);
  const [openAI, setOpenAI] = useState(true);
  const [openOptimization, setOpenOptimization] = useState(true);

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (prefix: string) => location.pathname.startsWith(prefix);

  return (
    <aside
      className={`bg-white border-r border-border h-screen sticky top-0 flex flex-col justify-between transition-all duration-300 z-40 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Logo */}
      <div className="h-16 px-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-beige-gradient border border-beige-300 flex items-center justify-center shadow-soft shrink-0">
            <Plane className="w-5 h-5 text-primary rotate-[-45deg]" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <div className="font-display font-bold text-base tracking-tight text-ink-primary flex items-center space-x-1.5">
                <span>SUPPLY</span>
                <span className="text-primary font-extrabold">IQ</span>
              </div>
              <div className="text-[10px] text-ink-secondary tracking-wider uppercase font-semibold">
                Multi-Supplier Engine
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-lg border border-border hover:bg-beige-50 text-ink-secondary hover:text-ink-primary transition-colors"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 text-xs">
        {/* 1. Overview */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isActive
                ? 'bg-beige-100 text-primary border border-beige-300 shadow-soft font-semibold'
                : 'text-ink-secondary hover:bg-beige-50 hover:text-ink-primary'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 shrink-0 text-primary" />
          {!sidebarCollapsed && <span>Overview</span>}
        </NavLink>

        {/* 2. Suppliers */}
        <NavLink
          to="/suppliers"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isActive
                ? 'bg-beige-100 text-primary border border-beige-300 shadow-soft font-semibold'
                : 'text-ink-secondary hover:bg-beige-50 hover:text-ink-primary'
            }`
          }
        >
          <Users className="w-4 h-4 shrink-0 text-primary" />
          {!sidebarCollapsed && <span>Suppliers</span>}
        </NavLink>

        {/* 3. Inventory (Sub-items) */}
        <div>
          <button
            onClick={() => setOpenInventory(!openInventory)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
              isGroupActive('/inventory')
                ? 'text-primary font-semibold bg-beige-50/60'
                : 'text-ink-secondary hover:bg-beige-50 hover:text-ink-primary'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Package className="w-4 h-4 shrink-0 text-primary" />
              {!sidebarCollapsed && <span>Inventory</span>}
            </div>
            {!sidebarCollapsed && (
              openInventory ? <ChevronUp className="w-3.5 h-3.5 text-ink-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
            )}
          </button>

          {openInventory && !sidebarCollapsed && (
            <div className="pl-9 pr-1 py-1 space-y-1">
              <NavLink
                to="/inventory/all"
                className={({ isActive }) =>
                  `block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive ? 'text-primary font-semibold bg-beige-100' : 'text-ink-secondary hover:text-ink-primary hover:bg-beige-50'
                  }`
                }
              >
                All Inventory (800)
              </NavLink>
              <NavLink
                to="/inventory/hotels"
                className={({ isActive }) =>
                  `block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive ? 'text-primary font-semibold bg-beige-100' : 'text-ink-secondary hover:text-ink-primary hover:bg-beige-50'
                  }`
                }
              >
                Hotels (500)
              </NavLink>
              <NavLink
                to="/inventory/sightseeing"
                className={({ isActive }) =>
                  `block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive ? 'text-primary font-semibold bg-beige-100' : 'text-ink-secondary hover:text-ink-primary hover:bg-beige-50'
                  }`
                }
              >
                Sightseeing (300)
              </NavLink>
            </div>
          )}
        </div>

        {/* 4. AI Intelligence (Sub-items) */}
        <div>
          <button
            onClick={() => setOpenAI(!openAI)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
              isGroupActive('/ai')
                ? 'text-primary font-semibold bg-beige-50/60'
                : 'text-ink-secondary hover:bg-beige-50 hover:text-ink-primary'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Brain className="w-4 h-4 shrink-0 text-primary" />
              {!sidebarCollapsed && <span>AI Intelligence</span>}
            </div>
            {!sidebarCollapsed && (
              openAI ? <ChevronUp className="w-3.5 h-3.5 text-ink-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
            )}
          </button>

          {openAI && !sidebarCollapsed && (
            <div className="pl-9 pr-1 py-1 space-y-1">
              <NavLink
                to="/ai/duplicates"
                className={({ isActive }) =>
                  `block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive ? 'text-primary font-semibold bg-beige-100' : 'text-ink-secondary hover:text-ink-primary hover:bg-beige-50'
                  }`
                }
              >
                Duplicate Detection
              </NavLink>
              <NavLink
                to="/ai/product-matching"
                className={({ isActive }) =>
                  `block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive ? 'text-primary font-semibold bg-beige-100' : 'text-ink-secondary hover:text-ink-primary hover:bg-beige-50'
                  }`
                }
              >
                Product Matching
              </NavLink>
              <NavLink
                to="/ai/room-mapping"
                className={({ isActive }) =>
                  `block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive ? 'text-primary font-semibold bg-beige-100' : 'text-ink-secondary hover:text-ink-primary hover:bg-beige-50'
                  }`
                }
              >
                Room Mapping
              </NavLink>
              <NavLink
                to="/ai/experience-matching"
                className={({ isActive }) =>
                  `block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive ? 'text-primary font-semibold bg-beige-100' : 'text-ink-secondary hover:text-ink-primary hover:bg-beige-50'
                  }`
                }
              >
                Experience Matching
              </NavLink>
            </div>
          )}
        </div>

        {/* 5. Optimization (Sub-items) */}
        <div>
          <button
            onClick={() => setOpenOptimization(!openOptimization)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
              isGroupActive('/optimization')
                ? 'text-primary font-semibold bg-beige-50/60'
                : 'text-ink-secondary hover:bg-beige-50 hover:text-ink-primary'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Scale className="w-4 h-4 shrink-0 text-primary" />
              {!sidebarCollapsed && <span>Optimization</span>}
            </div>
            {!sidebarCollapsed && (
              openOptimization ? <ChevronUp className="w-3.5 h-3.5 text-ink-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
            )}
          </button>

          {openOptimization && !sidebarCollapsed && (
            <div className="pl-9 pr-1 py-1 space-y-1">
              <NavLink
                to="/optimization/hotel-comparison"
                className={({ isActive }) =>
                  `block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive ? 'text-primary font-semibold bg-beige-100' : 'text-ink-secondary hover:text-ink-primary hover:bg-beige-50'
                  }`
                }
              >
                Hotel Comparison
              </NavLink>
              <NavLink
                to="/optimization/sightseeing-comparison"
                className={({ isActive }) =>
                  `block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive ? 'text-primary font-semibold bg-beige-100' : 'text-ink-secondary hover:text-ink-primary hover:bg-beige-50'
                  }`
                }
              >
                Sightseeing Comparison
              </NavLink>
              <NavLink
                to="/optimization/smart-ranking"
                className={({ isActive }) =>
                  `block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive ? 'text-primary font-semibold bg-beige-100' : 'text-ink-secondary hover:text-ink-primary hover:bg-beige-50'
                  }`
                }
              >
                Smart Ranking
              </NavLink>
            </div>
          )}
        </div>

        {/* 6. Supplier Analytics */}
        <NavLink
          to="/analytics/suppliers"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isActive
                ? 'bg-beige-100 text-primary border border-beige-300 shadow-soft font-semibold'
                : 'text-ink-secondary hover:bg-beige-50 hover:text-ink-primary'
            }`
          }
        >
          <BarChart3 className="w-4 h-4 shrink-0 text-primary" />
          {!sidebarCollapsed && <span>Supplier Analytics</span>}
        </NavLink>

        {/* 7. AI Insights */}
        <NavLink
          to="/insights"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isActive
                ? 'bg-beige-100 text-primary border border-beige-300 shadow-soft font-semibold'
                : 'text-ink-secondary hover:bg-beige-50 hover:text-ink-primary'
            }`
          }
        >
          <Lightbulb className="w-4 h-4 shrink-0 text-primary" />
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between flex-1">
              <span>AI Insights</span>
              <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">4</span>
            </div>
          )}
        </NavLink>

        {/* 8. Verification Center */}
        <NavLink
          to="/verification"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isActive
                ? 'bg-beige-100 text-primary border border-beige-300 shadow-soft font-semibold'
                : 'text-ink-secondary hover:bg-beige-50 hover:text-ink-primary'
            }`
          }
        >
          <CheckSquare className="w-4 h-4 shrink-0 text-primary" />
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between flex-1">
              <span>Verification Center</span>
              <span className="bg-status-warning text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">Review</span>
            </div>
          )}
        </NavLink>

        {/* 9. Processing History */}
        <NavLink
          to="/history"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isActive
                ? 'bg-beige-100 text-primary border border-beige-300 shadow-soft font-semibold'
                : 'text-ink-secondary hover:bg-beige-50 hover:text-ink-primary'
            }`
          }
        >
          <History className="w-4 h-4 shrink-0 text-primary" />
          {!sidebarCollapsed && <span>Processing History</span>}
        </NavLink>

        {/* 10. Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isActive
                ? 'bg-beige-100 text-primary border border-beige-300 shadow-soft font-semibold'
                : 'text-ink-secondary hover:bg-beige-50 hover:text-ink-primary'
            }`
          }
        >
          <Settings className="w-4 h-4 shrink-0 text-primary" />
          {!sidebarCollapsed && <span>Settings</span>}
        </NavLink>
      </div>

      {/* Bottom Status Panel */}
      {!sidebarCollapsed ? (
        <div className="p-3 m-3 rounded-xl bg-beige-subtle border border-border">
          <div className="text-[11px] font-semibold text-ink-primary flex items-center justify-between">
            <span>AI Quality Score</span>
            <span className="text-status-success font-bold">88.6%</span>
          </div>
          <div className="w-full bg-beige-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '88.6%' }}></div>
          </div>
          <div className="text-[10px] text-ink-secondary mt-2 flex items-center justify-between">
            <span>5 Suppliers Synced</span>
            <span className="text-primary font-medium">800 Recs</span>
          </div>
        </div>
      ) : (
        <div className="p-2 text-center text-[10px] text-primary font-bold">
          88.6%
        </div>
      )}
    </aside>
  );
};
