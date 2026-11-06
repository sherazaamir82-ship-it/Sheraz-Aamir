import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildMaterialLibrary, MaterialLibrary, isSoftwareGl } from './materials';
import {
  buildYardStockpile,
  buildFeedingHopper,
  buildBeltConveyor,
  buildBucketElevator,
  buildDownstreamModularStage,
  buildCementPlantBackground,
  buildApronFeeder,
  buildPreheaterConveyor,
  buildPreheaterCalcinerInterface,
} from './proceduralModels';
import { buildInspectionDrone } from './droneModel';
import { DroneController } from './DroneController';
import { SimulationManager, SimState } from './SimulationManager';
import {
  EquipmentId,
  ViewPreset,
  DisplayMode,
  HazardItem,
  DroneFlightMode,
  DroneVisionMode,
  DroneTelemetry,
} from '../types/plant';
import { EQUIPMENT_DATABASE } from '../data/plantData';

interface PlantViewerProps {
  selectedEquipmentId: EquipmentId;
  onSelectEquipment: (id: EquipmentId) => void;
  displayMode: DisplayMode;
  simulationState: SimState;
  simulationSpeed: number;
  activeDownstreamConfig: string;
  viewPreset: ViewPreset;
  showHseMode: boolean;
  onSelectHazard?: (hazard: HazardItem) => void;
  isTourActive?: boolean;
  isDroneModeActive?: boolean;
  droneFlightMode?: DroneFlightMode;
  droneVisionMode?: DroneVisionMode;
  onDroneTelemetry?: (telemetry: DroneTelemetry) => void;
  droneRefInstance?: React.MutableRefObject<DroneController | null>;
}

export const PlantViewer: React.FC<PlantViewerProps> = ({
  selectedEquipmentId,
  onSelectEquipment,
  displayMode,
  simulationState,
  simulationSpeed,
  activeDownstreamConfig,
  viewPreset,
  showHseMode,
  onSelectHazard,
  isTourActive,
  isDroneModeActive = false,
  droneFlightMode = 'patrol',
  droneVisionMode = 'rgb',
  onDroneTelemetry,
  droneRefInstance,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const simManagerRef = useRef<SimulationManager | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Modular mesh references
  const hoodsRef = useRef<THREE.Group[]>([]);
  const preheaterHoodsRef = useRef<THREE.Group[]>([]);
  const elevatorCasingsRef = useRef<THREE.Group[]>([]);
  const downstreamGroupRef = useRef<THREE.Group | null>(null);
  const matsRef = useRef<MaterialLibrary | null>(null);
  const hseMarkersRef = useRef<THREE.Group[]>([]);
  const droneControllerRef = useRef<DroneController | null>(null);

  // Smooth camera target interpolation (Framed to show Offloading, Loader, and Hopper in foreground)
  const targetCamPos = useRef(new THREE.Vector3(-14, 15, 26));
  const targetCamLook = useRef(new THREE.Vector3(2, 5, 0));
  const isInterpolatingCam = useRef(false);

  // Hover detection state
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 1. Initialize Scene & Three.js Canvas
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#101726'); // Dark industrial atmosphere
    scene.fog = new THREE.FogExp2('#101726', 0.008);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(-14, 15, 26);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Room Environment for metallic reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
    controls.minDistance = 3.0;
    controls.maxDistance = 140.0;
    controls.target.set(2, 5, 0);
    controlsRef.current = controls;

    // Lighting Rig
    // Key Light (Warm sunlight)
    const keyLight = new THREE.DirectionalLight('#fff1e6', 2.0);
    keyLight.position.set(24, 40, 20);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 120;
      const d = 35;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // Fill Light (Cool sky bounce)
    const hemiLight = new THREE.HemisphereLight('#64748b', '#1e293b', 1.2);
    hemiLight.position.set(0, 30, 0);
    scene.add(hemiLight);

    // Subtle Rim Light
    const rimLight = new THREE.DirectionalLight('#38bdf8', 0.8);
    rimLight.position.set(-20, 15, -20);
    scene.add(rimLight);

    // Materials Library
    const mats = buildMaterialLibrary();
    matsRef.current = mats;

    // Build Procedural Plant Hierarchy
    const yardData = buildYardStockpile(mats);
    scene.add(yardData.group);

    const hopperGroup = buildFeedingHopper(mats);
    scene.add(hopperGroup);

    const conveyorData = buildBeltConveyor(mats);
    scene.add(conveyorData.group);
    hoodsRef.current = conveyorData.hoods;

    const elevatorData = buildBucketElevator(mats);
    scene.add(elevatorData.group);
    elevatorCasingsRef.current = elevatorData.casingCovers;

    // Confirmed Downstream Stages: Apron Feeder (411-AF01) -> Preheater Conveyor (411-BC02) -> Calciner (411-PH01)
    const apronData = buildApronFeeder(mats);
    scene.add(apronData.group);

    const preheaterConveyorData = buildPreheaterConveyor(mats);
    scene.add(preheaterConveyorData.group);
    preheaterHoodsRef.current = preheaterConveyorData.hoods;

    const calcinerData = buildPreheaterCalcinerInterface(mats);
    scene.add(calcinerData.group);

    const plantBg = buildCementPlantBackground(mats);
    scene.add(plantBg);

    // Simulation Engine with Articulated Loader, Cascades, Apron Feeder & Fireball Calciner
    const simManager = new SimulationManager(
      mats,
      conveyorData.beltMesh,
      conveyorData.drivePulley,
      conveyorData.tailPulley,
      elevatorData.buckets,
      yardData.loader,
      yardData.truckCascade,
      apronData.pans,
      preheaterConveyorData.beltMesh,
      calcinerData.flameLight
    );
    scene.add(simManager.getGroup());
    simManagerRef.current = simManager;

    // Create 3D HSE Hazard Warning Pins
    const hseGroup = new THREE.Group();
    hseGroup.name = 'hse_hazard_pins';
    const allHazards: HazardItem[] = [];
    Object.values(EQUIPMENT_DATABASE).forEach((spec) => {
      spec.hazards.forEach((h) => allHazards.push(h));
    });

    allHazards.forEach((h) => {
      if (h.position3D) {
        const pin = new THREE.Group();
        pin.position.set(h.position3D[0], h.position3D[1], h.position3D[2]);
        pin.userData = { isHazardPin: true, hazardData: h };

        // Core glowing red/amber sphere
        const pinMat = new THREE.MeshStandardMaterial({
          color: h.riskLevel === 'CRITICAL' ? '#ef4444' : '#f59e0b',
          emissive: h.riskLevel === 'CRITICAL' ? '#dc2626' : '#d97706',
          emissiveIntensity: 0.9,
          roughness: 0.2,
        });
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), pinMat);
        pin.add(sphere);

        // Surrounding radar ring
        const ringMat = new THREE.MeshBasicMaterial({
          color: h.riskLevel === 'CRITICAL' ? '#f87171' : '#fbbf24',
          wireframe: true,
          transparent: true,
          opacity: 0.7,
        });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 8, 24), ringMat);
        ring.rotation.x = Math.PI / 2;
        pin.add(ring);

        // Ground anchor post
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.8),
          new THREE.MeshBasicMaterial({ color: '#ffffff' })
        );
        post.position.y = -0.4;
        pin.add(post);

        hseGroup.add(pin);
        hseMarkersRef.current.push(pin);
      }
    });
    scene.add(hseGroup);

    // Enterprise Industrial Inspection Drone (UAV-01)
    const droneData = buildInspectionDrone(mats);
    scene.add(droneData.group);

    const droneController = new DroneController(droneData, (t) => {
      if (onDroneTelemetry) onDroneTelemetry(t);
    });
    droneControllerRef.current = droneController;
    if (droneRefInstance) droneRefInstance.current = droneController;

    // Animation Loop
    const clock = new THREE.Clock();
    let frameId = 0;

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);

      // Advance material and mechanical simulation
      if (simManagerRef.current) {
        simManagerRef.current.update(delta);
      }

      // Advance Drone Flight Controller & Sensor Gimbal
      if (droneControllerRef.current) {
        droneControllerRef.current.update(delta);

        // If Drone Mode is active, attach camera to drone (chase or FPV view)
        if (isDroneModeActive && cameraRef.current && controlsRef.current) {
          const dronePos = droneControllerRef.current.getDronePosition();
          const droneFwd = droneControllerRef.current.getDroneForward();

          if (viewPreset === 'drone_fpv') {
            cameraRef.current.position.set(
              dronePos.x + droneFwd.x * 0.35,
              dronePos.y - 0.04,
              dronePos.z + droneFwd.z * 0.35
            );
            controlsRef.current.target.set(
              dronePos.x + droneFwd.x * 14,
              dronePos.y - 3,
              dronePos.z + droneFwd.z * 14
            );
          } else {
            // Chase camera: smooth follow 4.8m behind and 2.4m above the drone
            const chasePos = new THREE.Vector3(
              dronePos.x - droneFwd.x * 4.8,
              dronePos.y + 2.4,
              dronePos.z - droneFwd.z * 4.8
            );
            cameraRef.current.position.lerp(chasePos, 0.08);
            controlsRef.current.target.lerp(dronePos, 0.1);
          }
        }
      }

      // Smooth camera interpolation for standard views (when not in drone mode)
      if (!isDroneModeActive && isInterpolatingCam.current && cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.075);
        controlsRef.current.target.lerp(targetCamLook.current, 0.075);

        if (
          cameraRef.current.position.distanceTo(targetCamPos.current) < 0.15 &&
          controlsRef.current.target.distanceTo(targetCamLook.current) < 0.15
        ) {
          isInterpolatingCam.current = false;
        }
      }

      // Animate HSE Warning Pins (pulsing and rotating radar rings)
      hseMarkersRef.current.forEach((marker, idx) => {
        marker.rotation.y += delta * 1.5;
        const sphere = marker.children[0];
        if (sphere) {
          const s = 1.0 + Math.sin(clock.getElapsedTime() * 3.5 + idx) * 0.12;
          sphere.scale.set(s, s, s);
        }
      });

      controls.update();
      renderer.render(scene, camera);

      frameId = requestAnimationFrame(tick);
    };

    tick();

    // Handle Window Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Keyboard WASD Controls for free camera movement
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cameraRef.current || !controlsRef.current) return;
      // Do not trigger if typing in an input field
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const cam = cameraRef.current;
      const ctrl = controlsRef.current;
      const moveSpeed = 1.2;

      const forward = new THREE.Vector3();
      cam.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          cam.position.addScaledVector(forward, moveSpeed);
          ctrl.target.addScaledVector(forward, moveSpeed);
          break;
        case 's':
        case 'arrowdown':
          cam.position.addScaledVector(forward, -moveSpeed);
          ctrl.target.addScaledVector(forward, -moveSpeed);
          break;
        case 'a':
        case 'arrowleft':
          cam.position.addScaledVector(right, -moveSpeed);
          ctrl.target.addScaledVector(right, -moveSpeed);
          break;
        case 'd':
        case 'arrowright':
          cam.position.addScaledVector(right, moveSpeed);
          ctrl.target.addScaledVector(right, moveSpeed);
          break;
        case 'e':
          cam.position.y += moveSpeed;
          ctrl.target.y += moveSpeed;
          break;
        case 'q':
          if (cam.position.y > 1.0) {
            cam.position.y -= moveSpeed;
            ctrl.target.y = Math.max(0.5, ctrl.target.y - moveSpeed);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      renderer.dispose();
    };
  }, []);

  // 2. Handle Simulation State & Speed Updates
  useEffect(() => {
    if (!simManagerRef.current) return;
    if (simulationState === 'playing') simManagerRef.current.play();
    else if (simulationState === 'paused') simManagerRef.current.pause();
    else if (simulationState === 'stopped') simManagerRef.current.stop();
  }, [simulationState]);

  useEffect(() => {
    if (simManagerRef.current) {
      simManagerRef.current.setSpeed(simulationSpeed);
    }
  }, [simulationSpeed]);

  // 3. Handle Cutaway / Transparent / Solid display mode toggles
  useEffect(() => {
    if (!matsRef.current) return;

    if (displayMode === 'solid') {
      // Restore solid corrugated hood covers and solid elevator casing
      hoodsRef.current.forEach((hood) => {
        hood.visible = true;
        hood.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = matsRef.current!.corrugatedSteel;
          }
        });
      });
      preheaterHoodsRef.current.forEach((hood) => {
        hood.visible = true;
        hood.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = matsRef.current!.corrugatedSteel;
          }
        });
      });
      elevatorCasingsRef.current.forEach((sec) => {
        sec.visible = true;
        sec.traverse((child) => {
          if (child instanceof THREE.Mesh && !child.userData.isHazardPin) {
            child.material = matsRef.current!.paintedSteelSlate;
          }
        });
      });
    } else if (displayMode === 'cutaway') {
      // Make conveyor hoods transparent/acrylic and elevator casings transparent
      hoodsRef.current.forEach((hood) => {
        hood.visible = true;
        hood.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = matsRef.current!.cutawayGlass;
          }
        });
      });
      preheaterHoodsRef.current.forEach((hood) => {
        hood.visible = true;
        hood.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = matsRef.current!.cutawayGlass;
          }
        });
      });
      elevatorCasingsRef.current.forEach((sec) => {
        sec.visible = true;
        sec.traverse((child) => {
          if (child instanceof THREE.Mesh && !child.userData.isHazardPin) {
            child.material = matsRef.current!.cutawayGlass;
          }
        });
      });
    } else if (displayMode === 'transparent') {
      // X-Ray wireframe ghosted mode
      hoodsRef.current.forEach((hood) => {
        hood.visible = true;
        hood.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = matsRef.current!.cutawayGhosted;
          }
        });
      });
      preheaterHoodsRef.current.forEach((hood) => {
        hood.visible = true;
        hood.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = matsRef.current!.cutawayGhosted;
          }
        });
      });
      elevatorCasingsRef.current.forEach((sec) => {
        sec.visible = true;
        sec.traverse((child) => {
          if (child instanceof THREE.Mesh && !child.userData.isHazardPin) {
            child.material = matsRef.current!.cutawayGhosted;
          }
        });
      });
    }
  }, [displayMode]);

  // 4. Update Modular Downstream Stage dynamically when user switches options
  useEffect(() => {
    if (!sceneRef.current || !matsRef.current) return;
    if (downstreamGroupRef.current) {
      sceneRef.current.remove(downstreamGroupRef.current);
    }
    const newStage = buildDownstreamModularStage(matsRef.current, activeDownstreamConfig);
    sceneRef.current.add(newStage);
    downstreamGroupRef.current = newStage;
  }, [activeDownstreamConfig]);

  // 5. Toggle HSE Markers visibility based on HSE mode
  useEffect(() => {
    hseMarkersRef.current.forEach((m) => {
      m.visible = showHseMode;
    });
  }, [showHseMode]);

  // 5b. Sync Drone Flight Mode & Vision Mode
  useEffect(() => {
    if (droneControllerRef.current) {
      droneControllerRef.current.setFlightMode(droneFlightMode);
    }
  }, [droneFlightMode]);

  useEffect(() => {
    if (droneControllerRef.current) {
      droneControllerRef.current.setVisionMode(droneVisionMode);
    }
  }, [droneVisionMode]);

  // 6. Camera Presets Handling
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;

    isInterpolatingCam.current = true;

    switch (viewPreset) {
      case 'top':
        targetCamPos.current.set(12, 45, 0.1);
        targetCamLook.current.set(12, 5, 0);
        break;
      case 'front':
        targetCamPos.current.set(12, 10, 36);
        targetCamLook.current.set(12, 8, 0);
        break;
      case 'side':
        targetCamPos.current.set(-24, 12, 0);
        targetCamLook.current.set(12, 8, 0);
        break;
      case 'isometric':
        targetCamPos.current.set(34, 28, 34);
        targetCamLook.current.set(12, 8, 0);
        break;
      case 'hopper':
        // Perfect angle watching the wheel loader climb the ramp and dump into the open hopper grizzly
        targetCamPos.current.set(-10, 8.5, 9.5);
        targetCamLook.current.set(-1.5, 5.0, 0);
        break;
      case 'offloading':
        // Direct view of the Bedford truck offloading rice husk into storage bay
        targetCamPos.current.set(-22, 6.5, 8);
        targetCamLook.current.set(-15, 2.5, -4);
        break;
      case 'conveyor':
        targetCamPos.current.set(18, 10, 14);
        targetCamLook.current.set(10, 4, 0);
        break;
      case 'elevator':
        targetCamPos.current.set(21, 20, 26);
        targetCamLook.current.set(21, 15, 0);
        break;
      case 'apron_feeder':
        targetCamPos.current.set(31, 29, 8);
        targetCamLook.current.set(25.5, 25.5, 0);
        break;
      case 'preheater_conveyor':
        targetCamPos.current.set(38, 29, 12);
        targetCamLook.current.set(34, 24.5, 0);
        break;
      case 'preheater':
        targetCamPos.current.set(48, 28, 8);
        targetCamLook.current.set(42.5, 23.5, 0);
        break;
      case 'downstream':
        targetCamPos.current.set(36, 30, 16);
        targetCamLook.current.set(26, 25, 0);
        break;
      case 'orbit':
      default:
        targetCamPos.current.set(-14, 15, 26);
        targetCamLook.current.set(2, 5, 0);
        break;
    }
  }, [viewPreset]);

  // 7. Focus Camera when user selects equipment
  useEffect(() => {
    const spec = EQUIPMENT_DATABASE[selectedEquipmentId];
    if (spec && !isTourActive) {
      targetCamPos.current.set(spec.cameraPosition[0], spec.cameraPosition[1], spec.cameraPosition[2]);
      targetCamLook.current.set(spec.cameraTarget[0], spec.cameraTarget[1], spec.cameraTarget[2]);
      isInterpolatingCam.current = true;
    }
  }, [selectedEquipmentId, isTourActive]);

  // 8. Raycasting for Mouse Click & Hover
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    setMouseCoord({ x: e.clientX, y: e.clientY });

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

    if (intersects.length > 0) {
      let curr: THREE.Object3D | null = intersects[0].object;
      let matchedName: string | null = null;

      while (curr && curr !== sceneRef.current) {
        if (curr.userData?.isHazardPin) {
          matchedName = `⚠️ Hazard: ${curr.userData.hazardData.name}`;
          break;
        }
        if (curr.name && EQUIPMENT_DATABASE[curr.name]) {
          matchedName = EQUIPMENT_DATABASE[curr.name].name;
          break;
        }
        curr = curr.parent;
      }

      setHoveredName(matchedName);
    } else {
      setHoveredName(null);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

    if (intersects.length > 0) {
      let curr: THREE.Object3D | null = intersects[0].object;
      while (curr && curr !== sceneRef.current) {
        // If clicking an HSE pin
        if (curr.userData?.isHazardPin && onSelectHazard) {
          onSelectHazard(curr.userData.hazardData);
          return;
        }
        // If clicking an equipment group
        if (curr.name && EQUIPMENT_DATABASE[curr.name]) {
          onSelectEquipment(curr.name as EquipmentId);
          return;
        }
        curr = curr.parent;
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      targetCamLook.current.copy(hitPoint);
      targetCamPos.current.copy(hitPoint).add(new THREE.Vector3(6, 4, 8));
      isInterpolatingCam.current = true;
    }
  };

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden"
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Dynamic 3D Equipment / Hazard Hover Badge */}
      {hoveredName && (
        <div
          className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-lg bg-slate-900/90 text-cyan-400 text-xs font-semibold tracking-wide border border-cyan-500/40 shadow-xl backdrop-blur-sm -translate-x-1/2 -translate-y-12"
          style={{ left: mouseCoord.x, top: mouseCoord.y }}
        >
          {hoveredName}
        </div>
      )}
    </div>
  );
};
