'use client';
import React from 'react';
import { Users } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Users & Contributors Management</h2>
        <p className="text-xs text-slate-500">Track active community members and reputation metrics.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-xs text-slate-700 space-y-2">
        <div className="flex justify-between pb-2 border-b border-slate-100"><strong>Chinedu A.</strong> <span>48 contributions</span></div>
        <div className="flex justify-between pb-2 border-b border-slate-100"><strong>Blessing E.</strong> <span>42 contributions</span></div>
        <div className="flex justify-between"><strong>Samuel T.</strong> <span>38 contributions</span></div>
      </div>
    </div>
  );
}