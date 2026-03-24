// ─── Intake ──────────────────────────────────────────────────────────────────

export type IntakePurpose = 'medical' | 'tourism' | 'nri' | 'hybrid';

export interface MedicalFields {
  condition_summary: string;
  country: string;
  travel_dates_from: string;
  travel_dates_to: string;
  budget_range: string;
  medical_document_url?: string;
}

export interface TourismFields {
  travelers_count: number;
  interests: string[];
  travel_dates_from: string;
  travel_dates_to: string;
  budget: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}

export interface IntakeDraft {
  purpose: IntakePurpose;
  medicalFields?: Partial<MedicalFields>;
  tourismFields?: Partial<TourismFields>;
  contactInfo?: Partial<ContactInfo>;
}

// ─── Supabase Tables ─────────────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
}

export type BookingPurpose = 'medical' | 'tourism' | 'nri' | 'hybrid';

export interface Booking {
  id: string;
  client_id?: string;
  purpose: BookingPurpose;
  condition_summary?: string;
  country?: string;
  travel_dates_from?: string;
  travel_dates_to?: string;
  budget_range?: string;
  medical_document_url?: string;
  travelers_count?: number;
  interests?: string[];
  budget?: string;
  status: BookingStatusType;
  created_at: string;
  updated_at?: string;
}

export type BookingStatusType = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface BookingStatus {
  id: string;
  booking_id: string;
  status: BookingStatusType;
  notes?: string;
  updated_at: string;
}

// ─── Transport ───────────────────────────────────────────────────────────────

export interface Driver {
  id: string;
  name: string;
  phone: string;
  license_number?: string;
  photo_url?: string;
  rating?: number;
  is_available: boolean;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year?: number;
  plate_number: string;
  vehicle_type: string;
  capacity?: number;
  is_available: boolean;
}

export interface DriverVehicle {
  id: string;
  driver_id: string;
  vehicle_id: string;
  driver?: Driver;
  vehicle?: Vehicle;
}

export interface CabBooking {
  id: string;
  booking_id: string;
  driver_id?: string;
  vehicle_id?: string;
  pickup_location?: string;
  dropoff_location?: string;
  pickup_time?: string;
  status: BookingStatusType;
  driver?: Driver;
  vehicle?: Vehicle;
}

// ─── Rental ──────────────────────────────────────────────────────────────────

export interface RentalVehicle {
  id: string;
  name: string;
  type: string;
  make?: string;
  model?: string;
  daily_rate?: number;
  is_available: boolean;
  photo_url?: string;
}

export interface RentalBooking {
  id: string;
  booking_id: string;
  rental_vehicle_id: string;
  start_date?: string;
  end_date?: string;
  status: BookingStatusType;
  rental_vehicle?: RentalVehicle;
}

// ─── Location ────────────────────────────────────────────────────────────────

export interface Location {
  id: string;
  name: string;
  city?: string;
  state?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardData {
  booking: Booking | null;
  statuses: BookingStatus[];
  cabBookings: CabBooking[];
  rentalBookings: RentalBooking[];
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface UserSession {
  name: string;
  phone: string;
  email: string;
}
