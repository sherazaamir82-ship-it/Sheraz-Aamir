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
  Maximize2
} from 'lucide-react';
import { EquipmentId } from '../types/plant';

interface VideoReferenceModalProps {
  onClose: () => void;
  initialTimestamp?: number;
  onSync3DToEquipment?: (id: EquipmentId) => void;
}

interface VideoBookmark {
  seconds: number;
  title: string;
  stageName: string;
  equipmentId: EquipmentId;
  description: string;
  isConfirmed: boolean;
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
    seconds: 146,
    title: 'Elevator Casing & Flange Joints',
    stageName: 'Stage 3: Bucket Elevator',
    equipmentId: 'bucket_elevator',
    description: 'Explosion relief vents, ladder cage, and structural support frames.',
    isConfirmed: true,
  },
  {
    seconds: 170,
    title: 'Surge Bin with Pin Gate & Weigh Feeder',
    stageName: 'Stage 4: Downstream (To Be Confirmed)',
    equipmentId: 'downstream_unconfirmed',
    description: 'Upper level surge hopper with rod pin gate feeding weigh belt feeder.',
    isConfirmed: false,
  },
  {
    seconds: 205,
    title: 'Rotary Airlock Valve & Transport Pipe',
    stageName: 'Stage 4: Downstream (To Be Confirmed)',
    equipmentId: 'downstream_unconfirmed',
    description: 'Cylindrical rotary valve discharging into pneumatic calciner injection line.',
    isConfirmed: false,
  },
];

export const VideoReferenceModal: React.FC<VideoReferenceModalProps> = ({
  onClose,
  initialTimestamp = 0,
  onSync3DToEquipment,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(210);

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

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex items-center justify-center p-6 select-none">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-5xl h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">
                  Actual Plant Video Walkthrough Reference
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                  Site Verification Footage
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct cross-comparison between real-world cement plant rice husk handling equipment and the 3D digital twin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Video Player Column */}
          <div className="flex-1 bg-black flex flex-col justify-between relative group">
            <div className="flex-1 flex items-center justify-center relative">
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

              {/* Floating Center Play/Pause button on hover */}
              <button
                onClick={togglePlay}
                className="absolute w-14 h-14 rounded-full bg-slate-900/80 hover:bg-slate-900 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>
            </div>

            {/* Video Controls Bar */}
            <div className="bg-slate-950/90 border-t border-slate-800 p-3 flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <span className="text-xs font-mono text-slate-300 w-24">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Seek Bar */}
              <input
                type="range"
                min={0}
                max={duration || 210}
                value={currentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentTime(val);
                  if (videoRef.current) videoRef.current.currentTime = val;
                }}
                className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Bookmarks & Synchronization Right Column */}
          <div className="w-full md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col">
            <div className="p-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Equipment Timestamps
              </span>
              <span className="text-[10px] text-slate-400">
                Click to jump video & 3D view
              </span>
            </div>

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
                      {bm.isConfirmed ? (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          Confirmed Stage
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/30">
                          To Be Confirmed
                        </span>
                      )}
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
          </div>
        </div>
      </div>
    </div>
  );
};
