'use client';

import React, { useState } from 'react';
import { Search, MapPin, ArrowRight, TrendingUp, Bus, AlertTriangle, Users, Compass, Play, CheckCircle, Database, Lock, LogOut, ArrowLeft, LayoutDashboard, Shield, BarChart3, Settings, Menu, X, RefreshCw } from 'lucide-react';
import { FareSubmission } from '@/types';
import ContributeView from '@/components/ContributeView';
import CommunityView from '@/components/CommunityView';
import { supabase } from '@/lib/supabase';

// Modular Admin Pages
import FaresPage from '@/components/admin/FaresPage';
import RoutesPage from '@/components/admin/RoutesPage';
import ReportsPage from '@/components/admin/ReportsPage';
import MediaPage from '@/components/admin/MediaPage';
import ModerationPage from '@/components/admin/ModerationPage';
import UsersPage from '@/components/admin/UsersPage';
import AnalyticsPage from '@/components/admin/AnalyticsPage';
import MapEditorPage from '@/components/admin/MapEditorPage';
import SettingsPage from '@/components/admin/SettingsPage';

interface HomeViewProps {
  fares: FareSubmission[];
  reports: any[];
  loading: boolean;
  publicView: 'home' | 'contribute' | 'datacenter' | 'explore' | 'investor' | 'about' | 'community';
  setPublicView: (view: 'home' | 'contribute' | 'datacenter' | 'explore' | 'investor' | 'about' | 'community') => void;
  fetchDashboardData: () => void;
  googleMapsApiKey: string;
}

export default function HomeView({
  fares = [],
  reports = [],
  loading,
  publicView,
  setPublicView,
  fetchDashboardData,
  googleMapsApiKey
}: HomeViewProps) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveDataDropdownOpen, setLiveDataDropdownOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'fares' | 'routes' | 'reports' | 'media' | 'moderation' | 'users' | 'analytics' | 'map' | 'settings'
  >('overview');

  const [heroBg, setHeroBg] = useState<string | null>(null);
  const [kekeMedia, setKekeMedia] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setPublicView('explore');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'direshion@gmail.com';
    const expectedPassword = '@Direshion';

    if (emailInput.trim() === expectedEmail && passwordInput === expectedPassword) {
      setIsAuthenticated(true);
      setIsAdminMode(true);
      setLoginError('');
      fetchDashboardData();
    } else {
      setLoginError('Invalid credentials. Check your .env.local configuration.');
    }
  };

  // Compute live statistics dynamically from database records with safe fallbacks
  const safeFares = Array.isArray(fares) ? fares : [];
  const safeReports = Array.isArray(reports) ? reports : [];
  
  const totalContributors = new Set(safeFares.map(f => f?.contributor).filter(Boolean)).size || safeFares.length;
  const totalInsights = safeFares.length;
  const activeRoutesCount = new Set(safeFares.map(f => f ? `${f.origin}-${f.destination}` : '')).size;
  const communityPoweredPercent = safeFares.length > 0 ? 100 : 0;

  if (isAdminMode) {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto text-white font-bold shadow-lg shadow-emerald-600/30">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-white">Direshion Admin Portal</h1>
              <p className="text-xs text-slate-400">Secured via environment variables</p>
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
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-lg text-sm cursor-pointer">
                Sign In to Dashboard
              </button>
            </form>

            <div className="text-center pt-2">
              <button type="button" onClick={() => setIsAdminMode(false)} className="text-xs text-slate-400 hover:text-white transition cursor-pointer">← Return to Public Hub</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex font-sans w-full">
        <aside className="w-64 bg-[#0a1b18] text-slate-300 flex flex-col justify-between hidden md:flex border-r border-slate-800">
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
              <img src="/logo.png" alt="Direshion" className="w-10 h-10 object-contain" />
              <div>
                <span className="font-extrabold text-white text-lg tracking-tight">Direshion</span>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Admin Portal</p>
              </div>
            </div>

            <nav className="space-y-1 text-sm font-medium">
              <button type="button" onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${activeTab === 'overview' ? 'bg-emerald-700 text-white font-semibold shadow-md' : 'hover:bg-slate-800/60 text-slate-300'}`}>
                <LayoutDashboard className="w-4 h-4 text-emerald-400" /> Dashboard
              </button>

              <div className="pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">Submissions</div>
              <button type="button" onClick={() => setActiveTab('fares')} className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs transition cursor-pointer pl-8 ${activeTab === 'fares' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                <span>Fares</span>
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px]">{safeFares.length}</span>
              </button>
              <button type="button" onClick={() => setActiveTab('routes')} className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs transition cursor-pointer pl-8 ${activeTab === 'routes' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                <span>Routes & Landmarks</span>
              </button>
              <button type="button" onClick={() => setActiveTab('reports')} className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs transition cursor-pointer pl-8 ${activeTab === 'reports' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                <span>Road Reports</span>
                <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px]">{safeReports.length}</span>
              </button>
              <button type="button" onClick={() => setActiveTab('media')} className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs transition cursor-pointer pl-8 ${activeTab === 'media' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                <span>Media</span>
              </button>

              <div className="pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">Management</div>
              <button type="button" onClick={() => setActiveTab('moderation')} className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs transition cursor-pointer pl-4 ${activeTab === 'moderation' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-amber-400" /> Moderation</span>
              </button>
              <button type="button" onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs transition cursor-pointer pl-4 ${activeTab === 'users' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}><Users className="w-4 h-4" /> Users & Contributors</button>
              <button type="button" onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs transition cursor-pointer pl-4 ${activeTab === 'analytics' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}><BarChart3 className="w-4 h-4" /> Analytics</button>
              <button type="button" onClick={() => setActiveTab('map')} className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs transition cursor-pointer pl-4 ${activeTab === 'map' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}><MapPin className="w-4 h-4" /> Map Editor</button>
              <button type="button" onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs transition cursor-pointer pl-4 ${activeTab === 'settings' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}><Settings className="w-4 h-4" /> Settings</button>
            </nav>
          </div>

          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <img src="/samnetLogo.png" alt="Samnet" className="w-5 h-5 object-contain opacity-80" />
              <span>SAMNET & Direshion</span>
            </div>
            <button type="button" onClick={() => setIsAuthenticated(false)} className="text-slate-400 hover:text-rose-400 transition cursor-pointer" title="Log Out"><LogOut className="w-4 h-4" /></button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setIsAdminMode(false)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-100 px-3 py-1.5 rounded-lg transition cursor-pointer">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Hub
              </button>
              <span className="text-slate-300">|</span>
              <span className="text-sm font-bold text-slate-800 capitalize">{activeTab} View</span>
            </div>
            <div className="flex items-center gap-4">
              <button type="button" onClick={fetchDashboardData} className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Submissions</span>
                    <h3 className="text-3xl font-black text-slate-900 my-2">{safeFares.length + safeReports.length}</h3>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500">Pending Review</span>
                    <h3 className="text-3xl font-black text-slate-900 my-2">{safeFares.filter(f => f.verification_status === 'PENDING').length}</h3>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500">Approved Records</span>
                    <h3 className="text-3xl font-black text-slate-900 my-2">{safeFares.filter(f => f.verification_status === 'APPROVED').length}</h3>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500">Database</span>
                    <h3 className="text-lg font-bold text-slate-900 my-2">Supabase PG</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <h3 className="text-base font-bold text-slate-900">Recent Submissions Feed</h3>
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                          <th className="p-3 font-semibold">Type</th>
                          <th className="p-3 font-semibold">Details</th>
                          <th className="p-3 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {safeFares.slice(0, 4).map((f) => (
                          <tr key={f.id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-emerald-700 uppercase">Fare</td>
                            <td className="p-3 font-semibold text-slate-900">{f.origin} → {f.destination}</td>
                            <td className="p-3 font-bold text-emerald-600">{f.currency}{f.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 mb-3">Map View</h3>
                      <div className="h-44 rounded-xl overflow-hidden border border-slate-200 relative">
                        {googleMapsApiKey && (
                          <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=Port+Harcourt,Nigeria`}></iframe>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={() => setActiveTab('map')} className="mt-4 w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-sm cursor-pointer">
                      View Full Map Editor →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fares' && <FaresPage fares={safeFares} />}
            {activeTab === 'routes' && <RoutesPage />}
            {activeTab === 'reports' && <ReportsPage reports={safeReports} />}
            {activeTab === 'media' && (
              <MediaPage 
                heroBg={heroBg} 
                onHeroBgUpload={(url) => setHeroBg(url)} 
                kekeMedia={kekeMedia} 
                onKekeMediaUpload={(url) => setKekeMedia(url)} 
              />
            )}
            {activeTab === 'moderation' && <ModerationPage fares={safeFares} onApprove={async (id) => {
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans w-full">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPublicView('home')}>
            <img src="/logo.png" alt="Direshion Logo" className="w-10 h-10 object-contain" />
            <div>
              <span className="font-extrabold tracking-tight text-slate-900 text-xl block leading-tight">Direshion</span>
              <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Local Knowledge Hub</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button type="button" onClick={() => setPublicView('home')} className={`transition cursor-pointer ${publicView === 'home' ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'}`}>Home</button>
            <button type="button" onClick={() => setPublicView('explore')} className={`transition cursor-pointer ${publicView === 'explore' ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'}`}>Explore</button>
            <button type="button" onClick={() => setPublicView('contribute')} className={`transition cursor-pointer ${publicView === 'contribute' ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'}`}>Contribute</button>
            <button type="button" onClick={() => setPublicView('community')} className={`transition cursor-pointer ${publicView === 'community' ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'}`}>Community</button>
            <button type="button" onClick={() => setPublicView('investor')} className={`transition cursor-pointer ${publicView === 'investor' ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'}`}>Investor Portal</button>
            <button type="button" onClick={() => setPublicView('about')} className={`transition cursor-pointer ${publicView === 'about' ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'}`}>About</button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 relative z-50">
            <button type="button" onClick={() => setIsAdminMode(true)} className="hidden md:inline-block text-xs font-bold text-emerald-700 hover:underline cursor-pointer">
              Admin Login
            </button>

            <button type="button" onClick={() => setPublicView('community')} className="hidden md:inline-block bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition cursor-pointer">
              Join Community
            </button>

            <button 
              type="button"
              onClick={() => setPublicView('community')} 
              className="md:hidden w-9 h-9 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-xs transition cursor-pointer active:scale-95"
              title="Join Community"
            >
              <Users className="w-4 h-4 pointer-events-none" />
            </button>

            <div className="relative md:hidden">
              <button 
                type="button"
                onClick={() => setLiveDataDropdownOpen(!liveDataDropdownOpen)}
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center shadow-xs transition relative cursor-pointer active:scale-95"
                title="Live Data Center Feed"
              >
                <Database className="w-4 h-4 text-emerald-700 pointer-events-none" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping pointer-events-none"></span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-600 rounded-full pointer-events-none"></span>
              </button>

              {liveDataDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Database Status
                    </span>
                    <button type="button" onClick={() => setLiveDataDropdownOpen(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer">✕</button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600">Total Fares & Reports Recorded:</p>
                    <p className="text-xl font-black text-emerald-700">{safeFares.length + safeReports.length} Entries</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => { setLiveDataDropdownOpen(false); setPublicView('datacenter'); }}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm cursor-pointer"
                  >
                    Access Full Data Center →
                  </button>
                </div>
              )}
            </div>

            <button 
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer active:scale-95"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 pointer-events-none" />
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}></div>
          
          <div className="relative w-80 max-w-full bg-[#0a1b18] text-white p-6 flex flex-col justify-between shadow-2xl z-50">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                  <div>
                    <span className="font-extrabold text-base tracking-tight">Direshion</span>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase">Local Knowledge Hub</p>
                  </div>
                </div>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-2 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2 text-sm font-semibold">
                <button type="button" onClick={() => { setMobileMenuOpen(false); setPublicView('home'); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">Home</button>
                <button type="button" onClick={() => { setMobileMenuOpen(false); setPublicView('explore'); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">Explore</button>
                <button type="button" onClick={() => { setMobileMenuOpen(false); setPublicView('contribute'); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">Contribute</button>
                <button type="button" onClick={() => { setMobileMenuOpen(false); setPublicView('community'); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition text-emerald-400 font-bold cursor-pointer">Community</button>
                <button type="button" onClick={() => { setMobileMenuOpen(false); setPublicView('investor'); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">Investor Portal</button>
                <button type="button" onClick={() => { setMobileMenuOpen(false); setPublicView('about'); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">About</button>
              </nav>
            </div>

            <div className="space-y-3 border-t border-slate-800 pt-4">
              <button type="button" onClick={() => { setMobileMenuOpen(false); setIsAdminMode(true); }} className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-3 rounded-xl text-xs transition text-center cursor-pointer">
                Admin Login
              </button>
              <div className="text-[11px] text-slate-500 text-center">SAMNET & Direshion © 2026</div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 w-full pb-12">
        {publicView === 'contribute' ? (
          <ContributeView onSuccessSubmission={() => { fetchDashboardData(); setPublicView('datacenter'); }} apiKey={googleMapsApiKey} />
        ) : publicView === 'community' ? (
          <CommunityView 
            onNavigateHome={() => setPublicView('home')}
            onNavigateToDataCenter={() => setPublicView('datacenter')}
            onNavigateToContribute={() => setPublicView('contribute')}
            fares={safeFares}
          />
        ) : publicView === 'datacenter' ? (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-6 h-6 text-emerald-600" /> Direshion Live Data Center
                </h2>
                <p className="text-sm text-slate-500">Viewing all crowdsourced entries supplied to Supabase database.</p>
              </div>
              <button type="button" onClick={() => setPublicView('home')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
                ← Back to Home
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3 font-semibold">Mode</th>
                    <th className="p-3 font-semibold">Origin → Destination</th>
                    <th className="p-3 font-semibold">Amount</th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {safeFares.map((fare) => (
                    <tr key={fare.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold uppercase text-emerald-700">{fare.transport_mode}</td>
                      <td className="p-3 font-semibold text-slate-900">{fare.origin} → {fare.destination}</td>
                      <td className="p-3 font-bold text-emerald-600">{fare.currency}{fare.amount}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">{fare.verification_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : publicView === 'explore' ? (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
            <h2 className="text-3xl font-bold text-slate-900">Explore Port Harcourt Transport Corridors</h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">Browse verified routes, transfer stops, and transit maps across all districts.</p>
            <button type="button" onClick={() => setPublicView('home')} className="bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer">Return Home</button>
          </div>
        ) : publicView === 'investor' ? (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
            <h2 className="text-3xl font-bold text-slate-900">Direshion Investor Portal</h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">Pre-launch investment metrics, macroeconomic data integrations, and growth forecasts.</p>
            <button type="button" onClick={() => setPublicView('home')} className="bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer">Return Home</button>
          </div>
        ) : publicView === 'about' ? (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
            <h2 className="text-3xl font-bold text-slate-900">About Direshion & SAMNET</h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">Empowering local transit mobility through crowdsourced knowledge and advanced digital mapping.</p>
            <button type="button" onClick={() => setPublicView('home')} className="bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer">Return Home</button>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12 pb-16 bg-slate-50 text-slate-900 w-full pt-0 mt-0 relative z-10">
            <div className="hidden md:flex max-w-7xl mx-auto px-4 pt-4 justify-end">
              <button
                type="button"
                onClick={() => setPublicView('datacenter')}
                className="px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer active:scale-95"
              >
                <Database className="w-3.5 h-3.5 text-emerald-700" /> Live Data Center Feed ({safeFares.length} Entries)
              </button>
            </div>

            <section 
              className="relative w-full bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white py-12 md:py-16 px-6 md:px-12 shadow-xl overflow-hidden bg-cover bg-center transition-all duration-500 mt-0 pt-6 md:pt-16"
              style={heroBg ? { backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(6, 78, 59, 0.85)), url(${heroBg})` } : {}}
            >
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
              
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-20">
                <div className="lg:col-span-7 space-y-6">
                  <div className="text-emerald-400 text-xs font-bold tracking-widest uppercase">
                    REAL PEOPLE + LOCAL KNOWLEDGE = BETTER JOURNEYS
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                    Your Community.<br />
                    Better <span className="text-emerald-400">Directions.</span>
                  </h1>
                  
                  <p className="text-slate-300 text-sm md:text-lg max-w-xl">
                    Share and access local transport fares, routes, landmarks, road conditions and more. Help build a smarter, safer, and more connected Port Harcourt.
                  </p>

                  <form onSubmit={handleSearchSubmit} className="bg-white p-2 rounded-2xl shadow-2xl flex items-center max-w-xl relative z-30">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 ml-2 sm:ml-3 shrink-0" />
                    <input 
                      type="text"
                      placeholder="Search for a route, location, fare..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-slate-900 placeholder-slate-400 focus:outline-none text-xs sm:text-base bg-transparent"
                    />
                    <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition shrink-0 text-xs sm:text-sm cursor-pointer active:scale-95">
                      Search
                    </button>
                  </form>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-xs relative z-30">
                    <span className="text-slate-300 font-medium">Popular:</span>
                    {['Rumuola → Woji', 'Keke fare', 'Bus stops', 'Road condition'].map((pill, idx) => (
                      <button 
                        key={idx} 
                        type="button"
                        onClick={() => setPublicView('explore')}
                        className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full cursor-pointer transition border border-white/15 text-white text-[11px] sm:text-xs active:scale-95"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4 relative z-30">
                  <div className="bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-2xl p-5 shadow-2xl text-white">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                      <span className="font-bold text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Database Updates
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">Live</span>
                    </div>
                    
                    <div className="space-y-3 text-xs">
                      {safeFares.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><Bus className="w-4 h-4" /></div>
                          <div>
                            <p className="font-semibold text-slate-200">{item.origin} → {item.destination}</p>
                            <p className="text-emerald-400 font-bold">Fare: {item.currency}{item.amount} • {item.contributor}</p>
                          </div>
                        </div>
                      ))}
                      {safeFares.length === 0 && (
                        <div className="text-center text-slate-400 py-4 text-xs">No live submissions yet. Be the first to contribute!</div>
                      )}
                    </div>

                    <button 
                      type="button"
                      onClick={() => setPublicView('datacenter')}
                      className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer active:scale-95"
                    >
                      View all database entries →
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 space-y-10 relative z-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => setPublicView('contribute')} className="bg-white border border-slate-200 hover:border-emerald-500/50 transition rounded-2xl p-6 flex flex-col justify-between group cursor-pointer shadow-sm active:scale-98">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4 border border-emerald-100">
                      <Bus className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Report a Fare</h3>
                    <p className="text-slate-600 text-sm mb-4">Share what you paid for your trip and help others plan accurately.</p>
                  </div>
                  <div className="flex items-center text-emerald-700 text-sm font-semibold gap-1 group-hover:translate-x-1 transition">
                    Contribute <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <div onClick={() => setPublicView('contribute')} className="bg-white border border-slate-200 hover:border-amber-500/50 transition rounded-2xl p-6 flex flex-col justify-between group cursor-pointer shadow-sm active:scale-98">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4 border border-amber-100">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Add Route / Landmark</h3>
                    <p className="text-slate-600 text-sm mb-4">Help map keke parks, bus stops, transfer points and local landmarks.</p>
                  </div>
                  <div className="flex items-center text-amber-700 text-sm font-semibold gap-1 group-hover:translate-x-1 transition">
                    Add Info <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <div onClick={() => setPublicView('contribute')} className="bg-white border border-slate-200 hover:border-rose-500/50 transition rounded-2xl p-6 flex flex-col justify-between group cursor-pointer shadow-sm active:scale-98">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold mb-4 border border-rose-100">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Report Road Issue</h3>
                    <p className="text-slate-600 text-sm mb-4">Share traffic, flooding, road closures and other transit disruptions.</p>
                  </div>
                  <div className="flex items-center text-rose-700 text-sm font-semibold gap-1 group-hover:translate-x-1 transition">
                    Report Issue <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <div onClick={() => setPublicView('explore')} className="bg-white border border-slate-200 hover:border-blue-500/50 transition rounded-2xl p-6 flex flex-col justify-between group cursor-pointer shadow-sm active:scale-98">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4 border border-blue-100">
                      <Compass className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Explore Knowledge</h3>
                    <p className="text-slate-600 text-sm mb-4">Browse verified fares, routes, reports and community insights.</p>
                  </div>
                  <div className="flex items-center text-blue-700 text-sm font-semibold gap-1 group-hover:translate-x-1 transition">
                    Explore <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="relative h-40 bg-slate-200">
                    <div 
                      className="absolute inset-0 bg-cover bg-center" 
                      style={{ backgroundImage: `url('${kekeMedia || 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'}')` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button type="button" onClick={() => setPublicView('contribute')} className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md hover:scale-105 transition cursor-pointer active:scale-95">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900">Together we make Port Harcourt move.</h3>
                    <p className="text-[11px] text-slate-600">Watch how real commuters contribute local knowledge.</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Trending Routes
                      </h2>
                      <button type="button" onClick={() => setPublicView('explore')} className="text-[10px] text-emerald-700 font-semibold hover:underline cursor-pointer">View all</button>
                    </div>

                    <div className="space-y-2">
                      {safeFares.slice(0, 3).map((item) => (
                        <div key={item.id} className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <h4 className="font-bold text-slate-900 text-[11px]">{item.origin} → {item.destination}</h4>
                            <span className="text-[10px] text-slate-500 uppercase">{item.transport_mode}</span>
                          </div>
                          <span className="text-emerald-700 font-bold">{item.currency}{item.amount}</span>
                        </div>
                      ))}
                      {safeFares.length === 0 && (
                        <div className="text-xs text-slate-400 py-6 text-center">No trending routes yet.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-600" /> Recent Activity
                      </h2>
                      <button type="button" onClick={() => setPublicView('datacenter')} className="text-[10px] text-emerald-700 font-semibold hover:underline cursor-pointer">View all</button>
                    </div>

                    <div className="space-y-2">
                      {safeFares.slice(0, 3).map((contrib) => (
                        <div key={contrib.id} className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-700 uppercase">{contrib.transport_mode} Fare</span>
                            <p className="font-semibold text-slate-800 text-[11px] truncate max-w-[130px]">{contrib.origin} → {contrib.destination}</p>
                          </div>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        </div>
                      ))}
                      {safeFares.length === 0 && (
                        <div className="text-xs text-slate-400 py-6 text-center">No recent activity.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 border border-emerald-800/30 rounded-2xl p-5 shadow-md flex flex-col justify-between text-white">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                      <Users className="w-3 h-3" /> Community Power
                    </div>
                    <h3 className="text-sm font-bold">Your knowledge helps the community.</h3>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Share fares, routes and road conditions to make Port Harcourt move better.
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setPublicView('contribute')}
                    className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded-xl transition shadow-sm text-xs cursor-pointer active:scale-95"
                  >
                    Start Contributing
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-sm">
                <div>
                  <div className="text-2xl font-black text-slate-900">{totalContributors}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Contributors</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{totalInsights}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Local insights</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{activeRoutesCount}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Active routes</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{communityPoweredPercent}%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Community powered</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-10 px-4 text-center text-xs text-slate-500 space-y-4 shadow-inner">
        <div className="flex items-center justify-center gap-3">
          <img src="/samnetLogo.png" alt="SAMNET Logo" className="w-6 h-6 object-contain opacity-90" />
          <span className="font-semibold text-slate-800">Developed and Managed by SAMNET Industrials LTD & Direshion Inc.</span>
        </div>
        <p className="text-slate-400">Direshion Local Knowledge Hub • Pre-launch phase running until December 31, 2026.</p>
      </footer>
    </div>
  );
}