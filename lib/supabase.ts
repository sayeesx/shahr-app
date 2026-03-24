import { createClient } from '@supabase/supabase-js';
import type {
  IntakeDraft,
  Client,
  Booking,
  BookingStatus,
  CabBooking,
  RentalBooking,
  DashboardData,
} from '../types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// ─── Submit Full Intake ───────────────────────────────────────────────────────

export async function submitIntake(data: IntakeDraft & {
  name: string;
  phone: string;
  email: string;
}): Promise<{ bookingId: string }> {
  // 1. Insert client
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .insert({
      name: data.name,
      phone: data.phone,
      email: data.email,
    })
    .select('id')
    .single();

  let clientId = (clientData as any)?.id;

  if (clientError) {
    // Client might already exist; try to fetch by phone
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', data.phone)
      .maybeSingle();

    if (!existing) throw new Error(`Failed to create client: ${clientError.message}`);
    clientId = existing.id;
  }

  // 2. Build booking payload
  const bookingPayload: Partial<Booking> = {
    client_id: clientId,
    purpose: data.purpose,
    status: 'pending',
  };

  if (data.purpose === 'medical' && data.medicalFields) {
    Object.assign(bookingPayload, {
      condition_summary: data.medicalFields.condition_summary,
      country: data.medicalFields.country,
      travel_dates_from: data.medicalFields.travel_dates_from,
      travel_dates_to: data.medicalFields.travel_dates_to,
      budget_range: data.medicalFields.budget_range,
      medical_document_url: data.medicalFields.medical_document_url,
    });
  }

  if ((data.purpose === 'tourism' || data.purpose === 'nri' || data.purpose === 'hybrid') && data.tourismFields) {
    Object.assign(bookingPayload, {
      travelers_count: data.tourismFields.travelers_count,
      interests: data.tourismFields.interests,
      travel_dates_from: data.tourismFields.travel_dates_from,
      travel_dates_to: data.tourismFields.travel_dates_to,
      budget: data.tourismFields.budget,
    });
  }

  // 3. Insert booking
  const { data: bookingData, error: bookingError } = await supabase
    .from('bookings')
    .insert(bookingPayload)
    .select('id')
    .single();

  if (bookingError) throw new Error(`Failed to create booking: ${bookingError.message}`);

  const bookingId = (bookingData as any).id;

  // 4. Insert initial booking_status
  const { error: statusError } = await supabase
    .from('booking_status')
    .insert({
      booking_id: bookingId,
      status: 'pending',
      notes: 'Intake submitted. AI plan is being prepared.',
    });

  if (statusError) console.warn('booking_status insert warning:', statusError.message);

  return { bookingId };
}

// ─── Get Dashboard Data ───────────────────────────────────────────────────────

export async function getUserDashboard(identifier: string): Promise<DashboardData> {
  const isPhone = /^\+?[\d\s-]{7,}$/.test(identifier);
  const field = isPhone ? 'phone' : 'email';

  // Get client
  const { data: clientData } = await supabase
    .from('clients')
    .select('id')
    .eq(field, identifier)
    .maybeSingle();

  if (!clientData) {
    return { booking: null, statuses: [], cabBookings: [], rentalBookings: [] };
  }

  // Get latest booking
  const { data: bookingData } = await supabase
    .from('bookings')
    .select('*')
    .eq('client_id', clientData.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!bookingData) {
    return { booking: null, statuses: [], cabBookings: [], rentalBookings: [] };
  }

  const bookingId = (bookingData as Booking).id;

  // Parallel fetches
  const [statusRes, cabRes, rentalRes] = await Promise.all([
    supabase
      .from('booking_status')
      .select('*')
      .eq('booking_id', bookingId)
      .order('updated_at', { ascending: false }),
    supabase
      .from('cab_bookings')
      .select('*, drivers(*), vehicles(*)')
      .eq('booking_id', bookingId),
    supabase
      .from('rental_bookings')
      .select('*, rental_vehicles(*)')
      .eq('booking_id', bookingId),
  ]);

  return {
    booking: bookingData as Booking,
    statuses: (statusRes.data ?? []) as BookingStatus[],
    cabBookings: (cabRes.data ?? []) as CabBooking[],
    rentalBookings: (rentalRes.data ?? []) as RentalBooking[],
  };
}

// ─── Get Booking Status ───────────────────────────────────────────────────────

export async function getBookingStatus(identifier: string): Promise<BookingStatus[]> {
  const isPhone = /^\+?[\d\s-]{7,}$/.test(identifier);
  const filterField = isPhone ? 'phone' : 'email';

  const { data: clientData } = await supabase
    .from('clients')
    .select('id')
    .eq(filterField, identifier)
    .maybeSingle();

  if (!clientData) return [];

  const { data: bookingData } = await supabase
    .from('bookings')
    .select('id')
    .eq('client_id', clientData.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!bookingData) return [];

  const { data: statuses } = await supabase
    .from('booking_status')
    .select('*')
    .eq('booking_id', (bookingData as any).id)
    .order('updated_at', { ascending: false });

  return (statuses ?? []) as BookingStatus[];
}

// ─── Upload Medical Document ──────────────────────────────────────────────────

export async function uploadMedicalDocument(
  fileUri: string,
  fileName: string,
  mimeType: string,
): Promise<string> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const filePath = `medical-docs/${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from('medical-docs')
    .upload(filePath, blob, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from('medical-docs').getPublicUrl(filePath);
  return urlData.publicUrl;
}
