'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bus, MapPin, AlertTriangle, Compass, CheckCircle2, Send, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FareSubmission } from '@/types';

interface ContributeViewProps {
  onSuccessSubmission: () => void;
  apiKey: string;
}

export default function ContributeView({ onSuccessSubmission, apiKey }: ContributeViewProps) {
  const [activeTab, setActiveTab] = useState<'fares' | 'routes' | 'conditions' | 'recent'>('fares');
  
  // Form States
  const [transportMode, setTransportMode] = useState('Keke');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('500');
  const [notes, setNotes] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Live Database Contributions Feed State
  const [recentFares, setRecentFares] = useState<FareSubmission[]>([]);

  // Refs for Google Places Autocomplete inputs
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);

  // Fetch live contributions from Supabase on mount
  useEffect(() => {
    const fetchRecentSubmissions = async () => {
      try {
        const { data, error } = await supabase
          .from('fare_submissions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        if (data) {
          setRecentFares(
            data.map((item: any) => ({
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
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching live contributions:', err);
      }
    };

    fetchRecentSubmissions();
  }, [successMsg]);

  // Load Google Maps Script & Initialize Autocomplete
  useEffect(() => {
    if (!apiKey) return;

    const loadGoogleMapsScript = () => {
      if ((window as any).google && (window as any).google.maps) {
        initAutocomplete();
        return;
      }

      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', initAutocomplete);
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    };

    const initAutocomplete = () => {
      const google = (window as any).google;
      if (!google || !google.maps || !google.maps.places) return;

      const options = {
        componentRestrictions: { country: 'ng' },
        fields: ['formatted_address', 'name', 'geometry'],
        strictBounds: false,
      };

      if (originInputRef.current) {
        const originAutocomplete = new google.maps.places.Autocomplete(originInputRef.current, options);
        originAutocomplete.addListener('place_changed', () => {
          const place = originAutocomplete.getPlace();
          if (place.formatted_address || place.name) {
            setOrigin(place.formatted_address || place.name);
          }
        });
      }

      if (destinationInputRef.current) {
        const destAutocomplete = new google.maps.places.Autocomplete(destinationInputRef.current, options);
        destAutocomplete.addListener('place_changed', () => {
          const place = destAutocomplete.getPlace();
          if (place.formatted_address || place.name) {
            setDestination(place.formatted_address || place.name);
          }
        });
      }
    };

    loadGoogleMapsScript();
  }, [apiKey]);

  const handleFareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const contributionNotes = contact 
        ? `${notes ? notes + ' — ' : ''}Contact: ${contact}` 
        : (notes || 'Direct community contribution');

      // Including trip_date to satisfy the database NOT NULL constraint
      const payload = {
        transport_mode: transportMode,
        origin: origin || 'Rumuola',
        destination: destination || 'Woji',
        amount: parseFloat(amount) || 0,
        currency: '₦',
        trip_date: new Date().toISOString(),
        notes: contributionNotes,
        verification_status: 'PENDING'
      };

      const { error } = await supabase.from('fare_submissions').insert([payload]);

      if (error) {
        throw new Error(error.message || JSON.stringify(error));
      }
      
      setSuccessMsg('Contribution submitted successfully to database!');
      setTimeout(() => {
        setSuccessMsg('');
        onSuccessSubmission();
      }, 2000);
    } catch (err: any) {
      console.error('Submission error details:', err);
      alert(`Supabase Submission Error: ${err.message || 'Check RLS Policies or Table Schema.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Hero Banner Section */}
      <section className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-8 md:p-12 shadow-xl overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="text-emerald-400 text-xs font-bold tracking-widest uppercase">
              SHARE • INFORM • IMPROVE
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Help Build a Smarter<br />Port Harcourt
            </h1>
            
            <p className="text-slate-300 text-sm md:text-base max-w-xl">
              Contribute local transport fares, routes, landmarks, road conditions and more. Your knowledge helps everyone travel safer, faster and easier.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Real people • Real experiences</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Verified by our team and community</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Better journeys for everyone</div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white space-y-4 shadow-xl">
            <h3 className="font-bold text-base">What can you contribute?</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <Bus className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div><span className="font-bold">Transport fares</span> <p className="text-slate-300 text-[11px]">(keke, bus, taxi, etc.)</p></div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div><span className="font-bold">Local routes</span> <p className="text-slate-300 text-[11px]">(parks, stops, directions)</p></div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div><span className="font-bold">Landmarks</span> <p className="text-slate-300 text-[11px]">(junctions, markets, estates)</p></div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div><span className="font-bold">Road conditions</span> <p className="text-slate-300 text-[11px]">(traffic, flooding, closures)</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
        <button onClick={() => setActiveTab('fares')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'fares' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>Transport Fares</button>
        <button onClick={() => setActiveTab('routes')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'routes' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>Routes & Landmarks</button>
        <button onClick={() => setActiveTab('conditions')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'conditions' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>Road Conditions</button>
        <button onClick={() => setActiveTab('recent')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'recent' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>Recent Contributions</button>
      </div>

      {/* Main Form & Map Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form with Google Maps Places Autocomplete integrated */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Report a Transport Fare</h2>
            <p className="text-xs text-slate-500">Share what you paid for your trip. Search locations powered by Google Maps.</p>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {successMsg}
            </div>
          )}

          <form onSubmit={handleFareSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Transport Mode *</label>
              <div className="grid grid-cols-5 gap-2">
                {['Keke', 'Bus', 'Taxi', 'Okada', 'Other'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTransportMode(mode)}
                    className={`py-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${transportMode === mode ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Bus className="w-4 h-4" /> {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">From (Google Maps Autocomplete) *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    ref={originInputRef}
                    type="text" 
                    required 
                    value={origin} 
                    onChange={(e) => setOrigin(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500" 
                    placeholder="Search origin location..." 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">To (Google Maps Autocomplete) *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    ref={destinationInputRef}
                    type="text" 
                    required 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500" 
                    placeholder="Search destination location..." 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fare Amount (₦) *</label>
                <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500" placeholder="500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time *</label>
                <input type="text" disabled value="18 Sep 2026, 08:30 AM" className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes (optional)</label>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Morning traffic, direct trip, etc." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Contact (optional)</label>
              <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone number or WhatsApp" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500" />
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl transition shadow-md flex items-center justify-center gap-2 text-sm">
              <Send className="w-4 h-4" /> {submitting ? 'Submitting to Database...' : 'Submit Contribution →'}
            </button>

            <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> Your information will be reviewed before it is published.
            </p>
          </form>
        </div>

        {/* Right Column: Map Preview & Live Database Recent Contributions Feed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900">Popular Routes in Port Harcourt</h3>
            <div className="h-48 rounded-2xl overflow-hidden border border-slate-200 relative">
              {apiKey ? (
                <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=Port+Harcourt,Nigeria`}></iframe>
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-50 text-slate-400 text-xs">Map Preview Active</div>
              )}
            </div>
          </div>

          {/* Recent Contributions Card - Real-Time Supabase Feed */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Recent Contributions (Live DB)</h3>
              <span className="text-[10px] text-emerald-700 font-bold">Real-time</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {recentFares.map((fare) => (
                <div key={fare.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">{fare.transport_mode} Fare</span>
                    <p className="font-semibold text-slate-900">{fare.origin} → {fare.destination} • {fare.currency}{fare.amount}</p>
                    <span className="text-[10px] text-slate-400">{fare.trip_date}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${fare.verification_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {fare.verification_status}
                  </span>
                </div>
              ))}
              {recentFares.length === 0 && (
                <div className="text-xs text-slate-400 text-center py-4">No submissions recorded in database yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}