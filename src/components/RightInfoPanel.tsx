import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Video,
  Wrench,
  AlertTriangle,
  Cog,
  ShieldCheck,
  Flame,
  ArrowRight,
  Layers,
  BookOpen
} from 'lucide-react';
import { EquipmentId, EquipmentSpec, HazardItem } from '../types/plant';
import { EQUIPMENT_DATABASE } from '../data/plantData';

interface RightInfoPanelProps {
  equipmentId: EquipmentId;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenVideoAtTimestamp?: (seconds: number) => void;
  onSelectHazard?: (hazard: HazardItem) => void;
}

type TabType = 'operation' | 'components' | 'failures' | 'maintenance' | 'hazards';

export const RightInfoPanel: React.FC<RightInfoPanelProps> = ({
  equipmentId,
  onClose,
  collapsed,
  onToggleCollapse,
  onOpenVideoAtTimestamp,
  onSelectHazard,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('operation');
  const spec: EquipmentSpec = EQUIPMENT_DATABASE[equipmentId] || EQUIPMENT_DATABASE['feeding_hopper'];

  if (collapsed) {
    return (
      <div className="absolute right-0 top-14 bottom-0 z-20 flex items-center pointer-events-none">
        <button
          onClick={onToggleCollapse}
          className="pointer-events-auto mr-1 p-2 rounded-l-lg bg-slate-900 border-l border-y border-slate-800 text-slate-300 hover:text-white shadow-xl flex flex-col items-center gap-2 group transition-all"
          title="Open Equipment Specifications Panel"
        >
          <ChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-slate-400 rotate-90 tracking-widest my-4">
            SPECIFICATIONS
          </span>
        </button>
      </div>
    );
  }

  const isConfirmed = spec.confirmationStatus === 'CONFIRMED';

  return (
    <aside className="absolute right-0 top-14 bottom-0 w-96 bg-slate-900/95 border-l border-slate-800 z-20 flex flex-col shadow-2xl select-none backdrop-blur-md">
      {/* Header Bar */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              {spec.tag}
            </span>
            {isConfirmed ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Confirmed
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Unconfirmed Modular
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              title="Collapse Panel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h2 className="text-sm font-bold text-slate-100 mt-2 leading-snug">
          {spec.name}
        </h2>
        <div className="text-[11px] text-cyan-400/90 font-medium">
          {spec.stageTitle}
        </div>

        {/* Video Cross-Reference Button */}
        {spec.videoTimestamp && onOpenVideoAtTimestamp && (
          <button
            onClick={() => onOpenVideoAtTimestamp(spec.videoTimestamp!.start)}
            className="mt-2.5 w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 text-xs font-medium transition-all group"
          >
            <span className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-indigo-400" />
              <span>Plant Video: {spec.videoTimestamp.description}</span>
            </span>
            <span className="text-[10px] font-mono bg-indigo-900 px-1.5 py-0.5 rounded text-indigo-200">
              {Math.floor(spec.videoTimestamp.start / 60)}:
              {(spec.videoTimestamp.start % 60).toString().padStart(2, '0')}
            </span>
          </button>
        )}
      </div>

      {/* Internal Tabs */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/40 text-[11px] px-2 pt-1 gap-1">
        <button
          onClick={() => setActiveTab('operation')}
          className={`px-2.5 py-1.5 border-b-2 font-medium transition-colors ${
            activeTab === 'operation'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Operation
        </button>
        <button
          onClick={() => setActiveTab('components')}
          className={`px-2.5 py-1.5 border-b-2 font-medium transition-colors ${
            activeTab === 'components'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Parts ({spec.components.length})
        </button>
        <button
          onClick={() => setActiveTab('failures')}
          className={`px-2.5 py-1.5 border-b-2 font-medium transition-colors ${
            activeTab === 'failures'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Failures
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-2.5 py-1.5 border-b-2 font-medium transition-colors ${
            activeTab === 'maintenance'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Maintenance
        </button>
        <button
          onClick={() => setActiveTab('hazards')}
          className={`px-2.5 py-1.5 border-b-2 font-medium transition-colors ${
            activeTab === 'hazards'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          HSE ({spec.hazards.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        {activeTab === 'operation' && (
          <div className="space-y-4">
            {/* Purpose */}
            <div>
              <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Equipment Purpose
              </div>
              <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                {spec.purpose}
              </p>
            </div>

            {/* Working Principle */}
            <div>
              <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <Cog className="w-3.5 h-3.5 text-cyan-400" /> Working Principle & Mechanics
              </div>
              <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                {spec.workingPrinciple}
              </p>
            </div>

            {/* Material Stream Flow */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] font-semibold text-amber-400 mb-1">
                  Material Entering
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {spec.materialEntering}
                </p>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] font-semibold text-emerald-400 mb-1">
                  Material Leaving
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {spec.materialLeaving}
                </p>
              </div>
            </div>

            {/* Technical Specifications Table */}
            <div>
              <div className="text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Engineering Specifications
              </div>
              <div className="bg-slate-950/80 rounded-lg border border-slate-800 overflow-hidden divide-y divide-slate-850">
                {spec.technicalSpecs.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-1.5 text-[11px]">
                    <span className="text-slate-400">{s.label}</span>
                    <span className="text-slate-200 font-mono font-medium text-right max-w-[55%]">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-2.5">
            <div className="text-[11px] text-slate-400 mb-2">
              Mechanical sub-assemblies and structural components:
            </div>
            {spec.components.map((comp, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 text-[10px] font-mono font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{comp.name}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pl-7">
                  {comp.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'failures' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400 mb-2">
              Common operational failure modes and corrective engineering actions:
            </div>
            {spec.commonFailureModes.map((fm, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 p-3 rounded-lg border border-rose-950/60 space-y-1.5"
              >
                <div className="font-semibold text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  {fm.failure}
                </div>
                <div className="text-[11px] text-slate-400">
                  <strong className="text-slate-300">Root Cause:</strong> {fm.rootCause}
                </div>
                <div className="text-[11px] text-slate-400">
                  <strong className="text-slate-300">Symptom:</strong> {fm.symptom}
                </div>
                <div className="text-[11px] text-emerald-300/90 pt-1 border-t border-slate-800">
                  <strong className="text-emerald-400">Corrective Action:</strong> {fm.action}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-2.5">
            <div className="text-[11px] text-slate-400 mb-2">
              Preventive maintenance schedule and inspection procedures:
            </div>
            {spec.maintenanceRequirements.map((m, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                    <Wrench className="w-3 h-3 text-cyan-400" />
                    {m.task}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    {m.frequency}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  {m.procedure}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'hazards' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400 mb-2">
              Identified health, safety, and explosion risks for this equipment:
            </div>
            {spec.hazards.map((h) => (
              <div
                key={h.id}
                onClick={() => onSelectHazard && onSelectHazard(h)}
                className="bg-slate-950/80 p-3 rounded-lg border border-amber-950/70 hover:border-amber-500/50 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5 group-hover:text-amber-200">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    {h.name}
                  </div>
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

                <div className="text-[10px] text-slate-400 font-mono">
                  Location: {h.location}
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">
                  {h.whyExists}
                </p>

                <div className="pt-1.5 border-t border-slate-800 text-[10px] text-cyan-400 flex items-center justify-between">
                  <span>Click to view full HSE Risk Card</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
