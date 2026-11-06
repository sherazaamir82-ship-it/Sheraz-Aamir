import * as THREE from 'three';

// Detect software WebGL safely
export const isSoftwareGl = (() => {
  if (typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch (e) {
    return true;
  }
})();

// Procedural Canvas Texture Helpers
function createCorrugatedTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  // Base metal gradient
  ctx.fillStyle = '#6c757d';
  ctx.fillRect(0, 0, 256, 256);
  
  // Corrugation ridges
  const ridgeWidth = 16;
  for (let x = 0; x < 256; x += ridgeWidth) {
    const grad = ctx.createLinearGradient(x, 0, x + ridgeWidth, 0);
    grad.addColorStop(0, '#50565b');
    grad.addColorStop(0.3, '#9ca3af');
    grad.addColorStop(0.6, '#ced4da');
    grad.addColorStop(1, '#50565b');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, ridgeWidth, 256);
  }

  // Subtle industrial weathering dust
  ctx.fillStyle = 'rgba(212, 163, 115, 0.15)'; // rice husk dust tint
  for (let i = 0; i < 300; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    const rw = Math.random() * 4 + 1;
    ctx.fillRect(rx, ry, rw, rw);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createHazardStripesTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#F59E0B'; // Safety Yellow
  ctx.fillRect(0, 0, 128, 128);
  
  ctx.fillStyle = '#111827'; // Dark stripe
  const stripeWidth = 24;
  for (let i = -128; i < 256; i += stripeWidth * 2) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + stripeWidth, 0);
    ctx.lineTo(i + stripeWidth + 128, 128);
    ctx.lineTo(i + 128, 128);
    ctx.closePath();
    ctx.fill();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createRubberBeltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#1e242b';
  ctx.fillRect(0, 0, 256, 256);
  
  // Fabric texture & micro-grooves
  ctx.strokeStyle = '#28313b';
  ctx.lineWidth = 2;
  for (let y = 0; y < 256; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  // Rice husk dust dusting along center track
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, 'rgba(212, 163, 115, 0.05)');
  grad.addColorStop(0.5, 'rgba(212, 163, 115, 0.35)');
  grad.addColorStop(1, 'rgba(212, 163, 115, 0.05)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSteelGratingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#4b5563';
  ctx.fillRect(0, 0, 64, 64);
  
  // Serrated grating bars
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 3;
  for (let x = 0; x < 64; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 64);
    ctx.stroke();
  }
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  for (let y = 0; y < 64; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(64, y);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createRiceHuskGrainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#c59b63';
  ctx.fillRect(0, 0, 128, 128);
  
  // Flecks of golden husk husks
  const colors = ['#dfb77c', '#a87a48', '#e9c46a', '#b08968', '#f4a261'];
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    const len = Math.random() * 4 + 2;
    const angle = Math.random() * Math.PI;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillRect(-len / 2, -1, len, 2);
    ctx.restore();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export interface MaterialLibrary {
  industrialSteel: THREE.MeshStandardMaterial;
  paintedSteelSlate: THREE.MeshStandardMaterial;
  structuralTeal: THREE.MeshStandardMaterial;
  safetyYellow: THREE.MeshStandardMaterial;
  safetyRed: THREE.MeshStandardMaterial;
  motorBlue: THREE.MeshStandardMaterial;
  corrugatedSteel: THREE.MeshStandardMaterial;
  hazardStripes: THREE.MeshStandardMaterial;
  rubberBelt: THREE.MeshStandardMaterial;
  steelGrating: THREE.MeshStandardMaterial;
  riceHuskMaterial: THREE.MeshStandardMaterial;
  concretePavement: THREE.MeshStandardMaterial;
  cutawayGlass: THREE.MeshPhysicalMaterial;
  cutawayGhosted: THREE.MeshStandardMaterial;
  warningBeacon: THREE.MeshStandardMaterial;
  beltTexture: THREE.CanvasTexture;
  highlightEmissive: THREE.MeshStandardMaterial;
}

export function buildMaterialLibrary(): MaterialLibrary {
  const corrugatedTex = createCorrugatedTexture();
  const hazardTex = createHazardStripesTexture();
  const beltTex = createRubberBeltTexture();
  const gratingTex = createSteelGratingTexture();
  const riceHuskTex = createRiceHuskGrainTexture();

  const industrialSteel = new THREE.MeshStandardMaterial({
    color: '#495057',
    metalness: 0.75,
    roughness: 0.35,
  });

  const paintedSteelSlate = new THREE.MeshStandardMaterial({
    color: '#5c677d',
    metalness: 0.4,
    roughness: 0.55,
  });

  const structuralTeal = new THREE.MeshStandardMaterial({
    color: '#0077b6',
    metalness: 0.3,
    roughness: 0.6,
  });

  const safetyYellow = new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    metalness: 0.2,
    roughness: 0.45,
  });

  const safetyRed = new THREE.MeshStandardMaterial({
    color: '#dc2626',
    metalness: 0.2,
    roughness: 0.4,
  });

  const motorBlue = new THREE.MeshStandardMaterial({
    color: '#1d4ed8',
    metalness: 0.5,
    roughness: 0.35,
  });

  const corrugatedSteel = new THREE.MeshStandardMaterial({
    map: corrugatedTex,
    color: '#b0b8c1',
    metalness: 0.65,
    roughness: 0.45,
  });

  const hazardStripes = new THREE.MeshStandardMaterial({
    map: hazardTex,
    metalness: 0.1,
    roughness: 0.5,
  });

  const rubberBelt = new THREE.MeshStandardMaterial({
    map: beltTex,
    color: '#262d35',
    metalness: 0.1,
    roughness: 0.85,
  });

  const steelGrating = new THREE.MeshStandardMaterial({
    map: gratingTex,
    color: '#9ca3af',
    metalness: 0.8,
    roughness: 0.4,
  });

  const riceHuskMaterial = new THREE.MeshStandardMaterial({
    map: riceHuskTex,
    color: '#c59b63',
    roughness: 0.95,
    metalness: 0.05,
  });

  const concretePavement = new THREE.MeshStandardMaterial({
    color: '#6c757d',
    roughness: 0.9,
    metalness: 0.1,
  });

  // Cutaway inspection glass material
  const cutawayGlass = new THREE.MeshPhysicalMaterial({
    color: '#60a5fa',
    metalness: 0.1,
    roughness: 0.15,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    transmission: isSoftwareGl ? 0 : 0.8,
    ior: 1.45,
  });

  const cutawayGhosted = new THREE.MeshStandardMaterial({
    color: '#93c5fd',
    wireframe: true,
    transparent: true,
    opacity: 0.4,
  });

  const warningBeacon = new THREE.MeshStandardMaterial({
    color: '#ef4444',
    emissive: '#dc2626',
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });

  const highlightEmissive = new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: '#0284c7',
    emissiveIntensity: 0.6,
    metalness: 0.5,
    roughness: 0.3,
  });

  return {
    industrialSteel,
    paintedSteelSlate,
    structuralTeal,
    safetyYellow,
    safetyRed,
    motorBlue,
    corrugatedSteel,
    hazardStripes,
    rubberBelt,
    steelGrating,
    riceHuskMaterial,
    concretePavement,
    cutawayGlass,
    cutawayGhosted,
    warningBeacon,
    beltTexture: beltTex,
    highlightEmissive,
  };
}
