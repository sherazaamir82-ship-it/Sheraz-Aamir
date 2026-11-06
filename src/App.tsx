/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { PlantViewer } from './three/PlantViewer';
import { HeaderNav } from './components/HeaderNav';
import { LeftSidebar } from './components/LeftSidebar';
import { RightInfoPanel } from './components/RightInfoPanel';
import { BottomControlsDock } from './components/BottomControlsDock';
import { DownstreamConfigurator } from './components/DownstreamConfigurator';
import { HSEModal } from './components/HSEModal';
import { VideoReferenceModal } from './components/VideoReferenceModal';
import { ProcessTourModal } from './components/ProcessTourModal';
import { ControlsHelpModal } from './components/ControlsHelpModal';
import { ProcessFlowDiagram } from './components/ProcessFlowDiagram';
import { DroneHUD } from './components/DroneHUD';
import { DroneController, DRONE_PATROL_WAYPOINTS } from './three/DroneController';
import {
  EquipmentId,
  ViewPreset,
  DisplayMode,
  AppTab,
  HazardItem,
  DroneFlightMode,
  DroneVisionMode,
  DroneTelemetry,
} from './types/plant';
import { SimState } from './three/SimulationManager';

export default function App() {
  // Navigation & Active Screen Tab
  const [activeTab, setActiveTab] = useState<AppTab>('overview');

  // Selected Equipment
  const [selectedEquipmentId, setSelectedEquipmentId] =
    useState<EquipmentId>('feeding_hopper');

  // Simulation State
  const [simulationState, setSimulationState] = useState<SimState>('playing');
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1.0);

  // 3D Inspection Display Mode (Solid, Cutaway, Transparent)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('solid');

  // Camera Presets
  const [viewPreset, setViewPreset] = useState<ViewPreset>('orbit');

  // HSE 3D Warning Markers Toggle
  const [showHseMode, setShowHseMode] = useState<boolean>(true);

  // Drone Flight Inspection State
  const [isDroneModeActive, setIsDroneModeActive] = useState<boolean>(false);
  const [droneFlightMode, setDroneFlightMode] = useState<DroneFlightMode>('patrol');
  const [droneVisionMode, setDroneVisionMode] = useState<DroneVisionMode>('rgb');
  const [droneTelemetry, setDroneTelemetry] = useState<DroneTelemetry>({
    altitude: 12.0,
    speed: 0.0,
    battery: 96,
    heading: 85,
    pitch: 0,
    roll: 0,
    flightMode: 'patrol',
    visionMode: 'rgb',
    lockedHazardId: null,
    targetName: null,
    temperatureReading: 34,
    dustReading: 50,
  });
  const droneControllerRef = useRef<DroneController | null>(null);

  // Active Downstream Modular Configuration
  const [activeDownstreamConfig, setActiveDownstreamConfig] =
    useState<string>('config_surge_bin');
  const [customPlantNotes, setCustomPlantNotes] = useState<string>('');

  // UI Panels Collapsible States
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState<boolean>(false);

  // Modals & Guided Tour Overlays
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [videoTimestamp, setVideoTimestamp] = useState<number>(0);
  const [showHseModal, setShowHseModal] = useState<boolean>(false);
  const [selectedHazard, setSelectedHazard] = useState<HazardItem | null>(null);
  const [showControlsHelp, setShowControlsHelp] = useState<boolean>(false);

  // Select equipment handler
  const handleSelectEquipment = (id: EquipmentId) => {
    setSelectedEquipmentId(id);
    setRightPanelCollapsed(false);
  };

  // Open video modal at exact timestamp
  const handleOpenVideoAtTimestamp = (seconds: number) => {
    setVideoTimestamp(seconds);
    setShowVideoModal(true);
  };

  // Open HSE modal with a specific hazard selected
  const handleSelectHazard = (hazard: HazardItem) => {
    setSelectedHazard(hazard);
    setShowHseModal(true);
  };

  // Focus on 3D hazard pin and select its associated equipment
  const handleFocusHazardOn3D = (hazard: HazardItem) => {
    // Look up equipment containing this hazard
    if (hazard.id.includes('YD')) setSelectedEquipmentId('yard_stockpile');
    else if (hazard.id.includes('HP')) setSelectedEquipmentId('feeding_hopper');
    else if (hazard.id.includes('AF')) setSelectedEquipmentId('apron_feeder');
    else if (hazard.id.includes('PH')) setSelectedEquipmentId('preheater_calciner');
    else if (hazard.location.toLowerCase().includes('preheater') || hazard.id.includes('BC-02')) setSelectedEquipmentId('preheater_conveyor');
    else if (hazard.id.includes('BC')) setSelectedEquipmentId('belt_conveyor');
    else if (hazard.id.includes('BE')) setSelectedEquipmentId('bucket_elevator');
    else setSelectedEquipmentId('apron_feeder');

    setShowHseMode(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <HeaderNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'hse_assessment') setShowHseModal(true);
          else if (tab === 'video_reference') setShowVideoModal(true);
          else if (tab === 'equipment_spec') setRightPanelCollapsed(false);
        }}
        onStartTour={() => setIsTourActive(true)}
        displayMode={displayMode}
        onToggleDisplayMode={setDisplayMode}
        onOpenControlsHelp={() => setShowControlsHelp(true)}
        onOpenVideoModal={() => {
          setVideoTimestamp(0);
          setShowVideoModal(true);
        }}
        simulationPlaying={simulationState === 'playing'}
        onToggleSimulation={() =>
          setSimulationState((prev) => (prev === 'playing' ? 'paused' : 'playing'))
        }
        isDroneModeActive={isDroneModeActive}
        onToggleDroneMode={() => {
          const next = !isDroneModeActive;
          setIsDroneModeActive(next);
          if (next) setViewPreset('drone_chase');
          else setViewPreset('orbit');
        }}
      />

      {/* Main Content Workspace */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Left Sidebar: Equipment Hierarchy & Stages */}
        <LeftSidebar
          selectedEquipmentId={selectedEquipmentId}
          onSelectEquipment={handleSelectEquipment}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onStartTour={() => setIsTourActive(true)}
        />

        {/* 3D WebGL Canvas Viewport */}
        <main className="relative flex-1 h-full overflow-hidden bg-slate-950">
          {/* Quick Fly-To Stage Focus Bar */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-slate-750 px-2.5 py-1 rounded-full shadow-xl backdrop-blur-sm select-none max-w-[95vw] overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Fly To:
            </span>
            <button
              onClick={() => {
                setSelectedEquipmentId('yard_stockpile');
                setViewPreset('offloading');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedEquipmentId === 'yard_stockpile' && viewPreset === 'offloading'
                  ? 'bg-yellow-500 text-slate-950 shadow-md font-bold'
                  : 'text-yellow-300 hover:bg-slate-800'
              }`}
              title="Focus camera on Bedford truck offloading rice husk into storage bay"
            >
              <span>🚛 Offloading Bay</span>
            </button>
            <button
              onClick={() => {
                setSelectedEquipmentId('feeding_hopper');
                setViewPreset('hopper');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedEquipmentId === 'feeding_hopper' && viewPreset === 'hopper'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-amber-300 hover:bg-slate-800'
              }`}
              title="Focus camera on CAT loader climbing ramp and dumping into the hopper grizzly"
            >
              <span>📥 Feeding Hopper</span>
            </button>
            <button
              onClick={() => {
                setSelectedEquipmentId('belt_conveyor');
                setViewPreset('conveyor');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedEquipmentId === 'belt_conveyor' && viewPreset === 'conveyor'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-emerald-300 hover:bg-slate-800'
              }`}
            >
              <span>⚙️ Conveyor 1</span>
            </button>
            <button
              onClick={() => {
                setSelectedEquipmentId('bucket_elevator');
                setViewPreset('elevator');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedEquipmentId === 'bucket_elevator' && viewPreset === 'elevator'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-cyan-300 hover:bg-slate-800'
              }`}
            >
              <span>🏗️ Bucket Elevator</span>
            </button>
            <button
              onClick={() => {
                setSelectedEquipmentId('apron_feeder');
                setViewPreset('apron_feeder');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedEquipmentId === 'apron_feeder' && viewPreset === 'apron_feeder'
                  ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                  : 'text-sky-300 hover:bg-slate-800'
              }`}
            >
              <span>🔗 Apron Feeder</span>
            </button>
            <button
              onClick={() => {
                setSelectedEquipmentId('preheater_conveyor');
                setViewPreset('preheater_conveyor');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedEquipmentId === 'preheater_conveyor' && viewPreset === 'preheater_conveyor'
                  ? 'bg-green-500 text-slate-950 shadow-md font-bold'
                  : 'text-green-300 hover:bg-slate-800'
              }`}
            >
              <span>⚙️ Preheater Conveyor</span>
            </button>
            <button
              onClick={() => {
                setSelectedEquipmentId('preheater_calciner');
                setViewPreset('preheater');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedEquipmentId === 'preheater_calciner' && viewPreset === 'preheater'
                  ? 'bg-orange-500 text-slate-950 shadow-md font-bold'
                  : 'text-orange-300 hover:bg-slate-800'
              }`}
            >
              <span>🔥 Preheater Calciner</span>
            </button>
          </div>

          <PlantViewer
            selectedEquipmentId={selectedEquipmentId}
            onSelectEquipment={handleSelectEquipment}
            displayMode={displayMode}
            simulationState={simulationState}
            simulationSpeed={simulationSpeed}
            activeDownstreamConfig={activeDownstreamConfig}
            viewPreset={viewPreset}
            showHseMode={showHseMode}
            onSelectHazard={handleSelectHazard}
            isTourActive={isTourActive}
            isDroneModeActive={isDroneModeActive}
            droneFlightMode={droneFlightMode}
            droneVisionMode={droneVisionMode}
            onDroneTelemetry={setDroneTelemetry}
            droneRefInstance={droneControllerRef}
          />

          {/* Drone Pilot Cockpit HUD Overlay when Drone Mode is Active */}
          {isDroneModeActive && (
            <DroneHUD
              telemetry={droneTelemetry}
              onSetFlightMode={setDroneFlightMode}
              onSetVisionMode={setDroneVisionMode}
              onFlyToWaypoint={(idx) => droneControllerRef.current?.flyToWaypoint(idx)}
              onManualInput={(key, val) => {
                if (droneControllerRef.current) {
                  droneControllerRef.current.manualInputs[key] = val;
                }
              }}
              onOpenHazardDetail={(hazardId) => {
                const found = DRONE_PATROL_WAYPOINTS.find((w) => w.hazardId === hazardId);
                if (found) {
                  handleSelectHazard({
                    id: found.hazardId,
                    name: found.hazardName,
                    category: found.hazardCategory as any,
                    riskLevel: found.riskLevel,
                    location: found.stageName,
                    status: 'CONFIRMED_IN_FOOTAGE',
                    whyExists: found.description,
                    consequences: 'Critical deflagration, mechanical damage, or personnel injury.',
                    engineeringControls: ['Continuous automated sensor monitoring', 'Interlocked shutdown failsafe'],
                    administrativeControls: ['OSHA/NFPA standard inspections', 'Daily maintenance audits'],
                    requiredPPE: ['Flame-retardant coveralls', 'P2 dust respirator', 'High-temp gloves'],
                    correctiveActions: ['Install physical containment guards', 'Audit maintenance intervals'],
                  });
                }
              }}
              onCloseDroneMode={() => {
                setIsDroneModeActive(false);
                setViewPreset('orbit');
              }}
            />
          )}

          {/* Process Flow Diagram Overlay (when Process Flow tab is active) */}
          {activeTab === 'process_flow' && (
            <ProcessFlowDiagram
              selectedEquipmentId={selectedEquipmentId}
              onSelectEquipment={handleSelectEquipment}
              onStartTour={() => setIsTourActive(true)}
            />
          )}

          {/* Consolidated Ergonomic Bottom Control Dock */}
          <BottomControlsDock
            simulationState={simulationState}
            onPlay={() => setSimulationState('playing')}
            onPause={() => setSimulationState('paused')}
            onStop={() => setSimulationState('stopped')}
            onRestart={() => setSimulationState('playing')}
            simulationSpeed={simulationSpeed}
            onSetSpeed={setSimulationSpeed}
            viewPreset={viewPreset}
            onSelectViewPreset={setViewPreset}
            displayMode={displayMode}
            onSelectDisplayMode={setDisplayMode}
            showHseMode={showHseMode}
            onToggleHseMode={() => setShowHseMode(!showHseMode)}
          />
        </main>

        {/* Right Info Panel: Selected Equipment Deep Dive */}
        <RightInfoPanel
          equipmentId={selectedEquipmentId}
          onClose={() => setRightPanelCollapsed(true)}
          collapsed={rightPanelCollapsed}
          onToggleCollapse={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          onOpenVideoAtTimestamp={handleOpenVideoAtTimestamp}
          onSelectHazard={handleSelectHazard}
        />
      </div>

      {/* Guided Complete Process Walkthrough Modal */}
      {isTourActive && (
        <ProcessTourModal
          onClose={() => setIsTourActive(false)}
          onStepChange={(eqId) => setSelectedEquipmentId(eqId)}
        />
      )}

      {/* Modular Downstream Stage Configurator */}
      {activeTab === 'downstream_config' && (
        <DownstreamConfigurator
          activeConfigId={activeDownstreamConfig}
          onSelectConfig={(cfg) => {
            setActiveDownstreamConfig(cfg);
            setSelectedEquipmentId('downstream_unconfirmed');
          }}
          onOpenVideoAtTimestamp={handleOpenVideoAtTimestamp}
          customNotes={customPlantNotes}
          onSaveCustomNotes={setCustomPlantNotes}
        />
      )}

      {/* HSE Process Safety & Explosion Risk Modal */}
      {showHseModal && (
        <HSEModal
          onClose={() => {
            setShowHseModal(false);
            setSelectedHazard(null);
            if (activeTab === 'hse_assessment') setActiveTab('overview');
          }}
          selectedHazard={selectedHazard}
          onFocusHazardOn3D={handleFocusHazardOn3D}
        />
      )}

      {/* Actual Plant Video Reference Modal */}
      {showVideoModal && (
        <VideoReferenceModal
          onClose={() => {
            setShowVideoModal(false);
            if (activeTab === 'video_reference') setActiveTab('overview');
          }}
          initialTimestamp={videoTimestamp}
          onSync3DToEquipment={handleSelectEquipment}
          onDeployDroneToHazard={(hazardId) => {
            setShowVideoModal(false);
            setIsDroneModeActive(true);
            setViewPreset('drone_chase');
            droneControllerRef.current?.flyToHazard(hazardId);
          }}
        />
      )}

      {/* Camera & Navigation Controls Help Modal */}
      {showControlsHelp && (
        <ControlsHelpModal onClose={() => setShowControlsHelp(false)} />
      )}
    </div>
  );
}
