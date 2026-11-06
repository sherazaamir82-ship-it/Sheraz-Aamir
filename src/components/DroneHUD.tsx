import React from 'react';
import {
  Compass,
  Battery,
  Zap,
  Eye,
  Crosshair,
  Flame,
  Wind,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Radio,
  Sliders,
  ChevronRight,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Navigation,
  X
} from 'lucide-react';
import { DroneTelemetry, DroneFlightMode, DroneVisionMode, HazardItem } from '../types/plant';
import { DRONE_PATROL_WAYPOINTS, InspectionWaypoint } from '../three/DroneController';

interface DroneHUDProps {
  telemetry: DroneTelemetry;
  onSetFlightMode: (mode: DroneFlightMode) => void;
  onSetVisionMode: (mode: DroneVisionMode) => void;
  onFlyToWaypoint: (index: number) => void;
  onManualInput: (key: 'forward' | 'strafe' | 'elevate' | 'yaw', value: number) => void;
  onOpenHazardDetail: (hazardId: string) => void;
  onCloseDroneMode: () => void;
  activeWaypointIndex?: number;
}

export const DroneHUD: React.FC<DroneHUDProps> = ({
  telemetry,
  onSetFlightMode,
  onSetVisionMode,
  onFlyToWaypoint,
  onManualInput,
  onOpenHazardDetail,
  onCloseDroneMode,
}) => {
  const currentWp = DRONE_PATROL_WAYPOINTS.find((w) => w.hazardId === telemetry.lockedHazardId);

  // False-color filter overlay depending on vision mode
  const getVisionFilterClass = () => {
    switch (telemetry.visionMode) {
      case 'thermal':
        return 'border-orange-500/40 bg-gradient-to-b from-orange-950/20 via-transparent to-red-950/20';
      case 'night_vision':
        return 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-transparent to-emerald-950/20';
      default:
        return 'border-cyan-500/30 bg-transparent';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-3 font-mono">
      {/* 1. Tactical Flight Header Bar */}
      <div className="flex items-center justify-between pointer-events-auto bg-slate-900/90 border border-slate-750 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md max-w-5xl mx-auto w-full">
        {/* Left: Drone ID & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-bold tracking-widest text-white uppercase flex items-center gap-1.5 font-sans">
              <span>🚁 UAV-01 Enterprise Inspection</span>
            </span>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono">
            RTK GNSS: FIXED (18 SATS)
          </span>

          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            EO/IR 4K GIMBAL
          </span>
        </div>

        {/* Center: Flight Mode & Vision Mode Selectors */}
        <div className="flex items-center gap-2">
          {/* Flight Mode */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onSetFlightMode('patrol')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                telemetry.flightMode === 'patrol'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Autonomous Patrol
            </button>
            <button
              onClick={() => onSetFlightMode('manual')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                telemetry.flightMode === 'manual'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Manual Flight
            </button>
          </div>

          {/* Vision Mode */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onSetVisionMode('rgb')}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                telemetry.visionMode === 'rgb'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Standard RGB 4K Camera"
            >
              <span>4K RGB</span>
            </button>
            <button
              onClick={() => onSetVisionMode('thermal')}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                telemetry.visionMode === 'thermal'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold'
                  : 'text-orange-400/80 hover:text-orange-300'
              }`}
              title="FLIR Thermal Infrared (False-Color Heat Map)"
            >
              <Flame className="w-3 h-3 fill-current" />
              <span>FLIR Thermal</span>
            </button>
            <button
              onClick={() => onSetVisionMode('night_vision')}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                telemetry.visionMode === 'night_vision'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-emerald-400/80 hover:text-emerald-300'
              }`}
              title="LiDAR Night Scanning Mode"
            >
              <span>LiDAR</span>
            </button>
          </div>
        </div>

        {/* Right: Battery & Exit Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Battery
              className={`w-4 h-4 ${
                telemetry.battery > 40
                  ? 'text-emerald-400'
                  : telemetry.battery > 20
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            />
            <span className="font-bold text-white">{telemetry.battery}%</span>
          </div>

          <button
            onClick={onCloseDroneMode}
            className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-900/60 flex items-center justify-center transition-all border border-slate-700"
            title="Exit Drone Flight Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Central Reticle & Flight HUD Crosshairs Overlay */}
      <div className={`relative flex-1 my-2 rounded-3xl border-2 transition-all flex items-center justify-center ${getVisionFilterClass()}`}>
        {/* Pitch Ladder & Horizon Reticle */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Outer circle */}
          <div className="w-48 h-48 rounded-full border border-cyan-500/25 absolute animate-pulse"></div>

          {/* Central Target Crosshair */}
          <div className="w-12 h-12 flex items-center justify-center relative">
            <div className="w-2 h-2 rounded-full bg-cyan-400/80"></div>
            <div className="w-8 h-[1px] bg-cyan-400/60 absolute"></div>
            <div className="h-8 w-[1px] bg-cyan-400/60 absolute"></div>
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>
          </div>

          {/* Pitch Ladder Indicators */}
          <div className="absolute top-6 text-[10px] text-cyan-400/80 font-mono">
            +10° ──── ──── +10°
          </div>
          <div className="absolute bottom-6 text-[10px] text-cyan-400/80 font-mono">
            -10° ──── ──── -10°
          </div>

          {/* Pitch / Roll Telemetry text */}
          <div className="absolute bottom-12 text-[10px] text-slate-400 flex gap-3 font-mono">
            <span>PITCH: {telemetry.pitch}°</span>
            <span>ROLL: {telemetry.roll}°</span>
          </div>
        </div>

        {/* Left Tape: Speed (m/s) */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-slate-900/80 border border-slate-750 px-2.5 py-4 rounded-xl flex flex-col items-center">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 mb-1">SPD</span>
          <span className="text-lg font-bold text-cyan-300">{telemetry.speed}</span>
          <span className="text-[8px] text-slate-400">m/s</span>
        </div>

        {/* Right Tape: Altitude (m AGL) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-slate-900/80 border border-slate-750 px-2.5 py-4 rounded-xl flex flex-col items-center">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 mb-1">ALT</span>
          <span className="text-lg font-bold text-amber-300">+{telemetry.altitude}</span>
          <span className="text-[8px] text-slate-400">m AGL</span>
        </div>

        {/* Top Tape: Heading Compass */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 border border-slate-750 px-4 py-1.5 rounded-full flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold text-cyan-200">{telemetry.heading}°</span>
          <span className="text-[10px] text-slate-400">
            {telemetry.heading >= 315 || telemetry.heading < 45
              ? 'N'
              : telemetry.heading < 135
              ? 'E'
              : telemetry.heading < 225
              ? 'S'
              : 'W'}
          </span>
        </div>

        {/* Live Target Lock-On Augmented Reality Banner */}
        {currentWp && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-auto bg-slate-900/95 border-2 border-red-500/80 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md max-w-lg w-full flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-start gap-2.5">
              <span className={`p-1.5 rounded-xl border mt-0.5 ${
                currentWp.riskLevel === 'CRITICAL'
                  ? 'bg-red-950 text-red-400 border-red-500/50'
                  : 'bg-amber-950 text-amber-400 border-amber-500/50'
              }`}>
                <ShieldAlert className="w-4 h-4" />
              </span>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40">
                    TARGET ACQUIRED: {currentWp.hazardId}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    currentWp.riskLevel === 'CRITICAL' ? 'bg-red-900/80 text-red-100' : 'bg-amber-900/80 text-amber-100'
                  }`}>
                    {currentWp.riskLevel} RISK
                  </span>
                </div>

                <div className="text-xs font-bold text-white mt-1 font-sans">
                  {currentWp.hazardName}
                </div>

                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug font-sans">
                  {currentWp.description}
                </p>

                {/* Telemetry Sensor Readings */}
                <div className="flex items-center gap-3 mt-2 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-orange-400">
                    <Flame className="w-3 h-3" />
                    <span>IR TEMP: {currentWp.temperature}°C</span>
                  </span>
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Wind className="w-3 h-3" />
                    <span>DUST: {currentWp.dustLevel} mg/m³</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenHazardDetail(currentWp.hazardId)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg transition-all active:scale-95 whitespace-nowrap shrink-0 mt-1 font-sans"
            >
              HSE Controls
            </button>
          </div>
        )}

        {/* Thermal Vision Color Legend when in thermal mode */}
        {telemetry.visionMode === 'thermal' && (
          <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-orange-500/40 px-3 py-2 rounded-xl text-[10px] flex flex-col gap-1">
            <span className="text-orange-400 font-bold uppercase tracking-wider">FLIR Ironbow IR</span>
            <div className="w-32 h-2.5 rounded-full bg-gradient-to-r from-indigo-900 via-orange-500 to-yellow-200 border border-orange-400/50"></div>
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>20°C (Cold)</span>
              <span>900°C (Furnace)</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Patrol Route Waypoints Quick Bar / Manual Flight Controls */}
      <div className="pointer-events-auto bg-slate-900/90 border border-slate-750 p-2.5 rounded-2xl shadow-2xl backdrop-blur-md max-w-5xl mx-auto w-full">
        {telemetry.flightMode === 'patrol' ? (
          <div>
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-cyan-400" /> Autonomous Inspection Waypoints (Click to Fly)
              </span>
              <span className="text-[10px] text-cyan-300 font-sans">
                Scanning All 7 Plant Stages + Preheater Tower
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
              {DRONE_PATROL_WAYPOINTS.map((wp, idx) => {
                const isActive = wp.hazardId === telemetry.lockedHazardId;
                return (
                  <button
                    key={wp.id}
                    onClick={() => onFlyToWaypoint(idx)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-mono text-cyan-400 font-bold">WP-0{idx + 1}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        wp.riskLevel === 'CRITICAL' ? 'bg-red-400' : 'bg-amber-400'
                      }`}></span>
                    </div>
                    <div className="text-[10px] font-bold line-clamp-1 font-sans">{wp.name}</div>
                    <div className="text-[8px] text-slate-500 line-clamp-1">{wp.hazardId}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Manual Flight Controls Key Guide & Pads */
          <div className="flex items-center justify-between py-1 px-2 text-xs">
            <div className="flex items-center gap-4 text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">W</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">S</kbd>
                <span>Pitch Forward / Back</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">A</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">D</kbd>
                <span>Strafe Left / Right</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">E</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">Q</kbd>
                <span>Climb Up / Down</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">←</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">→</kbd>
                <span>Yaw Heading</span>
              </span>
            </div>

            {/* Quick Virtual Buttons for Mouse Touch Users */}
            <div className="flex items-center gap-1 text-[10px]">
              <button
                onMouseDown={() => onManualInput('forward', 1)}
                onMouseUp={() => onManualInput('forward', 0)}
                className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              >
                Forward
              </button>
              <button
                onMouseDown={() => onManualInput('forward', -1)}
                onMouseUp={() => onManualInput('forward', 0)}
                className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              >
                Reverse
              </button>
              <button
                onMouseDown={() => onManualInput('elevate', 1)}
                onMouseUp={() => onManualInput('elevate', 0)}
                className="px-2 py-1 rounded bg-amber-950 text-amber-300 hover:text-white border border-amber-600/50"
              >
                Climb +
              </button>
              <button
                onMouseDown={() => onManualInput('elevate', -1)}
                onMouseUp={() => onManualInput('elevate', 0)}
                className="px-2 py-1 rounded bg-amber-950 text-amber-300 hover:text-white border border-amber-600/50"
              >
                Descend -
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
