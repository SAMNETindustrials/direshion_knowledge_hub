import { FareSubmission, RoadReport, TransportRoute } from '@/types';

export const INITIAL_FARES: FareSubmission[] = [
  {
    id: '1',
    transport_mode: 'keke',
    origin: 'Rumuola',
    destination: 'Woji',
    amount: 500,
    currency: '₦',
    trip_date: '2026-09-18 08:30',
    notes: 'Morning traffic surge fare.',
    verification_status: 'APPROVED',
    contributor: 'Samuel M.',
    created_at: '2026-09-18',
  },
  {
    id: '2',
    transport_mode: 'bus',
    origin: 'Mile 3',
    destination: 'Artillery',
    amount: 400,
    currency: '₦',
    trip_date: '2026-09-18 09:15',
    notes: 'Direct bus via Aba Road.',
    verification_status: 'PENDING',
    contributor: 'Grace E.',
    created_at: '2026-09-18',
  },
  {
    id: '3',
    transport_mode: 'keke',
    origin: 'Rumuomasi',
    destination: 'Woji',
    amount: 300,
    currency: '₦',
    trip_date: '2026-09-17 17:45',
    notes: 'Off-peak evening rate.',
    verification_status: 'APPROVED',
    contributor: 'Chinedu K.',
    created_at: '2026-09-17',
  },
];

export const INITIAL_REPORTS: RoadReport[] = [
  {
    id: 'r1',
    title: 'Heavy Flooding around Waterlines Junction',
    report_type: 'flooding',
    location_description: 'Aba Road, near Waterlines',
    description: 'Keke operators are turning back due to high water levels after the morning rain.',
    verification_status: 'APPROVED',
    created_at: '2026-09-18 07:00',
  },
  {
    id: 'r2',
    title: 'Road Closure at Garrison',
    report_type: 'closure',
    location_description: 'Garrison Flyover Slip Road',
    description: 'Maintenance work ongoing, expect slight delays.',
    verification_status: 'PENDING',
    created_at: '2026-09-18 10:20',
  },
];

export const INITIAL_ROUTES: TransportRoute[] = [
  { id: 'rt1', name: 'Rumuola to Woji', mode: 'keke', origin_stop: 'Rumuola Junction', destination_stop: 'Woji Town', verification_status: 'approved' },
  { id: 'rt2', name: 'Mile 3 to Artillery', mode: 'bus', origin_stop: 'Mile 3 Park', destination_stop: 'Artillery Junction', verification_status: 'approved' },
  { id: 'rt3', name: 'Rumuomasi to Garrison', mode: 'taxi', origin_stop: 'Rumuomasi', destination_stop: 'Garrison', verification_status: 'pending' },
];