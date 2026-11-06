import React from 'react';
import {
  Factory,
  Layers,
  AlertTriangle,
  Settings2,
  Video,
  Play,
  HelpCircle,
  Eye,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AppTab, DisplayMode } from '../types/plant';

interface HeaderNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onStartTour: () => void;
  displayMode: DisplayMode;
  onToggleDisplayMode: (mode: DisplayMode) => void;
  onOpenControlsHelp: () => void;
  onOpenVideoModal: () => void;
  simulationPlaying: boolean;
  onToggleSimulation: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onTabChange,
  onStartTour,
  displayMode,
  onToggleDisplayMode,
  onOpenControlsHelp,
  onOpenVideoModal,
  simulationPlaying,
  onToggleSimulation,
}) => {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-30 select-none shadow-md">
      {/* Brand & Plant Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
          <Factory className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-100 tracking-wide uppercase">
              Alternative Fuel (Rice Husk) Handling System
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Cement Plant 3D Twin
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Interactive Industrial Digital Twin • Mechanical & HSE Engineering Simulation
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => onTabChange('overview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Factory className="w-3.5 h-3.5" />
          Plant Overview
        </button>

        <button
          onClick={() => onTabChange('process_flow')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'process_flow'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Process Flow
        </button>

        <button
          onClick={() => onTabChange('equipment_spec')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'equipment_spec'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Equipment Specs
        </button>

        <button
          onClick={() => onTabChange('hse_assessment')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'hse_assessment'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          HSE Risk Audit
        </button>

        <button
          onClick={() => onTabChange('downstream_config')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'downstream_config'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Modular Downstream
        </button>
      </nav>

      {/* Quick Action Utility Buttons */}
      <div className="flex items-center gap-2">
        {/* Plant Video Reference Button */}
        <button
          onClick={onOpenVideoModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-900 transition-all text-xs font-medium shadow-sm"
          title="Compare with actual cement plant drone/walkthrough footage"
        >
          <Video className="w-3.5 h-3.5 text-indigo-400" />
          Plant Video Ref
        </button>

        {/* Explain Complete Process Button */}
        <button
          onClick={onStartTour}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Explain Complete Process
        </button>

        {/* Cutaway Mode Fast Toggle */}
        <button
          onClick={() => {
            const nextMode: DisplayMode =
              displayMode === 'solid' ? 'cutaway' : displayMode === 'cutaway' ? 'transparent' : 'solid';
            onToggleDisplayMode(nextMode);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            displayMode !== 'solid'
              ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-sm'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title="Toggle Inspection Cutaway / Transparent X-Ray"
        >
          <Eye className="w-3.5 h-3.5" />
          {displayMode === 'solid' ? 'Cutaway View' : displayMode === 'cutaway' ? 'X-Ray View' : 'Solid View'}
        </button>

        {/* Controls Cheatsheet Modal trigger */}
        <button
          onClick={onOpenControlsHelp}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-all"
          title="Camera & Keyboard Controls (WASD, Mouse)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
