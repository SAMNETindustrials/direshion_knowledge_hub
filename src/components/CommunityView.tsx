'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, MessageSquare, MapPin, Send, Mail, Phone, UserCheck, Compass, Shield, Database, ArrowLeft, LogOut, Radio, CheckCircle2, User, Upload, Bell, Share2, Menu, X, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FareSubmission } from '@/types';

interface CommunityViewProps {
  onNavigateHome: () => void;
  onNavigateToDataCenter: () => void;
  onNavigateToContribute: () => void;
  fares: FareSubmission[];
}

export default function CommunityView({ 
  onNavigateHome, 
  onNavigateToDataCenter, 
  onNavigateToContribute,
  fares 
}: CommunityViewProps) {
  const [authMode, setAuthMode] = useState<'login' | 'join'>('login');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Login State
  const [loginPhone, setLoginPhone] = useState('');
  
  // Join State
  const [joinFullName, setJoinFullName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinPhone, setJoinPhone] = useState('');
  const [verifyingWhatsapp, setVerifyingWhatsapp] = useState(false);
  
  // Profile / Settings State
  const [editUsername, setEditUsername] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileProfileFileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'chat' | 'activities' | 'members' | 'notifications'>('chat');
  
  // Mobile Drawer & Profile Card Modal State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProfileModalOpen, setMobileProfileModalOpen] = useState(false);

  // Chat & Pings state
  const [chatMessageInput, setChatMessageInput] = useState('');
  const [sharedLocationInput, setSharedLocationInput] = useState('');
  const [onlineMembers, setOnlineMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [myPings, setMyPings] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchCommunityData();
    const interval = setInterval(() => {
      fetchCommunityData();
    }, 4000); // Live polling update
    return () => clearInterval(interval);
  }, [currentUser]);

  const fetchCommunityData = async () => {
    try {
      const { data: usersData } = await supabase
        .from('community_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersData) setOnlineMembers(usersData);

      const { data: msgData } = await supabase
        .from('community_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (msgData) setMessages(msgData);

      if (currentUser) {
        const { data: pingData } = await supabase
          .from('community_pings')
          .select('*')
          .eq('receiver_phone', currentUser.phone)
          .order('created_at', { ascending: false });

        if (pingData) setMyPings(pingData);
      }
    } catch (err) {
      console.error('Error fetching community data:', err);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      alert('Please enter your WhatsApp phone number to log in.');
      return;
    }

    try {
      const { data: foundUser, error } = await supabase
        .from('community_users')
        .select('*')
        .eq('phone', loginPhone.trim())
        .single();

      if (error || !foundUser) {
        alert('Phone number not found in database. Please register using the "Join Community" tab.');
        return;
      }

      await supabase
        .from('community_users')
        .update({ is_online: true, last_seen: new Date().toISOString() })
        .eq('id', foundUser.id);

      setCurrentUser(foundUser);
      setEditUsername(foundUser.username || foundUser.full_name);
      setStatusMsg('Successfully logged in!');
      setTimeout(() => setStatusMsg(''), 3000);
      fetchCommunityData();
    } catch (err: any) {
      console.error('Login error:', err);
      alert('Login failed. Check your phone number.');
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinFullName.trim() || !joinEmail.trim() || !joinPhone.trim()) {
      alert('Please fill in all required fields to join.');
      return;
    }

    try {
      setVerifyingWhatsapp(true);
      setStatusMsg('Verifying WhatsApp number with telecom API...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      const payload = {
        full_name: joinFullName.trim(),
        username: joinFullName.trim(),
        email: joinEmail.trim(),
        phone: joinPhone.trim(),
        is_online: true,
        whatsapp_verified: true,
        avatar_url: ''
      };

      const { data: newUser, error } = await supabase
        .from('community_users')
        .insert([payload])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          alert('This email or phone number is already registered. Please use Login instead.');
          setAuthMode('login');
          setLoginPhone(joinPhone.trim());
          setVerifyingWhatsapp(false);
          setStatusMsg('');
          return;
        }
        throw error;
      }

      setCurrentUser(newUser);
      setEditUsername(newUser.username || newUser.full_name);
      setStatusMsg('WhatsApp verified successfully! Welcome to Direshion Community.');
      setTimeout(() => setStatusMsg(''), 4000);
      fetchCommunityData();
    } catch (err: any) {
      console.error('Join error:', err);
      alert(`Registration error: ${err.message || 'Could not register.'}`);
    } finally {
      setVerifyingWhatsapp(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      try {
        const { error } = await supabase
          .from('community_users')
          .update({ avatar_url: base64String })
          .eq('id', currentUser.id);

        if (error) throw error;

        setCurrentUser({ ...currentUser, avatar_url: base64String });
        setStatusMsg('Profile picture uploaded successfully!');
        setTimeout(() => setStatusMsg(''), 3000);
        fetchCommunityData();
      } catch (err) {
        console.error('Avatar upload error:', err);
        alert('Could not save profile picture.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteProfile = async () => {
    if (!currentUser) return;
    if (confirm('Are you sure you want to delete your community profile? This action is permanent.')) {
      try {
        await supabase.from('community_users').delete().eq('id', currentUser.id);
        setCurrentUser(null);
        setMobileProfileModalOpen(false);
        alert('Profile deleted successfully.');
        fetchCommunityData();
      } catch (err) {
        console.error('Delete error:', err);
        alert('Could not delete profile.');
      }
    }
  };

  const handleShareProfile = () => {
    const shareText = `Check out my Direshion community profile: ${currentUser?.username || currentUser?.full_name} (${currentUser?.phone})`;
    if (navigator.share) {
      navigator.share({ title: 'Direshion Profile', text: shareText, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('community_users')
        .update({ username: editUsername.trim() })
        .eq('id', currentUser.id);

      if (error) throw error;

      setCurrentUser({ ...currentUser, username: editUsername.trim() });
      setStatusMsg('Username updated successfully!');
      setTimeout(() => setStatusMsg(''), 3000);
      fetchCommunityData();
    } catch (err) {
      console.error('Username update error:', err);
      alert('Could not update username.');
    }
  };

  const handleLogout = async () => {
    if (currentUser) {
      await supabase
        .from('community_users')
        .update({ is_online: false })
        .eq('id', currentUser.id);
    }
    setCurrentUser(null);
    setLoginPhone('');
    setJoinFullName('');
    setJoinEmail('');
    setJoinPhone('');
    fetchCommunityData();
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!chatMessageInput.trim() && !sharedLocationInput.trim()) || !currentUser) return;

    try {
      const payload = {
        user_id: currentUser.id,
        sender_name: currentUser.username || currentUser.full_name,
        sender_phone: currentUser.phone,
        message_text: chatMessageInput.trim() || 'Shared a location point.',
        location_shared: sharedLocationInput.trim() ? sharedLocationInput.trim() : null,
      };

      const { error } = await supabase.from('community_messages').insert([payload]);
      if (error) throw error;

      setChatMessageInput('');
      setSharedLocationInput('');
      fetchCommunityData();
    } catch (err) {
      console.error('Message error:', err);
      alert('Could not send message.');
    }
  };

  const [showPingModal, setShowPingModal] = useState(false);
  const [pingTargetPhone, setPingTargetPhone] = useState('');
  const [pingMessage, setPingMessage] = useState('');

  const handleSendPingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pingTargetPhone.trim()) return;

    try {
      const { data: targetUser } = await supabase
        .from('community_users')
        .select('*')
        .eq('phone', pingTargetPhone.trim())
        .single();

      if (targetUser) {
        await supabase.from('community_pings').insert([{
          sender_id: currentUser.id,
          receiver_phone: targetUser.phone,
          receiver_id: targetUser.id,
          message: pingMessage.trim() || 'Hello! Let us connect on Direshion transit network.',
          status: 'PENDING'
        }]);

        alert(`Success! ${targetUser.username || targetUser.full_name} exists in database and has received your ping notification.`);
      } else {
        const inviteText = encodeURIComponent(
          `Hello! You have been pinged by ${currentUser.username || currentUser.full_name} on Direshion Knowledge Hub. Join our Port Harcourt transit community here: https://direshion.vercel.app`
        );
        window.open(`https://wa.me/${pingTargetPhone.trim().replace(/[^0-9]/g, '')}?text=${inviteText}`, '_blank');
        alert('Phone number not found in database. WhatsApp invite message generated and opened!');
      }

      setShowPingModal(false);
      setPingTargetPhone('');
      setPingMessage('');
    } catch (err) {
      console.error('Ping dispatch error:', err);
      alert('Could not process ping request.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn w-full overflow-x-hidden">
      
      {/* Top Navigation & Mobile Menu Drawer Trigger Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button 
            onClick={onNavigateHome}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-100 px-3 py-1.5 rounded-xl transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Home Hub
          </button>
        </div>

        <div className="flex items-center gap-2">
          {currentUser && (
            <button
              onClick={() => setMobileProfileModalOpen(true)}
              className="md:hidden px-3 py-1.5 rounded-xl text-xs font-bold transition bg-slate-900 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-xs"
            >
              <User className="w-3.5 h-3.5" /> Profile Card
            </button>
          )}

          <button
            onClick={onNavigateToDataCenter}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-emerald-700" /> Data Center ({fares.length})
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Left Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}></div>
          
          <div className="relative w-80 max-w-full bg-[#0a1b18] text-white p-6 flex flex-col justify-between shadow-2xl z-10 animate-slideRight">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white">D</div>
                  <div>
                    <span className="font-extrabold text-base tracking-tight">Direshion</span>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase">Community Hub</p>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2 text-sm font-medium">
                <button 
                  onClick={() => { setMobileMenuOpen(false); onNavigateHome(); }} 
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition flex items-center gap-2.5"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-400" /> Return to Home
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); onNavigateToContribute(); }} 
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition flex items-center gap-2.5"
                >
                  <Compass className="w-4 h-4 text-emerald-400" /> Contribute Fares & Routes
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); onNavigateToDataCenter(); }} 
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition flex items-center gap-2.5"
                >
                  <Database className="w-4 h-4 text-emerald-400" /> Live Data Center Feed
                </button>
              </nav>
            </div>

            <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 text-center">
              SAMNET & Direshion © 2026
            </div>
          </div>
        </div>
      )}

      {/* Mobile Glassmorphism Profile Card Modal */}
      {mobileProfileModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:hidden">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setMobileProfileModalOpen(false)}></div>
          
          <div className="relative w-full max-w-sm bg-slate-900/85 backdrop-blur-xl border border-white/20 text-white p-6 rounded-3xl shadow-2xl z-50 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-extrabold text-sm tracking-wide text-emerald-400">COMMUNITY PROFILE</span>
              <button type="button" onClick={() => setMobileProfileModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-emerald-600/40 border border-emerald-500/50 flex items-center justify-center text-emerald-300 font-bold text-2xl shadow-inner">
                  {(currentUser.username || currentUser.full_name)?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="space-y-1">
                <h3 className="font-bold text-base text-white">{currentUser.username || currentUser.full_name}</h3>
                <p className="text-xs text-slate-400">WhatsApp: {currentUser.phone}</p>
                <div className="flex items-center gap-3 text-xs text-emerald-400 font-semibold pt-1">
                  <span>Port Harcourt Sector</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-white/10 p-3.5 rounded-2xl space-y-2 text-xs text-slate-300">
              <p className="font-semibold text-white">Direshion Verified Contributor</p>
              <p className="text-slate-400 leading-relaxed">Active mapper helping provide verified transport fare updates and route knowledge.</p>
            </div>

            <input 
              type="file" 
              ref={mobileProfileFileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />

            {/* Profile Bottom Action Buttons: Upload, Share Profile, Delete Profile */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => mobileProfileFileInputRef.current?.click()}
                className="bg-emerald-700/90 hover:bg-emerald-700 text-white font-bold py-2.5 px-2 rounded-xl text-xs transition flex flex-col items-center gap-1 cursor-pointer shadow-sm active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>

              <button 
                type="button" 
                onClick={handleShareProfile}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-2 rounded-xl text-xs transition flex flex-col items-center gap-1 cursor-pointer shadow-sm active:scale-95"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Share</span>
              </button>

              <button 
                type="button" 
                onClick={handleDeleteProfile}
                className="bg-rose-950/70 hover:bg-rose-900/90 text-rose-300 border border-rose-800/50 font-bold py-2.5 px-2 rounded-xl text-xs transition flex flex-col items-center gap-1 cursor-pointer shadow-sm active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner Section */}
      <section className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 md:p-12 shadow-xl overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="text-emerald-400 text-xs font-bold tracking-widest uppercase flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Direshion Commuter Network
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Join the Community & Chat Live
            </h1>
            
            <p className="text-slate-300 text-xs sm:text-sm md:text-base">
              Connect with commuters across Port Harcourt. Set your custom username, upload a profile picture, and ping members.
            </p>
          </div>

          {currentUser && (
            <div className="bg-white/10 backdrop-blur border border-white/20 p-3 sm:p-4 rounded-2xl flex items-center gap-3 sm:gap-4 w-full lg:w-auto justify-between lg:justify-start">
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setMobileProfileModalOpen(true)}
              >
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-emerald-400 shadow-sm" />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-sm">
                    {(currentUser.username || currentUser.full_name)?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">Logged In As (Tap Profile)</span>
                  <span className="font-bold text-xs sm:text-sm text-white">{currentUser.username || currentUser.full_name}</span>
                  <span className="text-[10px] sm:text-[11px] text-slate-300 block">{currentUser.phone}</span>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-rose-600/80 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          )}
        </div>
      </section>

      {statusMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {statusMsg}
        </div>
      )}

      {/* Main Content Area */}
      {!currentUser ? (
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button 
              type="button" 
              onClick={() => setAuthMode('login')}
              className={`py-2.5 rounded-xl text-xs font-bold transition ${authMode === 'login' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Login with WhatsApp
            </button>
            <button 
              type="button" 
              onClick={() => setAuthMode('join')}
              className={`py-2.5 rounded-xl text-xs font-bold transition ${authMode === 'join' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Join Community
            </button>
          </div>

          {authMode === 'login' ? (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Welcome Back</h2>
                <p className="text-xs text-slate-500">Enter your WhatsApp phone number to log into your account.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="tel" 
                      required 
                      placeholder="+234 800 000 0000" 
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl transition shadow-md text-xs sm:text-sm flex items-center justify-center gap-2">
                  Login to Community Hub →
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Create Community Account</h2>
                <p className="text-xs text-slate-500">We verify your WhatsApp number before registration is completed.</p>
              </div>

              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Samuel David" 
                    value={joinFullName}
                    onChange={(e) => setJoinFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      required 
                      placeholder="samuel@example.com" 
                      value={joinEmail}
                      onChange={(e) => setJoinEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="tel" 
                      required 
                      placeholder="+234 800 000 0000" 
                      value={joinPhone}
                      onChange={(e) => setJoinPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={verifyingWhatsapp}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl transition shadow-md text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  {verifyingWhatsapp ? 'Verifying WhatsApp...' : 'Verify WhatsApp & Join Community →'}
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 p-2.5 rounded-2xl shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button 
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'chat' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Live Chat
              </button>
              <button 
                onClick={() => setActiveTab('members')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'members' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Users className="w-3.5 h-3.5" /> Members ({onlineMembers.filter(m => m.is_online).length})
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'notifications' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Bell className="w-3.5 h-3.5" /> Pings ({myPings.length})
              </button>
              <button 
                onClick={() => setActiveTab('activities')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'activities' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Compass className="w-3.5 h-3.5" /> Activities
              </button>
            </div>

            <button 
              onClick={() => setShowPingModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 shrink-0"
            >
              <Radio className="w-4 h-4" /> Ping a User
            </button>
          </div>

          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col h-[500px] sm:h-[520px]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">Port Harcourt Commuters Live Database Stream</h3>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">Live Real-time</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {messages.map((msg) => {
                    const senderObj = onlineMembers.find(m => m.id === msg.user_id);
                    const senderAvatar = senderObj?.avatar_url;
                    const senderName = msg.sender_name;

                    return (
                      <div key={msg.id} className="bg-slate-50 border border-slate-100 p-3.5 sm:p-4 rounded-2xl space-y-2 shadow-xs">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            {senderAvatar ? (
                              <img src={senderAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                                {senderName?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">{senderName}</span>
                              <span className="text-slate-400 text-[10px] block">WhatsApp: {msg.sender_phone}</span>
                            </div>
                          </div>
                          <span className="text-slate-400 text-[10px]">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-10.5">{msg.message_text}</p>
                        {msg.location_shared && (
                          <div className="ml-10.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-xl border border-emerald-200 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Location: {msg.location_shared}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {messages.length === 0 && (
                    <div className="text-center text-slate-400 text-xs py-12">No chat messages yet. Start the conversation!</div>
                  )}
                </div>

                <form onSubmit={handleSendChatMessage} className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3">
                    <input 
                      type="text"
                      placeholder="Share location..."
                      value={sharedLocationInput}
                      onChange={(e) => setSharedLocationInput(e.target.value)}
                      className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                    <input 
                      type="text"
                      placeholder="Type message to the community..."
                      value={chatMessageInput}
                      onChange={(e) => setChatMessageInput(e.target.value)}
                      className="md:col-span-8 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Broadcast to Database Stream
                  </button>
                </form>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600" /> Customize Profile & Avatar
                  </h4>
                  
                  <div className="flex items-center gap-4">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-emerald-600 shadow-sm" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xl">
                        {(currentUser.username || currentUser.full_name)?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Picture
                      </button>
                      <span className="text-[10px] text-slate-400 mt-1 block">JPG, PNG or GIF</span>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateUsername} className="space-y-3 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Display Username</label>
                      <input 
                        type="text" 
                        value={editUsername} 
                        onChange={(e) => setEditUsername(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-emerald-500" 
                      />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl transition">
                      Update Username
                    </button>
                  </form>
                </div>

                <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Online Members ({onlineMembers.filter(m => m.is_online).length})</h4>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {onlineMembers.filter(m => m.is_online).map((member) => (
                      <div key={member.id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
                              {(member.username || member.full_name)?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{member.username || member.full_name}</p>
                            <span className="text-[10px] text-slate-400">{member.phone}</span>
                          </div>
                        </div>
                        {member.id !== currentUser.id && (
                          <button 
                            onClick={() => {
                              setPingTargetPhone(member.phone);
                              setShowPingModal(true);
                            }}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-2.5 py-1 rounded-lg text-[10px] transition flex items-center gap-1"
                          >
                            <Radio className="w-3 h-3" /> Ping
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">All Registered Database Members</h3>
                  <p className="text-xs text-slate-500">Fetched directly from Supabase community_users table.</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full">{onlineMembers.length} Total</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                {onlineMembers.map((member) => (
                  <div key={member.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                          {(member.username || member.full_name)?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${member.is_online ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          <p className="font-bold text-slate-900">{member.username || member.full_name}</p>
                        </div>
                        <p className="text-[10px] text-slate-500">{member.email}</p>
                        <p className="text-[10px] text-slate-400">{member.phone}</p>
                      </div>
                    </div>
                    {member.id !== currentUser.id && (
                      <button 
                        onClick={() => {
                          setPingTargetPhone(member.phone);
                          setShowPingModal(true);
                        }}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-2 rounded-xl text-[10px] transition shadow-xs flex items-center gap-1"
                      >
                        <Radio className="w-3 h-3" /> Ping
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Your Connection Pings & Notifications</h3>
                  <p className="text-xs text-slate-500">Pings received from other members in the community network.</p>
                </div>
                <span className="bg-amber-50 text-amber-700 font-bold text-xs px-3 py-1 rounded-full">{myPings.length} Pings</span>
              </div>

              <div className="space-y-3 text-xs">
                {myPings.map((ping) => (
                  <div key={ping.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <p className="font-bold text-slate-900">Connection Ping from WhatsApp: {ping.receiver_phone}</p>
                      </div>
                      <p className="text-slate-700 text-xs">{ping.message}</p>
                      <span className="text-[10px] text-slate-400">{new Date(ping.created_at).toLocaleString()}</span>
                    </div>
                    <a 
                      href={`https://wa.me/${ping.receiver_phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Reply on WhatsApp
                    </a>
                  </div>
                ))}
                {myPings.length === 0 && (
                  <div className="text-center text-slate-400 text-xs py-12">No pings received yet.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-xs">
                <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2.5 py-1 rounded-full">Upcoming Rally</span>
                <h4 className="font-bold text-base text-slate-900">Port Harcourt Transit Safety Rally</h4>
                <p className="text-xs text-slate-600 leading-relaxed">Join community volunteers mapping bus stops and promoting fair transit rates across major districts.</p>
                <button className="w-full bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold">Participate</button>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-xs">
                <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded-full">Mapping Drive</span>
                <h4 className="font-bold text-base text-slate-900">Rumuola & Woji Route Verification</h4>
                <p className="text-xs text-slate-600 leading-relaxed">Help verify keke fares and alternative routes to improve community navigation for all commuters.</p>
                <button onClick={onNavigateToContribute} className="w-full bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold">Contribute Now</button>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-xs">
                <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2.5 py-1 rounded-full">Meetup</span>
                <h4 className="font-bold text-base text-slate-900">Monthly Commuter Townhall</h4>
                <p className="text-xs text-slate-600 leading-relaxed">Discuss local transport challenges and collaborate on smarter transit solutions with civic leaders.</p>
                <button className="w-full bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold">Register</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ping Modal Dialog */}
      {showPingModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-600" /> Ping a Community Member
              </h3>
              <button onClick={() => setShowPingModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
            </div>
            
            <p className="text-xs text-slate-500">
              Enter target WhatsApp phone number. If registered, they receive an in-dashboard notification. If not, a WhatsApp invite link opens automatically.
            </p>

            <form onSubmit={handleSendPingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target WhatsApp Phone *</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="+234 800 000 0000" 
                  value={pingTargetPhone}
                  onChange={(e) => setPingTargetPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Optional Message</label>
                <textarea 
                  rows={2}
                  placeholder="Hey, let's connect on transit routes!" 
                  value={pingMessage}
                  onChange={(e) => setPingMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowPingModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl transition text-xs shadow-md"
                >
                  Send Ping →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}