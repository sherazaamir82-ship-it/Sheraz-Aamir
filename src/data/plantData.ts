import { EquipmentSpec, DownstreamOption, HazardItem } from '../types/plant';

export const EQUIPMENT_DATABASE: Record<string, EquipmentSpec> = {
  yard_stockpile: {
    id: 'yard_stockpile',
    tag: '411-YD01',
    name: 'Truck Offloading Bay & Yard Stockpiles',
    stageNumber: 0,
    stageTitle: 'Stage 0: Bulk Truck Offloading & Yard Reception',
    confirmationStatus: 'CONFIRMED',
    purpose: 'Receives bulk deliveries of agricultural rice husk from road transport trucks via side and rear gate offloading, provides buffer storage, and stages material for loader charging.',
    workingPrinciple: 'Heavy haul trucks pull into the storage bays and offload loose rice husk (bulk density ~100-140 kg/m³) by dropping side wooden/metal gates and burlap curtains. A front-end wheel loader (CAT 950B) scoops the material and builds compacted ramps leading directly to the primary reception hopper intake.',
    operationMechanism: 'Periodic bulk discharging from Bedford-type open-bed trucks with fabric side covers. Bulk loaders transfer material in 3.5 m³ cycles into the hopper grizzly.',
    materialEntering: 'Raw uncompacted rice husk (moisture 8-12%, bulk density ~0.12 t/m³, calorific value ~3,000-3,400 kcal/kg).',
    materialLeaving: 'Metered scoops transferred via front-end loader into the hopper intake screen.',
    mechanicalFunction: 'Non-mechanical buffer storage area; wheel loader hydraulic boom and high-flotation tires manage husk compaction and dust kick-up.',
    technicalSpecs: [
      { label: 'Bulk Density', value: '110 – 140 kg/m³' },
      { label: 'Yard Storage Capacity', value: 'approx. 450 – 600 tonnes' },
      { label: 'Retaining Walls', value: 'Intermodal 40ft containers stacked 2-high' },
      { label: 'Mobile Fleet', value: '1x CAT 950B Wheel Loader (3.1 m³ bucket)' },
      { label: 'Tipping Method', value: 'Manual/gravity side & rear gate discharge' },
    ],
    components: [
      { name: 'Paved Concrete Yard Slab', description: 'Abrasion-resistant reinforced slab graded for water drainage.' },
      { name: 'Container Baffle Walls', description: 'Repurposed shipping containers acting as windbreaks and bay segregators.' },
      { name: 'Wheel Loader (CAT 950B)', description: 'Articulated diesel wheel loader with high-capacity light-material bucket.' },
      { name: 'Ramp Approach', description: 'Compacted rice husk incline allowing loader direct dump height into hopper.' },
    ],
    commonFailureModes: [
      { failure: 'Airborne Fugitive Dust Dispersion', rootCause: 'High ambient wind velocity across dry loose husk piles.', symptom: 'Dense dust cloud reducing visibility; ambient dust threshold exceedance.', action: 'Deploy mist cannons/water fogging curtains around container perimeters.' },
      { failure: 'Smoldering Deep-Bed Fire', rootCause: 'Spontaneous combustion or stray spark from truck exhaust into dry pile.', symptom: 'Sweet organic smoke smell, localized hot spots detected by thermal camera.', action: 'Isolate burning pocket with loader, douse with water, and monitor with thermal imaging.' },
      { failure: 'Foreign Tramp Ingestion', rootCause: 'Stones, baling wire, or wood blocks mixed in farm deliveries.', symptom: 'Chute jamming, belt puncture downstream.', action: 'Enforce visual inspection at gate; maintain hopper grizzly screen intact.' }
    ],
    maintenanceRequirements: [
      { task: 'Yard Housekeeping & Sweep-down', frequency: 'Daily', procedure: 'Sweep loose husk spillage away from vehicle roadways and electrical cable runs.' },
      { task: 'Thermal Hotspot Inspection', frequency: 'Every 4 Hours', procedure: 'Handheld infrared thermography sweep across deep storage piles.' },
      { task: 'Loader Air Intake Filter Clean', frequency: 'Every 8 Hours', procedure: 'Blow down engine air filters due to extreme airborne husk particulates.' }
    ],
    hazards: [
      {
        id: 'HAZ-YD-01',
        name: 'Open Yard Smoldering & Rapid Flame Propagation',
        category: 'FIRE_EXPLOSION',
        location: 'Biomass Yard & Storage Piles',
        status: 'CONFIRMED_IN_FOOTAGE',
        riskLevel: 'HIGH',
        whyExists: 'Rice husk contains volatile organics with high surface-area-to-volume ratio; very susceptible to sparks or truck exhaust contact.',
        consequences: 'Rapid uncontrolled surface flash fire, engulfment of mobile equipment and container bays.',
        engineeringControls: ['Perimeter fire hydrants and foam monitors', 'Automatic water mist cannons', 'Spark arrestors on loader and truck exhausts'],
        administrativeControls: ['Strict No-Smoking policy strictly enforced', 'Hot work permit mandatory within 30m', 'Designated truck staging zone'],
        requiredPPE: ['Flame-retardant high-vis coveralls', 'P2/N95 dust respirators', 'Safety footwear', 'Safety goggles'],
        correctiveActions: ['Install thermal imaging camera for continuous pile monitoring', 'Maintain emergency water bowser on standby'],
        position3D: [-14, 1.5, -4]
      },
      {
        id: 'HAZ-YD-02',
        name: 'Mobile Equipment & Pedestrian Collision',
        category: 'MECHANICAL',
        location: 'Loader Haul Path between Pile and Hopper',
        status: 'CONFIRMED_IN_FOOTAGE',
        riskLevel: 'HIGH',
        whyExists: 'CAT loader moving continuously in reverse and forward through dust plumes with blind spots.',
        consequences: 'Crushing or fatal strike of ground personnel.',
        engineeringControls: ['Radar/ultrasonic proximity sensors on loader', 'Audible reverse alarm and flashing amber strobe', 'Physical segregated walkway'],
        administrativeControls: ['Pedestrians banned from loader operating envelope', 'Radio communication between operator and supervisor'],
        requiredPPE: ['Class 3 High-Visibility Vest', 'Safety Helmet', 'High-decibel whistle/horn'],
        correctiveActions: ['Install painted bollard walkways separating personnel traffic from loader path'],
        position3D: [-8, 2, 0]
      }
    ],
    videoTimestamp: {
      start: 5,
      description: 'Truck tipping rice husk and CAT 950B loader scooping pile'
    },
    cameraTarget: [-15, 2.5, -4],
    cameraPosition: [-22, 6.5, 8]
  },

  feeding_hopper: {
    id: 'feeding_hopper',
    tag: '411-HP01',
    name: 'Primary Feeding Hopper & Grizzly Shelter',
    stageNumber: 1,
    stageTitle: 'Stage 1: Primary Feeding Hopper',
    confirmationStatus: 'CONFIRMED',
    purpose: 'Receives periodic bulk dumps of rice husk from wheel loader bucket, prevents oversized foreign objects from entering, and delivers a controlled flow onto the belt conveyor.',
    workingPrinciple: 'Inverted steel pyramid hopper with corrugated steel weather shed. Material dumped onto the top grizzly screen falls through into the hopper basin. The hopper bottom feeds the conveyor tail section through an adjustable skirt chute with manual needle/rod gate control.',
    operationMechanism: 'Gravity feed with internal wall angle (65°) exceeding the angle of repose of rice husk (approx. 45-50°), assisted by external eccentric vibrators to prevent bridging or rat-holing.',
    materialEntering: 'Batch dumps (3.1 m³ / ~400 kg per bucket) of loose rice husk from loader.',
    materialLeaving: 'Continuous gravity stream discharging through bottom transition neck onto belt conveyor tail.',
    mechanicalFunction: 'Surge dampening from intermittent loader bucket dumping into steady-state volumetric discharge.',
    technicalSpecs: [
      { label: 'Holding Volume', value: '25 – 35 m³' },
      { label: 'Grizzly Screen Aperture', value: '80 mm x 80 mm heavy bar grid' },
      { label: 'Hopper Wall Slope', value: '62° – 68° with low-friction UHMWPE liners' },
      { label: 'Discharge Neck Dimension', value: '800 mm x 1200 mm' },
      { label: 'Shelter Structure', value: 'Corrugated steel canopy and structural wind baffles' },
      { label: 'Flow Assist', value: '2x Pneumatic / electric vibrator pads' },
    ],
    components: [
      { name: 'Weather Protection Canopy', description: 'Protective corrugated metal roof preventing rainwater from saturating husk.' },
      { name: 'Heavy-Duty Grizzly Screen', description: 'Welded steel bar grate retaining rocks, roots, or steel straps.' },
      { name: 'Inverted Steel Chute Body', description: 'Fabricated 6mm structural steel plate with stiffener channels.' },
      { name: 'Adjustable Needle / Pin Gate', description: 'Comb-like steel rods inserted horizontally to restrict or shut off flow.' },
      { name: 'Skirtboard Sealing Rubber', description: 'Dual-seal polyurethane side skirting preventing spillage onto tail pulley.' },
      { name: 'Pneumatic Bin Vibrators', description: 'Vibratory flow motivators breaking material bridges in low-density husk.' },
    ],
    commonFailureModes: [
      { failure: 'Material Bridging / Arching', rootCause: 'Interlocking fibrous husk husks forming a self-supporting arch over outlet.', symptom: 'Loader dumps into hopper but no material discharges onto conveyor.', action: 'Activate hopper vibrator pads; manually prod through inspection port with non-sparking brass rod.' },
      { failure: 'Grizzly Screen Blindness', rootCause: 'Accumulation of burlap sacks, plastic bags, or twine over grid bars.', symptom: 'Husk spilling over hopper rim rather than passing through grid.', action: 'Stop loader dumping, apply LOTO on conveyor, rake clear screen surface.' },
      { failure: 'Neck Chute Wear Liner Detachment', rootCause: 'Continuous abrasive impact of silica-rich rice husk on chute throat.', symptom: 'Wear holes in hopper casing plate; dust leakage.', action: 'Replace UHMWPE / Hardox wear plates during scheduled shutdown.' }
    ],
    maintenanceRequirements: [
      { task: 'Grizzly Bar & Structural Weld Inspection', frequency: 'Weekly', procedure: 'Visual and tap check for cracked welds from loader bucket impact.' },
      { task: 'Skirt Rubber Height Adjustment', frequency: 'Bi-Weekly', procedure: 'Set skirt rubber 2mm off moving belt to prevent belt groove wear.' },
      { task: 'Vibrator Mount Bolt Torque Check', frequency: 'Monthly', procedure: 'Torque check M20 bolts on vibrator mounting plates to 320 Nm.' }
    ],
    hazards: [
      {
        id: 'HAZ-HP-01',
        name: 'Hopper Engulfment & Suffocation Hazard',
        category: 'MECHANICAL',
        location: 'Inside Feeding Hopper Basin (411-HP01)',
        status: 'CONFIRMED_IN_FOOTAGE',
        riskLevel: 'CRITICAL',
        whyExists: 'Personnel entering hopper to unblock bridged husk can trigger collapse of false cavity; low bulk density husk causes instantaneous asphyxiation.',
        consequences: 'Fatal entrapment and suffocation under collapsing biomass.',
        engineeringControls: ['Permanent grizzly screen bolted in place', 'Fixed safety harness anchor beam above hopper', 'External poke holes with safety flaps'],
        administrativeControls: ['Strict Confined Space Entry Permit', 'Zero-energy lock-out of upstream loader and downstream belt', 'Attendant on constant standby'],
        requiredPPE: ['Full body rescue harness with tripod retrieval lifeline', 'Dust mask', 'Hardhat'],
        correctiveActions: ['Install pneumatic air blasters to eliminate need for manual entry'],
        position3D: [0, 4.5, 0]
      },
      {
        id: 'HAZ-HP-02',
        name: 'Combustible Dust Cloud Flash Fire at Intake Neck',
        category: 'FIRE_EXPLOSION',
        location: 'Hopper Discharge Neck / Skirt Zone',
        status: 'CONFIRMED_IN_FOOTAGE',
        riskLevel: 'HIGH',
        whyExists: 'Sudden dump creates suspended dust cloud; mechanical friction from loader teeth or tramp metal striking steel creates ignition spark.',
        consequences: 'Deflagration flash fire spreading into covered conveyor enclosure.',
        engineeringControls: ['Dust extraction hood connection', 'Water mist suppression nozzles at discharge lip', 'Grizzly screen made of spark-resistant wear material'],
        administrativeControls: ['No loader bucket metal-to-metal scraping', 'Regular clean-up of dry dust deposits on structure'],
        requiredPPE: ['Anti-static flame retardant overalls', 'Face shield', 'P3 dust respirator'],
        correctiveActions: ['Fit automatic flame detector and fast-acting suppression deluge valve'],
        position3D: [0, 2, 0]
      }
    ],
    videoTimestamp: {
      start: 55,
      description: 'Wheel loader discharging full bucket into sheltered feeding hopper'
    },
    cameraTarget: [-1.5, 5.0, 0],
    cameraPosition: [-10, 8.5, 9.5]
  },

  belt_conveyor: {
    id: 'belt_conveyor',
    tag: '411-BC01',
    name: 'Inclined Covered Belt Conveyor & Drive Station',
    stageNumber: 2,
    stageTitle: 'Stage 2: Inclined Belt Conveyor',
    confirmationStatus: 'CONFIRMED',
    purpose: 'Transports rice husk continuously from the hopper discharge neck up an incline of ~14° to the intake boot of the vertical bucket elevator.',
    workingPrinciple: 'An endless multi-ply rubber belt supported on 3-roll troughing idlers (35° angle). Driven by a head-mounted electric motor via a reduction gearbox and fluid coupling. Fitted with corrugated semicircular weather and dust hood covers along the entire length to eliminate fugitive dust and rain ingress.',
    operationMechanism: 'Continuous linear conveying at 1.8 m/s. Material is centered by troughing idlers. A self-cleaning overband magnetic separator removes ferrous debris before discharge into the elevator.',
    materialEntering: 'Regulated stream of rice husk from feeding hopper skirt.',
    materialLeaving: 'Continuous stream cascading off head pulley into the bucket elevator feed chute.',
    mechanicalFunction: 'Continuous bulk elevation and horizontal translation with automated speed monitoring and zero-speed interlocking.',
    technicalSpecs: [
      { label: 'Belt Width', value: '800 mm' },
      { label: 'Conveyor Length (C-C)', value: '26.5 meters' },
      { label: 'Inclination Angle', value: '14°' },
      { label: 'Belt Speed', value: '1.6 – 1.8 m/s' },
      { label: 'Design Capacity', value: '15 – 25 tonnes/hour (low density biomass)' },
      { label: 'Drive Motor', value: '30 kW, 4-pole, IP55, TEFC 400V 50Hz' },
      { label: 'Gearbox', value: 'Helical-bevel reduction unit (Ratio ~1:25)' },
      { label: 'Idler Trough Angle', value: '35° 3-roll idlers, 127mm dia.' },
      { label: 'Cover Type', value: 'Corrugated semicircular galvanized hood covers with inspection hatches' },
      { label: 'Safety Devices', value: 'Pull-wire emergency stop cord, belt sway switches, zero-speed monitor, chute plug detector' },
    ],
    components: [
      { name: 'Corrugated Dust Hoods', description: 'Curved galvanized steel covers enclosing belt to suppress fugitive rice husk dust and prevent wind loss.' },
      { name: 'Head Drive Pulley & Lagging', description: 'Rubber-lagged driving drum providing high traction without belt slip.' },
      { name: 'Drive Motor & Helical Gearbox', description: 'Heavy-duty foot-mounted motor and shaft-mounted reduction gear with torque arm.' },
      { name: 'Troughing Idlers (35°)', description: 'Three equal rollers in welded cradle forming trough cross-section for maximum material volume.' },
      { name: 'Overhead Tramp Magnet (411-MS01)', description: 'Cross-belt permanent/electromagnetic separator extracting tramp iron (bolts, nails, wire).' },
      { name: 'Emergency Pull-Wire Switch', description: 'Full-length trip wire along the maintenance walkway for instant operator stop.' },
      { name: 'Screw Take-Up Tensioner', description: 'Threaded spindle adjustment on tail pulley frame maintaining correct belt elongation.' },
      { name: 'Maintenance Walkway & Handrails', description: 'Galvanized grating walkway with standard 1100mm handrails and 150mm kick-plates.' },
    ],
    commonFailureModes: [
      { failure: 'Belt Slip on Head Pulley', rootCause: 'Loss of take-up tension or wet husk dust paste accumulating on drive drum.', symptom: 'Zero-speed sensor trips conveyor; smoke/burning rubber odor at head.', action: 'Check take-up carriage tension; clean pulley lagging; inspect belt underside scraper.' },
      { failure: 'Belt Drift / Mistracking', rootCause: 'Off-center hopper loading, uneven idler wear, or buildup on return idlers.', symptom: 'Belt edge rubs against structural stringer, activating sway switch.', action: 'Adjust training idlers, level hopper loading chute, replace sticky return idler rolls.' },
      { failure: 'Discharge Chute Blockage', rootCause: 'High moisture husk agglomeration at transition chute into bucket elevator boot.', symptom: 'Material backs up around head pulley, triggering tilt level switch.', action: 'Immediately interlock stop upstream feeder; clear chute using inspection flap.' }
    ],
    maintenanceRequirements: [
      { task: 'Pulley Lagging & Belt Cleaner Inspection', frequency: 'Daily', procedure: 'Verify primary and secondary polyurethane belt scrapers are contacting cleanly without chatter.' },
      { task: 'Gearbox Oil Level & Bearing Greasing', frequency: 'Monthly', procedure: 'Check synthetic gear oil level in sight glass; lubricate pillow block bearings with lithium complex grease.' },
      { task: 'Pull-Wire Trip Test', frequency: 'Monthly', procedure: 'Physically pull cord at several walkway locations to verify microswitch contact and PLC trip response.' }
    ],
    hazards: [
      {
        id: 'HAZ-BC-01',
        name: 'In-Running Nip Points at Head and Tail Pulleys',
        category: 'MECHANICAL',
        location: 'Conveyor Head Pulley and Tail Take-up Drum',
        status: 'CONFIRMED_IN_FOOTAGE',
        riskLevel: 'CRITICAL',
        whyExists: 'High-tension moving belt wrapping around rotating drums creates lethal pinch and entanglement points.',
        consequences: 'Severe limb crushing, amputation, or fatal entanglement.',
        engineeringControls: ['Fully enclosed mesh side guards extending 1.2m beyond pulley center', 'Interlocked guard interlocks on inspection panels', 'Emergency pull-wire cord along entire walkway'],
        administrativeControls: ['Zero-energy lockout (LOTO) mandatory before any cleaning or lubrication', 'Prohibition of loose clothing or jewelry'],
        requiredPPE: ['Snug-fit work clothing', 'Heavy leather work gloves (when de-energized)', 'Safety glasses'],
        correctiveActions: ['Install yellow heavy-duty wire mesh nip guards with captive fasteners'],
        position3D: [12, 4.5, 0]
      },
      {
        id: 'HAZ-BC-02',
        name: 'Dust Accumulation & Fire Under Conveyor Enclosure',
        category: 'FIRE_EXPLOSION',
        location: 'Along Belt Deck beneath Corrugated Hoods',
        status: 'CONFIRMED_IN_FOOTAGE',
        riskLevel: 'HIGH',
        whyExists: 'Rice husk contains fine fibrous dust; friction from seized idler roller heats up accumulated dust to ignition temperature (~400°C).',
        consequences: 'Conveyor belt ignition, rapid fire propagation along conveyor gallery into bucket elevator tower.',
        engineeringControls: ['Bearing temperature sensors on head/tail pulleys', 'Rotation sensors on idler rolls', 'Linear heat detection cable inside hoods'],
        administrativeControls: ['Regular dust washdown / vacuuming under hoods', 'Idler roll listening and acoustic checks'],
        requiredPPE: ['Flame-retardant clothing', 'N95 respirator'],
        correctiveActions: ['Install pressurized water deluge line with fusible bulb sprinkler heads inside hood structure'],
        position3D: [8, 3, 0]
      },
      {
        id: 'HAZ-BC-03',
        name: 'Working at Height along Incline Walkway',
        category: 'ENVIRONMENTAL_HEIGHT',
        location: 'Elevated Conveyor Trestle Walkway (up to 7.5m)',
        status: 'CONFIRMED_IN_FOOTAGE',
        riskLevel: 'MEDIUM',
        whyExists: 'Walkway inclined at 14° elevated over ground; loose husk granules create slipping hazard on steel grating.',
        consequences: 'Personnel slip, trip, or fall from height.',
        engineeringControls: ['Full 1100mm handrails with intermediate mid-rails and 150mm toe-boards', 'Serrated slip-resistant bar grating treads'],
        administrativeControls: ['Daily sweeping of walkway grating', 'Three-point contact rule during ascension'],
        requiredPPE: ['Non-slip safety boots with deep tread', 'Safety helmet with chin strap'],
        correctiveActions: ['Add anti-slip serrated cleats along incline walkway'],
        position3D: [10, 3.5, 1.2]
      }
    ],
    videoTimestamp: {
      start: 80,
      description: 'Inclined belt conveyor with corrugated hood covers, idlers, and walkways'
    },
    cameraTarget: [10, 3.5, 0],
    cameraPosition: [18, 9, 14]
  },

  bucket_elevator: {
    id: 'bucket_elevator',
    tag: '411-BE01',
    name: 'Vertical Bucket Elevator & Head Drive Platform',
    stageNumber: 3,
    stageTitle: 'Stage 3: Vertical Bucket Elevator',
    confirmationStatus: 'CONFIRMED',
    purpose: 'Lifts the rice husk vertically from plant ground level (elevation +0.5m) to the upper staging platform of the cement plant preheater tower (elevation +28.0m).',
    workingPrinciple: 'Continuous bucket elevator with heavy-duty anti-static rubber belt carrying pressed steel buckets. The boot section scoops and takes in husk from the belt conveyor chute. Buckets ascend at 1.5 m/s inside the enclosed twin-leg steel trunking and discharge by centrifugal force around the head pulley into the discharge chute.',
    operationMechanism: 'Continuous vertical lifting. Head drive unit consists of a high-efficiency electric motor, hollow-shaft helical-bevel gearbox with integral mechanical backstop (sprag clutch) to prevent reverse runaway in the event of power outage. Tensioning in boot handled by internal screw or counterweight take-up.',
    materialEntering: 'Continuous stream from belt conveyor discharge chute into elevator boot section.',
    materialLeaving: 'High-velocity centrifugal discharge cascading into upper transfer chute / downstream modular staging.',
    mechanicalFunction: 'Ultra-compact vertical material elevation through 28 meters with dust-tight sealed steel casing.',
    technicalSpecs: [
      { label: 'Elevator Total Lift Height', value: '28.0 meters' },
      { label: 'Casing Construction', value: '4mm structural plate steel, dust-tight flanged trunk sections' },
      { label: 'Traction Medium', value: 'High-tensile steel cord / EP polyester-nylon anti-static elevator belt' },
      { label: 'Bucket Type & Spacing', value: 'Deep steel buckets (DIN 15234 style), 350 mm spacing' },
      { label: 'Belt Speed', value: '1.4 – 1.6 m/s (centrifugal discharge tuning)' },
      { label: 'Drive Motor', value: '45 kW, 400V, Class F insulation, Ex-rated' },
      { label: 'Safety Backstop', value: 'Mechanical internal sprag clutch (instant zero-backlash hold)' },
      { label: 'Explosion Protection', value: 'NFPA 68 / ATEX certified explosion relief vent panels vented to safe outdoors' },
      { label: 'Monitoring Systems', value: 'Belt misalignment switches (head & boot), zero-speed switch, bearing temperature PT100 sensors' }
    ],
    components: [
      { name: 'Head Section & Drive', description: 'Crowned rubber-lagged head pulley, spherical roller bearings, 45 kW motor and helical gearbox with backstop.' },
      { name: 'Head Discharge Hood & Wear Plates', description: 'Curved hood profiled to match centrifugal trajectory of rice husk, lined with replaceable wear liners.' },
      { name: 'Vertical Leg Trunking Casing', description: 'Rectangular flanged steel tubes housing ascending (carry) and descending (return) legs.' },
      { name: 'Explosion Relief Vent Panels', description: 'Calibrated bursting membranes designed to rupture safely outwards during dust deflagration.' },
      { name: 'Elevator Buckets & Attachment', description: 'Specialized pressed steel scoops secured to belt with elevator bolts and dome lock nuts.' },
      { name: 'Boot Section with Intake Chute', description: 'Heavy steel bottom casing with clean-out slide doors, slotted pillow block bearings, and screw take-up.' },
      { name: 'Inspection Windows & Cutaways', description: 'Removable bolted inspection covers at boot and head for maintenance and internal bucket inspection.' },
      { name: 'Access Cage Ladder & Rest Platforms', description: 'Vertical climbing ladder with OSHA safety cage and intermediate rest landings every 6 meters.' }
    ],
    commonFailureModes: [
      { failure: 'Bucket Detachment / Tear-off', rootCause: 'Foreign metal tramp ingestion or fatigue cracking of elevator bolt washers.', symptom: 'Violent banging sound inside trunking, bucket pile-up in boot, belt stalling.', action: 'Immediate emergency stop; open boot cleanout door; extract loose buckets; inspect belt integrity.' },
      { failure: 'Belt Misalignment / Rubbing against Trunking', rootCause: 'Uneven belt stretch, boot take-up misalignment, or build-up on pulleys.', symptom: 'Belt alignment switch trips; casing wall heats up due to belt friction.', action: 'Level boot tensioning screws; check pulley crowning; re-track belt.' },
      { failure: 'Centrifugal Back-legging (Incomplete Discharge)', rootCause: 'Belt speed too low or discharge throat wear baffle improperly adjusted.', symptom: 'Husk falls back down the descending leg casing into boot; excessive motor load.', action: 'Verify VFD frequency/belt speed; adjust discharge lip throat clearance to 25mm.' },
      { failure: 'Elevator Boot Choking', rootCause: 'Sudden stoppage of downstream equipment while elevator continues feeding.', symptom: 'Motor thermal overload trip; zero-speed sensor detects belt stoppage.', action: 'Lock out; open bottom cleanout slide; manually spade out choked husk before restart.' }
    ],
    maintenanceRequirements: [
      { task: 'Bucket Bolt Torque & Crack Inspection', frequency: 'Weekly', procedure: 'Open inspection hatch; jog belt slowly and check torque of bucket fasteners; check for bent lips.' },
      { task: 'Explosion Vent Membrane Integrity', frequency: 'Monthly', procedure: 'Inspect bursting disc seals, weather covers, and ensure vent relief paths are 100% unobstructed.' },
      { task: 'Backstop Sprag Clutch Function Test', frequency: 'Quarterly', procedure: 'Simulate power cut while fully loaded to confirm instant mechanical hold without backward rollback.' },
      { task: 'Belt Tension & Elongation Measurement', frequency: 'Monthly', procedure: 'Measure travel remaining on boot screw take-up spindles; adjust if belt elongation exceeds 1.5%.' }
    ],
    hazards: [
      {
        id: 'HAZ-BE-01',
        name: 'Confined Dust Explosion Inside Elevator Trunking (Kst & Pmax)',
        category: 'FIRE_EXPLOSION',
        location: 'Interior of Vertical Casing Leg and Head Section',
        status: 'CONFIRMED_IN_FOOTAGE',
        riskLevel: 'CRITICAL',
        whyExists: 'Continuous lifting creates dense suspended combustible dust cloud; friction from rubbing belt or bucket spark provides ignition energy (MIE ~30-50 mJ).',
        consequences: 'Catastrophic casing rupture, fireball ejection, structural tower failure, and fatal blast injuries.',
        engineeringControls: [
          'NFPA 68 ATEX explosion relief vent panels vented to open atmosphere',
          'Fast-acting optical infrared spark detection and water quenching nozzles',
          'Mechanical backstop preventing friction rollback',
          'Belt misalignment sensors with automatic interlock shutdown'
        ],
        administrativeControls: [
          'Explosion venting zones clearly marked as NO ENTRY during operation',
          'Strict grounding verification of all casing segments (< 10 Ohms to earth)',
          'Regular thermal imaging of head and boot bearings'
        ],
        requiredPPE: ['Flame-resistant rated PPE', 'Hearing protection', 'Safety helmet'],
        correctiveActions: ['Install high-speed explosion suppression cannisters (chemical barrier) on discharge duct'],
        position3D: [21, 14, 0]
      },
      {
        id: 'HAZ-BE-02',
        name: 'High-Altitude Fall from Head Maintenance Platform',
        category: 'ENVIRONMENTAL_HEIGHT',
        location: 'Top Head Service Platform (+28.0m Level)',
        status: 'CONFIRMED_IN_FOOTAGE',
        riskLevel: 'HIGH',
        whyExists: 'Maintenance personnel working at 28 meters elevation subject to high wind buffeting and elevated open hatches.',
        consequences: 'Fatal fall from height.',
        engineeringControls: [
          'Permanent 1100mm perimeter safety handrails with toe-boards',
          'Full safety cage on vertical access ladder with self-closing swing gates',
          'Certified overhead fall arrest anchorage cables'
        ],
        administrativeControls: [
          'Working at Heights permit required for all access above +2m',
          'Work prohibited during high winds (> 40 km/h) or lightning risk',
          'Tool tethering mandatory to prevent dropped objects onto ground personnel'
        ],
        requiredPPE: ['Full body 5-point safety harness with dual shock-absorbing lanyards', 'Chin-strap safety helmet', 'Anti-slip boots'],
        correctiveActions: ['Install permanent davit crane at head platform for lifting heavy spare parts without manual handling'],
        position3D: [21, 28, 0]
      },
      {
        id: 'HAZ-BE-03',
        name: 'Sudden Reverse Runaway (Back-Drive Hazard)',
        category: 'MECHANICAL',
        location: 'Head Drive Shaft & Casing Interior',
        status: 'CONFIRMED_IN_FOOTAGE',
        riskLevel: 'HIGH',
        whyExists: 'When loaded with 28 meters of material, elevator will violently reverse drive if motor cuts out without backstop.',
        consequences: 'Machinery disintegration, catastrophic overspeed, projectile ejection of buckets, severe structural damage.',
        engineeringControls: ['Heavy-duty mechanical sprag backstop integrated into gearbox', 'Electro-mechanical failsafe motor brake'],
        administrativeControls: ['Backstop tested and documented every 3 months under controlled load conditions'],
        requiredPPE: ['Standard plant PPE'],
        correctiveActions: ['Fit redundant auxiliary external band brake on head pulley shaft'],
        position3D: [21, 27, 1.5]
      }
    ],
    videoTimestamp: {
      start: 125,
      description: 'Towering bucket elevator casing running up alongside cement plant preheater tower'
    },
    cameraTarget: [21, 14, 0],
    cameraPosition: [21, 18, 28]
  },

  downstream_unconfirmed: {
    id: 'downstream_unconfirmed',
    tag: '411-DS00',
    name: 'Process Stage To Be Confirmed (Modular Downstream)',
    stageNumber: 4,
    stageTitle: 'Stage 4: Downstream Process Stage (Pending Confirmation)',
    confirmationStatus: 'UNCONFIRMED_MODULAR',
    purpose: 'Modular placeholder representing the unconfirmed downstream conveying, dosing, and kiln firing equipment. Designed to be dynamically configured as plant verification data is finalized.',
    workingPrinciple: 'Receives discharged rice husk from the bucket elevator head chute and directs it to the appropriate downstream alternative fuel dosing equipment (e.g., surge bin, loss-in-weight feeder, rotary airlock, pneumatic injection pipe to cement kiln / precalciner burner).',
    operationMechanism: 'Configurable based on user selection or incoming plant drawings/videos. Can be swapped between Surge Bin + Pin Gate, Rotary Airlock Feeder + Pneumatic Blowing Line, or Screw Conveyor Feeder.',
    materialEntering: 'Elevated stream of rice husk (approx. 15-20 t/h) from bucket elevator head discharge chute.',
    materialLeaving: 'Calibrated feed into kiln burner pipe / precalciner firing chamber (hot gas temperature ~850-950°C).',
    mechanicalFunction: 'Continuous gravimetric or volumetric metering, flame isolation, and pneumatic injection.',
    technicalSpecs: [
      { label: 'Status', value: 'UNCONFIRMED — User Modular Selection Active' },
      { label: 'Observed in Video 02:50', value: 'Surge Bin with Pin Gate & Weigh Feeder Belt' },
      { label: 'Observed in Video 03:25', value: 'Rotary Airlock Valve & Pneumatic Transport Duct' },
      { label: 'Recommended Action', value: 'Select active configuration or input custom equipment in the Configurator tab' },
    ],
    components: [
      { name: 'Transfer Transition Chute', description: 'Abrasion-resistant sloped chute connecting elevator head to downstream equipment.' },
      { name: 'Modular Equipment Envelope', description: 'Configurable 3D boundary representing the selected downstream system.' },
      { name: 'Process Flow Direction Indicator', description: 'Visual telemetry arrows showing material destination toward kiln/calciner.' }
    ],
    commonFailureModes: [
      { failure: 'Backflow of Hot Kiln Gas / Flame Blowback', rootCause: 'Airlock seal loss or failure of double flap valve under negative/positive pressure swings.', symptom: 'Chute charring, smoke emitting backwards into elevator head.', action: 'Immediate emergency isolation slide gate closure; nitrogen purging.' }
    ],
    maintenanceRequirements: [
      { task: 'Modular Equipment Verification', frequency: 'As Plant Data Arrives', procedure: 'Update plant equipment tag, mechanical drawings, and OEM specs.' }
    ],
    hazards: [
      {
        id: 'HAZ-DS-01',
        name: 'Kiln Hot Gas & Flame Blowback into Fuel Line',
        category: 'FIRE_EXPLOSION',
        location: 'Downstream Injection Interface to Precalciner',
        status: 'POTENTIAL_SITE_VERIFY',
        riskLevel: 'CRITICAL',
        whyExists: 'Precalciner operates under slight draft or pressure fluctuations with temperatures exceeding 850°C; failure of airlock allows ignition of incoming husk.',
        consequences: 'Catastrophic fire propagating backwards through conveying line to elevator head.',
        engineeringControls: ['Heavy-duty rotary airlock with sacrificial replaceable tips', 'Pneumatic emergency shut-off knife gate', 'Continuous pressure differential interlock'],
        administrativeControls: ['Automatic trip sequence: trip fuel feed if kiln pressure differential drops'],
        requiredPPE: ['Heat-resistant aluminized clothing during kiln area maintenance'],
        correctiveActions: ['Install fast-acting flame detection sensor interlocked with high-pressure nitrogen snuffing valve'],
        position3D: [26, 26, 0]
      }
    ],
    videoTimestamp: {
      start: 170,
      description: 'Upper platforms, surge bin, pin gate, and rotary airlock valve'
    },
    cameraTarget: [26, 25, 0],
    cameraPosition: [36, 30, 16]
  }
};

export const DOWNSTREAM_CONFIGURATIONS: DownstreamOption[] = [
  {
    id: 'config_surge_bin',
    title: 'Option A: Surge Dosing Bin with Pin Gate & Weigh Belt Feeder',
    description: 'As observed in plant video (02:50 - 03:06): Material enters a vertical rectangular surge hopper fitted with horizontal rod/pin gates to modulate volume, feeding onto an enclosed gravimetric weigh belt feeder.',
    equipmentList: ['Surge Buffer Hopper (411-SB01)', 'Manual Rod/Pin Isolating Gate', 'Gravimetric Weigh Feeder (411-WF01)', 'Exhaust Dust Filter'],
    recommendedApplication: 'Ideal when continuous gravimetric dosing and precise mass-flow measurement (kg/min) into the kiln is required for thermal control.',
    isConfirmed: false
  },
  {
    id: 'config_rotary_airlock',
    title: 'Option B: Rotary Airlock Feeder & Pneumatic Blowing Line',
    description: 'As observed in plant video (03:20 - 03:29): Discharged husk drops through a rotary vane valve (airlock) into a pressurized pneumatic transport pipe powered by a Roots blower, injecting into the calciner burner.',
    equipmentList: ['Feed Chute Hopper', 'Rotary Airlock Valve (411-RV01)', 'Roots Blower (411-BL01)', 'Pneumatic Injection Pipework to Precalciner'],
    recommendedApplication: 'Standard industry method for injecting low-density husk directly into turbulent high-temperature calciner combustion zone.',
    isConfirmed: false
  },
  {
    id: 'config_screw_conveyor',
    title: 'Option C: Twin Enclosed Screw Conveyor & Distribution Chute',
    description: 'Alternative configuration: Horizontal twin-shaft screw conveyor with hardfaced flighting transporting husk across the upper structural gallery to dual firing splitters.',
    equipmentList: ['Horizontal Screw Conveyor (411-SC01)', 'Two-way Diverter Flap Gate', 'Split Gravity Chutes'],
    recommendedApplication: 'Selected when conveying across tight horizontal elevations before vertical drop into burner ports.',
    isConfirmed: false
  },
  {
    id: 'config_bypass_silo',
    title: 'Option D: Direct Chute Bypass to High-Level Buffer Silo',
    description: 'Straight bypass chute diverting husk to a cylindrical steel storage silo for overnight buffering when kiln is running at reduced alternative fuel rate.',
    equipmentList: ['Motorized Diverter Gate', 'Bypass Telescopic Chute', 'Buffer Storage Silo'],
    recommendedApplication: 'Utilized during kiln start-up or fuel quality testing routines.',
    isConfirmed: false
  }
];

export const PROCESS_STAGES_FLOW = [
  {
    step: 0,
    equipmentId: 'yard_stockpile',
    title: 'Truck Offloading & Yard Storage',
    status: 'CONFIRMED',
    description: 'Bulk delivery trucks offload rice husk via side gates beside container walls. Active cascading material discharge creates staging mounds.',
    highlightColor: '#E9C46A'
  },
  {
    step: 1,
    equipmentId: 'feeding_hopper',
    title: 'Loader Feeding & Hopper Receiving',
    status: 'CONFIRMED',
    description: 'Wheel loader (CAT 950B) scoops husk, ascends feeding ramp, and tips bucket into open hopper shelter and grizzly screen (80x80mm).',
    highlightColor: '#F4A261'
  },
  {
    step: 2,
    equipmentId: 'belt_conveyor',
    title: 'Inclined Covered Belt Conveying',
    status: 'CONFIRMED',
    description: 'Belt transports husk up a 14° incline beneath corrugated dust covers. Tramp magnet extracts iron before transfer.',
    highlightColor: '#2A9D8F'
  },
  {
    step: 3,
    equipmentId: 'bucket_elevator',
    title: 'Vertical Elevation to Preheater Platform (+28m)',
    status: 'CONFIRMED',
    description: 'Enclosed bucket elevator lifts husk vertically inside twin-leg casing. Buckets centrifugally discharge at the head pulley.',
    highlightColor: '#0077B6'
  },
  {
    step: 4,
    equipmentId: 'downstream_unconfirmed',
    title: 'Downstream Processing & Kiln Dosing (To Be Confirmed)',
    status: 'UNCONFIRMED_MODULAR',
    description: 'Modular staging zone: Pending final plant confirmation. Configurable between surge bin, rotary airlock, or pneumatic injection.',
    highlightColor: '#E63946'
  }
];
