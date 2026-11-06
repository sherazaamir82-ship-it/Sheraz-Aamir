import * as THREE from 'three';
import { MaterialLibrary } from './materials';
import { createCalloutBadge } from './proceduralModels';

export interface Drone3D {
  group: THREE.Group;
  propellers: THREE.Mesh[];
  gimbalCamera: THREE.Group;
  searchlight: THREE.SpotLight;
  searchlightTarget: THREE.Object3D;
  beamMesh: THREE.Mesh;
  navLightLeft: THREE.PointLight;
  navLightRight: THREE.PointLight;
  strobeLight: THREE.PointLight;
}

export function buildInspectionDrone(mats: MaterialLibrary): Drone3D {
  const group = new THREE.Group();
  group.name = 'inspection_drone_uav';

  // Drone is roughly 1.1m tip-to-tip (industrial enterprise inspection class)
  const carbonMat = new THREE.MeshStandardMaterial({
    color: '#1a1d24',
    metalness: 0.85,
    roughness: 0.25,
  });

  const hiVisYellow = mats.safetyYellow;
  const chromeMat = mats.industrialSteel;

  // 1. Central Aerodynamic Fuselage Pod
  const bodyGroup = new THREE.Group();

  // Main upper canopy
  const mainBodyGeom = new THREE.BoxGeometry(0.55, 0.22, 0.32);
  const mainBody = new THREE.Mesh(mainBodyGeom, carbonMat);
  mainBody.castShadow = true;
  bodyGroup.add(mainBody);

  // High-vis yellow accent shell on top
  const topShell = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 0.26), hiVisYellow);
  topShell.position.set(0, 0.12, 0);
  bodyGroup.add(topShell);

  // Dual RTK GNSS Antenna Masts on rear
  const rtkL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 12), chromeMat);
  rtkL.position.set(-0.18, 0.16, -0.1);
  bodyGroup.add(rtkL);
  const rtkCapL = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16), hiVisYellow);
  rtkCapL.position.set(-0.18, 0.25, -0.1);
  bodyGroup.add(rtkCapL);

  const rtkR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 12), chromeMat);
  rtkR.position.set(-0.18, 0.16, 0.1);
  bodyGroup.add(rtkR);
  const rtkCapR = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16), hiVisYellow);
  rtkCapR.position.set(-0.18, 0.25, 0.1);
  bodyGroup.add(rtkCapR);

  // Forward FPV Pilot Camera on nose
  const fpvCam = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 12), chromeMat);
  fpvCam.rotation.z = Math.PI / 2;
  fpvCam.position.set(0.28, 0.04, 0);
  bodyGroup.add(fpvCam);

  // Battery pack on belly
  const battery = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.22), mats.paintedSteelSlate);
  battery.position.set(-0.04, -0.12, 0);
  bodyGroup.add(battery);

  // Cooling vents on sides
  for (let z of [-0.17, 0.17]) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.02), mats.hazardStripes);
    vent.position.set(0, 0.02, z);
    bodyGroup.add(vent);
  }

  group.add(bodyGroup);

  // 2. Four Rotor Booms (Arms) in X-shape
  const armPositions = [
    { x: 0.38, z: 0.38, angle: Math.PI / 4 },    // Front-Right
    { x: 0.38, z: -0.38, angle: -Math.PI / 4 },  // Front-Left
    { x: -0.38, z: 0.38, angle: (3 * Math.PI) / 4 },  // Rear-Right
    { x: -0.38, z: -0.38, angle: -(3 * Math.PI) / 4 }, // Rear-Left
  ];

  const propellers: THREE.Mesh[] = [];

  armPositions.forEach((arm, idx) => {
    // Carbon tube arm
    const armLen = 0.48;
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, armLen, 12), carbonMat);
    boom.rotation.y = -arm.angle;
    boom.rotation.z = Math.PI / 2;
    boom.position.set(arm.x * 0.55, 0.02, arm.z * 0.55);
    boom.castShadow = true;
    group.add(boom);

    // Motor Pod Housing
    const motorPod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.042, 0.1, 16), mats.paintedSteelSlate);
    motorPod.position.set(arm.x, 0.04, arm.z);
    motorPod.castShadow = true;
    group.add(motorPod);

    // Motor cap with safety yellow ring
    const mCap = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 12), hiVisYellow);
    mCap.position.set(arm.x, 0.095, arm.z);
    group.add(mCap);

    // Carbon-fiber dual-blade propeller
    const propGeom = new THREE.BoxGeometry(0.46, 0.008, 0.035);
    const propMat = new THREE.MeshStandardMaterial({
      color: '#111827',
      metalness: 0.5,
      roughness: 0.3,
    });
    const prop = new THREE.Mesh(propGeom, propMat);
    prop.position.set(arm.x, 0.11, arm.z);
    prop.castShadow = true;
    group.add(prop);
    propellers.push(prop);

    // Landing gear leg strut under motor
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.008, 0.28, 8), carbonMat);
    leg.position.set(arm.x * 0.9, -0.12, arm.z * 0.9);
    leg.rotation.z = arm.x > 0 ? 0.15 : -0.15;
    group.add(leg);

    // Landing foot pad
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.015, 12), hiVisYellow);
    pad.position.set(arm.x * 0.9, -0.26, arm.z * 0.9);
    group.add(pad);
  });

  // 3. 3-Axis Stabilized Inspection Gimbal & EO/IR Dual Sensor Camera
  const gimbalGroup = new THREE.Group();
  gimbalGroup.position.set(0.12, -0.16, 0);

  // Gimbal yaw bracket
  const yawBracket = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 16), chromeMat);
  gimbalGroup.add(yawBracket);

  // Pitch ring
  const pitchRing = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.012, 8, 16), carbonMat);
  pitchRing.rotation.y = Math.PI / 2;
  pitchRing.position.y = -0.04;
  gimbalGroup.add(pitchRing);

  // Camera Payload Body
  const cameraBody = new THREE.Group();
  cameraBody.position.y = -0.04;

  const camBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.1), mats.paintedSteelSlate);
  cameraBody.add(camBox);

  // RGB Optical 4K Zoom Lens (Main eye)
  const zoomLens = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.06, 20), chromeMat);
  zoomLens.rotation.z = Math.PI / 2;
  zoomLens.position.set(0.07, 0.01, -0.025);
  cameraBody.add(zoomLens);

  // Front glass optical element
  const lensGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.01, 20), mats.cutawayGlass);
  lensGlass.rotation.z = Math.PI / 2;
  lensGlass.position.set(0.105, 0.01, -0.025);
  cameraBody.add(lensGlass);

  // Thermal Infrared Sensor Lens (FLIR Long-Wave IR)
  const irLens = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 16), hiVisYellow);
  irLens.rotation.z = Math.PI / 2;
  irLens.position.set(0.06, 0.01, 0.025);
  cameraBody.add(irLens);

  // LiDAR / Laser Rangefinder window
  const laserWindow = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.025, 0.025), mats.safetyRed);
  laserWindow.position.set(0.06, -0.02, 0);
  cameraBody.add(laserWindow);

  gimbalGroup.add(cameraBody);
  group.add(gimbalGroup);

  // 4. Industrial Searchlight & Thermal Inspection Scanning Beam
  const searchlightTarget = new THREE.Object3D();
  searchlightTarget.position.set(12, -8, 0);
  group.add(searchlightTarget);

  const searchlight = new THREE.SpotLight(0x38bdf8, 4.5, 35, Math.PI / 7, 0.45, 1.2);
  searchlight.position.set(0.2, -0.2, 0);
  searchlight.target = searchlightTarget;
  searchlight.castShadow = true;
  group.add(searchlight);

  // Visible Translucent Beam Cone (giving dramatic industrial inspection beam)
  const coneGeom = new THREE.ConeGeometry(3.2, 14, 24, 1, true);
  coneGeom.rotateX(-Math.PI / 2);
  coneGeom.translate(0, 0, 7.0);

  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const beamMesh = new THREE.Mesh(coneGeom, coneMat);
  beamMesh.position.set(0.2, -0.2, 0);
  beamMesh.lookAt(searchlightTarget.position);
  group.add(beamMesh);

  // 5. Aviation Position Navigation Strobes
  // Left Front: Red
  const navLightLeft = new THREE.PointLight(0xef4444, 1.8, 6);
  navLightLeft.position.set(0.38, 0.02, -0.38);
  group.add(navLightLeft);
  const redBead = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), mats.safetyRed);
  redBead.position.copy(navLightLeft.position);
  group.add(redBead);

  // Right Front: Green
  const navLightRight = new THREE.PointLight(0x22c55e, 1.8, 6);
  navLightRight.position.set(0.38, 0.02, 0.38);
  group.add(navLightRight);
  const greenBead = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
  greenBead.position.copy(navLightRight.position);
  group.add(greenBead);

  // Bottom Central: High-intensity White Anti-Collision Strobe
  const strobeLight = new THREE.PointLight(0xffffff, 2.5, 10);
  strobeLight.position.set(0, -0.22, 0);
  group.add(strobeLight);
  const whiteBead = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  whiteBead.position.copy(strobeLight.position);
  group.add(whiteBead);

  // 6. 3D Callout Signboard for Drone High Visibility
  const droneBadge = createCalloutBadge('INSPECTION DRONE UAV-01', 'AUTONOMOUS HSE PATROL', '#38BDF8');
  droneBadge.position.set(0, 0.75, 0);
  group.add(droneBadge);

  // Default initial position hovering over plant
  group.position.set(-10, 12, 12);

  return {
    group,
    propellers,
    gimbalCamera: cameraBody,
    searchlight,
    searchlightTarget,
    beamMesh,
    navLightLeft,
    navLightRight,
    strobeLight,
  };
}
