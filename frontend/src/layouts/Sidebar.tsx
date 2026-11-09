import React from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { selectedDataset, datasets } = useApp();

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
    <aside
      className={`fixed lg:sticky top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-[#F7F5F0] border-r border-[#E8E4ED] flex flex-col justify-between shrink-0 ${
        isOpen ? 'w-64' : 'w-20'
      } lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 gap-3 border-b border-[#E8E4ED]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B7BE8] to-[#A396EE] text-white flex items-center justify-center shadow-sm shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <span className="font-display font-extrabold text-lg tracking-tight text-[#28263A] block">
                Data_<span className="text-[#8B7BE8]">Analyzer</span>
              </span>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#777487] block">
                Analytics SaaS
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group select-none ${
                    isActive
                      ? 'bg-white text-[#7564D5] shadow-xs border border-[#E8E4ED] font-semibold'
                      : 'text-[#777487] hover:text-[#28263A] hover:bg-[#F0EDF9]/70'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive
                          ? 'text-[#8B7BE8]'
                          : item.highlight
                          ? 'text-[#8B7BE8] group-hover:text-[#7564D5]'
                          : 'text-[#777487] group-hover:text-[#28263A]'
                      }`}
                    />
                    {isOpen && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {isOpen && item.step && (
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
                    {isOpen && item.badge && (
                      <Badge variant="gray" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                    {isOpen && item.highlight && !item.badge && (
                      <Badge variant="violet" size="sm">
                        AI
                      </Badge>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Active Dataset Footnote */}
      {isOpen && (
        <div className="p-4 m-3 bg-white border border-[#E8E4ED] rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#777487] uppercase tracking-wider">Active Dataset</span>
            {selectedDataset && (
              <Badge variant="mint" size="sm">
                Score: {selectedDataset.data_quality_score}%
              </Badge>
            )}
          </div>
          {selectedDataset ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#28263A] truncate font-display">
                {selectedDataset.name}
              </p>
              <p className="text-xs text-[#777487]">
                {selectedDataset.row_count.toLocaleString()} rows • {selectedDataset.column_count} cols
              </p>
            </div>
          ) : (
            <div className="text-xs text-[#777487] italic">
              No dataset selected yet
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
