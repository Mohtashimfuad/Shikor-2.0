import { PilotUpazila, LandLossRecord, ClaimApplication } from '../types';

export const PILOT_UPAZILAS: PilotUpazila[] = [
  {
    id: 'chilmari',
    name: 'Chilmari',
    banglaName: 'চিলমারী',
    district: 'Kurigram (কুড়িগ্রাম)',
    river: 'Brahmaputra / Jamuna',
    erosionRate: '180 meters/year',
    displacedFamilies: 4820,
    activeClaims: 1240,
    coordinates: { x: 58, y: 18 },
    status: 'Active Pilot'
  },
  {
    id: 'kazipur',
    name: 'Kazipur',
    banglaName: 'কাজীপুর',
    district: 'Sirajganj (সিরাজগঞ্জ)',
    river: 'Jamuna',
    erosionRate: '210 meters/year',
    displacedFamilies: 6150,
    activeClaims: 1890,
    coordinates: { x: 50, y: 38 },
    status: 'Active Pilot'
  },
  {
    id: 'naria',
    name: 'Naria',
    banglaName: 'নড়িয়া',
    district: 'Shariatpur (শরীয়তপুর)',
    river: 'Padma',
    erosionRate: '160 meters/year',
    displacedFamilies: 3900,
    activeClaims: 950,
    coordinates: { x: 57, y: 58 },
    status: 'Phase 2 Scale'
  },
  {
    id: 'haimchar',
    name: 'Haimchar',
    banglaName: 'হাইমচর',
    district: 'Chandpur (চাঁদপুর)',
    river: 'Meghna',
    erosionRate: '145 meters/year',
    displacedFamilies: 3200,
    activeClaims: 810,
    coordinates: { x: 64, y: 65 },
    status: 'Phase 2 Scale'
  },
  {
    id: 'char-fasson',
    name: 'Char Fasson',
    banglaName: 'চর ফ্যাশন',
    district: 'Bhola (ভোলা)',
    river: 'Meghna Estuary / Bay of Bengal',
    erosionRate: '195 meters/year',
    displacedFamilies: 7400,
    activeClaims: 2150,
    coordinates: { x: 67, y: 82 },
    status: 'Phase 2 Scale'
  }
];

export const SAMPLE_LOSS_RECORDS: LandLossRecord[] = [
  {
    id: 'rec-001',
    trackingId: 'SHK-KUR-2024-00284',
    ownerName: 'Md. Abdur Rahim Mondol',
    ownerBanglaName: 'মো: আব্দুর রহিম মন্ডল',
    nidNumber: '19824915239004812',
    district: 'Kurigram',
    upazila: 'Chilmari',
    union: 'Raniganj',
    mouza: 'Char Natundiar',
    jlNumber: '42',
    khatianNo: 'RS-1102',
    dagNo: '284',
    totalAreaAcre: 0.65,
    submergedAreaAcre: 0.58,
    submersionYear: 2022,
    riverBasin: 'Brahmaputra River',
    gpsCoords: { lat: 25.5682, lng: 89.6741 },
    status: 'Verified by Satellite',
    satelliteSentinelMatch: 99.4,
    witnessCount: 14,
    certificateHash: '0x8f4d92a11b6c...93e1',
    issuedDate: '12 November 2024'
  },
  {
    id: 'rec-002',
    trackingId: 'SHK-SIR-2024-00519',
    ownerName: 'Mst. Rokeya Begum',
    ownerBanglaName: 'মোছা: রোকেয়া বেগম',
    nidNumber: '19798812049182341',
    district: 'Sirajganj',
    upazila: 'Kazipur',
    union: 'Natuarpara',
    mouza: 'Char Girish',
    jlNumber: '19',
    khatianNo: 'BS-840',
    dagNo: '519',
    totalAreaAcre: 0.42,
    submergedAreaAcre: 0.42,
    submersionYear: 2021,
    riverBasin: 'Jamuna River',
    gpsCoords: { lat: 24.6812, lng: 89.7125 },
    status: 'AC Land Review',
    satelliteSentinelMatch: 98.8,
    witnessCount: 19,
    certificateHash: '0x43a8e99f...882c',
    issuedDate: '28 October 2024'
  },
  {
    id: 'rec-003',
    trackingId: 'SHK-SHA-2024-00142',
    ownerName: 'Kazi Faruk Ahmed',
    ownerBanglaName: 'কাজী ফারুক আহমেদ',
    nidNumber: '19882619472019482',
    district: 'Shariatpur',
    upazila: 'Naria',
    union: 'Muktarter Char',
    mouza: 'Char Kedarpur',
    jlNumber: '31',
    khatianNo: 'CS-441 / RS-902',
    dagNo: '142',
    totalAreaAcre: 0.88,
    submergedAreaAcre: 0.88,
    submersionYear: 2020,
    riverBasin: 'Padma River',
    gpsCoords: { lat: 23.3214, lng: 90.4128 },
    status: 'Khas Land Allocated',
    satelliteSentinelMatch: 99.7,
    witnessCount: 22,
    certificateHash: '0x71bc2901...3f18',
    issuedDate: '15 August 2024'
  }
];

export const SAMPLE_CLAIM: ClaimApplication = {
  id: 'claim-chilmari-01',
  claimantName: 'Md. Abdur Rahim Mondol (মো: আব্দুর রহিম মন্ডল)',
  claimantNid: '19824915239004812',
  targetOffice: 'Office of the Assistant Commissioner (Land) & Upazila Nirbahi Officer, Chilmari, Kurigram',
  subject: 'Application for Khas Land Allocation / Resettlement due to River Erosion of Homestead and Farmland',
  actSection: 'State Acquisition and Tenancy Act 1950 (Section 86/87) & National Char Rehabilitation Policy',
  applicationText: `To:
The Assistant Commissioner (Land) / Upazila Nirbahi Officer (UNO)
Chilmari Upazila, Kurigram District, Bangladesh.

Subject: Petition for Allotment of Resettlement Khas Land against Total River Erosion Inundation of Inherited Land (Dag #284, Mouza: Char Natundiar).

Respected Sir/Madam,
I, Md. Abdur Rahim Mondol, son of late Kashem Mondol, NID #19824915239004812, humbly submit that our generational residential homestead and agricultural plot measuring 0.58 Acres in Dag No. 284, Khatian RS-1102, Mouza Char Natundiar (JL #42) has been entirely engulfed and submerged into the bed of the Brahmaputra River during the severe monsoonal erosion of July 2022.

In support of this petition, I have generated and attached the Shikor Satellite-Verified Land Loss Certificate (Tracking ID: SHK-KUR-2024-00284) integrating historical Sentinel-2 surface water transitions with RS Mouza Georeference, along with 14 community geo-witness signatures.

Under Section 86 of the State Acquisition and Tenancy Act 1950 and the Government Land Settlement Directive, I respectfully pray that your honor kindly inspect the enclosed verifiable digital evidence docket and allocate an equivalent portion of available 1-No. Khas Khatian resettlement land in the newly accredited Char Khas area to secure our displaced family's livelihood.`,
  applicationBanglaText: `বরাবর,
সহকারী কমিশনার (ভূমি) / উপজেলা নির্বাহী অফিসার (ইউএনও)
চিলমারী উপজেলা, কুড়িগ্রাম জেলা।

বিষয়: ব্রহ্মপুত্র নদের ভাঙনে বসতভিটা ও ফসলি জমি নদীগর্ভে বিলীন হওয়ায় পুনর্বাসনের নিমিত্তে ১-নং খাস খতিয়ানভুক্ত জমি বন্দোবস্তের আবেদন।

মহোদয়,
বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী মো: আব্দুর রহিম মন্ডল, পিতা: মৃত কাশেম মন্ডল, জাতীয় পরিচয়পত্র নং: ১৯৮২৪৯১৫২৩৯০০৪৮১২। আমাদের বংশানুক্রমিক বসতভিটা ও ফসলি জমি (মৌজা: চর নতুনদিয়ার, জে.এল নং: ৪২, আর.এস খতিয়ান নং: ১১০২, দাগ নং: ২৮৪, মোট পরিমাপ: ০.৫৮ একর) ২০২২ সালের বন্যায় ব্রহ্মপুত্র নদের তীব্র ভাঙনে সম্পূর্ণ নদীগর্ভে বিলীন হয়ে গেছে।

উক্ত ভাঙন ও পূর্ববর্তী দখল প্রমাণের সপক্ষে শিকড় (Shikor) স্যাটেলাইট সেন্টিনেল-২ ও আর.এস মৌজা নকশা সম্বলিত ডিজিটাল "ভূমিহীন নদীভাঙন সনদ" (ট্র্যাকিং আইডি: SHK-KUR-2024-00284) এবং ১৪ জন স্থানীয় অধিবাসীর ডিজিটাল সাক্ষী প্রমাণ সংযুক্ত করা হলো।

অতএব মহোদয়ের নিকট আকুল প্রার্থনা, রাষ্ট্রীয় অধিগ্রহণ ও প্রজাস্বত্ব আইন ১৯৫০-এর ৮৬ ধারা মোতাবেক বিষয়টি পর্যালোচনাপূর্বক আমাদের গৃহহীন পরিবারকে সরকারি বন্দোবস্তযোগ্য ১-নং খাস খতিয়ান হতে পুনর্বাসনের ব্যবস্থা গ্রহণ করতে আপনার মর্জি হয়।`,
  recommendedKhasMouza: 'Char Rajibpur Mouza (1-No. Khas Register Plot #114/2)',
  submissionDate: '15 November 2024',
  status: 'Draft Ready'
};
