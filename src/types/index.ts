export type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface FareSubmission {
  id: string;
  transport_mode: 'keke' | 'bus' | 'taxi';
  origin: string;
  destination: string;
  amount: number;
  currency: string;
  trip_date: string;
  notes?: string;
  verification_status: VerificationStatus;
  contributor?: string;
  created_at: string;
}

export interface RoadReport {
  id: string;
  title: string;
  report_type: 'flooding' | 'closure' | 'traffic' | 'hazard';
  location_description: string;
  description?: string;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface TransportRoute {
  id: string;
  name: string;
  mode: string;
  origin_stop: string;
  destination_stop: string;
  verification_status: string;
}