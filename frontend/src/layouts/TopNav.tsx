import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Database,
  TableProperties,
  Sparkles,
  BarChart3,
  Bot,
  FileText,
  Settings,
  Layers,
  Upload,
  User as UserIcon,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

interface TopNavProps {
  onOpenUpload: () => void;
  onToggleSidebar?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenUpload }) => {
  const { user, datasets, selectedDataset, setSelectedDataset, demoLogin, logout } = useApp();
  const [isDatasetMenuOpen, setIsDatasetMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [hoveredSubTab, setHoveredSubTab] = useState<string | null>(null);

  const datasetMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on Escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDatasetMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        datasetMenuRef.current &&
        !datasetMenuRef.current.contains(e.target as Node)
      ) {
        setIsDatasetMenuOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
    setIsDatasetMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const navItems = [
    { label: 'Datasets', to: '/datasets', icon: Database, step: '1', badge: datasets.length ? datasets.length.toString() : undefined },
    { label: 'Data Explorer', to: '/explorer', icon: TableProperties, step: '2' },
    { label: 'Data Cleaning', to: '/cleaning', icon: Sparkles, step: '3' },
    { label: 'Visualizations', to: '/visualizations', icon: BarChart3, step: '4' },
    { label: 'AI Analyst', to: '/ai-analyst', icon: Bot, step: '5', highlight: true },
    { label: 'Reports', to: '/reports', icon: FileText, step: '6' },
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5F0]/95 backdrop-blur-md border-b border-[#E8E4ED] transition-all duration-200">
      {/* Top Animated Accent Gradient Flow */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#8B7BE8] via-[#C4B5FD] to-[#7564D5] animate-gradient-flow opacity-85 shadow-2xs" />

      {/* Main Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity with Interactive Micro-Animations */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group select-none py-1">
            <motion.div
              whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 450, damping: 15 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B7BE8] to-[#A396EE] text-white flex items-center justify-center shadow-xs group-hover:shadow-md group-hover:shadow-[#8B7BE8]/30 transition-shadow duration-300 shrink-0"
            >
              <Layers className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-base tracking-tight text-[#28263A] leading-tight flex items-center gap-1.5 transition-colors duration-200">
                Data_
                <span className="text-[#8B7BE8] group-hover:text-[#7564D5] transition-colors duration-200">
                  Analyzer
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-[#ECE8FC] text-[#7564D5] border border-[#8B7BE8]/25 group-hover:border-[#8B7BE8]/50 group-hover:shadow-2xs transition-all duration-200">
                  SaaS
                </span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#777487] hidden sm:block leading-none group-hover:text-[#525064] transition-colors duration-200">
                Analytics Workbench
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Options with Sliding Hover Pill & Active Springs */}
        <nav
          className="hidden xl:flex items-center gap-1 bg-[#EFECE6]/70 p-1.5 rounded-2xl border border-[#E8E4ED]/90 shadow-2xs backdrop-blur-xs relative"
          onMouseLeave={() => setHoveredTab(null)}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredTab === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={handleNavClick}
                onMouseEnter={() => setHoveredTab(item.to)}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-colors duration-200 select-none whitespace-nowrap z-10 group ${
                    isActive
                      ? 'text-[#7564D5]'
                      : 'text-[#777487] hover:text-[#28263A]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Pill Spring Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="active-desktop-tab"
                        className="absolute inset-0 bg-white rounded-xl shadow-xs border border-[#E8E4ED] -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}

                    {/* Sliding Hover Glow Pill */}
                    {!isActive && isHovered && (
                      <motion.div
                        layoutId="hover-desktop-tab"
                        className="absolute inset-0 bg-white/70 rounded-xl border border-[#E8E4ED]/60 shadow-2xs -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}

                    {/* Step indicator */}
                    {item.step && (
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0 transition-colors ${
                          isActive
                            ? 'bg-[#8B7BE8] text-white shadow-2xs'
                            : 'bg-[#E8E4ED] text-[#777487] group-hover:bg-[#ECE8FC] group-hover:text-[#7564D5]'
                        }`}
                      >
                        {item.step}
                      </span>
                    )}

                    {/* Icon with interactive micro-lift and rotate */}
                    <div className="shrink-0 transition-transform duration-200 group-hover:scale-115 group-hover:-translate-y-0.5">
                      <Icon
                        className={`w-3.5 h-3.5 transition-colors duration-200 ${
                          isActive
                            ? 'text-[#8B7BE8]'
                            : item.highlight
                            ? 'text-[#8B7BE8] group-hover:text-[#7564D5]'
                            : 'text-[#777487] group-hover:text-[#28263A]'
                        }`}
                      />
                    </div>

                    {/* Label */}
                    <span className="transition-transform duration-150 group-hover:translate-x-0.5">
                      {item.label}
                    </span>

                    {/* Count Badge with hover bounce */}
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full transition-all duration-200 group-hover:scale-110 ${
                          isActive
                            ? 'bg-[#ECE8FC] text-[#7564D5] shadow-2xs'
                            : 'bg-[#E8E4ED] text-[#777487] group-hover:bg-[#ECE8FC] group-hover:text-[#7564D5]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* AI Sparkle Badge with shimmering glow & pulse */}
                    {item.highlight && !item.badge && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-gradient-to-r from-[#8B7BE8]/20 via-[#A396EE]/30 to-[#8B7BE8]/20 text-[#7564D5] border border-[#8B7BE8]/30 shadow-2xs group-hover:shadow-xs group-hover:shadow-[#8B7BE8]/30 transition-all duration-200">
                        <Sparkles className="w-2.5 h-2.5 text-[#8B7BE8] group-hover:rotate-45 transition-transform duration-300" />
                        AI
                      </span>
                    )}

                    {/* Subtle active indicator dot under active tab */}
                    {isActive && (
                      <motion.span
                        layoutId="active-nav-dot"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full bg-[#8B7BE8]"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Working Dataset Selector + Upload Action + User Profile + Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Dataset Selector Dropdown with Pulsing Live Status Dot */}
          <div className="relative" ref={datasetMenuRef}>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsDatasetMenuOpen(!isDatasetMenuOpen);
                setIsUserMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E8E4ED] text-xs sm:text-sm text-[#28263A] hover:border-[#8B7BE8]/60 hover:shadow-xs hover:shadow-[#8B7BE8]/10 transition-all duration-200 max-w-[170px] sm:max-w-[220px] group"
              title="Active Working Dataset"
            >
              {/* Live pulsing radar dot */}
              <div className="relative flex h-2 w-2 items-center justify-center shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3FB950] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2EA043]" />
              </div>

              <Database className="w-3.5 h-3.5 text-[#8B7BE8] shrink-0 group-hover:scale-110 group-hover:text-[#7564D5] transition-all duration-200" />

              <span className="truncate font-semibold text-xs text-left group-hover:text-[#28263A]">
                {selectedDataset ? selectedDataset.name : 'Select Dataset'}
              </span>

              {selectedDataset && (
                <span className="hidden sm:inline-flex px-1.5 py-0.2 text-[10px] font-bold rounded bg-[#DDF2E7] text-[#286A50] shrink-0 group-hover:bg-[#CBEBD9] transition-colors duration-200">
                  {selectedDataset.data_quality_score}%
                </span>
              )}

              <motion.div
                animate={{ rotate: isDatasetMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-auto shrink-0"
              >
                <ChevronDown className="w-3.5 h-3.5 text-[#777487] group-hover:text-[#28263A] transition-colors duration-200" />
              </motion.div>
            </motion.button>

            {/* Dropdown Menu with Spring Entrance Animation */}
            <AnimatePresence>
              {isDatasetMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-[#E8E4ED] shadow-xl py-2 z-50 overflow-hidden"
                >
                  <div className="px-3 py-1.5 border-b border-[#E8E4ED] flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#777487] uppercase tracking-wider">
                      Working Dataset
                    </span>
                    <Link
                      to="/datasets"
                      onClick={() => setIsDatasetMenuOpen(false)}
                      className="text-xs font-medium text-[#7564D5] hover:text-[#8B7BE8] hover:underline flex items-center gap-0.5 transition-colors"
                    >
                      Manage <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1">
                    {datasets.length === 0 ? (
                      <div className="p-4 text-xs text-center text-[#777487]">
                        No datasets loaded yet.
                      </div>
                    ) : (
                      datasets.map((d) => (
                        <motion.button
                          key={d.id}
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => {
                            setSelectedDataset(d);
                            setIsDatasetMenuOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-[#F0EDF9] flex items-start justify-between transition-colors group ${
                            selectedDataset?.id === d.id
                              ? 'bg-[#F0EDF9]/70 font-semibold text-[#7564D5]'
                              : 'text-[#28263A]'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <p className="truncate font-semibold flex items-center gap-1.5">
                              {selectedDataset?.id === d.id && (
                                <Check className="w-3.5 h-3.5 text-[#7564D5] shrink-0" />
                              )}
                              {d.name}
                            </p>
                            <p className="text-[11px] text-[#777487]">
                              {d.row_count.toLocaleString()} rows • {d.column_count} cols
                            </p>
                          </div>
                          <Badge
                            variant={d.data_quality_score >= 80 ? 'mint' : 'coral'}
                            size="sm"
                          >
                            {d.data_quality_score}%
                          </Badge>
                        </motion.button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Upload Action with Hover Scale and Icon Micro-Animation */}
          <motion.div
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Upload className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110" />}
              onClick={onOpenUpload}
              className="hidden sm:inline-flex text-xs font-semibold shadow-xs hover:shadow-md hover:shadow-[#8B7BE8]/25 group transition-all duration-200"
            >
              Upload Data
            </Button>
          </motion.div>

          {/* User Profile Menu with Animated Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsDatasetMenuOpen(false);
              }}
              className="w-8 h-8 rounded-xl bg-white border border-[#E8E4ED] flex items-center justify-center text-[#777487] hover:text-[#28263A] hover:border-[#8B7BE8]/50 shadow-2xs hover:shadow-xs transition-all duration-200 relative group"
              aria-label="User Profile"
            >
              <UserIcon className="w-4 h-4 text-[#777487] group-hover:text-[#28263A] transition-colors" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#3FB950] border-2 border-white rounded-full group-hover:scale-125 transition-transform" />
            </motion.button>

            {/* User Dropdown Menu with Spring Entrance Animation */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#E8E4ED] shadow-xl py-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-2 border-b border-[#E8E4ED]">
                    <p className="text-xs font-bold text-[#28263A] truncate font-display">
                      {user?.full_name || 'Guest Analyst'}
                    </p>
                    <p className="text-[11px] text-[#777487] truncate">{user?.email}</p>
                    {user?.is_demo && (
                      <Badge
                        variant="violet"
                        size="sm"
                        className="mt-1.5"
                        icon={<ShieldCheck className="w-3 h-3" />}
                      >
                        Demo Portfolio Active
                      </Badge>
                    )}
                  </div>

                  <div className="py-1">
                    <motion.button
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => {
                        demoLogin();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#28263A] hover:bg-[#F0EDF9] flex items-center gap-2 transition-colors font-medium group"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#8B7BE8] group-hover:rotate-45 transition-transform duration-300" />
                      Switch to Demo Analyst
                    </motion.button>
                    <motion.button
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#C54D58] hover:bg-[#FDE8E9] flex items-center gap-2 transition-colors font-medium group"
                    >
                      <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
                      Sign Out
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile / Tablet Menu Button with Morphing Animation */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-[#777487] hover:text-[#28263A] hover:bg-white border border-transparent hover:border-[#E8E4ED] hover:shadow-2xs transition-all duration-200"
            aria-label="Toggle navigation menu"
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-[#28263A]" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Sub-bar Navigation: Visible on screens < xl (Tablets, iPad, compact screens) */}
      <div className="xl:hidden border-t border-[#E8E4ED] bg-white/60 backdrop-blur-sm px-4 sm:px-6 py-2">
        <nav
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 relative"
          onMouseLeave={() => setHoveredSubTab(null)}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredSubTab === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={handleNavClick}
                onMouseEnter={() => setHoveredSubTab(item.to)}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-colors duration-200 select-none shrink-0 whitespace-nowrap z-10 group ${
                    isActive
                      ? 'text-[#7564D5]'
                      : 'text-[#777487] hover:text-[#28263A]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Tab Spring Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="active-sub-tab"
                        className="absolute inset-0 bg-white rounded-xl shadow-xs border border-[#E8E4ED] -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}

                    {/* Hover Glow Pill */}
                    {!isActive && isHovered && (
                      <motion.div
                        layoutId="hover-sub-tab"
                        className="absolute inset-0 bg-white/70 rounded-xl border border-[#E8E4ED]/60 shadow-2xs -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}

                    {item.step && (
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0 ${
                          isActive
                            ? 'bg-[#8B7BE8] text-white shadow-2xs'
                            : 'bg-[#E8E4ED] text-[#777487]'
                        }`}
                      >
                        {item.step}
                      </span>
                    )}
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:scale-115 group-hover:-translate-y-0.5 ${
                        isActive
                          ? 'text-[#8B7BE8]'
                          : item.highlight
                          ? 'text-[#8B7BE8]'
                          : 'text-[#777487]'
                      }`}
                    />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full group-hover:scale-110 transition-transform ${
                          isActive
                            ? 'bg-[#ECE8FC] text-[#7564D5]'
                            : 'bg-[#E8E4ED] text-[#777487]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && !item.badge && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-gradient-to-r from-[#8B7BE8]/20 via-[#A396EE]/30 to-[#8B7BE8]/20 text-[#7564D5] border border-[#8B7BE8]/30">
                        <Sparkles className="w-2.5 h-2.5 text-[#8B7BE8]" />
                        AI
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Expanded Mobile Drawer Panel with Staggered Entrance Animation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="xl:hidden border-t border-[#E8E4ED] bg-white px-4 sm:px-6 py-4 shadow-xl overflow-hidden space-y-4"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-[#777487] px-1">
              Navigation Menu
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.2 }}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-[#F0EDF9] text-[#7564D5] border border-[#E8E4ED] shadow-2xs'
                            : 'text-[#777487] hover:text-[#28263A] hover:bg-[#F7F5F0]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {item.step && (
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                                isActive
                                  ? 'bg-[#8B7BE8] text-white'
                                  : 'bg-[#E8E4ED] text-[#777487]'
                              }`}
                            >
                              {item.step}
                            </span>
                          )}
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                              isActive ? 'text-[#8B7BE8]' : 'text-[#777487]'
                            }`}
                          />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <Badge variant="gray" size="sm">
                              {item.badge}
                            </Badge>
                          )}
                          {item.highlight && !item.badge && (
                            <Badge variant="violet" size="sm">
                              AI
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>

            {/* Active Dataset Footnote Card with Hover Lift */}
            <motion.div
              whileHover={{ y: -1 }}
              className="p-3.5 bg-[#F7F5F0] rounded-xl border border-[#E8E4ED] transition-shadow duration-200 hover:shadow-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777487]">
                  Active Dataset
                </span>
                {selectedDataset && (
                  <Badge variant="mint" size="sm">
                    Score: {selectedDataset.data_quality_score}%
                  </Badge>
                )}
              </div>
              {selectedDataset ? (
                <div>
                  <p className="text-sm font-bold text-[#28263A] truncate font-display">
                    {selectedDataset.name}
                  </p>
                  <p className="text-xs text-[#777487]">
                    {selectedDataset.row_count.toLocaleString()} rows • {selectedDataset.column_count} columns
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#777487] italic">No dataset selected yet</p>
              )}
            </motion.div>

            {/* Quick Mobile Upload Action with Button Scale */}
            <div className="pt-2 border-t border-[#E8E4ED]">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Upload className="w-4 h-4" />}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenUpload();
                  }}
                  className="w-full justify-center shadow-xs hover:shadow-md hover:shadow-[#8B7BE8]/25 transition-all"
                >
                  Upload New Dataset
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
