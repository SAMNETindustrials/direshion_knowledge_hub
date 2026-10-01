'use client';
import React from 'react';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">System Settings</h2>
        <p className="text-xs text-slate-500">Configure database parameters and environment credentials.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3 text-xs">
        <div className="flex justify-between p-3 bg-slate-50 rounded-xl"><span>Supabase URL</span><strong>hypgwuuokidpkodbygtk.supabase.co</strong></div>
        <div className="flex justify-between p-3 bg-slate-50 rounded-xl"><span>Project Deadline</span><strong className="text-emerald-700">December 31, 2026</strong></div>
      </div>
    </div>
  );
}