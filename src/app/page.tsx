'use client';

import React, { useState, useEffect } from 'react';
import HomeView from '@/components/HomeView';
import ContributeView from '@/components/ContributeView';
import CommunityView from '@/components/CommunityView';
import { supabase } from '@/lib/supabase';
import { FareSubmission } from '@/types';

export default function Page() {
  const [fares, setFares] = useState<FareSubmission[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [publicView, setPublicView] = useState<'home' | 'contribute' | 'datacenter' | 'explore' | 'investor' | 'about' | 'community'>('home');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: fareData, error: fareError } = await supabase
        .from('fare_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fareError) throw fareError;

      if (fareData) {
        setFares(fareData.map((item: any) => ({
          id: item.id,
          transport_mode: item.transport_mode,
          origin: item.origin,
          destination: item.destination,
          amount: item.amount,
          currency: item.currency || '₦',
          trip_date: new Date(item.trip_date || item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          notes: item.notes,
          verification_status: item.verification_status || 'PENDING',
          contributor: item.notes?.includes('Contact:') ? item.notes.split('Contact:')[1] : 'Community Member',
          created_at: item.created_at,
        })));
      }

      const { data: reportData, error: reportError } = await supabase
        .from('road_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportError) throw reportError;

      if (reportData) {
        setReports(reportData);
      }
    } catch (err) {
      console.error('Database fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const pollInterval = setInterval(() => {
      fetchDashboardData();
    }, 4000);
    return () => clearInterval(pollInterval);
  }, []);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Render CommunityView if the user selects the community tab
  if (publicView === 'community') {
    return (
      <CommunityView 
        onNavigateHome={() => setPublicView('home')}
        onNavigateToDataCenter={() => setPublicView('datacenter')}
        onNavigateToContribute={() => setPublicView('contribute')}
        fares={fares}
      />
    );
  }

  return (
    <HomeView 
      fares={fares}
      reports={reports}
      loading={loading}
      publicView={publicView}
      setPublicView={setPublicView}
      fetchDashboardData={fetchDashboardData}
      googleMapsApiKey={googleMapsApiKey}
    />
  );
}