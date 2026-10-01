'use client';
import React from 'react';
import { Video, Upload, Image as ImageIcon } from 'lucide-react';

interface MediaPageProps {
  heroBg: string | null;
  onHeroBgUpload: (url: string) => void;
  kekeMedia: string | null;
  onKekeMediaUpload: (url: string) => void;
}

export default function MediaPage({ heroBg, onHeroBgUpload, kekeMedia, onKekeMediaUpload }: MediaPageProps) {
  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onHeroBgUpload(url);
    }
  };

  const handleKekeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onKekeMediaUpload(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Media & Campaign Assets</h2>
        <p className="text-xs text-slate-500">Upload and manage hero banner backgrounds and Keke promotional media displayed on the public hub.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hero Background Upload */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-600" /> Public Hub Hero Background
          </h3>
          <div className="h-32 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
            {heroBg ? (
              <img src={heroBg} alt="Hero Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">Default Gradient Active</div>
            )}
          </div>
          <label className="cursor-pointer w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm">
            <Upload className="w-4 h-4" /> Upload New Hero Image
            <input type="file" accept="image/*" onChange={handleHeroFileChange} className="hidden" />
          </label>
        </div>

        {/* Keke Ads Media Upload */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Video className="w-4 h-4 text-emerald-600" /> Keke Ads Card Media (Image/Video)
          </h3>
          <div className="h-32 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
            {kekeMedia ? (
              <img src={kekeMedia} alt="Keke Ad Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">Default Keke Image Active</div>
            )}
          </div>
          <label className="cursor-pointer w-full bg-amber-500 hover:bg-amber-600 text-slate-950 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm">
            <Upload className="w-4 h-4" /> Upload Keke Ad Media
            <input type="file" accept="image/*,video/*" onChange={handleKekeFileChange} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}