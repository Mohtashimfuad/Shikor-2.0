export interface ErosionZone {
  id: string;
  name: string;
  banglaName: string;
  district: string;
  upazila: string;
  river: string;
  lat: number;
  lng: number;
  riskLevel: 'critical' | 'high' | 'moderate';
  erosionRateMetersPerYear: number;
  annualLandLossHectares: number;
  threatenedHomesteads: number;
  satelliteSensor: string;
  lastSatellitePass: string;
  ndwiWaterIndex: number; // 0 to 1
  mouzaCadastralList: string[];
  keyVulnerabilitySummary: string;
  boundaryCoordinates: [number, number][]; // Polygon vertices [lat, lng]
}

export const CURRENT_YEAR_EROSION_ZONES: ErosionZone[] = [
  {
    id: 'chilmari-brahmaputra',
    name: 'Chilmari & Roumari Reach',
    banglaName: 'চিলমারী ও রৌমারী রিচ',
    district: 'Kurigram (কুড়িগ্রাম)',
    upazila: 'Chilmari & Roumari',
    river: 'Brahmaputra',
    lat: 25.5682,
    lng: 89.6741,
    riskLevel: 'critical',
    erosionRateMetersPerYear: 220,
    annualLandLossHectares: 640,
    threatenedHomesteads: 1450,
    satelliteSensor: 'Sentinel-2 MSI (10m Resolution)',
    lastSatellitePass: 'Current Satellite Run • 5 Days Ago',
    ndwiWaterIndex: 0.88,
    mouzaCadastralList: ['Char Natundiar (JL #42)', 'Char Shakhati (JL #38)', 'Astomir Char (JL #55)'],
    keyVulnerabilitySummary: 'West bank severe right-flank scour. 14 mouza cadastral plots entirely submerged into the main Brahmaputra channel since monsoonal surge.',
    boundaryCoordinates: [
      [25.6200, 89.6300],
      [25.6350, 89.6850],
      [25.5400, 89.7150],
      [25.5100, 89.6500],
      [25.5800, 89.6200]
    ]
  },
  {
    id: 'kazipur-jamuna',
    name: 'Kazipur & Chauhali Reach',
    banglaName: 'কাজীপুর ও চৌহালী রিচ',
    district: 'Sirajganj (সিরাজগঞ্জ)',
    upazila: 'Kazipur',
    river: 'Jamuna',
    lat: 24.6812,
    lng: 89.7125,
    riskLevel: 'critical',
    erosionRateMetersPerYear: 250,
    annualLandLossHectares: 820,
    threatenedHomesteads: 2100,
    satelliteSensor: 'Sentinel-2 & Landsat-9 OLI',
    lastSatellitePass: 'Current Satellite Run • 3 Days Ago',
    ndwiWaterIndex: 0.92,
    mouzaCadastralList: ['Char Girish (JL #19)', 'Natuarpara (JL #14)', 'Mansur Nagar (JL #28)'],
    keyVulnerabilitySummary: 'Rapid braided sandbar detachment. Western embankment under persistent vortex stress with 250m westward channel migration.',
    boundaryCoordinates: [
      [24.7400, 89.6700],
      [24.7500, 89.7500],
      [24.6200, 89.7600],
      [24.6000, 89.6800],
      [24.6800, 89.6600]
    ]
  },
  {
    id: 'fulchhari-jamuna',
    name: 'Fulchhari & Sundarganj',
    banglaName: 'ফুলছড়ি ও সুন্দরগঞ্জ',
    district: 'Gaibandha (গাইবান্ধা)',
    upazila: 'Fulchhari',
    river: 'Jamuna / Teesta Confluence',
    lat: 25.1850,
    lng: 89.6450,
    riskLevel: 'high',
    erosionRateMetersPerYear: 175,
    annualLandLossHectares: 490,
    threatenedHomesteads: 980,
    satelliteSensor: 'Sentinel-2 MSI',
    lastSatellitePass: 'Current Satellite Run • 6 Days Ago',
    ndwiWaterIndex: 0.81,
    mouzaCadastralList: ['Gazaria Char (JL #33)', 'Uria Mouza (JL #27)', 'Khatiamari (JL #41)'],
    keyVulnerabilitySummary: 'Heavy bed scouring following high upstream discharge from Teesta river confluence.',
    boundaryCoordinates: [
      [25.2400, 89.6000],
      [25.2500, 89.6800],
      [25.1300, 89.7000],
      [25.1100, 89.6200]
    ]
  },
  {
    id: 'naria-padma',
    name: 'Naria & Jajira Bend',
    banglaName: 'নড়িয়া ও জাজিরা বাঁক',
    district: 'Shariatpur (শরীয়তপুর)',
    upazila: 'Naria',
    river: 'Padma',
    lat: 23.3214,
    lng: 90.4128,
    riskLevel: 'critical',
    erosionRateMetersPerYear: 190,
    annualLandLossHectares: 510,
    threatenedHomesteads: 1650,
    satelliteSensor: 'Sentinel-2 MSI & PlanetScope Data',
    lastSatellitePass: 'Current Satellite Run • Yesterday',
    ndwiWaterIndex: 0.94,
    mouzaCadastralList: ['Char Kedarpur (JL #31)', 'Muktarter Char (JL #18)', 'Banshgari (JL #24)'],
    keyVulnerabilitySummary: 'Deep scour hole on outer river curve. Extreme flow velocity during recession phase causing sudden catastrophic sub-bank sliding.',
    boundaryCoordinates: [
      [23.3700, 90.3600],
      [23.3800, 90.4500],
      [23.2700, 90.4600],
      [23.2600, 90.3800]
    ]
  },
  {
    id: 'haimchar-meghna',
    name: 'Haimchar Confluence',
    banglaName: 'হাইমচর মোহনা',
    district: 'Chandpur (চাঁদপুর)',
    upazila: 'Haimchar',
    river: 'Lower Meghna',
    lat: 23.0560,
    lng: 90.6280,
    riskLevel: 'high',
    erosionRateMetersPerYear: 165,
    annualLandLossHectares: 430,
    threatenedHomesteads: 1120,
    satelliteSensor: 'Sentinel-2 MSI (10m)',
    lastSatellitePass: 'Current Satellite Run • 2 Days Ago',
    ndwiWaterIndex: 0.85,
    mouzaCadastralList: ['Char Bhairabi (JL #12)', 'Gazirbazar Mouza (JL #08)', 'Algi Durgapur (JL #15)'],
    keyVulnerabilitySummary: 'Turbulent convergence zone of Padma and Meghna rivers. Strong cross-current shear destroying coastal homesteads and fish hatcheries.',
    boundaryCoordinates: [
      [23.1100, 90.5800],
      [23.1200, 90.6800],
      [23.0000, 90.6700],
      [22.9900, 90.5900]
    ]
  },
  {
    id: 'char-fasson-coastal',
    name: 'Char Fasson & Monpura',
    banglaName: 'চর ফ্যাশন ও মনপুরা',
    district: 'Bhola (ভোলা)',
    upazila: 'Char Fasson & Monpura',
    river: 'Meghna Estuary / Bay of Bengal',
    lat: 22.1850,
    lng: 90.7100,
    riskLevel: 'critical',
    erosionRateMetersPerYear: 240,
    annualLandLossHectares: 950,
    threatenedHomesteads: 2400,
    satelliteSensor: 'Sentinel-2 & Copernicus Coastal Service',
    lastSatellitePass: 'Current Satellite Run • Today',
    ndwiWaterIndex: 0.96,
    mouzaCadastralList: ['Char Kukri Mukri (JL #01)', 'Dhal Char (JL #05)', 'Char Nizam (JL #09)'],
    keyVulnerabilitySummary: 'Combined tidal surge bore and river outflow. Coastal fringe erosion wiping out newly registered agro-allotments.',
    boundaryCoordinates: [
      [22.2800, 90.6400],
      [22.3000, 90.8000],
      [22.0800, 90.8200],
      [22.0600, 90.6600]
    ]
  },
  {
    id: 'harirampur-padma',
    name: 'Harirampur & Dohar',
    banglaName: 'হরিরামপুর ও দোহার',
    district: 'Manikganj & Dhaka',
    upazila: 'Harirampur',
    river: 'Padma',
    lat: 23.7310,
    lng: 89.9650,
    riskLevel: 'high',
    erosionRateMetersPerYear: 155,
    annualLandLossHectares: 380,
    threatenedHomesteads: 890,
    satelliteSensor: 'Sentinel-2 MSI',
    lastSatellitePass: 'Current Satellite Run • 4 Days Ago',
    ndwiWaterIndex: 0.79,
    mouzaCadastralList: ['Boyra Mouza (JL #21)', 'Balballa Char (JL #16)', 'Lechhraganj (JL #11)'],
    keyVulnerabilitySummary: 'Erosion of fertile agricultural silt soil on the northern Padma bank threatening regional crop supply.',
    boundaryCoordinates: [
      [23.7800, 89.9200],
      [23.7900, 90.0200],
      [23.6800, 90.0100],
      [23.6700, 89.9300]
    ]
  }
];
