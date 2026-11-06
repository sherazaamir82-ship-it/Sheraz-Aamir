import * as THREE from 'three';
import { MaterialLibrary } from './materials';
import { ArticulatedLoader } from './proceduralModels';

export type SimState = 'playing' | 'paused' | 'stopped';

export interface SimulationParams {
  speed: number;
  state: SimState;
}

export class SimulationManager {
  private particlesGroup: THREE.Group;
  private particleCount: number = 850;
  private particlePositions: Float32Array;
  private particleProgress: Float32Array;
  private particlePoints: THREE.Points;

  // Truck offloading particles
  private truckOffloadCount: number = 80;
  private truckOffloadPositions: Float32Array;
  private truckOffloadPoints: THREE.Points;

  // Loader dumping into hopper particles
  private loaderDumpCount: number = 100;
  private loaderDumpPositions: Float32Array;
  private loaderDumpPoints: THREE.Points;

  private mats: MaterialLibrary;
  private beltMesh: THREE.Mesh | null = null;
  private drivePulley: THREE.Mesh | null = null;
  private tailPulley: THREE.Mesh | null = null;
  private elevatorBuckets: THREE.Mesh[] = [];
  private loader: ArticulatedLoader | null = null;
  private truckCascade: THREE.Mesh | null = null;
  private apronPans: THREE.Mesh[] = [];
  private preheaterBeltMesh: THREE.Mesh | null = null;
  private calcinerFlameLight: THREE.PointLight | null = null;

  private loaderCycleTime: number = 0; // 0 to 1 loop cycle
  private totalSimTime: number = 0;
  
  public state: SimState = 'playing';
  public speedMultiplier: number = 1.0;

  constructor(
    mats: MaterialLibrary,
    beltMesh: THREE.Mesh,
    drivePulley: THREE.Mesh,
    tailPulley: THREE.Mesh,
    elevatorBuckets: THREE.Mesh[],
    loader?: ArticulatedLoader,
    truckCascade?: THREE.Mesh,
    apronPans?: THREE.Mesh[],
    preheaterBeltMesh?: THREE.Mesh,
    calcinerFlameLight?: THREE.PointLight
  ) {
    this.mats = mats;
    this.beltMesh = beltMesh;
    this.drivePulley = drivePulley;
    this.tailPulley = tailPulley;
    this.elevatorBuckets = elevatorBuckets;
    this.loader = loader || null;
    this.truckCascade = truckCascade || null;
    this.apronPans = apronPans || [];
    this.preheaterBeltMesh = preheaterBeltMesh || null;
    this.calcinerFlameLight = calcinerFlameLight || null;

    this.particlesGroup = new THREE.Group();
    this.particlesGroup.name = 'rice_husk_simulation_particles';

    // 1. Primary process stream particles (Conveyor, elevator, downstream)
    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleProgress = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      this.particleProgress[i] = Math.random();
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    // Procedural Rice Husk Particle Texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d')!;
    pCtx.fillStyle = '#E9C46A';
    pCtx.beginPath();
    pCtx.ellipse(16, 16, 14, 7, Math.PI / 4, 0, Math.PI * 2);
    pCtx.fill();
    pCtx.fillStyle = '#BC6C25';
    pCtx.fillRect(14, 4, 4, 24);

    const pTex = new THREE.CanvasTexture(pCanvas);
    pTex.colorSpace = THREE.SRGBColorSpace;

    const pMat = new THREE.PointsMaterial({
      size: 0.35,
      map: pTex,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      color: 0xffffff,
    });

    this.particlePoints = new THREE.Points(geom, pMat);
    this.particlesGroup.add(this.particlePoints);

    // 2. Dedicated Truck Offloading Particles (pouring out of Bedford truck side into bay)
    this.truckOffloadPositions = new Float32Array(this.truckOffloadCount * 3);
    const truckGeom = new THREE.BufferGeometry();
    truckGeom.setAttribute('position', new THREE.BufferAttribute(this.truckOffloadPositions, 3));
    this.truckOffloadPoints = new THREE.Points(truckGeom, pMat);
    this.particlesGroup.add(this.truckOffloadPoints);

    for (let i = 0; i < this.truckOffloadCount; i++) {
      this.resetTruckParticle(i);
    }

    // 3. Dedicated Loader Dumping into Hopper Grizzly Particles
    this.loaderDumpPositions = new Float32Array(this.loaderDumpCount * 3);
    const dumpGeom = new THREE.BufferGeometry();
    dumpGeom.setAttribute('position', new THREE.BufferAttribute(this.loaderDumpPositions, 3));
    this.loaderDumpPoints = new THREE.Points(dumpGeom, pMat);
    this.particlesGroup.add(this.loaderDumpPoints);

    for (let i = 0; i < this.loaderDumpCount; i++) {
      this.resetLoaderDumpParticle(i);
    }

    this.updatePositions();
  }

  private resetTruckParticle(i: number) {
    const i3 = i * 3;
    // Originates from truck side door at (-13.5, 2.4, -6.8)
    this.truckOffloadPositions[i3] = -13.6 + (Math.random() - 0.5) * 0.4;
    this.truckOffloadPositions[i3 + 1] = 2.4 - Math.random() * 0.2;
    this.truckOffloadPositions[i3 + 2] = -6.8 + (Math.random() - 0.5) * 2.2;
  }

  private resetLoaderDumpParticle(i: number) {
    const i3 = i * 3;
    // Spills from loader bucket mouth over hopper grizzly: x ~ -1.5, y ~ 7.2, z ~ 0
    this.loaderDumpPositions[i3] = -1.6 + Math.random() * 0.6;
    this.loaderDumpPositions[i3 + 1] = 7.1 - Math.random() * 0.3;
    this.loaderDumpPositions[i3 + 2] = (Math.random() - 0.5) * 1.8;
  }

  public getGroup(): THREE.Group {
    return this.particlesGroup;
  }

  public play() {
    this.state = 'playing';
  }

  public pause() {
    this.state = 'paused';
  }

  public stop() {
    this.state = 'stopped';
    for (let i = 0; i < this.particleCount; i++) {
      this.particleProgress[i] = (i / this.particleCount) * 0.2;
    }
    this.updatePositions();
  }

  public restart() {
    this.stop();
    this.play();
  }

  public setSpeed(multiplier: number) {
    this.speedMultiplier = Math.max(0.1, Math.min(3.0, multiplier));
  }

  public update(delta: number) {
    if (this.state !== 'playing') return;

    const effectiveDelta = delta * this.speedMultiplier;

    // 1. Animate Conveyor Belt Texture
    if (this.mats.beltTexture) {
      this.mats.beltTexture.offset.y -= effectiveDelta * 0.65;
    }

    // 2. Animate Pulleys rotation
    if (this.drivePulley) {
      this.drivePulley.rotation.x += effectiveDelta * 4.2;
    }
    if (this.tailPulley) {
      this.tailPulley.rotation.x += effectiveDelta * 4.2;
    }

    // 3. Animate Elevator Buckets vertical loop
    const numBuckets = this.elevatorBuckets.length;
    const loopTravel = 2 * (27.2 - 2.4);
    const bucketSpeed = 1.6 * effectiveDelta;

    this.elevatorBuckets.forEach((bucket, idx) => {
      if ((bucket as any).loopT === undefined) {
        (bucket as any).loopT = idx / numBuckets;
      }
      (bucket as any).loopT = ((bucket as any).loopT + (bucketSpeed / loopTravel)) % 1.0;
      const t = (bucket as any).loopT;

      if (t < 0.5) {
        const upProgress = t / 0.5;
        bucket.position.set(0, 2.4 + upProgress * (27.2 - 2.4), -0.42);
        bucket.rotation.x = 0;
        bucket.visible = true;
      } else {
        const downProgress = (t - 0.5) / 0.5;
        bucket.position.set(0, 27.2 - downProgress * (27.2 - 2.4), 0.42);
        bucket.rotation.x = Math.PI;
        bucket.visible = true;
      }
    });

    // 4. Animate Articulated Wheel Loader Feeding Cycle
    // Cycle runs continuously in ~9 seconds
    this.loaderCycleTime = (this.loaderCycleTime + effectiveDelta * 0.11) % 1.0;
    const lt = this.loaderCycleTime;

    let isDumpingActive = false;

    if (this.loader) {
      const { loaderGroup, boomGroup, bucketGroup, huskInBucket } = this.loader;

      if (lt < 0.22) {
        // Phase 1: Scooping at stockpile (x = -7.8, y = 0.4)
        loaderGroup.position.set(-7.8, 0.4, 0);
        boomGroup.rotation.x = 0.15; // lowered boom
        bucketGroup.rotation.x = 0.05; // flat bucket
        huskInBucket.visible = true;
        huskInBucket.scale.set(1, 1, 1);
      } else if (lt < 0.46) {
        // Phase 2: Driving up the ramp toward hopper (x: -7.8 -> -2.2, y: 0.4 -> 2.8)
        const p = (lt - 0.22) / 0.24;
        const xPos = -7.8 + p * 5.6;
        const yPos = 0.4 + p * 2.4;
        loaderGroup.position.set(xPos, yPos, 0);

        // Raise hydraulic boom smoothly
        boomGroup.rotation.x = 0.15 - p * 0.65; // lifts boom
        bucketGroup.rotation.x = 0.05 + p * 0.15; // slight curl back to hold husk
        huskInBucket.visible = true;
        huskInBucket.scale.set(1, 1, 1);
      } else if (lt < 0.70) {
        // Phase 3: At Hopper Top Opening, Dumping into Grizzly Screen!
        isDumpingActive = true;
        const p = (lt - 0.46) / 0.24;
        loaderGroup.position.set(-2.2, 2.8, 0);
        boomGroup.rotation.x = -0.5; // High boom

        // Bucket tilts down forward (-55 deg)
        const dumpAngle = Math.min(0.95, p * 1.6);
        bucketGroup.rotation.x = -dumpAngle;

        // Husk in bucket empties
        const remHusk = Math.max(0, 1.0 - p * 1.5);
        huskInBucket.scale.set(remHusk, remHusk, remHusk);
      } else if (lt < 0.94) {
        // Phase 4: Reversing down the ramp (x: -2.2 -> -7.8, y: 2.8 -> 0.4)
        const p = (lt - 0.70) / 0.24;
        const xPos = -2.2 - p * 5.6;
        const yPos = 2.8 - p * 2.4;
        loaderGroup.position.set(xPos, yPos, 0);

        // Return bucket and boom to travel position
        bucketGroup.rotation.x = -0.95 + p * 1.0;
        boomGroup.rotation.x = -0.5 + p * 0.65;
        huskInBucket.visible = false;
      } else {
        // Phase 5: Re-aligning at pile
        loaderGroup.position.set(-7.8, 0.4, 0);
        boomGroup.rotation.x = 0.15;
        bucketGroup.rotation.x = 0.05;
        huskInBucket.visible = true;
        huskInBucket.scale.set(1, 1, 1);
      }
    }

    // 5. Animate Loader Dumping Particles into Hopper Grizzly
    const dumpPos = this.loaderDumpPositions;
    for (let i = 0; i < this.loaderDumpCount; i++) {
      const i3 = i * 3;
      if (isDumpingActive) {
        dumpPos[i3 + 1] -= effectiveDelta * (5.5 + (i % 5)); // Gravity fall
        dumpPos[i3] += (Math.random() - 0.5) * 0.04;
        // If particle reaches bottom of hopper throat (y < 2.0), reset to top
        if (dumpPos[i3 + 1] < 2.0) {
          this.resetLoaderDumpParticle(i);
        }
      } else {
        // Hide particles offscreen when not dumping
        dumpPos[i3 + 1] = -10;
      }
    }
    this.loaderDumpPoints.geometry.attributes.position.needsUpdate = true;

    // 6. Animate Truck Offloading Stream (pouring from Bedford truck side into bay)
    const truckPos = this.truckOffloadPositions;
    for (let i = 0; i < this.truckOffloadCount; i++) {
      const i3 = i * 3;
      truckPos[i3 + 1] -= effectiveDelta * (3.8 + (i % 4));
      truckPos[i3] += (Math.random() - 0.5) * 0.05;
      truckPos[i3 + 2] += (Math.random() - 0.5) * 0.08;

      if (truckPos[i3 + 1] < 0.2) {
        this.resetTruckParticle(i);
      }
    }
    this.truckOffloadPoints.geometry.attributes.position.needsUpdate = true;

    // 7. Animate Apron Feeder interlocking pans slow advance
    if (this.apronPans.length > 0) {
      const panSpeed = effectiveDelta * 0.35;
      this.apronPans.forEach((pan) => {
        pan.position.x += panSpeed;
        if (pan.position.x > 5.18) {
          pan.position.x = 0.5 + (pan.position.x - 5.18);
        }
      });
    }

    // 8. Animate Calciner flame flicker
    this.totalSimTime += effectiveDelta;
    if (this.calcinerFlameLight) {
      this.calcinerFlameLight.intensity =
        3.2 + Math.sin(this.totalSimTime * 9.0) * 0.7 + Math.sin(this.totalSimTime * 23.0) * 0.35;
    }

    // 9. Animate Main Process Stream Particles (Full 7-Stage Cement Plant Flow)
    const pathSpeed = 0.042 * effectiveDelta;
    for (let i = 0; i < this.particleCount; i++) {
      this.particleProgress[i] = (this.particleProgress[i] + pathSpeed) % 1.0;
    }

    this.updatePositions();
  }

  private updatePositions() {
    const pos = this.particlePositions;

    for (let i = 0; i < this.particleCount; i++) {
      const t = this.particleProgress[i];
      const i3 = i * 3;
      const seedZ = ((i * 17) % 100) / 100 - 0.5;
      const seedX = ((i * 31) % 10) / 10 - 0.5;

      if (t < 0.08) {
        // Stage 1: Primary Hopper gravity drop through throat into feeder boot
        const s = t / 0.08;
        const spread = (1.0 - s) * 0.7;
        pos[i3] = 0 + seedX * spread;
        pos[i3 + 1] = 6.2 - s * 4.7;
        pos[i3 + 2] = seedZ * spread;
      } else if (t < 0.32) {
        // Stage 2: Inclined Covered Belt Conveyor (411-BC01) travel
        const s = (t - 0.08) / 0.24;
        pos[i3] = 0.2 + s * 19.4;
        pos[i3 + 1] = 1.45 + s * 4.45 + Math.sin(s * Math.PI * 8) * 0.015;
        pos[i3 + 2] = seedZ * 0.42;
      } else if (t < 0.37) {
        // Conveyor discharge chute tumble into Bucket Elevator Boot
        const s = (t - 0.32) / 0.05;
        pos[i3] = 19.6 + s * 1.4;
        pos[i3 + 1] = 5.9 - s * 3.5;
        pos[i3 + 2] = ((i % 5) - 2) * 0.08;
      } else if (t < 0.60) {
        // Stage 3: Vertical Bucket Elevator (411-BE01) lift up to +28m
        const s = (t - 0.37) / 0.23;
        pos[i3] = 21.0 + seedX * 0.12;
        pos[i3 + 1] = 2.4 + s * 24.8;
        pos[i3 + 2] = -0.42 + ((i % 4) - 2) * 0.06;
      } else if (t < 0.65) {
        // Elevator Head discharge chute arc dropping onto Apron Feeder intake
        const s = (t - 0.60) / 0.05;
        pos[i3] = 21.1 + s * 1.7;
        pos[i3 + 1] = 27.2 - s * 1.6 - Math.pow(s, 2) * 0.4;
        pos[i3 + 2] = seedZ * 0.25;
      } else if (t < 0.76) {
        // Stage 4: Apron Feeder (411-AF01) horizontal metered conveying
        const s = (t - 0.65) / 0.11;
        pos[i3] = 22.8 + s * 4.6; // x: 22.8 -> 27.4
        pos[i3 + 1] = 25.6 + Math.sin(s * 18) * 0.015;
        pos[i3 + 2] = seedZ * 0.45;
      } else if (t < 0.80) {
        // Apron Feeder discharge drop into Preheater Conveyor loading skirt
        const s = (t - 0.76) / 0.04;
        pos[i3] = 27.4 + s * 0.5;
        pos[i3 + 1] = 25.6 - s * 1.5;
        pos[i3 + 2] = seedZ * 0.2;
      } else if (t < 0.94) {
        // Stage 5: Preheater Gallery Belt Conveyor (411-BC02) bridge transport
        const s = (t - 0.80) / 0.14;
        pos[i3] = 27.9 + s * 13.6; // x: 27.9 -> 41.5
        pos[i3 + 1] = 24.1 + Math.sin(s * Math.PI * 6) * 0.01;
        pos[i3 + 2] = seedZ * 0.38;
      } else {
        // Stage 6: Preheater Calciner (411-PH01) injection & 900°C combustion fireball
        const s = (t - 0.94) / 0.06;
        pos[i3] = 41.5 + s * 2.5;
        pos[i3 + 1] = 24.1 - s * 4.2 - Math.pow(s, 2) * 1.5;
        pos[i3 + 2] = Math.sin(s * 12 + i) * 0.4 * s;
      }
    }

    this.particlePoints.geometry.attributes.position.needsUpdate = true;
  }
}
