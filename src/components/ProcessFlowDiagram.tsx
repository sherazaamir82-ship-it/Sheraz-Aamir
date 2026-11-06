import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Truck,
  Inbox,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { EquipmentId } from '../types/plant';
import { PROCESS_STAGES_FLOW, EQUIPMENT_DATABASE } from '../data/plantData';

interface ProcessFlowDiagramProps {
  selectedEquipmentId: EquipmentId;
  onSelectEquipment: (id: EquipmentId) => void;
  onStartTour: () => void;
}

export const ProcessFlowDiagram: React.FC<ProcessFlowDiagramProps> = ({
  selectedEquipmentId,
  onSelectEquipment,
  onStartTour,
}) => {
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-full max-w-5xl px-4 select-none pointer-events-none">
      <div className="pointer-events-auto bg-slate-900/95 border border-slate-750 rounded-2xl shadow-2xl p-4 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Interactive Material Flow Sequence
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Rice Husk Bulk Density: 120 kg/m³
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any stage in the flow path to inspect its 3D mechanical twin, hazards, and operational parameters
            </p>
          </div>

          <button
            onClick={onStartTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Explain Complete Process
          </button>
        </div>

        {/* Process Flow Cards Sequence */}
        <div className="py-4 grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
          {PROCESS_STAGES_FLOW.map((stage, idx) => {
            const spec = EQUIPMENT_DATABASE[stage.equipmentId];
            const isSelected = selectedEquipmentId === stage.equipmentId;
            const isConfirmed = stage.status === 'CONFIRMED';

            return (
              <div key={stage.equipmentId} className="relative flex flex-col items-center">
                <div
                  onClick={() => onSelectEquipment(stage.equipmentId as EquipmentId)}
                  className={`w-full p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-full ${
                    isSelected
                      ? 'bg-gradient-to-b from-slate-800 to-slate-850 border-cyan-400 shadow-xl ring-2 ring-cyan-500/40 -translate-y-1'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 text-[10px] font-bold flex items-center justify-center">
                        {stage.step}
                      </span>
                      {isConfirmed ? (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Confirmed
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/30 flex items-center gap-0.5">
                          <AlertCircle className="w-2.5 h-2.5" /> Unconfirmed
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-bold text-slate-100 line-clamp-1 mb-1">
                      {spec?.name || stage.title}
                    </div>

                    <div className="text-[10px] font-mono text-cyan-400 mb-1">
                      {spec?.tag || `STAGE-0${stage.step}`}
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-3 leading-snug">
                      {stage.description}
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{spec?.technicalSpecs[0]?.value || 'Active'}</span>
                    <span className="text-cyan-400 font-semibold group-hover:underline">Inspect 3D</span>
                  </div>
                </div>

                {/* Connecting Directional Arrow between cards */}
                {idx < PROCESS_STAGES_FLOW.length - 1 && (
                  <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-cyan-400 shadow-md">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend & Downstream Confirmation Notice */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Confirmed In Plant Video (Stages 0 - 3)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Pending Plant Confirmation (Stage 4 Modular)
            </span>
          </div>

          <div className="text-[11px] text-cyan-300 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Use the Modular Downstream tab to test alternate firing routes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
