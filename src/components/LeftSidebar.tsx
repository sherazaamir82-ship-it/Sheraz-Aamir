import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Truck,
  Inbox,
  ArrowUpRight,
  TrendingUp,
  HelpCircle,
  Sparkles,
  Flame,
  Info
} from 'lucide-react';
import { EquipmentId } from '../types/plant';
import { EQUIPMENT_DATABASE, PROCESS_STAGES_FLOW } from '../data/plantData';

interface LeftSidebarProps {
  selectedEquipmentId: EquipmentId;
  onSelectEquipment: (id: EquipmentId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onStartTour: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  selectedEquipmentId,
  onSelectEquipment,
  collapsed,
  onToggleCollapse,
  onStartTour,
}) => {
  const getStageIcon = (id: EquipmentId) => {
    switch (id) {
      case 'yard_stockpile':
        return <Truck className="w-4 h-4 text-amber-400" />;
      case 'feeding_hopper':
        return <Inbox className="w-4 h-4 text-orange-400" />;
      case 'belt_conveyor':
        return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
      case 'bucket_elevator':
        return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      case 'apron_feeder':
        return <ArrowUpRight className="w-4 h-4 text-sky-400" />;
      case 'preheater_conveyor':
        return <ArrowUpRight className="w-4 h-4 text-green-400" />;
      case 'preheater_calciner':
        return <Flame className="w-4 h-4 text-orange-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <aside
      className={`relative h-[calc(100vh-3.5rem)] bg-slate-900/95 border-r border-slate-800 transition-all duration-300 z-20 flex flex-col select-none ${
        collapsed ? 'w-12' : 'w-72'
      }`}
    >
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3.5 top-5 w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center shadow-lg z-30 transition-transform hover:scale-105"
        title={collapsed ? 'Expand Equipment Panel' : 'Collapse Equipment Panel'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Sidebar Header */}
      {!collapsed ? (
        <div className="p-3.5 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Plant Equipment Stages
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              {PROCESS_STAGES_FLOW.length} Stages (Confirmed)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            Select equipment to inspect 3D mechanics, hazard controls, and operational principles.
          </p>
        </div>
      ) : (
        <div className="p-2 border-b border-slate-800 flex justify-center py-4">
          <span className="text-[10px] font-bold text-slate-400 rotate-90 my-2">STAGES</span>
        </div>
      )}

      {/* Equipment Stage List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
        {PROCESS_STAGES_FLOW.map((stage) => {
          const spec = EQUIPMENT_DATABASE[stage.equipmentId];
          const isSelected = selectedEquipmentId === stage.equipmentId;
          const isConfirmed = stage.status === 'CONFIRMED';

          if (collapsed) {
            return (
              <button
                key={stage.equipmentId}
                onClick={() => onSelectEquipment(stage.equipmentId as EquipmentId)}
                className={`w-full h-10 flex items-center justify-center rounded-lg transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title={`${stage.title} (${isConfirmed ? 'Confirmed' : 'Unconfirmed'})`}
              >
                {getStageIcon(stage.equipmentId as EquipmentId)}
              </button>
            );
          }

          return (
            <div
              key={stage.equipmentId}
              onClick={() => onSelectEquipment(stage.equipmentId as EquipmentId)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer group ${
                isSelected
                  ? 'bg-gradient-to-r from-slate-800 to-slate-850 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              {/* Header: Stage Number, Tag, and Confirmation Badge */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {stage.step}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {spec?.tag || `STAGE-0${stage.step}`}
                  </span>
                </div>

                {isConfirmed ? (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Confirmed
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-500/30 flex items-center gap-0.5">
                    <AlertCircle className="w-2.5 h-2.5" /> To Be Confirmed
                  </span>
                )}
              </div>

              {/* Title & Icon */}
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{getStageIcon(stage.equipmentId as EquipmentId)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                    {spec?.name || stage.title}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {stage.description}
                  </p>
                </div>
              </div>

              {/* Failure Modes & Hazard Counter Pill */}
              {spec && (
                <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    {spec.hazards.length} HSE Hazards
                  </span>
                  <span className="font-mono text-cyan-400/80">
                    {spec.technicalSpecs[0]?.value || 'Active'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Material Properties & Guided Tour Card */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/50 space-y-2">
          {/* Rice Husk Fuel Properties */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
            <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
              <span className="flex items-center gap-1 text-amber-400">
                <Info className="w-3 h-3" /> Rice Husk Biomass Specs
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Kst 115 bar·m/s</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
              <div>Density: <span className="text-slate-200 font-medium">120 kg/m³</span></div>
              <div>Moisture: <span className="text-slate-200 font-medium">8 – 12%</span></div>
              <div>Calorific: <span className="text-slate-200 font-medium">3,200 kcal/kg</span></div>
              <div>Rate: <span className="text-slate-200 font-medium">15 – 25 t/h</span></div>
            </div>
          </div>

          {/* Guided Tour Trigger Button */}
          <button
            onClick={onStartTour}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-400 border border-cyan-500/30 text-xs font-semibold shadow-sm transition-all hover:border-cyan-400"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Walk Me Through The Process
          </button>
        </div>
      )}
    </aside>
  );
};
