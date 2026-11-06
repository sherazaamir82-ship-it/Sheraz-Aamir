import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Sliders,
  Plus,
  Save,
  Info,
  Check,
  Video,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DOWNSTREAM_CONFIGURATIONS } from '../data/plantData';
import { DownstreamOption } from '../types/plant';

interface DownstreamConfiguratorProps {
  activeConfigId: string;
  onSelectConfig: (configId: string) => void;
  onOpenVideoAtTimestamp?: (seconds: number) => void;
  customNotes: string;
  onSaveCustomNotes: (notes: string) => void;
}

export const DownstreamConfigurator: React.FC<DownstreamConfiguratorProps> = ({
  activeConfigId,
  onSelectConfig,
  onOpenVideoAtTimestamp,
  customNotes,
  onSaveCustomNotes,
}) => {
  const [notesInput, setNotesInput] = useState(customNotes);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveNotes = () => {
    onSaveCustomNotes(notesInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex items-center justify-center p-6 select-none">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Stage 4: Process Stage To Be Confirmed
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Modular Downstream Configurator
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              Downstream Equipment Sequence & Cement Kiln Interface
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Stages 1 to 3 (Hopper, Conveyor, Bucket Elevator) are engineered and confirmed from your plant video. The remaining downstream equipment arrangement can be chosen from the configurations observed in your plant footage or modified as new drawings arrive.
            </p>
          </div>
        </div>

        {/* Configurations Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Engineering Notice Callout */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-300">Engineering Protocol:</strong> Selecting any configuration below immediately swaps the active 3D procedural machinery at the top platform (+28m) in the virtual plant, updates material simulation trajectories, and synchronizes the process flow telemetry.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOWNSTREAM_CONFIGURATIONS.map((opt) => {
              const isActive = activeConfigId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => onSelectConfig(opt.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-400 shadow-xl ring-2 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-100">
                        {opt.title}
                      </span>
                      {isActive ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" /> ACTIVE IN 3D
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 hover:text-cyan-300 font-medium">
                          Select Config
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {opt.description}
                    </p>

                    {/* Equipment list */}
                    <div className="mb-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Equipment Included:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {opt.equipmentList.map((eq, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Application Recommendation */}
                    <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                      <strong className="text-slate-300">Application:</strong> {opt.recommendedApplication}
                    </div>
                  </div>

                  {opt.id === 'config_surge_bin' && onOpenVideoAtTimestamp && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenVideoAtTimestamp(170);
                      }}
                      className="mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 text-xs font-medium hover:bg-indigo-900 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5 text-indigo-400" />
                      View in Plant Video (02:50 Pin Gate Surge Bin)
                    </button>
                  )}

                  {opt.id === 'config_rotary_airlock' && onOpenVideoAtTimestamp && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenVideoAtTimestamp(205);
                      }}
                      className="mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 text-xs font-medium hover:bg-indigo-900 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5 text-indigo-400" />
                      View in Plant Video (03:25 Rotary Airlock Valve)
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Plant Engineer Notes / Custom Equipment Input */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Plant Specific Notes & Confirmed Equipment Tags
                </h3>
                <p className="text-[11px] text-slate-400">
                  Record confirmed plant equipment numbers, supplier drawings, or revised routing from plant site surveys:
                </p>
              </div>
              <button
                onClick={handleSaveNotes}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Saved
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Save Plant Notes
                  </>
                )}
              </button>
            </div>

            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="e.g., Confirmed Tag: 411-SB01 Surge Bin with Schenck Weigh Feeder. Operating under negative draft (-15 mmWC) from Calciner Fan. Verified rotary airlock is 10-vane Schenck with hardened Stellite tips."
              className="w-full h-24 bg-slate-900 border border-slate-750 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
