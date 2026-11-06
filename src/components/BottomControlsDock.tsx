import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  FastForward,
  Compass,
  Eye,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Camera,
  Maximize2
} from 'lucide-react';
import { SimState } from '../three/SimulationManager';
import { ViewPreset, DisplayMode } from '../types/plant';

interface BottomControlsDockProps {
  simulationState: SimState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRestart: () => void;
  simulationSpeed: number;
  onSetSpeed: (speed: number) => void;
  viewPreset: ViewPreset;
  onSelectViewPreset: (preset: ViewPreset) => void;
  displayMode: DisplayMode;
  onSelectDisplayMode: (mode: DisplayMode) => void;
  showHseMode: boolean;
  onToggleHseMode: () => void;
}

export const BottomControlsDock: React.FC<BottomControlsDockProps> = ({
  simulationState,
  onPlay,
  onPause,
  onStop,
  onRestart,
  simulationSpeed,
  onSetSpeed,
  viewPreset,
  onSelectViewPreset,
  displayMode,
  onSelectDisplayMode,
  showHseMode,
  onToggleHseMode,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none select-none max-w-[94vw] w-max">
      {/* Collapsible Zen/Cinema Mode Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="pointer-events-auto mb-1.5 px-3 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all"
      >
        {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {collapsed ? 'Show Simulation & Camera Dock' : 'Hide Controls (Zen View)'}
      </button>

      {/* Main Dock Container */}
      {!collapsed && (
        <div className="pointer-events-auto bg-slate-900/95 border border-slate-750 rounded-2xl shadow-2xl p-2.5 flex items-center gap-4 text-xs">
          {/* 1. Simulation Playback Controls */}
          <div className="flex items-center gap-1.5 pr-3 border-r border-slate-800">
            {simulationState === 'playing' ? (
              <button
                onClick={onPause}
                className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center justify-center transition-all"
                title="Pause Material Flow Simulation"
              >
                <Pause className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={onPlay}
                className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 flex items-center justify-center transition-all"
                title="Play Material Flow Simulation"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            )}

            <button
              onClick={onStop}
              className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750 flex items-center justify-center transition-all"
              title="Stop Simulation"
            >
              <Square className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onRestart}
              className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750 flex items-center justify-center transition-all"
              title="Restart Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Speed Multiplier Pills */}
            <div className="flex items-center gap-1 ml-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
              <button
                onClick={() => onSetSpeed(0.25)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  simulationSpeed === 0.25 ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Slow Motion (0.25x)"
              >
                0.25x
              </button>
              <button
                onClick={() => onSetSpeed(1.0)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  simulationSpeed === 1.0 ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Normal Speed (1.0x)"
              >
                1.0x
              </button>
              <button
                onClick={() => onSetSpeed(2.0)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  simulationSpeed === 2.0 ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Fast Forward (2.0x)"
              >
                2.0x
              </button>
            </div>
          </div>

          {/* 2. Camera View Presets */}
          <div className="flex items-center gap-1 pr-3 border-r border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
              <Camera className="w-3 h-3 text-cyan-400" /> Focus:
            </span>
            <button
              onClick={() => onSelectViewPreset('hopper')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                viewPreset === 'hopper'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-amber-400/90 hover:text-amber-200 hover:bg-slate-800'
              }`}
              title="Watch wheel loader feeding rice husk into the hopper grizzly"
            >
              📥 Hopper & Feeding
            </button>
            <button
              onClick={() => onSelectViewPreset('offloading')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                viewPreset === 'offloading'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-bold'
                  : 'text-yellow-400/90 hover:text-yellow-200 hover:bg-slate-800'
              }`}
              title="Inspect truck offloading rice husk into storage bay"
            >
              🚛 Offloading Bay
            </button>
            <button
              onClick={() => onSelectViewPreset('conveyor')}
              className={`px-1.5 py-1 rounded text-xs transition-colors ${
                viewPreset === 'conveyor' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Conveyor 1
            </button>
            <button
              onClick={() => onSelectViewPreset('elevator')}
              className={`px-1.5 py-1 rounded text-xs transition-colors ${
                viewPreset === 'elevator' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Elevator
            </button>
            <button
              onClick={() => onSelectViewPreset('apron_feeder')}
              className={`px-1.5 py-1 rounded text-xs transition-colors ${
                viewPreset === 'apron_feeder' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Apron Feeder
            </button>
            <button
              onClick={() => onSelectViewPreset('preheater_conveyor')}
              className={`px-1.5 py-1 rounded text-xs transition-colors ${
                viewPreset === 'preheater_conveyor' ? 'bg-green-500/20 text-green-300 border border-green-500/40 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Preheater Conveyor
            </button>
            <button
              onClick={() => onSelectViewPreset('preheater')}
              className={`px-1.5 py-1 rounded text-xs transition-colors ${
                viewPreset === 'preheater' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Calciner
            </button>
            <button
              onClick={() => onSelectViewPreset('orbit')}
              className={`px-1.5 py-1 rounded text-xs transition-colors ${
                viewPreset === 'orbit' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Orbit
            </button>
            <button
              onClick={() => onSelectViewPreset('top')}
              className={`px-1.5 py-1 rounded text-xs transition-colors ${
                viewPreset === 'top' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Top
            </button>
          </div>

          {/* 3. Inspection View Mode (Solid / Cutaway / X-Ray) */}
          <div className="flex items-center gap-1.5 pr-3 border-r border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
              <Eye className="w-3 h-3 text-cyan-400" /> Mode:
            </span>
            <button
              onClick={() => onSelectDisplayMode('solid')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                displayMode === 'solid' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Solid
            </button>
            <button
              onClick={() => onSelectDisplayMode('cutaway')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                displayMode === 'cutaway' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Reveal internal moving buckets and conveyor idler rolls"
            >
              Cutaway
            </button>
            <button
              onClick={() => onSelectDisplayMode('transparent')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                displayMode === 'transparent' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              X-Ray
            </button>
          </div>

          {/* 4. HSE Hazard Markers Toggle */}
          <div className="flex items-center">
            <button
              onClick={onToggleHseMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                showHseMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Display 3D Interactive Hazard Warning Beacons"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>3D Hazards {showHseMode ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
