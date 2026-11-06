export type EquipmentId = 
  | 'yard_stockpile'
  | 'feeding_hopper'
  | 'belt_conveyor'
  | 'bucket_elevator'
  | 'downstream_unconfirmed'
  | 'downstream_surge_bin'
  | 'downstream_rotary_valve'
  | 'downstream_screw_conveyor';

export type StageConfirmationStatus = 'CONFIRMED' | 'UNCONFIRMED_MODULAR' | 'SITE_VERIFICATION_REQUIRED';

export interface EquipmentComponent {
  name: string;
  description: string;
  materialSpec?: string;
  inspectionInterval?: string;
}

export interface HazardItem {
  id: string;
  name: string;
  category: 'FIRE_EXPLOSION' | 'MECHANICAL' | 'HEALTH_DUST' | 'ENVIRONMENTAL_HEIGHT';
  location: string;
  status: 'CONFIRMED_IN_FOOTAGE' | 'POTENTIAL_SITE_VERIFY';
  riskLevel: 'HIGH' | 'MEDIUM' | 'CRITICAL';
  whyExists: string;
  consequences: string;
  engineeringControls: string[];
  administrativeControls: string[];
  requiredPPE: string[];
  correctiveActions: string[];
  position3D?: [number, number, number];
}

export interface EquipmentSpec {
  id: EquipmentId;
  tag: string;
  name: string;
  stageNumber: number;
  stageTitle: string;
  confirmationStatus: StageConfirmationStatus;
  purpose: string;
  workingPrinciple: string;
  operationMechanism: string;
  materialEntering: string;
  materialLeaving: string;
  mechanicalFunction: string;
  technicalSpecs: {
    label: string;
    value: string;
  }[];
  components: EquipmentComponent[];
  commonFailureModes: {
    failure: string;
    rootCause: string;
    symptom: string;
    action: string;
  }[];
  maintenanceRequirements: {
    task: string;
    frequency: string;
    procedure: string;
  }[];
  hazards: HazardItem[];
  videoTimestamp?: {
    start: number;
    description: string;
  };
  cameraTarget: [number, number, number];
  cameraPosition: [number, number, number];
}

export type ViewPreset = 'orbit' | 'top' | 'front' | 'side' | 'isometric' | 'hopper' | 'offloading' | 'conveyor' | 'elevator' | 'downstream';

export type DisplayMode = 'solid' | 'cutaway' | 'transparent';

export type AppTab = 'overview' | 'process_flow' | 'equipment_spec' | 'hse_assessment' | 'downstream_config' | 'video_reference';

export interface DownstreamOption {
  id: string;
  title: string;
  description: string;
  equipmentList: string[];
  recommendedApplication: string;
  isConfirmed: boolean;
}
