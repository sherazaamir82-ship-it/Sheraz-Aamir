import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Video,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  Maximize2,
  ShieldAlert,
  Flame,
  Radio,
  Sliders,
  Crosshair,
  Zap,
  Info
} from 'lucide-react';
import { EquipmentId } from '../types/plant';

interface VideoReferenceModalProps {
  onClose: () => void;
  initialTimestamp?: number;
  onSync3DToEquipment?: (id: EquipmentId) => void;
  onDeployDroneToHazard?: (hazardId: string) => void;
}

interface VideoBookmark {
  seconds: number;
  title: string;
  stageName: string;
  equipmentId: EquipmentId;
  description: string;
  isConfirmed: boolean;
}

export interface VideoHazardRecord {
  startSec: number;
  endSec: number;
  hazardId: string;
  name: string;
  category: 'FIRE_EXPLOSION' | 'MECHANICAL' | 'HEALTH_DUST' | 'ENVIRONMENTAL_HEIGHT';
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  stageName: string;
  equipmentId: EquipmentId;
  videoObservation: string;
  rootCause: string;
  correctiveAction: string;
  boxCoords: { top: string; left: string; width: string; height: string };
}

const VIDEO_BOOKMARKS: VideoBookmark[] = [
  {
    seconds: 8,
    title: 'Yard Stockpiles & Truck Tipping',
    stageName: 'Stage 0: Reception Yard',
    equipmentId: 'yard_stockpile',
    description: 'Bulk delivery trucks discharging loose rice husk beside container walls.',
    isConfirmed: true,
  },
  {
    seconds: 37,
    title: 'CAT 950B Loader Charging',
    stageName: 'Stage 0: Reception Yard',
    equipmentId: 'yard_stockpile',
    description: 'Wheel loader scooping low-density husk pile and driving up feeding ramp.',
    isConfirmed: true,
  },
  {
    seconds: 58,
    title: 'Loader Dumping into Hopper',
    stageName: 'Stage 1: Primary Hopper',
    equipmentId: 'feeding_hopper',
    description: 'Loader bucket discharging into sheltered hopper with corrugated weather shed.',
    isConfirmed: true,
  },
  {
    seconds: 82,
    title: 'Hopper Bottom & Conveyor Skirt',
    stageName: 'Stage 1: Primary Hopper',
    equipmentId: 'feeding_hopper',
    description: 'Material discharging through needle pin gate onto inclined belt conveyor tail.',
    isConfirmed: true,
  },
  {
    seconds: 95,
    title: 'Inclined Belt Conveyor Hoods',
    stageName: 'Stage 2: Belt Conveyor',
    equipmentId: 'belt_conveyor',
    description: 'Corrugated semicircular dust hood covers, trestle frames, and safety walkway.',
    isConfirmed: true,
  },
  {
    seconds: 114,
    title: 'Overhead Tramp Magnet (411-MS01)',
    stageName: 'Stage 2: Belt Conveyor',
    equipmentId: 'belt_conveyor',
    description: 'Cross-belt permanent/electromagnetic separator extracting tramp iron.',
    isConfirmed: true,
  },
  {
    seconds: 125,
    title: 'Bucket Elevator Tower (+28m)',
    stageName: 'Stage 3: Bucket Elevator',
    equipmentId: 'bucket_elevator',
    description: 'Vertical flanged elevator trunking running up cement preheater tower.',
    isConfirmed: true,
  },
  {
    seconds: 170,
    title: 'Apron Feeder Receiving Staging Area',
    stageName: 'Stage 4: Apron Feeder',
    equipmentId: 'apron_feeder',
    description: 'Heavy overlapping pan feeder receiving vertical discharge from elevator head.',
    isConfirmed: true,
  },
  {
    seconds: 205,
    title: 'Preheater Gallery Conveyor & Calciner Interface',
    stageName: 'Stage 5 & 6: Preheater High Gallery',
    equipmentId: 'preheater_calciner',
    description: 'Conveyor gallery transport leading directly into cement kiln calciner burner.',
    isConfirmed: true,
  },
];

export const VIDEO_HAZARD_RECORDS: VideoHazardRecord[] = [
  {
    startSec: 8,
    endSec: 32,
    hazardId: 'HAZ-YD-01',
    name: 'Fugitive Dust Cloud & Smoldering Fire Hazard',
    category: 'FIRE_EXPLOSION',
    riskLevel: 'HIGH',
    stageName: 'Stage 0: Reception Yard & Bedford Truck Tipping',
    equipmentId: 'yard_stockpile',
    videoObservation: 'Dense airborne rice husk dust cloud generated during gravity side-gate drop from Bedford truck. Dry husk settles within inches of hot truck diesel exhaust pipe without spark arrestor.',
    rootCause: 'Absence of perimeter fogging mist cannons and lack of spark arrestor baffling on transport vehicles.',
    correctiveAction: 'Install automated boundary misting curtains; mandate certified spark arrestors on all delivery trucks.',
    boxCoords: { top: '35%', left: '22%', width: '38%', height: '42%' }
  },
  {
    startSec: 35,
    endSec: 54,
    hazardId: 'HAZ-YD-02',
    name: 'Mobile Heavy Plant & Ground Crew Struck-By Zone',
    category: 'MECHANICAL',
    riskLevel: 'HIGH',
    stageName: 'Stage 0: Loader Incline Approach',
    equipmentId: 'yard_stockpile',
    videoObservation: 'CAT 950B wheel loader maneuvers on loose 18° inclined husk mound with obstructed rear blind spot. Pedestrian workers observed walking across vehicle haul lane.',
    rootCause: 'Uncontrolled traffic management; absence of physical jersey barriers separating mobile equipment and pedestrians.',
    correctiveAction: 'Enforce strictly segregated pedestrian walkways with high handrails and mandate 360° radar blind-spot detection.',
    boxCoords: { top: '25%', left: '30%', width: '45%', height: '48%' }
  },
  {
    startSec: 55,
    endSec: 78,
    hazardId: 'HAZ-HP-01',
    name: 'Grizzly Screen Choking & Engulfment Hazard',
    category: 'MECHANICAL',
    riskLevel: 'HIGH',
    stageName: 'Stage 1: Primary Receiving Hopper',
    equipmentId: 'feeding_hopper',
    videoObservation: 'Large clumps of compacted husk and agricultural baling wire accumulate across the 80x80mm grizzly grid, requiring manual rod clearance over the open intake.',
    rootCause: 'Raw field delivery with tramp debris; lack of mechanical scalping vibrator over grizzly.',
    correctiveAction: 'Install hydraulic rock breaker / vibratory scalper; mandate fall-arrest harness tethering prior to clearing.',
    boxCoords: { top: '30%', left: '28%', width: '42%', height: '40%' }
  },
  {
    startSec: 80,
    endSec: 105,
    hazardId: 'HAZ-BC-01',
    name: 'In-Running Belt Nip Points & Skirt Entanglement',
    category: 'MECHANICAL',
    riskLevel: 'HIGH',
    stageName: 'Stage 2: Conveyor Loading Skirt',
    equipmentId: 'belt_conveyor',
    videoObservation: 'In-running pinch point where belt passes under skirt rubber clamps. Return rollers located within arm reach of floor level without full mesh enclosing cages.',
    rootCause: 'Incomplete perimeter guarding around tail pulley and loading skirt transition.',
    correctiveAction: 'Install captive-screw yellow expanded metal nip guards extending 1.2m around tail drum.',
    boxCoords: { top: '45%', left: '35%', width: '35%', height: '35%' }
  },
  {
    startSec: 106,
    endSec: 122,
    hazardId: 'HAZ-BC-02',
    name: 'Combustible Dust Accumulation on Walkways',
    category: 'FIRE_EXPLOSION',
    riskLevel: 'MEDIUM',
    stageName: 'Stage 2: Conveyor Gallery Walkway',
    equipmentId: 'belt_conveyor',
    videoObservation: 'Loose fine husk dust settling on steel grating walkway and structural stringers under conveyor dust hoods.',
    rootCause: 'Static dust carryback on belt return strand; hood seam micro-leaks.',
    correctiveAction: 'Fit dual polyurethane belt scrapers and central vacuum dust extraction ports.',
    boxCoords: { top: '50%', left: '15%', width: '40%', height: '30%' }
  },
  {
    startSec: 124,
    endSec: 165,
    hazardId: 'HAZ-BE-01',
    name: 'ATEX Zone 20 Deflagration & Catastrophic Backspin',
    category: 'FIRE_EXPLOSION',
    riskLevel: 'CRITICAL',
    stageName: 'Stage 3: Vertical Bucket Elevator (+28m)',
    equipmentId: 'bucket_elevator',
    videoObservation: 'Towering twin-leg casing rising 28 meters alongside preheater tower. High internal combustible dust cloud during continuous bucket lift.',
    rootCause: 'Silica-rich dry husk friction sparks or hot bearing inside enclosed vertical trunking; loss of motor torque causing reverse overspeed.',
    correctiveAction: 'Inspect NFPA 68 burst panels vented outside; test internal mechanical sprag backstop every 90 days.',
    boxCoords: { top: '15%', left: '38%', width: '25%', height: '65%' }
  },
  {
    startSec: 168,
    endSec: 195,
    hazardId: 'HAZ-AF-01',
    name: 'Sprocket In-Running Pinch & Interlocking Pan Shear',
    category: 'MECHANICAL',
    riskLevel: 'CRITICAL',
    stageName: 'Stage 4: Apron Feeder Extraction',
    equipmentId: 'apron_feeder',
    videoObservation: 'Massive torque crawler track chain sprockets driving overlapping cast steel pans. High-risk pinch zone between moving pans and side skirt frame.',
    rootCause: 'Slow pan translation gives false illusion of safety; zero yield in heavy mechanical drive.',
    correctiveAction: 'Install interlocked safety wire mesh guards and emergency stop pull-cables along full feeder perimeter.',
    boxCoords: { top: '38%', left: '25%', width: '50%', height: '38%' }
  },
  {
    startSec: 196,
    endSec: 215,
    hazardId: 'HAZ-PH-01',
    name: 'Kiln Flame Flashback & 900°C Thermal Gas Blowback',
    category: 'FIRE_EXPLOSION',
    riskLevel: 'CRITICAL',
    stageName: 'Stage 6: Precalciner Injection Duct',
    equipmentId: 'preheater_calciner',
    videoObservation: 'Direct connection into cement kiln calciner vessel running at 900°C. Backdraft draft pressure fluctuations could force flame into fuel chute.',
    rootCause: 'Seal erosion on rotary airlock vanes or loss of negative draft pressure from preheater fan.',
    correctiveAction: 'Install automated high-speed pneumatic knife gate (<0.8s trip) and continuous nitrogen snuffing purge line.',
    boxCoords: { top: '20%', left: '32%', width: '42%', height: '52%' }
  }
];

export const VideoReferenceModal: React.FC<VideoReferenceModalProps> = ({
  onClose,
  initialTimestamp = 0,
  onSync3DToEquipment,
  onDeployDroneToHazard,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(215);
  const [activeTab, setActiveTab] = useState<'hazards' | 'stages'>('hazards');
  const [aiScannerActive, setAiScannerActive] = useState<boolean>(true);

  useEffect(() => {
    if (videoRef.current && initialTimestamp > 0) {
      videoRef.current.currentTime = initialTimestamp;
    }
  }, [initialTimestamp]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const jumpToTime = (secs: number, equipId?: EquipmentId) => {
    if (videoRef.current) {
      videoRef.current.currentTime = secs;
      videoRef.current.play();
      setIsPlaying(true);
    }
    if (equipId && onSync3DToEquipment) {
      onSync3DToEquipment(equipId);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Find active hazard at the current video timestamp
  const activeHazard = VIDEO_HAZARD_RECORDS.find(
    (h) => currentTime >= h.startSec && currentTime <= h.endSec
  );

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex items-center justify-center p-4 sm:p-6 select-none font-sans">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">
                  Actual Plant Video Footage & AI Hazard Detection
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40">
                  8 Hazards Identified in Video
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cross-correlate actual cement plant footage with the 3D twin, automated drone patrol, and OSHA/NFPA safety controls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Scanner Toggle */}
            <button
              onClick={() => setAiScannerActive(!aiScannerActive)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                aiScannerActive
                  ? 'bg-red-950 text-red-300 border-red-500/50 shadow-md ring-1 ring-red-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>AI Hazard Scanner: {aiScannerActive ? 'ACTIVE' : 'OFF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Video Player Column */}
          <div className="flex-1 bg-black flex flex-col justify-between relative group overflow-hidden">
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              <video
                ref={videoRef}
                src="/assets/aistudio/WhatsApp_Video_2026-11-06_at_8.33.36_AM_d88fc821.mp4"
                className="max-h-full max-w-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                controls={false}
                autoPlay
                playsInline
              />

              {/* Augmented Reality Hazard Detection Bounding Box on Video */}
              {aiScannerActive && activeHazard && (
                <div
                  className="absolute pointer-events-none transition-all duration-300 border-2 border-red-500/90 rounded-xl bg-red-950/20 backdrop-blur-[1px] animate-pulse shadow-2xl"
                  style={{
                    top: activeHazard.boxCoords.top,
                    left: activeHazard.boxCoords.left,
                    width: activeHazard.boxCoords.width,
                    height: activeHazard.boxCoords.height,
                  }}
                >
                  {/* Corner Targets */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-400"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-400"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-400"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-400"></div>

                  <div className="absolute -top-7 left-0 bg-red-900/90 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-lg border border-red-400/50 flex items-center gap-1 font-bold">
                    <span>⚠️ {activeHazard.hazardId}: {activeHazard.riskLevel} RISK</span>
                  </div>
                </div>
              )}

              {/* Floating Center Play/Pause button on hover */}
              <button
                onClick={togglePlay}
                className="absolute w-14 h-14 rounded-full bg-slate-900/80 hover:bg-slate-900 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>

              {/* Active Hazard Quick Banner over Video */}
              {activeHazard && (
                <div className="absolute bottom-3 left-4 right-4 bg-slate-900/90 border border-red-500/60 p-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="p-1 rounded bg-red-950 text-red-400 border border-red-500/40">
                      <ShieldAlert className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-red-400">
                        {activeHazard.hazardId} | {activeHazard.stageName}
                      </span>
                      <div className="text-xs font-bold text-white leading-tight">
                        {activeHazard.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onDeployDroneToHazard && (
                      <button
                        onClick={() => {
                          onDeployDroneToHazard(activeHazard.hazardId);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1"
                      >
                        <span>🚁 Inspect with Drone</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls & Hazard Timeline Bar */}
            <div className="bg-slate-950/90 border-t border-slate-800 p-3 flex flex-col gap-2">
              {/* Timeline with Hazard Range Highlights */}
              <div className="relative w-full flex items-center">
                {/* Visual colored hazard bands along timeline */}
                <div className="absolute inset-x-0 h-1.5 rounded-lg overflow-hidden pointer-events-none flex">
                  {VIDEO_HAZARD_RECORDS.map((h, i) => {
                    const leftPct = (h.startSec / (duration || 215)) * 100;
                    const widthPct = ((h.endSec - h.startSec) / (duration || 215)) * 100;
                    return (
                      <div
                        key={i}
                        className={`absolute h-full ${
                          h.riskLevel === 'CRITICAL' ? 'bg-red-500/80' : 'bg-amber-500/80'
                        }`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        title={`${h.hazardId}: ${h.name}`}
                      />
                    );
                  })}
                </div>

                <input
                  type="range"
                  min={0}
                  max={duration || 215}
                  value={currentTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCurrentTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 relative z-10"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <span className="text-xs font-mono text-slate-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Timeline Hazard Legend */}
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span>Critical Hazard Range</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>High Hazard Range</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hazards Log & Equipment Bookmarks */}
          <div className="w-full md:w-[410px] bg-slate-900 border-l border-slate-800 flex flex-col">
            {/* Tabs */}
            <div className="p-2 border-b border-slate-800 bg-slate-950/70 flex gap-1">
              <button
                onClick={() => setActiveTab('hazards')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'hazards'
                    ? 'bg-red-950 text-red-300 border border-red-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Identified Hazards ({VIDEO_HAZARD_RECORDS.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('stages')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'stages'
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Equipment ({VIDEO_BOOKMARKS.length})</span>
              </button>
            </div>

            {/* Tab 1: Identified Hazards List */}
            {activeTab === 'hazards' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
                {VIDEO_HAZARD_RECORDS.map((h) => {
                  const isActive = currentTime >= h.startSec && currentTime <= h.endSec;
                  return (
                    <div
                      key={h.hazardId}
                      onClick={() => jumpToTime(h.startSec, h.equipmentId)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-red-950/90 to-slate-900 border-red-400 shadow-lg ring-1 ring-red-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-red-400">
                            {formatTime(h.startSec)} - {formatTime(h.endSec)}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {h.hazardId}
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          h.riskLevel === 'CRITICAL'
                            ? 'bg-red-950 text-red-300 border border-red-500/50'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        }`}>
                          {h.riskLevel}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-white mb-0.5">
                        {h.name}
                      </div>
                      <div className="text-[10px] text-cyan-300 font-medium">
                        {h.stageName}
                      </div>

                      <div className="mt-2 text-[11px] text-slate-300 leading-snug bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <span className="text-red-300 font-semibold block mb-0.5">👁️ Observed in Video:</span>
                        {h.videoObservation}
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Click to jump video</span>
                        {onDeployDroneToHazard && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeployDroneToHazard(h.hazardId);
                              onClose();
                            }}
                            className="text-cyan-300 hover:text-cyan-200 font-bold underline flex items-center gap-0.5"
                          >
                            <span>Deploy Drone 🚁</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Equipment Bookmarks */}
            {activeTab === 'stages' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {VIDEO_BOOKMARKS.map((bm, idx) => {
                  const isCurrent = Math.abs(currentTime - bm.seconds) < 8;
                  return (
                    <div
                      key={idx}
                      onClick={() => jumpToTime(bm.seconds, bm.equipmentId)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-gradient-to-r from-indigo-950/80 to-slate-900 border-indigo-400 shadow-md ring-1 ring-indigo-500/30'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-cyan-300">
                          {formatTime(bm.seconds)}
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          Confirmed Stage
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-200">
                        {bm.title}
                      </div>
                      <div className="text-[10px] text-indigo-300 font-medium">
                        {bm.stageName}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {bm.description}
                      </p>

                      <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-end text-[10px] text-cyan-400 gap-1">
                        <Eye className="w-3 h-3" />
                        <span>Sync 3D Model</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
