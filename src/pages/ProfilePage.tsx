import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, ShieldCheck, LogIn, Save, LogOut } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BD_LOCATIONS } from '../data/bangladeshData';

export function ProfilePage() {
  const { user, isRegisteredUser, userProfile, isAdmin, isSuperAdmin, isVerifiedUser, saveUserProfile, logout } = useStore();

  const divisions = Object.keys(BD_LOCATIONS);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [division, setDivision] = useState('ঢাকা');
  const [district, setDistrict] = useState('ঢাকা');
  const [upazila, setUpazila] = useState('মিরপুর');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setPhone(userProfile.phone || '');
      if (userProfile.division && BD_LOCATIONS[userProfile.division]) {
        setDivision(userProfile.division);
        const dists = Object.keys(BD_LOCATIONS[userProfile.division]);
        if (userProfile.district && dists.includes(userProfile.district)) {
          setDistrict(userProfile.district);
          const ups = BD_LOCATIONS[userProfile.division][userProfile.district] || [];
          if (userProfile.upazila && ups.includes(userProfile.upazila)) {
            setUpazila(userProfile.upazila);
          }
        }
      }
      setAddress(userProfile.address || '');
    }
  }, [userProfile]);

  const districtList = useMemo(() => Object.keys(BD_LOCATIONS[division] || {}), [division]);
  const upazilaList = useMemo(() => BD_LOCATIONS[division]?.[district] || [], [division, district]);

  if (!isRegisteredUser || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FFF0F0] text-[#E31E24] flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-[#2B2B2B]">প্রোফাইল দেখতে লগইন করুন</h1>
        <p className="text-sm text-[#737373]">আপনার ঠিকানা ও অর্ডার তথ্য সংরক্ষণ করতে গুগল বা ইমেইল দিয়ে লগইন করুন।</p>
        <Link
          to="/login"
          state={{ from: '/profile' }}
          className="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-[#E31E24] hover:bg-[#C41419] text-white text-sm font-semibold"
        >
          <LogIn className="w-4 h-4" />
          <span>লগইন করুন</span>
        </Link>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveUserProfile({ fullName, phone, division, district, upazila, address });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="p-5 rounded-2xl bg-white border border-[#E8E8E8] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E31E24] text-white font-bold text-lg flex items-center justify-center uppercase">
            {(userProfile?.fullName || user.email || 'U').charAt(0)}
          </div>
          <div>
            <h1 className="font-heading text-lg sm:text-xl font-bold text-[#2B2B2B]">
              {userProfile?.fullName || user.displayName || 'গ্রাহক'}
            </h1>
            <p className="text-xs sm:text-sm text-[#737373]">{user.email}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-[#E31E24]">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isSuperAdmin ? 'সুপার অ্যাডমিন' : 'অ্যাডমিন'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              to="/admin"
              className="px-4 h-9 rounded-xl bg-[#E31E24] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>অ্যাডমিন প্যানেল</span>
            </Link>
          )}
          <button
            type="button"
            onClick={logout}
            className="px-3.5 h-9 rounded-xl border border-[#E8E8E8] text-xs sm:text-sm font-semibold text-[#525252] hover:text-red-600 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {!isVerifiedUser ? (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800 space-y-2">
          <p className="font-bold">ইমেইল ভেরিফিকেশন সম্পন্ন হয়নি</p>
          <p>প্রোফাইল সংরক্ষণ করতে লগইন পেজ থেকে আপনার ইমেইল ভেরিফাই করুন।</p>
          <Link to="/login" className="inline-block font-semibold text-[#E31E24] hover:underline">
            ভেরিফিকেশন পেজে যান →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSave} className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E8E8] space-y-4">
          <h2 className="font-heading text-base font-bold text-[#2B2B2B]">ডিফল্ট ডেলিভারি ঠিকানা সংরক্ষণ</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-1">পুরো নাম</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-1">মোবাইল নম্বর</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-1">বিভাগ</label>
              <select
                value={division}
                onChange={(e) => {
                  const next = e.target.value;
                  setDivision(next);
                  const d = Object.keys(BD_LOCATIONS[next] || {})[0] || '';
                  setDistrict(d);
                  setUpazila((BD_LOCATIONS[next]?.[d] || [])[0] || '');
                }}
                className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] bg-white text-sm outline-none focus:border-[#E31E24]"
              >
                {divisions.map((div) => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-1">জেলা</label>
              <select
                value={district}
                onChange={(e) => {
                  const d = e.target.value;
                  setDistrict(d);
                  setUpazila((BD_LOCATIONS[division]?.[d] || [])[0] || '');
                }}
                className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] bg-white text-sm outline-none focus:border-[#E31E24]"
              >
                {districtList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-1">থানা / উপজেলা</label>
              <select
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] bg-white text-sm outline-none focus:border-[#E31E24]"
              >
                {upazilaList.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#333333] mb-1">বিস্তারিত ঠিকানা</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="বাসা/হোল্ডিং নম্বর, রোড, এলাকা"
              className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 h-10 rounded-xl bg-[#E31E24] hover:bg-[#C41419] text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
