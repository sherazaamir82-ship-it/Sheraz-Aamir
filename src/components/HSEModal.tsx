import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  HardHat,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
  Eye,
  Crosshair
} from 'lucide-react';
import { HazardItem, EquipmentId } from '../types/plant';
import { EQUIPMENT_DATABASE } from '../data/plantData';

interface HSEModalProps {
  onClose: () => void;
  selectedHazard?: HazardItem | null;
  onFocusHazardOn3D?: (hazard: HazardItem) => void;
}

export const HSEModal: React.FC<HSEModalProps> = ({
  onClose,
  selectedHazard,
  onFocusHazardOn3D,
}) => {
  // Aggregate all hazards across all plant equipment
  const allHazards: (HazardItem & { equipmentName: string; equipmentId: EquipmentId })[] = [];
  Object.values(EQUIPMENT_DATABASE).forEach((spec) => {
    spec.hazards.forEach((h) => {
      allHazards.push({
        ...h,
        equipmentName: spec.name,
        equipmentId: spec.id,
      });
    });
  });

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [activeHazard, setActiveHazard] = useState<
    (HazardItem & { equipmentName: string; equipmentId: EquipmentId }) | null
  >(
    selectedHazard
      ? allHazards.find((h) => h.id === selectedHazard.id) || allHazards[0]
      : allHazards[0]
  );

  const filteredHazards = allHazards.filter((h) => {
    if (filterCategory !== 'ALL' && h.category !== filterCategory) return false;
    if (filterStatus !== 'ALL' && h.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex items-center justify-center p-6 select-none">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  HSE Process Safety & Dust Explosion Risk Audit
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                  Alternative Fuel Protocol (NFPA 68 / ATEX / OSHA)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Identification, hazard zoning, engineering barriers, and PPE for agricultural rice husk handling in cement manufacturing
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

        {/* Filter Bar */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 flex items-center gap-1 font-semibold uppercase text-[10px]">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter Hazard Class:
            </span>
            <div className="flex items-center gap-1">
              {['ALL', 'FIRE_EXPLOSION', 'MECHANICAL', 'HEALTH_DUST', 'ENVIRONMENTAL_HEIGHT'].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      filterCategory === cat
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat === 'ALL'
                      ? 'All Risks'
                      : cat === 'FIRE_EXPLOSION'
                      ? 'Fire & Dust Explosion'
                      : cat === 'MECHANICAL'
                      ? 'Mechanical & Nip'
                      : cat === 'HEALTH_DUST'
                      ? 'Dust / Health'
                      : 'Working at Heights'}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterStatus(filterStatus === 'ALL' ? 'CONFIRMED_IN_FOOTAGE' : 'ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                filterStatus === 'CONFIRMED_IN_FOOTAGE'
                  ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              Confirmed in Footage Only
            </button>
          </div>
        </div>

        {/* Body Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Hazards List Left Column */}
          <div className="w-80 border-r border-slate-800 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-slate-950/30">
            {filteredHazards.map((h) => {
              const isSelected = activeHazard?.id === h.id;
              const isFire = h.category === 'FIRE_EXPLOSION';
              return (
                <div
                  key={h.id}
                  onClick={() => setActiveHazard(h)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-950/60 to-slate-900 border-amber-400 shadow-md ring-1 ring-amber-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                      {h.id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        h.riskLevel === 'CRITICAL'
                          ? 'bg-red-950 text-red-400 border border-red-500/40'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {h.riskLevel}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-200 line-clamp-1 mb-1 flex items-center gap-1.5">
                    {isFire ? (
                      <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    )}
                    {h.name}
                  </div>

                  <div className="text-[11px] text-slate-400 truncate">
                    {h.location}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/80">
                    <span className="text-slate-400 truncate max-w-[140px]">
                      {h.equipmentName}
                    </span>
                    {h.status === 'CONFIRMED_IN_FOOTAGE' ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Plant Confirmed
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3" /> Site Verify
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Hazard Breakdown Right Column */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-slate-900">
            {activeHazard ? (
              <div className="space-y-5">
                {/* Hazard Title Card */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                        {activeHazard.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          activeHazard.riskLevel === 'CRITICAL'
                            ? 'bg-red-950 text-red-300 border border-red-500/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        Risk Rating: {activeHazard.riskLevel}
                      </span>
                      {activeHazard.status === 'CONFIRMED_IN_FOOTAGE' ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          Confirmed in Plant Footage
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/30">
                          Potential — Requires Site Survey Verification
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-100">
                      {activeHazard.name}
                    </h3>
                    <div className="text-xs text-slate-400 mt-1">
                      Exact Location: <span className="text-cyan-300 font-mono">{activeHazard.location}</span> ({activeHazard.equipmentName})
                    </div>
                  </div>

                  {activeHazard.position3D && onFocusHazardOn3D && (
                    <button
                      onClick={() => {
                        onFocusHazardOn3D(activeHazard);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-sm transition-all"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      Locate in 3D Plant
                    </button>
                  )}
                </div>

                {/* Why It Exists & Consequences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-4 h-4" /> Why The Hazard Exists
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {activeHazard.whyExists}
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Potential Consequences
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {activeHazard.consequences}
                    </p>
                  </div>
                </div>

                {/* Engineering Controls */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Recommended Engineering Controls
                  </div>
                  <ul className="space-y-1.5 pl-2">
                    {activeHazard.engineeringControls.map((ec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{ec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Administrative Controls & Required PPE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-400" /> Administrative Controls
                    </div>
                    <ul className="space-y-1.5 pl-1">
                      {activeHazard.administrativeControls.map((ac, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <span>{ac}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <HardHat className="w-4 h-4 text-amber-400" /> Required PPE Matrix
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeHazard.requiredPPE.map((ppe, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-750 text-slate-200 text-xs font-medium"
                        >
                          {ppe}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Corrective & Preventive Actions */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-emerald-950/60 space-y-2">
                  <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Corrective & Preventive Actions (CAPA)
                  </div>
                  <ul className="space-y-1.5">
                    {activeHazard.correctiveActions.map((ca, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{ca}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Select a hazard from the left list to review detailed safety analysis.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
