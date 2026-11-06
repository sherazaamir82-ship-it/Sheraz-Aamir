import React from 'react';
import {
  X,
  MousePointer,
  Keyboard,
  Compass,
  Eye,
  Sliders,
  Check
} from 'lucide-react';

interface ControlsHelpModalProps {
  onClose: () => void;
}

export const ControlsHelpModal: React.FC<ControlsHelpModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 select-none">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              3D Interactive Camera & Navigation Guide
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Full 6-DOF plant inspection and machinery examination controls
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mouse Navigation */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <MousePointer className="w-4 h-4" /> Mouse Controls
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-slate-200 block mb-0.5">Left Click + Drag:</strong>
              <span className="text-slate-400">Orbit & rotate around the 3D plant</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-slate-200 block mb-0.5">Right Click + Drag:</strong>
              <span className="text-slate-400">Pan camera horizontally and vertically</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-slate-200 block mb-0.5">Scroll Wheel:</strong>
              <span className="text-slate-400">Smooth zoom in and out</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-slate-200 block mb-0.5">Double Click Equipment:</strong>
              <span className="text-slate-400">Instantly focus camera on target machinery</span>
            </div>
          </div>
        </div>

        {/* Keyboard Navigation */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Keyboard className="w-4 h-4" /> Keyboard Fly Controls
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-center">
              <span className="font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-750 inline-block mb-1">
                W / ↑
              </span>
              <div className="text-slate-400 text-[11px]">Move Forward</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-center">
              <span className="font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-750 inline-block mb-1">
                S / ↓
              </span>
              <div className="text-slate-400 text-[11px]">Move Backward</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-center">
              <span className="font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-750 inline-block mb-1">
                A / ←
              </span>
              <div className="text-slate-400 text-[11px]">Move Left</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-center">
              <span className="font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-750 inline-block mb-1">
                D / →
              </span>
              <div className="text-slate-400 text-[11px]">Move Right</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-center">
              <span className="font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-750 inline-block mb-1">
                E
              </span>
              <div className="text-slate-400 text-[11px]">Ascend (Up)</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-center">
              <span className="font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-750 inline-block mb-1">
                Q
              </span>
              <div className="text-slate-400 text-[11px]">Descend (Down)</div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
