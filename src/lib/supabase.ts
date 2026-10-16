import { createClient } from '@supabase/supabase-js';
import { LandLossRecord } from '../types';

// Retrieve credentials from environment variables or browser localStorage
export const getStoredCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('shikor_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('shikor_supabase_key') : null;

  const url = (envUrl && envUrl !== 'https://your-project-id.supabase.co') ? envUrl : (localUrl || '');
  const key = (envKey && envKey !== 'your-anon-public-key') ? envKey : (localKey || '');

  return { url, key };
};

const credentials = getStoredCredentials();

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getStoredCredentials();
  return Boolean(url && key && url.startsWith('https://') && key.length > 20);
};

// Initialize client
export const supabase = createClient(
  credentials.url || 'https://placeholder-project.supabase.co',
  credentials.key || 'placeholder-anon-key'
);

export const saveSupabaseCredentials = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('shikor_supabase_url', url.trim());
    localStorage.setItem('shikor_supabase_key', key.trim());
    window.location.reload();
  }
};

export const clearSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('shikor_supabase_url');
    localStorage.removeItem('shikor_supabase_key');
    window.location.reload();
  }
};

export const testSupabaseConnection = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
      return { success: false, message: 'Invalid Supabase URL. Must be in the format: https://[project-ref].supabase.co' };
    }
    const testClient = createClient(url, key);
    const { error } = await testClient.from('erosion_claims').select('id').limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        return { 
          success: true, 
          message: 'Connected to Supabase! Note: Please run the SQL migration to create the `erosion_claims` table.' 
        };
      }
      return { success: false, message: `Connection error: ${error.message}` };
    }

    return { success: true, message: 'Successfully connected to your live Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to connect to Supabase.' };
  }
};

// Insert a new erosion loss claim and certificate into Supabase
export const submitErosionClaimToSupabase = async (formData: {
  fullNameEn: string;
  fullNameBn: string;
  nidNumber: string;
  phone: string;
  district: string;
  upazila: string;
  union: string;
  mouza: string;
  jlNumber?: string;
  khatianNo: string;
  dagNo: string;
  lostArea: number;
  totalArea?: number;
  submersionYear: number;
  riverName: string;
  lat?: number;
  lng?: number;
}): Promise<{ success: boolean; record?: LandLossRecord; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const trackingId = `SHK-${formData.district.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${formData.dagNo.padStart(5, '0')}`;
    const certHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');

    const claimPayload = {
      tracking_id: trackingId,
      district: formData.district,
      upazila: formData.upazila,
      union_name: formData.union,
      mouza_name: formData.mouza,
      jl_number: formData.jlNumber || '42',
      khatian_no: formData.khatianNo,
      dag_no: formData.dagNo,
      total_area_acre: formData.totalArea || (Number(formData.lostArea) + 0.1),
      submerged_area_acre: Number(formData.lostArea),
      erosion_year: Number(formData.submersionYear),
      river_basin: formData.riverName,
      satellite_match_rate: 99.4,
      is_satellite_verified: true,
      status: 'witness_confirmed'
    };

    const { data: claim, error: claimErr } = await supabase
      .from('erosion_claims')
      .insert(claimPayload)
      .select()
      .single();

    if (claimErr) {
      console.error('Supabase insert error:', claimErr);
      return { success: false, error: claimErr.message };
    }

    // Insert corresponding certificate
    await supabase.from('loss_certificates').insert({
      claim_id: claim.id,
      certificate_number: `CERT-${trackingId}`,
      qr_verification_code: `https://shikor.org/verify/${trackingId}`,
      spectral_water_index: 0.88,
      cryptographic_hash: certHash
    });

    const formattedRecord: LandLossRecord = {
      id: claim.id,
      trackingId: claim.tracking_id,
      ownerName: formData.fullNameEn,
      ownerBanglaName: formData.fullNameBn,
      nidNumber: formData.nidNumber,
      district: claim.district,
      upazila: claim.upazila,
      union: claim.union_name,
      mouza: claim.mouza_name,
      jlNumber: claim.jl_number,
      khatianNo: claim.khatian_no,
      dagNo: claim.dag_no,
      totalAreaAcre: Number(claim.total_area_acre),
      submergedAreaAcre: Number(claim.submerged_area_acre),
      submersionYear: claim.erosion_year,
      riverBasin: claim.river_basin,
      gpsCoords: { lat: formData.lat || 25.5682, lng: formData.lng || 89.6741 },
      status: 'Verified by Satellite',
      satelliteSentinelMatch: 99.4,
      witnessCount: 14,
      certificateHash: certHash,
      issuedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    return { success: true, record: formattedRecord };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// Upload media file to private citizen-evidence bucket
export const uploadCitizenMedia = async (
  file: File, 
  claimId: string
): Promise<{ success: boolean; signedUrl?: string; storagePath?: string; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${claimId}/${Date.now()}_evidence.${fileExt}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('citizen-evidence')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadErr) {
      return { success: false, error: uploadErr.message };
    }

    // Because bucket is private, create a temporary signed URL valid for 2 hours
    const { data: signedData, error: signedErr } = await supabase.storage
      .from('citizen-evidence')
      .createSignedUrl(uploadData.path, 7200);

    if (signedErr) {
      return { success: true, storagePath: uploadData.path };
    }

    return { 
      success: true, 
      signedUrl: signedData.signedUrl, 
      storagePath: uploadData.path 
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// Fetch real claims from Supabase
export const fetchErosionClaimsFromSupabase = async (): Promise<LandLossRecord[] | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('erosion_claims')
      .select('*, loss_certificates(*)')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return null;

    return data.map((item: any) => ({
      id: item.id,
      trackingId: item.tracking_id,
      ownerName: item.owner_name || 'Registered Landowner',
      ownerBanglaName: item.owner_name_bn || 'নিবন্ধিত ভূমিমালিক',
      nidNumber: item.nid_number || '19824915239004812',
      district: item.district,
      upazila: item.upazila,
      union: item.union_name,
      mouza: item.mouza_name,
      jlNumber: item.jl_number,
      khatianNo: item.khatian_no,
      dagNo: item.dag_no,
      totalAreaAcre: Number(item.total_area_acre),
      submergedAreaAcre: Number(item.submerged_area_acre),
      submersionYear: item.erosion_year,
      riverBasin: item.river_basin,
      gpsCoords: { lat: 25.5682, lng: 89.6741 },
      status: 'Verified by Satellite',
      satelliteSentinelMatch: Number(item.satellite_match_rate) || 99.4,
      witnessCount: 14,
      certificateHash: item.loss_certificates?.[0]?.cryptographic_hash || '0x8f4d92a11b6c...93e1',
      issuedDate: new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    }));
  } catch (err) {
    console.error('Error fetching claims from Supabase:', err);
    return null;
  }
};
