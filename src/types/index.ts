export type PageView =
  | 'home'
  | 'signin'
  | 'signup'
  | 'evidence'
  | 'satellite'
  | 'claims'
  | 'about'
  | 'profile'
  | 'officer-register'
  | 'officer-status'
  | 'officer-dashboard'
  | 'admin-dashboard'
  | 'account-activation';

export type Language = 'en' | 'bn';

export interface PilotUpazila {
  id: string;
  name: string;
  banglaName: string;
  district: string;
  river: string;
  erosionRate: string;
  displacedFamilies: number;
  activeClaims: number;
  coordinates: { x: number; y: number }; // percentage on Bangladesh map
  status: 'Active Pilot' | 'Phase 2 Scale' | 'Planned';
}

export interface LandLossRecord {
  id: string;
  trackingId: string;
  ownerName: string;
  ownerBanglaName: string;
  district: string;
  upazila: string;
  union: string;
  mouza: string;
  jlNumber: string;
  khatianNo: string;
  dagNo: string;
  totalAreaAcre: number;
  submergedAreaAcre: number;
  submersionYear: number;
  riverBasin: string;
  gpsCoords: { lat: number; lng: number };
  status: 'Verified by Satellite' | 'Pending Community Endorsement' | 'AC Land Review' | 'Khas Land Allocated';
  satelliteSentinelMatch: number; // percentage
  witnessCount: number;
  certificateHash: string;
  issuedDate: string;
}

export interface ClaimApplication {
  id: string;
  claimantName: string;
  targetOffice: string; // e.g., "Office of the Assistant Commissioner (Land), Chilmari, Kurigram"
  subject: string;
  actSection: string; // "State Acquisition and Tenancy Act 1950 (Section 86/87)"
  applicationText: string;
  applicationBanglaText: string;
  recommendedKhasMouza: string;
  submissionDate: string;
  status: 'Draft Ready' | 'Dispatched to UNO' | 'Under Field Hearing' | 'Approved';
}
