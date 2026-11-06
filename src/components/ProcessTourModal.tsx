import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Volume2
} from 'lucide-react';
import { EquipmentId } from '../types/plant';
import { EQUIPMENT_DATABASE, PROCESS_STAGES_FLOW } from '../data/plantData';

interface ProcessTourModalProps {
  onClose: () => void;
  onStepChange: (equipmentId: EquipmentId) => void;
}

export const ProcessTourModal: React.FC<ProcessTourModalProps> = ({
  onClose,
  onStepChange,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(12);

  const totalSteps = PROCESS_STAGES_FLOW.length;
  const stage = PROCESS_STAGES_FLOW[currentStep];
  const spec = EQUIPMENT_DATABASE[stage.equipmentId];

  useEffect(() => {
    onStepChange(stage.equipmentId as EquipmentId);
  }, [currentStep, onStepChange, stage.equipmentId]);

  // Auto advance countdown
  useEffect(() => {
    if (!autoAdvance) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setCurrentStep((curr) => (curr + 1) % totalSteps);
          return 12;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoAdvance, totalSteps, currentStep]);

  const handleNext = () => {
    setCurrentStep((curr) => (curr + 1) % totalSteps);
    setTimerSeconds(12);
  };

  const handlePrev = () => {
    setCurrentStep((curr) => (curr - 1 + totalSteps) % totalSteps);
    setTimerSeconds(12);
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 pointer-events-none select-none">
      <div className="pointer-events-auto bg-slate-900/95 border border-cyan-500/50 rounded-2xl shadow-2xl p-4 backdrop-blur-md">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Guided Process Walkthrough
              </span>
              <span className="text-[11px] text-slate-400 ml-2 font-mono">
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoAdvance(!autoAdvance)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-semibold flex items-center gap-1 border transition-colors ${
                autoAdvance
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {autoAdvance ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {autoAdvance ? `Auto (${timerSeconds}s)` : 'Paused'}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stage Content */}
        <div className="py-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-xs font-bold flex items-center justify-center">
                {stage.step}
              </span>
              {spec?.name || stage.title}
            </h3>

            {stage.status === 'CONFIRMED' ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Confirmed Plant Stage
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> To Be Confirmed
              </span>
            )}
          </div>

          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            {spec?.workingPrinciple || stage.description}
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
              <strong className="text-cyan-400">Mechanical Role:</strong> {spec?.mechanicalFunction || 'Bulk handling'}
            </div>
            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
              <strong className="text-amber-400">Key Safety Note:</strong> {spec?.hazards[0]?.name || 'Standard PPE'}
            </div>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 text-xs font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Stage
          </button>

          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {PROCESS_STAGES_FLOW.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentStep(i);
                  setTimerSeconds(12);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentStep === i ? 'w-6 bg-cyan-400' : 'bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Next Stage <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
