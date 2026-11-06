import * as THREE from 'three';
import { MaterialLibrary } from './materials';
import { EquipmentId } from '../types/plant';

export interface PlantEquipmentMeshMap {
  yard_stockpile: THREE.Group;
  feeding_hopper: THREE.Group;
  belt_conveyor: THREE.Group;
  bucket_elevator: THREE.Group;
  downstream_stage: THREE.Group;
  conveyorHoods: THREE.Group[];
  elevatorCasingCovers: THREE.Group[];
  elevatorBucketsGroup: THREE.Group;
  elevatorBuckets: THREE.Mesh[];
  conveyorBeltMesh: THREE.Mesh;
  drivePulleyHead: THREE.Mesh;
  tailPulley: THREE.Mesh;
  modularDownstreamGroup: THREE.Group;
}

// Helper to create an I-Beam
function createIBeam(length: number, width: number, height: number, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const flangeThick = height * 0.12;
  const webThick = width * 0.12;
  
  // Top flange
  const topFlange = new THREE.Mesh(new THREE.BoxGeometry(width, flangeThick, length), mat);
  topFlange.position.y = height / 2 - flangeThick / 2;
  topFlange.castShadow = true;
  group.add(topFlange);

  // Bottom flange
  const btmFlange = new THREE.Mesh(new THREE.BoxGeometry(width, flangeThick, length), mat);
  btmFlange.position.y = -height / 2 + flangeThick / 2;
  btmFlange.castShadow = true;
  group.add(btmFlange);

  // Web
  const web = new THREE.Mesh(new THREE.BoxGeometry(webThick, height - flangeThick * 2, length), mat);
  web.castShadow = true;
  group.add(web);

  return group;
}

export interface ArticulatedLoader {
  loaderGroup: THREE.Group;
  boomGroup: THREE.Group;
  bucketGroup: THREE.Group;
  huskInBucket: THREE.Mesh;
}

export interface YardStockpileData {
  group: THREE.Group;
  loader: ArticulatedLoader;
  truckCascade: THREE.Mesh;
}

// Procedural 3D Billboard Callout Label Helper
export function createCalloutBadge(title: string, tag: string, colorHex: string = '#38bdf8'): THREE.Group {
  const group = new THREE.Group();
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d')!;

  // Background rounded plate with dark translucent gradient
  ctx.fillStyle = 'rgba(10, 15, 29, 0.95)';
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(6, 6, 500, 128, 16);
  ctx.fill();
  ctx.stroke();

  // Tag badge pill
  ctx.fillStyle = colorHex;
  ctx.beginPath();
  ctx.roundRect(20, 18, 130, 32, 6);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(tag, 30, 41);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(title, 20, 88);

  // Status sub-line
  ctx.fillStyle = colorHex;
  ctx.font = '16px monospace';
  ctx.fillText('● ACTIVE INDUSTRIAL STAGE', 20, 118);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.0), mat);
  mesh.position.y = 0.6;
  group.add(mesh);

  // Ground anchor post
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 1.2),
    new THREE.MeshBasicMaterial({ color: '#64748b' })
  );
  rod.position.y = 0;
  group.add(rod);

  return group;
}

// 1. Yard & Stockpile Group with Articulated Loader & Truck Offloading
export function buildYardStockpile(mats: MaterialLibrary): YardStockpileData {
  const group = new THREE.Group();
  group.name = 'yard_stockpile';

  // Ground slab
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(60, 0.4, 40),
    mats.concretePavement
  );
  slab.position.set(0, -0.2, 0);
  slab.receiveShadow = true;
  group.add(slab);

  // Shipping Container Bay Walls (as seen in video)
  const containerCoords = [
    { x: -16, y: 1.3, z: -10, rotY: 0 },
    { x: -16, y: 3.9, z: -10, rotY: 0 },
    { x: -8, y: 1.3, z: -10, rotY: 0 },
    { x: -8, y: 3.9, z: -10, rotY: 0 },
    { x: -20, y: 1.3, z: 0, rotY: Math.PI / 2 },
    { x: -20, y: 3.9, z: 0, rotY: Math.PI / 2 },
    { x: -20, y: 1.3, z: 8, rotY: Math.PI / 2 },
    { x: -20, y: 3.9, z: 8, rotY: Math.PI / 2 },
  ];

  containerCoords.forEach((c) => {
    const cont = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(12, 2.6, 2.4), mats.corrugatedSteel);
    body.castShadow = true;
    body.receiveShadow = true;
    cont.add(body);

    // Corner posts
    const postMat = mats.paintedSteelSlate;
    for (let cx of [-5.9, 5.9]) {
      for (let cz of [-1.1, 1.1]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.6, 0.2), postMat);
        post.position.set(cx, 0, cz);
        cont.add(post);
      }
    }
    cont.position.set(c.x, c.y, c.z);
    cont.rotation.y = c.rotY;
    group.add(cont);
  });

  // Rice Husk Stockpile Dunes
  const pileGeom1 = new THREE.ConeGeometry(7, 3.8, 16);
  pileGeom1.scale(1.4, 1, 1);
  const pile1 = new THREE.Mesh(pileGeom1, mats.riceHuskMaterial);
  pile1.position.set(-14, 1.9, -4);
  pile1.castShadow = true;
  pile1.receiveShadow = true;
  group.add(pile1);

  const pileGeom2 = new THREE.ConeGeometry(5.5, 3.2, 16);
  pileGeom2.scale(1.2, 1, 1.3);
  const pile2 = new THREE.Mesh(pileGeom2, mats.riceHuskMaterial);
  pile2.position.set(-11, 1.6, 5);
  pile2.castShadow = true;
  pile2.receiveShadow = true;
  group.add(pile2);

  // Approach ramp to hopper (compacted rice husk ramp allowing loader dump height)
  const rampGeom = new THREE.BoxGeometry(8, 2.6, 6.5);
  const ramp = new THREE.Mesh(rampGeom, mats.riceHuskMaterial);
  ramp.position.set(-5.0, 1.3, 0);
  ramp.rotation.z = -0.16;
  ramp.castShadow = true;
  ramp.receiveShadow = true;
  group.add(ramp);

  // Articulated Wheel Loader Model (CAT 950B styled)
  const loaderGroup = new THREE.Group();
  loaderGroup.name = 'cat_loader';
  loaderGroup.position.set(-7.5, 0.4, 0);
  loaderGroup.rotation.y = -Math.PI / 2; // Facing +X towards hopper ramp

  // Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 4.2), mats.safetyYellow);
  chassis.position.y = 1.0;
  chassis.castShadow = true;
  loaderGroup.add(chassis);

  // Engine Hood / Counterweight
  const hood = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 1.8), mats.safetyYellow);
  hood.position.set(0, 1.6, -1.1);
  hood.castShadow = true;
  loaderGroup.add(hood);

  // Exhaust pipe
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2), mats.industrialSteel);
  exhaust.position.set(0.7, 2.6, -1.4);
  loaderGroup.add(exhaust);

  // Operator Cab with Safety Windows
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.6, 1.6), mats.paintedSteelSlate);
  cab.position.set(0, 2.2, 0.4);
  cab.castShadow = true;
  loaderGroup.add(cab);

  // Wheels (4 big pneumatic tires)
  const wheelGeom = new THREE.CylinderGeometry(0.75, 0.75, 0.6, 16);
  wheelGeom.rotateZ(Math.PI / 2);
  const wheelMat = mats.rubberBelt;
  const wheelCoords = [
    [-1.4, 0.75, 1.4],
    [1.4, 0.75, 1.4],
    [-1.4, 0.75, -1.4],
    [1.4, 0.75, -1.4]
  ];
  wheelCoords.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;
    loaderGroup.add(wheel);
  });

  // Articulated Hydraulic Boom Group (pivoting at chassis front)
  const boomGroup = new THREE.Group();
  boomGroup.name = 'loader_boom';
  boomGroup.position.set(0, 1.4, 1.0); // Pivot point on loader
  loaderGroup.add(boomGroup);

  const boomL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 2.8), mats.safetyYellow);
  boomL.position.set(-1.1, 0.2, 1.4);
  boomGroup.add(boomL);

  const boomR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 2.8), mats.safetyYellow);
  boomR.position.set(1.1, 0.2, 1.4);
  boomGroup.add(boomR);

  // Articulated Bucket Group (pivoting at boom tip)
  const bucketGroup = new THREE.Group();
  bucketGroup.name = 'loader_bucket';
  bucketGroup.position.set(0, 0.2, 2.8); // Pivot point at end of boom
  boomGroup.add(bucketGroup);

  const bucketGeom = new THREE.BoxGeometry(2.9, 1.3, 1.5);
  const bucket = new THREE.Mesh(bucketGeom, mats.paintedSteelSlate);
  bucket.position.set(0, 0.2, 0.5);
  bucket.castShadow = true;
  bucketGroup.add(bucket);

  // Rice husk inside bucket (dynamic payload)
  const huskInBucket = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.7, 1.3), mats.riceHuskMaterial);
  huskInBucket.position.set(0, 0.45, 0.5);
  bucketGroup.add(huskInBucket);

  group.add(loaderGroup);

  // Haul Truck actively Offloading / Dumping at reception bay (as in video 00:05-00:30)
  const truck = new THREE.Group();
  truck.name = 'haul_truck_offloading';
  truck.position.set(-15, 0.2, -6);
  truck.rotation.y = 0.35;

  const truckChassis = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.0, 7.5), mats.paintedSteelSlate);
  truckChassis.position.y = 1.0;
  truck.add(truckChassis);

  // Decorated Pakistani / Bedford style cab
  const truckCab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.0), mats.motorBlue);
  truckCab.position.set(0, 2.2, 2.6);
  truckCab.castShadow = true;
  truck.add(truckCab);

  // High wooden/metal cargo bed
  const cargoBed = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.0, 4.8), mats.paintedSteelSlate);
  cargoBed.position.set(0, 2.4, -1.0);
  cargoBed.castShadow = true;
  truck.add(cargoBed);

  const huskInTruck = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 4.6), mats.riceHuskMaterial);
  huskInTruck.position.set(0, 2.6, -1.0);
  truck.add(huskInTruck);

  // Dropped side door / flap releasing rice husk (as seen in video 00:10)
  const sideDoor = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 3.4), mats.paintedSteelSlate);
  sideDoor.position.set(1.4, 1.5, -1.0);
  sideDoor.rotation.z = -0.7; // dropped open
  truck.add(sideDoor);

  // Burlap sheet barrier (video 00:08)
  const burlap = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.8, 2.8), mats.riceHuskMaterial);
  burlap.position.set(1.6, 1.8, -1.0);
  truck.add(burlap);

  // Rice husk avalanche pouring from truck side into the ground pile
  const cascadeGeom = new THREE.ConeGeometry(1.8, 2.6, 14);
  cascadeGeom.scale(1, 1, 1.6);
  const truckCascade = new THREE.Mesh(cascadeGeom, mats.riceHuskMaterial);
  truckCascade.position.set(2.4, 1.1, -1.0);
  truckCascade.rotation.z = 0.45;
  truckCascade.castShadow = true;
  truck.add(truckCascade);

  // Truck wheels
  const tWheelGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 14);
  tWheelGeom.rotateZ(Math.PI / 2);
  [-1.3, 1.3].forEach((tx) => {
    [2.4, -0.6, -2.4].forEach((tz) => {
      const tw = new THREE.Mesh(tWheelGeom, wheelMat);
      tw.position.set(tx, 0.55, tz);
      tw.castShadow = true;
      truck.add(tw);
    });
  });

  group.add(truck);

  // 3D Callout Signboards for High Visibility
  const offloadBadge = createCalloutBadge('TRUCK OFFLOADING & YARD BAY', 'STAGE 0', '#E9C46A');
  offloadBadge.position.set(-15, 6.8, -6);
  group.add(offloadBadge);

  const loaderBadge = createCalloutBadge('WHEEL LOADER FEEDING RAMP', 'CAT-950B', '#F59E0B');
  loaderBadge.position.set(-5, 6.2, 0);
  group.add(loaderBadge);

  return {
    group,
    loader: {
      loaderGroup,
      boomGroup,
      bucketGroup,
      huskInBucket,
    },
    truckCascade,
  };
}

// 2. Stage 1: Feeding Hopper (411-HP01)
export function buildFeedingHopper(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'feeding_hopper';
  group.position.set(0, 0, 0);

  // Supporting Structural Frame (4 primary columns + bracing)
  const colHeight = 6.5;
  const colMat = mats.industrialSteel;
  const colCoords = [
    [-2.2, -2.2],
    [2.2, -2.2],
    [-2.2, 2.2],
    [2.2, 2.2],
  ];

  colCoords.forEach(([cx, cz]) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.35, colHeight, 0.35), colMat);
    col.position.set(cx, colHeight / 2, cz);
    col.castShadow = true;
    group.add(col);

    // Footing pad
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.8), mats.concretePavement);
    pad.position.set(cx, 0.125, cz);
    group.add(pad);
  });

  // Cross horizontal beams
  const beamMat = mats.industrialSteel;
  const hBeams = [
    { pos: [0, 2.8, -2.2], size: [4.4, 0.3, 0.2] },
    { pos: [0, 2.8, 2.2], size: [4.4, 0.3, 0.2] },
    { pos: [-2.2, 2.8, 0], size: [0.2, 0.3, 4.4] },
    { pos: [2.2, 2.8, 0], size: [0.2, 0.3, 4.4] },
    { pos: [0, 5.5, -2.2], size: [4.4, 0.3, 0.2] },
    { pos: [0, 5.5, 2.2], size: [4.4, 0.3, 0.2] },
    { pos: [-2.2, 5.5, 0], size: [0.2, 0.3, 4.4] },
    { pos: [2.2, 5.5, 0], size: [0.2, 0.3, 4.4] },
  ];
  hBeams.forEach((b) => {
    const bm = new THREE.Mesh(new THREE.BoxGeometry(b.size[0], b.size[1], b.size[2]), beamMat);
    bm.position.set(b.pos[0], b.pos[1], b.pos[2]);
    bm.castShadow = true;
    group.add(bm);
  });

  // Diagonal V-bracing on sides
  const diagMat = mats.industrialSteel;
  const d1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.8), diagMat);
  d1.position.set(0, 4.15, -2.2);
  d1.rotation.z = 0.7;
  group.add(d1);

  const d2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.8), diagMat);
  d2.position.set(0, 4.15, -2.2);
  d2.rotation.z = -0.7;
  group.add(d2);

  // Inverted Pyramid Hopper Body
  // Top: 4.2m x 4.2m at y=5.5; Bottom throat: 1.0m x 1.4m at y=2.2
  const hopperGeom = new THREE.CylinderGeometry(0.7, 2.8, 3.3, 4, 1, false);
  hopperGeom.rotateY(Math.PI / 4);
  const hopperBody = new THREE.Mesh(hopperGeom, mats.paintedSteelSlate);
  hopperBody.position.set(0, 3.85, 0);
  hopperBody.castShadow = true;
  hopperBody.receiveShadow = true;
  group.add(hopperBody);

  // Upper rectangular hopper collar (y=5.5 to 6.8)
  const collar = new THREE.Mesh(new THREE.BoxGeometry(4.3, 1.4, 4.3), mats.paintedSteelSlate);
  collar.position.set(0, 6.2, 0);
  collar.castShadow = true;
  group.add(collar);

  // Stiffener ribs around hopper
  for (let dy of [3.2, 4.4]) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(3.6 - (dy - 3) * 0.8, 0.12, 3.6 - (dy - 3) * 0.8), mats.safetyYellow);
    rib.position.set(0, dy, 0);
    group.add(rib);
  }

  // Heavy Grizzly Screen (bar grid at top of hopper, y=6.9)
  const grizzly = new THREE.Group();
  grizzly.name = 'grizzly_screen';
  for (let i = -1.9; i <= 1.9; i += 0.28) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 4.1), mats.industrialSteel);
    bar.position.set(i, 6.9, 0);
    bar.castShadow = true;
    grizzly.add(bar);
  }
  // Cross supports
  for (let cz of [-1.2, 0, 1.2]) {
    const cBar = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.14, 0.1), mats.safetyYellow);
    cBar.position.set(0, 6.85, cz);
    grizzly.add(cBar);
  }
  group.add(grizzly);

  // Corrugated Weather Shelter Canopy (as seen in plant footage)
  const canopy = new THREE.Group();
  canopy.name = 'hopper_weather_shelter';
  
  // Overhead angled corrugated roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.15, 5.6), mats.corrugatedSteel);
  roof.position.set(0, 8.8, 0.4);
  roof.rotation.x = -0.18; // angled roof
  roof.castShadow = true;
  canopy.add(roof);

  // Side and back corrugated windbreak sheets
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(5.0, 3.2, 0.1), mats.corrugatedSteel);
  backWall.position.set(0, 7.8, -2.4);
  backWall.castShadow = true;
  canopy.add(backWall);

  // Note: Loader Approach Side (x=-2.4) is OPEN PORTAL so loader bucket reaches directly in to dump!
  const portalPost1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 0.2), mats.safetyYellow);
  portalPost1.position.set(-2.4, 7.8, -2.3);
  canopy.add(portalPost1);

  const portalPost2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 0.2), mats.safetyYellow);
  portalPost2.position.set(-2.4, 7.8, 2.3);
  canopy.add(portalPost2);

  const portalHeader = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 4.8), mats.safetyYellow);
  portalHeader.position.set(-2.4, 9.3, 0);
  canopy.add(portalHeader);

  // Right side wall (toward conveyor incline)
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.2, 4.8), mats.corrugatedSteel);
  rightWall.position.set(2.4, 7.8, 0);
  rightWall.castShadow = true;
  canopy.add(rightWall);

  group.add(canopy);

  // Discharge Neck & Chute Skirt (y=1.2 to 2.2)
  const neck = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.0, 1.5), mats.paintedSteelSlate);
  neck.position.set(0, 1.7, 0);
  neck.castShadow = true;
  group.add(neck);

  // Needle / Pin Gate (horizontal cutoff rods)
  const pinGate = new THREE.Group();
  pinGate.name = 'pin_gate';
  for (let pz = -0.6; pz <= 0.6; pz += 0.15) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.8), mats.safetyYellow);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(0.2, 1.8, pz);
    pinGate.add(pin);
  }
  group.add(pinGate);

  // Vibrator pads on hopper sides
  const vibL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.35), mats.motorBlue);
  vibL.position.set(-1.6, 3.8, 0);
  group.add(vibL);

  const vibR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.35), mats.motorBlue);
  vibR.position.set(1.6, 3.8, 0);
  group.add(vibR);

  // Rice husk inside hopper
  const huskInside = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.8, 12), mats.riceHuskMaterial);
  huskInside.position.set(0, 5.0, 0);
  group.add(huskInside);

  // Warning sign on hopper leg
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.02), mats.hazardStripes);
  sign.position.set(-2.2, 2.0, 2.22);
  group.add(sign);

  // 3D Callout Signboard for Hopper High Visibility
  const hopperBadge = createCalloutBadge('PRIMARY FEEDING HOPPER', '411-HP01', '#F59E0B');
  hopperBadge.position.set(0, 10.6, 0);
  group.add(hopperBadge);

  return group;
}

// 3. Stage 2: Belt Conveyor (411-BC01)
export function buildBeltConveyor(
  mats: MaterialLibrary
): {
  group: THREE.Group;
  hoods: THREE.Group[];
  beltMesh: THREE.Mesh;
  drivePulley: THREE.Mesh;
  tailPulley: THREE.Mesh;
} {
  const group = new THREE.Group();
  group.name = 'belt_conveyor';

  const hoods: THREE.Group[] = [];

  // Conveyor Geometry Parameters
  // Tail starts at hopper throat: x=0, y=1.2, z=0
  // Incline runs along +X axis up to elevator boot intake: x=20.0, y=5.8, z=0
  const startX = 0;
  const startY = 1.1;
  const endX = 20.0;
  const endY = 5.8;
  const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  const inclineAngle = Math.atan2(endY - startY, endX - startX); // ~13.2 degrees

  // Truss Container Group aligned with belt incline
  const trussGroup = new THREE.Group();
  trussGroup.position.set(startX, startY, 0);
  trussGroup.rotation.z = inclineAngle;

  // Main Stringer I-Beams (left and right rails)
  const beamMat = mats.industrialSteel;
  const leftStringer = createIBeam(length, 0.14, 0.3, beamMat);
  leftStringer.position.set(length / 2, 0, -0.65);
  leftStringer.rotation.y = Math.PI / 2;
  trussGroup.add(leftStringer);

  const rightStringer = createIBeam(length, 0.14, 0.3, beamMat);
  rightStringer.position.set(length / 2, 0, 0.65);
  rightStringer.rotation.y = Math.PI / 2;
  trussGroup.add(rightStringer);

  // Cross ties every 1.5m
  for (let lx = 1.0; lx < length - 0.5; lx += 1.5) {
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 1.44), mats.industrialSteel);
    tie.position.set(lx, -0.05, 0);
    trussGroup.add(tie);
  }

  // Pulleys: Tail Pulley at x=0.4; Head Pulley at x=length - 0.5
  const pulleyMat = mats.industrialSteel;
  const tailPulleyGeom = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 20);
  tailPulleyGeom.rotateX(Math.PI / 2);
  const tailPulley = new THREE.Mesh(tailPulleyGeom, pulleyMat);
  tailPulley.position.set(0.5, 0, 0);
  tailPulley.castShadow = true;
  trussGroup.add(tailPulley);

  const headPulleyGeom = new THREE.CylinderGeometry(0.35, 0.35, 1.0, 20);
  headPulleyGeom.rotateX(Math.PI / 2);
  const drivePulley = new THREE.Mesh(headPulleyGeom, mats.paintedSteelSlate);
  drivePulley.position.set(length - 0.5, 0, 0);
  drivePulley.castShadow = true;
  trussGroup.add(drivePulley);

  // Drive Motor & Helical Gearbox at Head Pulley
  const driveStation = new THREE.Group();
  driveStation.name = 'conveyor_drive_station';
  driveStation.position.set(length - 0.5, 0, 0.85);

  const gearbox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.55), mats.paintedSteelSlate);
  gearbox.castShadow = true;
  driveStation.add(gearbox);

  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.85, 16), mats.motorBlue);
  motor.rotation.x = Math.PI / 2;
  motor.position.set(0, 0, 0.6);
  motor.castShadow = true;
  driveStation.add(motor);

  const couplingGuard = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.35), mats.safetyYellow);
  couplingGuard.rotation.x = Math.PI / 2;
  couplingGuard.position.set(0, 0, -0.35);
  driveStation.add(couplingGuard);

  trussGroup.add(driveStation);

  // Troughing Idlers (3-roll sets) every 1.2m
  const idlerMat = mats.industrialSteel;
  for (let ix = 1.2; ix < length - 1.0; ix += 1.2) {
    const idlerSet = new THREE.Group();
    idlerSet.position.set(ix, 0.12, 0);

    // Center horizontal roll
    const centerRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12), idlerMat);
    centerRoll.rotation.x = Math.PI / 2;
    centerRoll.castShadow = true;
    idlerSet.add(centerRoll);

    // Left wing roll (35 deg tilt)
    const leftRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 12), idlerMat);
    leftRoll.rotation.x = Math.PI / 2 - 0.61; // ~35 deg
    leftRoll.position.set(0, 0.08, -0.28);
    leftRoll.castShadow = true;
    idlerSet.add(leftRoll);

    // Right wing roll (35 deg tilt)
    const rightRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 12), idlerMat);
    rightRoll.rotation.x = Math.PI / 2 + 0.61; // ~35 deg
    rightRoll.position.set(0, 0.08, 0.28);
    rightRoll.castShadow = true;
    idlerSet.add(rightRoll);

    // Return flat idler underneath
    const returnRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 12), idlerMat);
    returnRoll.rotation.x = Math.PI / 2;
    returnRoll.position.set(0, -0.3, 0);
    idlerSet.add(returnRoll);

    trussGroup.add(idlerSet);
  }

  // Conveyor Rubber Belt Mesh (top carry strand)
  // We model the troughed carry strand as a wide mesh slightly curved
  const beltLength = length - 1.0;
  const beltGeom = new THREE.PlaneGeometry(beltLength, 0.85, 32, 4);
  // Give subtle trough dish to the belt vertices
  const posAttr = beltGeom.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const yVal = posAttr.getY(i);
    // bend edges up
    posAttr.setZ(i, Math.pow(yVal / 0.42, 2) * 0.08);
  }
  beltGeom.computeVertexNormals();
  beltGeom.rotateX(-Math.PI / 2);
  beltGeom.rotateY(Math.PI / 2);

  const beltMesh = new THREE.Mesh(beltGeom, mats.rubberBelt);
  beltMesh.position.set(length / 2, 0.22, 0);
  beltMesh.castShadow = true;
  beltMesh.receiveShadow = true;
  trussGroup.add(beltMesh);

  // Return belt strand (flat underneath)
  const returnBeltGeom = new THREE.PlaneGeometry(beltLength, 0.8, 1, 1);
  returnBeltGeom.rotateX(Math.PI / 2);
  returnBeltGeom.rotateY(Math.PI / 2);
  const returnBelt = new THREE.Mesh(returnBeltGeom, mats.rubberBelt);
  returnBelt.position.set(length / 2, -0.35, 0);
  trussGroup.add(returnBelt);

  // Corrugated Semicircular Dust Hood Covers (as seen in plant footage)
  // 4 modular hood sections along the conveyor that can be made transparent in cutaway mode
  const numHoods = 5;
  const hoodSegLen = (length - 2.8) / numHoods;

  for (let h = 0; h < numHoods; h++) {
    const hoodGroup = new THREE.Group();
    hoodGroup.name = `conveyor_hood_${h + 1}`;
    const hx = 1.4 + h * hoodSegLen + hoodSegLen / 2;

    // Semicircular arch canopy
    const archGeom = new THREE.CylinderGeometry(0.68, 0.68, hoodSegLen - 0.08, 16, 1, true, 0, Math.PI);
    archGeom.rotateZ(Math.PI / 2);
    const archMesh = new THREE.Mesh(archGeom, mats.corrugatedSteel);
    archMesh.position.set(0, 0.2, 0);
    archMesh.castShadow = true;
    archMesh.receiveShadow = true;
    hoodGroup.add(archMesh);

    // Inspection handle & clamp
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.3), mats.safetyYellow);
    handle.position.set(0, 0.9, 0);
    hoodGroup.add(handle);

    hoodGroup.position.set(hx, 0.1, 0);
    trussGroup.add(hoodGroup);
    hoods.push(hoodGroup);
  }

  // Overhead Self-Cleaning Tramp Magnetic Separator (411-MS01) at x=14m (as seen in video)
  const magnetGroup = new THREE.Group();
  magnetGroup.name = 'magnetic_separator';
  magnetGroup.position.set(13.5, 1.2, 0);

  // Suspended frame
  const magFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.8), mats.paintedSteelSlate);
  magnetGroup.add(magFrame);

  // Magnet core block
  const magCore = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 1.2), mats.safetyYellow);
  magCore.position.y = -0.35;
  magCore.castShadow = true;
  magnetGroup.add(magCore);

  // Cross discharge belt & motor
  const crossBelt = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.45, 1.4), mats.rubberBelt);
  crossBelt.position.y = -0.35;
  magnetGroup.add(crossBelt);

  const magMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35), mats.motorBlue);
  magMotor.position.set(0.6, -0.3, 0);
  magnetGroup.add(magMotor);

  trussGroup.add(magnetGroup);

  // Maintenance Walkway alongside conveyor (+Z side)
  const walkwayGeom = new THREE.BoxGeometry(length, 0.06, 0.85);
  const walkway = new THREE.Mesh(walkwayGeom, mats.steelGrating);
  walkway.position.set(length / 2, -0.15, 1.15);
  walkway.receiveShadow = true;
  trussGroup.add(walkway);

  // Safety Yellow Handrails along walkway
  const railMat = mats.safetyYellow;
  const topRail = new THREE.Mesh(new THREE.BoxGeometry(length, 0.05, 0.05), railMat);
  topRail.position.set(length / 2, 0.95, 1.55);
  trussGroup.add(topRail);

  const midRail = new THREE.Mesh(new THREE.BoxGeometry(length, 0.04, 0.04), railMat);
  midRail.position.set(length / 2, 0.45, 1.55);
  trussGroup.add(midRail);

  const toeBoard = new THREE.Mesh(new THREE.BoxGeometry(length, 0.15, 0.02), mats.hazardStripes);
  toeBoard.position.set(length / 2, -0.05, 1.55);
  trussGroup.add(toeBoard);

  // Stanchions every 1.5m
  for (let sx = 0.5; sx < length; sx += 1.5) {
    const stanchion = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.15, 0.05), railMat);
    stanchion.position.set(sx, 0.45, 1.55);
    trussGroup.add(stanchion);
  }

  // Emergency Pull-Wire Switch Cable (red wire running full length)
  const pullCordMat = mats.safetyRed;
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, length), pullCordMat);
  cord.rotation.z = Math.PI / 2;
  cord.position.set(length / 2, 0.7, 0.75);
  trussGroup.add(cord);

  // Pull-cord switch boxes
  for (let bx of [2.0, 10.0, 18.0]) {
    const swBox = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.12), mats.safetyYellow);
    swBox.position.set(bx, 0.7, 0.78);
    trussGroup.add(swBox);
  }

  group.add(trussGroup);

  // Supporting Ground Columns & Trestles
  // Placed at absolute world coordinates under the inclined truss
  const trestlePositions = [5.0, 10.0, 15.0, 19.5];
  trestlePositions.forEach((tx) => {
    const ty = startY + (tx - startX) * Math.sin(inclineAngle);
    const colH = ty + 0.1;

    const tCol1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, colH, 12), mats.industrialSteel);
    tCol1.position.set(tx, colH / 2, -0.65);
    tCol1.castShadow = true;
    group.add(tCol1);

    const tCol2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, colH, 12), mats.industrialSteel);
    tCol2.position.set(tx, colH / 2, 0.65);
    tCol2.castShadow = true;
    group.add(tCol2);

    // Cross brace between legs
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.3), mats.industrialSteel);
    brace.position.set(tx, colH * 0.6, 0);
    group.add(brace);

    // Concrete footing
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 2.0), mats.concretePavement);
    foot.position.set(tx, 0.15, 0);
    group.add(foot);
  });

  // 3D Callout Signboard for Belt Conveyor High Visibility
  const conveyorBadge = createCalloutBadge('INCLINED BELT CONVEYOR', '411-BC01', '#2A9D8F');
  conveyorBadge.position.set(10.0, 8.4, 0);
  group.add(conveyorBadge);

  return {
    group,
    hoods,
    beltMesh,
    drivePulley,
    tailPulley,
  };
}

// 4. Stage 3: Vertical Bucket Elevator (411-BE01)
export function buildBucketElevator(
  mats: MaterialLibrary
): {
  group: THREE.Group;
  casingCovers: THREE.Group[];
  bucketsGroup: THREE.Group;
  buckets: THREE.Mesh[];
} {
  const group = new THREE.Group();
  group.name = 'bucket_elevator';
  // Positioned at the end of the belt conveyor: x = 21.0, z = 0
  group.position.set(21.0, 0, 0);

  const casingCovers: THREE.Group[] = [];
  const buckets: THREE.Mesh[] = [];

  const totalHeight = 28.5; // reaches preheater tower +28m platform

  // Concrete foundation pedestal
  const foundation = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 3.2), mats.concretePavement);
  foundation.position.set(0, 0.4, 0);
  foundation.receiveShadow = true;
  group.add(foundation);

  // Boot Section (Bottom casing from y=0.8 to y=4.5)
  const bootBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.6, 1.4), mats.paintedSteelSlate);
  bootBox.position.set(0, 2.6, 0);
  bootBox.castShadow = true;
  group.add(bootBox);

  // Boot intake chute receiving material from conveyor head (facing -X)
  const intakeChute = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.9), mats.paintedSteelSlate);
  intakeChute.position.set(-1.1, 5.2, 0);
  intakeChute.rotation.z = 0.55;
  intakeChute.castShadow = true;
  group.add(intakeChute);

  // Boot clean-out doors & screw take-up spindles
  const cleanDoor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.8), mats.safetyYellow);
  cleanDoor.position.set(0.81, 1.8, 0);
  group.add(cleanDoor);

  // Twin Leg Trunking Casing (from y=4.5 to y=25.5)
  // Ascending leg (-Z) and Descending leg (+Z)
  const trunkHeight = 21.0;
  const numSections = 7;
  const secHeight = trunkHeight / numSections;

  for (let s = 0; s < numSections; s++) {
    const secGroup = new THREE.Group();
    secGroup.name = `elevator_casing_sec_${s + 1}`;
    const sy = 4.5 + s * secHeight + secHeight / 2;

    // Up leg casing
    const upLeg = new THREE.Mesh(new THREE.BoxGeometry(0.7, secHeight - 0.05, 0.65), mats.paintedSteelSlate);
    upLeg.position.set(0, 0, -0.42);
    upLeg.castShadow = true;
    secGroup.add(upLeg);

    // Down leg casing
    const downLeg = new THREE.Mesh(new THREE.BoxGeometry(0.7, secHeight - 0.05, 0.65), mats.paintedSteelSlate);
    downLeg.position.set(0, 0, 0.42);
    downLeg.castShadow = true;
    secGroup.add(downLeg);

    // Flange joints at top and bottom of section
    const flangeMat = mats.industrialSteel;
    const fTop = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 1.6), flangeMat);
    fTop.position.set(0, secHeight / 2, 0);
    secGroup.add(fTop);

    // Explosion relief vent panels on sections 2, 4, and 6 (ATEX / NFPA 68)
    if (s === 1 || s === 3 || s === 5) {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.2, 0.04), mats.hazardStripes);
      vent.position.set(0, 0, -0.76);
      secGroup.add(vent);

      const ventLabel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.02), mats.safetyRed);
      ventLabel.position.set(0, 0, -0.78);
      secGroup.add(ventLabel);
    }

    // Inspection window on section 1 (boot inspection) and section 6
    if (s === 0 || s === 5) {
      const hatch = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.7, 0.4), mats.safetyYellow);
      hatch.position.set(0.05, 0, 0.5);
      secGroup.add(hatch);
    }

    secGroup.position.set(0, sy, 0);
    group.add(secGroup);
    casingCovers.push(secGroup);
  }

  // Head Section (y=25.5 to y=28.5)
  const headHood = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.2, 1.6), mats.paintedSteelSlate);
  headHood.position.set(0.1, 27.0, 0);
  headHood.castShadow = true;
  group.add(headHood);

  // Curved discharge hood profile
  const headCurveGeom = new THREE.CylinderGeometry(0.85, 0.85, 1.6, 16, 1, false, 0, Math.PI);
  headCurveGeom.rotateZ(Math.PI / 2);
  const headCurve = new THREE.Mesh(headCurveGeom, mats.paintedSteelSlate);
  headCurve.position.set(0.1, 28.6, 0);
  group.add(headCurve);

  // Elevator Discharge Chute (cascading toward +X downstream)
  const dischargeChute = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.9), mats.paintedSteelSlate);
  dischargeChute.position.set(1.4, 26.2, 0);
  dischargeChute.rotation.z = -0.55;
  dischargeChute.castShadow = true;
  group.add(dischargeChute);

  // Head Drive Motor (45 kW) & Gearbox with Integral Backstop
  const headDrive = new THREE.Group();
  headDrive.name = 'elevator_head_drive';
  headDrive.position.set(0.1, 27.2, 1.1);

  const headGearbox = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.85, 0.6), mats.paintedSteelSlate);
  headDrive.add(headGearbox);

  const headMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.95, 16), mats.motorBlue);
  headMotor.rotation.x = Math.PI / 2;
  headMotor.position.set(0, 0, 0.7);
  headDrive.add(headMotor);

  // Backstop clutch housing
  const backstopHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.3), mats.safetyYellow);
  backstopHousing.rotation.x = Math.PI / 2;
  backstopHousing.position.set(0, 0, -0.45);
  headDrive.add(backstopHousing);

  group.add(headDrive);

  // Top Service Maintenance Platform (+28.0m elevation)
  const platGeom = new THREE.BoxGeometry(4.2, 0.1, 3.8);
  const topPlatform = new THREE.Mesh(platGeom, mats.steelGrating);
  topPlatform.position.set(0.3, 26.8, 0);
  group.add(topPlatform);

  // Safety Handrails around top platform
  const railMat = mats.safetyYellow;
  const pRails = [
    { pos: [0.3, 27.9, 1.85], size: [4.2, 0.05, 0.05] },
    { pos: [0.3, 27.9, -1.85], size: [4.2, 0.05, 0.05] },
    { pos: [-1.75, 27.9, 0], size: [0.05, 0.05, 3.8] },
    { pos: [2.35, 27.9, 0], size: [0.05, 0.05, 3.8] },
  ];
  pRails.forEach((r) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(r.size[0], r.size[1], r.size[2]), railMat);
    rail.position.set(r.pos[0], r.pos[1], r.pos[2]);
    group.add(rail);
  });

  // Toe-boards
  const pToe = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.18, 0.02), mats.hazardStripes);
  pToe.position.set(0.3, 26.9, 1.85);
  group.add(pToe);

  // Vertical Caged Ladder running up the elevator leg
  const ladderGroup = new THREE.Group();
  ladderGroup.name = 'access_caged_ladder';
  ladderGroup.position.set(-0.95, 0, 0);

  // Rungs & uprights
  const uprightL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 26.5), mats.safetyYellow);
  uprightL.position.set(0, 13.5, -0.22);
  ladderGroup.add(uprightL);

  const uprightR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 26.5), mats.safetyYellow);
  uprightR.position.set(0, 13.5, 0.22);
  ladderGroup.add(uprightR);

  for (let ly = 1.0; ly < 26.5; ly += 0.35) {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.44), mats.safetyYellow);
    rung.rotation.x = Math.PI / 2;
    rung.position.set(0, ly, 0);
    ladderGroup.add(rung);
  }

  // Safety cage (from y=2.5m upwards)
  for (let cy = 3.0; cy < 26.5; cy += 1.2) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.02, 8, 16, Math.PI * 1.5), mats.safetyYellow);
    hoop.rotation.x = Math.PI / 2;
    hoop.position.set(-0.25, cy, 0);
    ladderGroup.add(hoop);
  }

  group.add(ladderGroup);

  // Internal Mechanism Group (Visible in Cutaway mode or when covers are hidden)
  const bucketsGroup = new THREE.Group();
  bucketsGroup.name = 'internal_buckets_mechanism';

  // Internal Head Pulley (at y=27.2)
  const intHeadPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.5, 20), mats.industrialSteel);
  intHeadPulley.rotation.x = Math.PI / 2;
  intHeadPulley.position.set(0, 27.2, 0);
  bucketsGroup.add(intHeadPulley);

  // Internal Boot Pulley (at y=2.4)
  const intBootPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.5, 20), mats.industrialSteel);
  intBootPulley.rotation.x = Math.PI / 2;
  intBootPulley.position.set(0, 2.4, 0);
  bucketsGroup.add(intBootPulley);

  // Array of Buckets attached to the loop
  // Total travel loop ~ 2 * (27.2 - 2.4) = 49.6m
  const numBuckets = 32;
  const bucketGeom = new THREE.BoxGeometry(0.35, 0.24, 0.42);
  // Shape the bucket like an industrial scoop
  const bMat = mats.safetyYellow;

  for (let b = 0; b < numBuckets; b++) {
    const bucket = new THREE.Mesh(bucketGeom, bMat);
    // Add rice husk payload inside bucket
    const huskPayload = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.38), mats.riceHuskMaterial);
    huskPayload.position.set(0, 0.08, 0);
    bucket.add(huskPayload);

    bucket.castShadow = true;
    bucketsGroup.add(bucket);
    buckets.push(bucket);
  }

  group.add(bucketsGroup);

  // 3D Callout Signboard for Bucket Elevator High Visibility
  const elevatorBadge = createCalloutBadge('VERTICAL BUCKET ELEVATOR', '411-BE01', '#0077B6');
  elevatorBadge.position.set(0, 30.5, 0);
  group.add(elevatorBadge);

  return {
    group,
    casingCovers,
    bucketsGroup,
    buckets,
  };
}

// 5. Stage 4: Downstream Process Stage (Modular / To Be Confirmed)
export function buildDownstreamModularStage(
  mats: MaterialLibrary,
  activeConfigId: string = 'config_surge_bin'
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'downstream_stage';
  // Positioned at elevator discharge: x=24.5, y=24.5, z=0
  group.position.set(24.5, 24.5, 0);

  // Modular Demarcation Frame (Glowing dashed box indicating unconfirmed / modular boundary)
  const frameMat = mats.structuralTeal;
  const boundBox = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(6.5, 7.0, 5.0)), 0x38bdf8);
  boundBox.position.set(3.2, 0, 0);
  group.add(boundBox);

  // "TO BE CONFIRMED" Marquee indicator plate
  const badgeMat = mats.safetyRed;
  const badge = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 0.08), badgeMat);
  badge.position.set(3.2, 3.8, 2.5);
  group.add(badge);

  // Transfer Chute connecting elevator discharge to the modular equipment
  const transChute = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.8), mats.paintedSteelSlate);
  transChute.position.set(0.6, 0.8, 0);
  transChute.rotation.z = -0.4;
  transChute.castShadow = true;
  group.add(transChute);

  // Render modular equipment based on active selection
  if (activeConfigId === 'config_surge_bin') {
    // Option A: Surge Dosing Bin with Pin Gate & Weigh Belt Feeder (as in video 02:50 - 03:06)
    const surgeGroup = new THREE.Group();
    surgeGroup.name = 'modular_surge_bin';

    // Vertical rectangular surge bin body
    const binBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.4, 2.2), mats.paintedSteelSlate);
    binBody.position.set(2.8, 0.6, 0);
    binBody.castShadow = true;
    surgeGroup.add(binBody);

    // Stiffener ribs
    for (let by of [-0.6, 0.6, 1.8]) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 2.4), mats.safetyYellow);
      rib.position.set(2.8, by, 0);
      surgeGroup.add(rib);
    }

    // Horizontal pin gate cutoff comb (just like video 02:52)
    const pinComb = new THREE.Group();
    for (let pz = -0.8; pz <= 0.8; pz += 0.2) {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8), mats.safetyYellow);
      rod.rotation.z = Math.PI / 2;
      rod.position.set(2.8, -1.15, pz);
      pinComb.add(rod);
    }
    surgeGroup.add(pinComb);

    // Enclosed Weigh Belt Feeder (411-WF01) beneath bin
    const weighFeeder = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 1.4), mats.industrialSteel);
    weighFeeder.position.set(3.2, -2.1, 0);
    weighFeeder.castShadow = true;
    surgeGroup.add(weighFeeder);

    const wfMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.5), mats.motorBlue);
    wfMotor.position.set(4.8, -2.1, 0.7);
    surgeGroup.add(wfMotor);

    // Red calibration weight boxes (as seen in video 03:02)
    const calBox1 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.2), mats.safetyRed);
    calBox1.position.set(2.4, -1.8, 0.75);
    surgeGroup.add(calBox1);

    const calBox2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.2), mats.safetyRed);
    calBox2.position.set(3.4, -1.8, 0.75);
    surgeGroup.add(calBox2);

    group.add(surgeGroup);
  } else if (activeConfigId === 'config_rotary_airlock') {
    // Option B: Rotary Airlock Valve & Pneumatic Blowing Line to Calciner (as in video 03:20 - 03:29)
    const rotaryGroup = new THREE.Group();
    rotaryGroup.name = 'modular_rotary_airlock';

    // Transition feed chute
    const fChute = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.4), mats.paintedSteelSlate);
    fChute.position.set(2.6, 1.2, 0);
    rotaryGroup.add(fChute);

    // Rotary airlock cylindrical valve body (411-RV01)
    const airlockBody = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.1, 20), mats.structuralTeal);
    airlockBody.rotation.x = Math.PI / 2;
    airlockBody.position.set(2.6, -0.4, 0);
    airlockBody.castShadow = true;
    rotaryGroup.add(airlockBody);

    // Circular end-plate with inspection ports (red caps matching video 03:04)
    const redCap1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), mats.safetyRed);
    redCap1.position.set(2.6, -0.4, 0.6);
    rotaryGroup.add(redCap1);

    // Drive motor
    const rvMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.6), mats.motorBlue);
    rvMotor.position.set(2.6, -0.4, -0.9);
    rotaryGroup.add(rvMotor);

    // Pressurized pneumatic blowing pipework below airlock (heading toward calciner burner)
    const blowPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 5.5, 16), mats.industrialSteel);
    blowPipe.rotation.z = Math.PI / 2;
    blowPipe.position.set(4.5, -1.6, 0);
    blowPipe.castShadow = true;
    rotaryGroup.add(blowPipe);

    // Blower injector venturi nozzle
    const venturi = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 16), mats.safetyYellow);
    venturi.rotation.z = -Math.PI / 2;
    venturi.position.set(1.5, -1.6, 0);
    rotaryGroup.add(venturi);

    group.add(rotaryGroup);
  } else if (activeConfigId === 'config_screw_conveyor') {
    // Option C: Twin Enclosed Screw Conveyor
    const screwGroup = new THREE.Group();
    screwGroup.name = 'modular_screw_conveyor';

    const trough = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 4.8, 16, 1, false, 0, Math.PI), mats.paintedSteelSlate);
    trough.rotation.z = Math.PI / 2;
    trough.rotation.x = Math.PI;
    trough.position.set(3.8, 0, 0);
    trough.castShadow = true;
    screwGroup.add(trough);

    const lid = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.08, 1.2), mats.paintedSteelSlate);
    lid.position.set(3.8, 0.04, 0);
    screwGroup.add(lid);

    const scMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.7), mats.motorBlue);
    scMotor.rotation.z = Math.PI / 2;
    scMotor.position.set(6.4, 0, 0);
    screwGroup.add(scMotor);

    group.add(screwGroup);
  } else {
    // Option D: Direct Bypass Chute to Silo
    const bypassGroup = new THREE.Group();
    bypassGroup.name = 'modular_bypass';

    const chute = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 4.2, 14), mats.industrialSteel);
    chute.rotation.z = -0.7;
    chute.position.set(3.2, -0.6, 0);
    chute.castShadow = true;
    bypassGroup.add(chute);

    group.add(bypassGroup);
  }

  return group;
}

// 6. Realistic Cement Plant Architecture Background (Tower, Cyclone, Silo)
export function buildCementPlantBackground(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'cement_plant_background';

  // Towering Preheater Structural Tower (6-tier steel frame next to elevator)
  const tower = new THREE.Group();
  tower.position.set(28, 0, -3.5);

  const colH = 36.0;
  const colMat = mats.industrialSteel;
  const tCols = [
    [-4, -4],
    [4, -4],
    [-4, 4],
    [4, 4]
  ];

  tCols.forEach(([cx, cz]) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.6, colH, 0.6), colMat);
    col.position.set(cx, colH / 2, cz);
    col.castShadow = true;
    tower.add(col);
  });

  // Intermediate floor decks every 6m
  for (let fy = 6; fy <= 36; fy += 6) {
    const floor = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.25, 8.4), mats.steelGrating);
    floor.position.set(0, fy, 0);
    tower.add(floor);

    // Cross horizontal framing
    const beam = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.4, 8.2), mats.industrialSteel);
    beam.position.set(0, fy - 0.2, 0);
    tower.add(beam);
  }

  // Preheater Cyclone Cones (as seen in video 03:14)
  const cycloneMat = mats.paintedSteelSlate;
  const cyclone1 = new THREE.Group();
  const cBody = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 4.0, 24), cycloneMat);
  cBody.position.y = 2.0;
  cyclone1.add(cBody);
  const cCone = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 0.4, 5.0, 24), cycloneMat);
  cCone.position.y = -2.5;
  cyclone1.add(cCone);
  cyclone1.position.set(0, 18, 0);
  tower.add(cyclone1);

  // Large Kiln Gas Riser Duct (slanted duct from kiln up to cyclone)
  const duct = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 14.0, 18), mats.paintedSteelSlate);
  duct.rotation.z = 0.45;
  duct.position.set(-2.0, 10.0, 1.5);
  duct.castShadow = true;
  tower.add(duct);

  group.add(tower);

  // Concrete Raw Meal / Clinker Silo in background
  const silo = new THREE.Group();
  silo.position.set(16, 0, -14);

  const siloBody = new THREE.Mesh(new THREE.CylinderGeometry(6.0, 6.0, 24.0, 32), mats.concretePavement);
  siloBody.position.y = 12.0;
  siloBody.castShadow = true;
  siloBody.receiveShadow = true;
  silo.add(siloBody);

  const siloDome = new THREE.Mesh(new THREE.SphereGeometry(6.0, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mats.concretePavement);
  siloDome.position.y = 24.0;
  silo.add(siloDome);

  group.add(silo);

  return group;
}
