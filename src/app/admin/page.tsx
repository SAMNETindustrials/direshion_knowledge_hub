'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Shield, Users, BarChart3, MapPin, Settings, 
  Bell, ChevronDown, TrendingUp, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, Database, Lock, LogOut, Compass
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { FareSubmission, RoadReport } from '@/types';

// Import modular admin pages
import FaresPage from '@/components/admin/FaresPage';
import RoutesPage from '@/components/admin/RoutesPage';
import ReportsPage from '@/components/admin/ReportsPage';
import MediaPage from '@/components/admin/MediaPage';
import ModerationPage from '@/components/admin/ModerationPage';
import UsersPage from '@/components/admin/UsersPage';
import AnalyticsPage from '@/components/admin/AnalyticsPage';
import MapEditorPage from '@/components/admin/MapEditorPage';
import SettingsPage from '@/components/admin/SettingsPage';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<
    'overview' | 'fares' | 'routes' | 'reports' | 'media' | 'moderation' | 'users' | 'analytics' | 'map' | 'settings'
  >('overview');

  const [fares, setFares] = useState<FareSubmission[]>([]);
  const [reports, setReports] = useState<RoadReport[]>([]);
  const [loading, setLoading] = useState(false);

  // Shared Admin Media State for Hero & Keke Ads
  const [heroBg, setHeroBg] = useState<string | null>(null);
  const [kekeMedia, setKekeMedia] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim() === 'direshion@gmail.com' && passwordInput === '@Direshion') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Use direshion@gmail.com / @Direshion');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: fareData } = await supabase.from('fare_submissions').select('*').order('created_at', { ascending: false });
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
          contributor: item.contributor || 'Community Member',
          created_at: item.created_at,
        })));
      }

      const { data: reportData } = await supabase.from('road_reports').select('*').order('created_at', { ascending: false });
      if (reportData) {
        setReports(reportData.map((item: any) => ({
          id: item.id,
          title: item.title,
          report_type: item.report_type,
          location_description: item.location_description,
          description: item.description,
          verification_status: item.verification_status || 'PENDING',
          created_at: new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        })));
      }
    } catch (err) {
      console.error('Database fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const totalSubmissions = fares.length + reports.length;
  const pendingCount = fares.filter(f => f.verification_status === 'PENDING').length + reports.filter(r => r.verification_status === 'PENDING').length;
  const approvedCount = fares.filter(f => f.verification_status === 'APPROVED').length + reports.filter(r => r.verification_status === 'APPROVED').length;

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto text-white font-bold shadow-lg shadow-emerald-600/30">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white">Direshion Admin Portal</h1>
            <p className="text-xs text-slate-400">Login with direshion@gmail.com / @Direshion</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email</label>
              <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="direshion@gmail.com" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            {loginError && <p className="text-xs text-rose-500 font-semibold">{loginError}</p>}
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-lg text-sm">
              Sign In to Dashboard
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition">← Return to Public Knowledge Hub</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0a1b18] text-slate-300 flex flex-col justify-between hidden md:flex border-r border-slate-800">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Direshion Logo" className="w-10 h-10 object-contain" />
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight">Direshion</span>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Admin Portal</p>
            </div>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'overview' ? 'bg-emerald-700 text-white font-semibold shadow-md' : 'hover:bg-slate-800/60 text-slate-300'}`}>
              <LayoutDashboard className="w-4 h-4 text-emerald-400" /> Dashboard
            </button>

            <div className="pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">Submissions</div>
            <button onClick={() => setActiveTab('fares')} className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs transition pl-8 ${activeTab === 'fares' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
              <span>Fares</span>
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px]">{fares.length}</span>
            </button>
            <button onClick={() => setActiveTab('routes')} className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs transition pl-8 ${activeTab === 'routes' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
              <span>Routes & Landmarks</span>
            </button>
            <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs transition pl-8 ${activeTab === 'reports' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
              <span>Road Reports</span>
              <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px]">{reports.length}</span>
            </button>
            <button onClick={() => setActiveTab('media')} className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs transition pl-8 ${activeTab === 'media' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
              <span>Media</span>
            </button>

            <div className="pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">Management</div>
            <button onClick={() => setActiveTab('moderation')} className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs transition pl-4 ${activeTab === 'moderation' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-amber-400" /> Moderation</span>
              <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px]">{pendingCount}</span>
            </button>
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs transition pl-4 ${activeTab === 'users' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}><Users className="w-4 h-4" /> Users & Contributors</button>
            <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs transition pl-4 ${activeTab === 'analytics' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}><BarChart3 className="w-4 h-4" /> Analytics</button>
            <button onClick={() => setActiveTab('map')} className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs transition pl-4 ${activeTab === 'map' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}><MapPin className="w-4 h-4" /> Map Editor</button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs transition pl-4 ${activeTab === 'settings' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}><Settings className="w-4 h-4" /> Settings</button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <img src="/samnetLogo.png" alt="Samnet" className="w-5 h-5 object-contain opacity-80" />
            <span>SAMNET & Direshion</span>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-slate-400 hover:text-rose-400 transition" title="Log Out"><LogOut className="w-4 h-4" /></button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-100 px-3 py-1.5 rounded-lg transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Hub
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-bold text-slate-800 capitalize">{activeTab} View</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={fetchDashboardData} className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">A</div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">Admin</p>
                <p className="text-[10px] text-slate-500 mt-0.5">direshion@gmail.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Router Content */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Submissions</span>
                  <h3 className="text-3xl font-black text-slate-900 my-2">{totalSubmissions}</h3>
                  <div className="text-xs text-emerald-700 font-semibold">Live Supabase sync active</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-500">Pending Review</span>
                  <h3 className="text-3xl font-black text-slate-900 my-2">{pendingCount}</h3>
                  <div className="text-xs text-amber-600 font-semibold">Requires moderation</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-500">Approved Records</span>
                  <h3 className="text-3xl font-black text-slate-900 my-2">{approvedCount}</h3>
                  <div className="text-xs text-emerald-700 font-semibold">Ready for route engine</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-500">Connected Database</span>
                  <h3 className="text-lg font-bold text-slate-900 my-2">Supabase PG</h3>
                  <div className="text-xs text-emerald-700 font-semibold">hypgwuuokidpkodbygtk</div>
                </div>
              </div>

              {/* Map View Preview Card on Dashboard Overview matching Mockup */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Recent Submissions Feed</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                          <th className="p-3 font-semibold">Type</th>
                          <th className="p-3 font-semibold">Details</th>
                          <th className="p-3 font-semibold">Amount</th>
                          <th className="p-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {fares.slice(0, 4).map((f) => (
                          <tr key={f.id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-emerald-700 uppercase">Fare ({f.transport_mode})</td>
                            <td className="p-3 font-semibold text-slate-900">{f.origin} → {f.destination}</td>
                            <td className="p-3 font-bold text-emerald-600">{f.currency}{f.amount}</td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">{f.verification_status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Map View Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-3">Map View</h3>
                    <div className="h-44 rounded-xl overflow-hidden border border-slate-200 relative">
                      {googleMapsApiKey ? (
                        <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=Port+Harcourt,Nigeria`}></iframe>
                      ) : (
                        <div className="flex items-center justify-center h-full bg-slate-50 text-slate-400 text-xs">API key required</div>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('map')} className="mt-4 w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-sm">
                    View Full Map Editor →
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fares' && <FaresPage fares={fares} />}
          {activeTab === 'routes' && <RoutesPage />}
          {activeTab === 'reports' && <ReportsPage reports={reports} />}
          {activeTab === 'media' && (
            <MediaPage 
              heroBg={heroBg} 
              onHeroBgUpload={(url) => setHeroBg(url)} 
              kekeMedia={kekeMedia} 
              onKekeMediaUpload={(url) => setKekeMedia(url)} 
            />
          )}
          {activeTab === 'moderation' && <ModerationPage fares={fares} onApprove={async (id) => {
            await supabase.from('fare_submissions').update({ verification_status: 'APPROVED' }).eq('id', id);
            fetchDashboardData();
          }} />}
          {activeTab === 'users' && <UsersPage />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'map' && <MapEditorPage apiKey={googleMapsApiKey} />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}