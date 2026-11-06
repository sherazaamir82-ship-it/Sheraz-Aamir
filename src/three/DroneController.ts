import * as THREE from 'three';
import { Drone3D } from './droneModel';
import { DroneFlightMode, DroneVisionMode, DroneTelemetry } from '../types/plant';
import { EQUIPMENT_DATABASE } from '../data/plantData';

export interface InspectionWaypoint {
  id: string;
  name: string;
  stageName: string;
  position: [number, number, number];
  lookAt: [number, number, number];
  duration: number; // dwell time in seconds
  hazardId: string;
  hazardName: string;
  hazardCategory: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  temperature: number; // deg C
  dustLevel: number; // mg/m3
}

export const DRONE_PATROL_WAYPOINTS: InspectionWaypoint[] = [
  {
    id: 'wp_yard_offloading',
    name: 'Truck Offloading Bay & Yard',
    stageName: 'Stage 0: Reception Yard',
    position: [-18, 6.0, 7.5],
    lookAt: [-15, 2.5, -3.5],
    duration: 6.5,
    hazardId: 'HAZ-YD-01',
    hazardName: 'Fugitive Dust Cloud & Smoldering Fire Hazard',
    hazardCategory: 'FIRE_EXPLOSION',
    riskLevel: 'HIGH',
    description: 'Scanning Bedford truck side-gate tipping: High organic combustible dust plumes without perimeter water fogging. Unshielded truck exhaust in close proximity to dry husk.',
    temperature: 42,
    dustLevel: 380,
  },
  {
    id: 'wp_loader_ramp',
    name: 'CAT 950B Wheel Loader Approach Ramp',
    stageName: 'Stage 0 to Stage 1 Transition',
    position: [-6.5, 7.0, 6.5],
    lookAt: [-2.5, 4.0, 0],
    duration: 6.0,
    hazardId: 'HAZ-YD-02',
    hazardName: 'Mobile Heavy Plant & Ground Crew Struck-By Zone',
    hazardCategory: 'MECHANICAL',
    riskLevel: 'HIGH',
    description: 'Articulated loader reversing down 18° husk incline. Severe rear blind spots; pedestrian access barriers absent along approach ramp.',
    temperature: 68,
    dustLevel: 210,
  },
  {
    id: 'wp_hopper_grizzly',
    name: 'Primary Feeding Hopper Grizzly & Throat',
    stageName: 'Stage 1: Primary Receiving Hopper',
    position: [0.5, 9.5, 4.8],
    lookAt: [0, 4.2, 0],
    duration: 6.5,
    hazardId: 'HAZ-HP-01',
    hazardName: 'Grizzly Screen Choking & Engulfment Hazard',
    hazardCategory: 'MECHANICAL',
    riskLevel: 'HIGH',
    description: '80x80mm aperture grizzly screen prone to tramp wood and baling wire bridging. High risk of personnel stepping onto intake without harness fall arrest.',
    temperature: 32,
    dustLevel: 190,
  },
  {
    id: 'wp_belt_conveyor',
    name: 'Inclined Belt Conveyor & Tramp Magnet',
    stageName: 'Stage 2: Inclined Belt Conveyor',
    position: [10.5, 8.2, 4.8],
    lookAt: [10.0, 4.6, 0],
    duration: 6.0,
    hazardId: 'HAZ-BC-01',
    hazardName: 'In-Running Belt Nip Points & Tramp Magnet Ejection',
    hazardCategory: 'MECHANICAL',
    riskLevel: 'HIGH',
    description: '35° troughed carrying rollers moving at 1.8 m/s. Emergency pull wire tested; cross-belt magnetic separator actively extracting tramp iron.',
    temperature: 55,
    dustLevel: 85,
  },
  {
    id: 'wp_bucket_elevator_mid',
    name: 'Bucket Elevator Tower Mid-Span (+16m)',
    stageName: 'Stage 3: Vertical Bucket Elevator',
    position: [17.5, 17.5, 6.5],
    lookAt: [21.0, 16.5, 0],
    duration: 6.0,
    hazardId: 'HAZ-BE-01',
    hazardName: 'Confined Dust Deflagration & Backstop Reversal',
    hazardCategory: 'FIRE_EXPLOSION',
    riskLevel: 'CRITICAL',
    description: 'ATEX Zone 20 interior dust atmosphere. Inspecting explosion relief rupture disc panels; zero backspin clutch interlock verified in drive gearbox.',
    temperature: 48,
    dustLevel: 520,
  },
  {
    id: 'wp_apron_feeder',
    name: 'Heavy-Duty Apron Feeder (+26m Platform)',
    stageName: 'Stage 4: Apron Feeder Extraction',
    position: [24.0, 29.5, 5.5],
    lookAt: [25.5, 25.5, 0],
    duration: 6.5,
    hazardId: 'HAZ-AF-01',
    hazardName: 'Head Sprocket Nip Points & Interlocking Pan Shear',
    hazardCategory: 'MECHANICAL',
    riskLevel: 'CRITICAL',
    description: 'Continuous crawler track drive sprockets running at 15 kW. Extreme pinch torque at head shaft; fine husk dribble accumulation on lower pan basin.',
    temperature: 62,
    dustLevel: 140,
  },
  {
    id: 'wp_preheater_conveyor',
    name: 'High Gallery Preheater Feeding Conveyor',
    stageName: 'Stage 5: High Gallery Conveyor',
    position: [34.5, 29.0, 6.2],
    lookAt: [34.0, 24.5, 0],
    duration: 6.0,
    hazardId: 'HAZ-BC-02',
    hazardName: 'High Elevation Fall Hazard (+28m) & Wind Dispersion',
    hazardCategory: 'ENVIRONMENTAL_HEIGHT',
    riskLevel: 'HIGH',
    description: 'High crosswinds across elevated gallery. Corrugated dust hood clamps verified; perimeter kick plates and emergency lanyard wire inspected.',
    temperature: 38,
    dustLevel: 95,
  },
  {
    id: 'wp_preheater_calciner',
    name: 'Preheater Calciner 900°C Injection Duct',
    stageName: 'Stage 6: Precalciner Firing Chamber',
    position: [46.0, 27.5, 6.5],
    lookAt: [42.5, 23.5, 0],
    duration: 7.5,
    hazardId: 'HAZ-PH-01',
    hazardName: 'Kiln Flame Flashback & 900°C Superheated Gas Blowback',
    hazardCategory: 'FIRE_EXPLOSION',
    riskLevel: 'CRITICAL',
    description: 'Active biomass combustion chamber at 900°C. Rotary airlock seal and failsafe pneumatic knife gate monitored for thermal backdraft containment.',
    temperature: 890,
    dustLevel: 45,
  },
];

export class DroneController {
  private drone: Drone3D;
  public flightMode: DroneFlightMode = 'patrol';
  public visionMode: DroneVisionMode = 'rgb';

  // Autonomous Patrol State
  private currentWaypointIndex: number = 0;
  private waypointTimer: number = 0;
  private isTransitioning: boolean = false;
  private transitionProgress: number = 0;
  private startPos: THREE.Vector3 = new THREE.Vector3();
  private endPos: THREE.Vector3 = new THREE.Vector3();
  private startLook: THREE.Vector3 = new THREE.Vector3();
  private endLook: THREE.Vector3 = new THREE.Vector3();

  // Manual Flight Physics
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private targetPosition: THREE.Vector3 = new THREE.Vector3(-10, 12, 12);
  private currentLookAt: THREE.Vector3 = new THREE.Vector3(0, 5, 0);

  // Manual Input State
  public manualInputs = {
    forward: 0, // -1 to 1 (W/S)
    strafe: 0,  // -1 to 1 (A/D)
    elevate: 0, // -1 to 1 (E/Q or Space/Shift)
    yaw: 0,     // -1 to 1 (ArrowLeft/ArrowRight)
  };

  // Telemetry
  public battery: number = 96.0;
  private elapsedTime: number = 0;
  private onTelemetryCallback?: (telemetry: DroneTelemetry) => void;

  constructor(drone: Drone3D, onTelemetry?: (telemetry: DroneTelemetry) => void) {
    this.drone = drone;
    this.onTelemetryCallback = onTelemetry;

    // Initialize at first waypoint
    const wp0 = DRONE_PATROL_WAYPOINTS[0];
    this.drone.group.position.set(wp0.position[0], wp0.position[1], wp0.position[2]);
    this.targetPosition.copy(this.drone.group.position);
    this.currentLookAt.set(wp0.lookAt[0], wp0.lookAt[1], wp0.lookAt[2]);
    this.drone.group.lookAt(this.currentLookAt);
  }

  public setFlightMode(mode: DroneFlightMode) {
    this.flightMode = mode;
    if (mode === 'patrol') {
      this.isTransitioning = false;
      this.waypointTimer = 0;
    }
  }

  public setVisionMode(mode: DroneVisionMode) {
    this.visionMode = mode;

    // Adjust searchlight and beam color depending on vision mode
    if (mode === 'thermal') {
      // Amber/Red FLIR thermal scanning beam
      this.drone.searchlight.color.set('#f97316');
      (this.drone.beamMesh.material as THREE.MeshBasicMaterial).color.set('#f97316');
      this.drone.searchlight.intensity = 5.5;
    } else if (mode === 'night_vision') {
      // Emerald Green LiDAR / Night illumination
      this.drone.searchlight.color.set('#10b981');
      (this.drone.beamMesh.material as THREE.MeshBasicMaterial).color.set('#10b981');
      this.drone.searchlight.intensity = 6.0;
    } else {
      // Cool Cyan/White High-Intensity Inspection Beam
      this.drone.searchlight.color.set('#38bdf8');
      (this.drone.beamMesh.material as THREE.MeshBasicMaterial).color.set('#38bdf8');
      this.drone.searchlight.intensity = 4.5;
    }
  }

  public flyToWaypoint(index: number) {
    if (index >= 0 && index < DRONE_PATROL_WAYPOINTS.length) {
      this.currentWaypointIndex = index;
      const wp = DRONE_PATROL_WAYPOINTS[index];

      this.startPos.copy(this.drone.group.position);
      this.endPos.set(wp.position[0], wp.position[1], wp.position[2]);
      this.startLook.copy(this.currentLookAt);
      this.endLook.set(wp.lookAt[0], wp.lookAt[1], wp.lookAt[2]);

      this.isTransitioning = true;
      this.transitionProgress = 0;
      this.waypointTimer = 0;
    }
  }

  public flyToHazard(hazardId: string) {
    const wpIdx = DRONE_PATROL_WAYPOINTS.findIndex((w) => w.hazardId === hazardId);
    if (wpIdx !== -1) {
      this.flyToWaypoint(wpIdx);
    }
  }

  public update(delta: number) {
    this.elapsedTime += delta;

    // 1. Animate Propellers Spin (Rapid Enterprise UAV RPM)
    const propSpeed = delta * 52.0;
    this.drone.propellers.forEach((prop, i) => {
      // Counter-rotating pairs
      prop.rotation.y += i % 2 === 0 ? propSpeed : -propSpeed;
    });

    // 2. Animate Navigation Strobe Flash (every 1.0s)
    const strobePhase = this.elapsedTime % 1.0;
    this.drone.strobeLight.intensity = strobePhase < 0.12 ? 3.5 : 0.2;

    // 3. Gentle Drone Hover Wobble (Realistic aerodynamic oscillation)
    const hoverWobbleY = Math.sin(this.elapsedTime * 3.2) * 0.04;
    const hoverWobbleRoll = Math.sin(this.elapsedTime * 2.1) * 0.015;
    const hoverWobblePitch = Math.cos(this.elapsedTime * 2.7) * 0.015;

    // 4. Update Battery Discharge (~1% every 25 seconds of flight)
    this.battery = Math.max(12.0, this.battery - delta * 0.035);

    // 5. Flight Mode Logic
    let currentLockedHazard: InspectionWaypoint | null = null;

    if (this.flightMode === 'patrol') {
      const currentWp = DRONE_PATROL_WAYPOINTS[this.currentWaypointIndex];
      currentLockedHazard = currentWp;

      if (this.isTransitioning) {
        // Smooth transit between inspection waypoints (takes ~3.5s)
        this.transitionProgress += delta * 0.32;
        const t = Math.min(1.0, this.transitionProgress);
        // Smooth cosine ease-in-out
        const ease = 0.5 - 0.5 * Math.cos(t * Math.PI);

        // Interpolate position with an arched flight arc
        this.drone.group.position.lerpVectors(this.startPos, this.endPos, ease);
        this.drone.group.position.y += Math.sin(ease * Math.PI) * 1.8; // Climb slightly during transit

        this.currentLookAt.lerpVectors(this.startLook, this.endLook, ease);
        this.drone.group.lookAt(this.currentLookAt);

        // Banking tilt when moving
        this.drone.group.rotation.z = Math.sin(t * Math.PI) * 0.08;
        this.drone.group.rotation.x += hoverWobblePitch;

        if (t >= 1.0) {
          this.isTransitioning = false;
          this.waypointTimer = 0;
        }
      } else {
        // Dwell at current waypoint while scanning hazard
        this.waypointTimer += delta;

        // Keep drone hovered at exact waypoint position with micro-wobble
        const target = new THREE.Vector3(currentWp.position[0], currentWp.position[1] + hoverWobbleY, currentWp.position[2]);
        this.drone.group.position.lerp(target, 0.08);

        // Lock camera gimbal and searchlight directly at the target hazard
        const lookTarget = new THREE.Vector3(currentWp.lookAt[0], currentWp.lookAt[1], currentWp.lookAt[2]);
        this.currentLookAt.lerp(lookTarget, 0.1);
        this.drone.group.lookAt(this.currentLookAt);
        this.drone.group.rotation.z = hoverWobbleRoll;

        // Auto advance to next waypoint after duration
        if (this.waypointTimer >= currentWp.duration) {
          const nextIndex = (this.currentWaypointIndex + 1) % DRONE_PATROL_WAYPOINTS.length;
          this.flyToWaypoint(nextIndex);
        }
      }
    } else if (this.flightMode === 'manual') {
      // Manual Drone Flight Physics with Inertia & Damping
      const moveSpeed = 8.5; // m/s
      const rotSpeed = 1.8;

      // Calculate forward and right vectors relative to current heading
      const forward = new THREE.Vector3();
      this.drone.group.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      // Velocity acceleration
      const accel = new THREE.Vector3();
      accel.addScaledVector(forward, this.manualInputs.forward * moveSpeed);
      accel.addScaledVector(right, this.manualInputs.strafe * moveSpeed);
      accel.y = this.manualInputs.elevate * (moveSpeed * 0.7);

      this.velocity.lerp(accel, delta * 4.0);

      // Apply velocity
      this.drone.group.position.addScaledVector(this.velocity, delta);

      // Prevent going through ground slab
      if (this.drone.group.position.y < 1.2) {
        this.drone.group.position.y = 1.2;
        this.velocity.y = 0;
      }

      // Yaw rotation
      this.drone.group.rotation.y -= this.manualInputs.yaw * rotSpeed * delta;

      // Realistic Pitch & Roll Banking
      const targetPitch = this.manualInputs.forward * 0.22;
      const targetRoll = -this.manualInputs.strafe * 0.22;
      this.drone.group.rotation.x = THREE.MathUtils.lerp(this.drone.group.rotation.x, targetPitch + hoverWobblePitch, delta * 6.0);
      this.drone.group.rotation.z = THREE.MathUtils.lerp(this.drone.group.rotation.z, targetRoll + hoverWobbleRoll, delta * 6.0);

      // Find nearest hazard within 12 meters
      let nearestDist = 14.0;
      DRONE_PATROL_WAYPOINTS.forEach((wp) => {
        const d = this.drone.group.position.distanceTo(new THREE.Vector3(...wp.lookAt));
        if (d < nearestDist) {
          nearestDist = d;
          currentLockedHazard = wp;
        }
      });
    }

    // 6. Aim Gimbal Camera and Searchlight
    this.drone.searchlightTarget.position.set(0, -5, 12);

    // 7. Fire Telemetry Callback
    if (this.onTelemetryCallback) {
      const pos = this.drone.group.position;
      const spd = this.velocity.length();
      const headingDeg = Math.round(((this.drone.group.rotation.y * 180) / Math.PI + 360) % 360);

      this.onTelemetryCallback({
        altitude: parseFloat(pos.y.toFixed(1)),
        speed: parseFloat((this.flightMode === 'patrol' && this.isTransitioning ? 5.4 : spd).toFixed(1)),
        battery: Math.round(this.battery),
        heading: headingDeg,
        pitch: parseFloat((this.drone.group.rotation.x * 57.3).toFixed(1)),
        roll: parseFloat((this.drone.group.rotation.z * 57.3).toFixed(1)),
        flightMode: this.flightMode,
        visionMode: this.visionMode,
        lockedHazardId: currentLockedHazard ? (currentLockedHazard as InspectionWaypoint).hazardId : null,
        targetName: currentLockedHazard ? (currentLockedHazard as InspectionWaypoint).name : null,
        temperatureReading: currentLockedHazard ? (currentLockedHazard as InspectionWaypoint).temperature : 34,
        dustReading: currentLockedHazard ? (currentLockedHazard as InspectionWaypoint).dustLevel : 50,
      });
    }
  }

  public getDronePosition(): THREE.Vector3 {
    return this.drone.group.position;
  }

  public getDroneForward(): THREE.Vector3 {
    const f = new THREE.Vector3();
    this.drone.group.getWorldDirection(f);
    return f;
  }
}
