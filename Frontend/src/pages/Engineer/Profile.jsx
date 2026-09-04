import React, { useState, useEffect } from 'react';
import {
  User, Briefcase, MapPin, Star, Calendar, BadgeCheck,
  Mail, Phone, Languages, Award, GraduationCap, FileText,
  AlertCircle, CheckCircle2, Clock, Pencil,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { engineerService } from '../../services/engineerService';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/cn';

const CompletionBadge = ({ completion }) => {
  const label =
    completion === 100 ? 'Complete' :
    completion >= 80 ? 'Almost Complete' :
    completion >= 50 ? 'Developing' : 'Incomplete';
  const color =
    completion === 100 ? 'bg-emerald-100 text-emerald-800' :
    completion >= 80 ? 'bg-blue-100 text-blue-700' :
    completion >= 50 ? 'bg-amber-100 text-amber-800' :
    'bg-slate-100 text-slate-600';
  return (
    <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold', color)}>
      <Clock className="w-4 h-4" />
      Profile {completion}% · {label}
    </div>
  );
};

const VerificationBadge = ({ status }) => {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold">
        <CheckCircle2 className="w-4 h-4" /> Verified
      </span>
    );
  }
  if (status === 'rejected') return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-bold">
      <AlertCircle className="w-4 h-4" /> Rejected
    </span>
  );
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
      <Clock className="w-4 h-4" /> Pending
    </span>
  );
};

const EngineerProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // First try self profile from dashboard or current user
        const profileRes = await engineerService.getProfile().catch(() => null);
        const loaded = profileRes?.data || user || {};
        const me = loaded.engineerProfile || {};
        setProfile({
          firstName: loaded.firstName || '',
          lastName: loaded.lastName || '',
          avatar: loaded.avatar || null,
          phone: loaded.phone || '',
          engineerProfile: me,
        });
        const dashRes = await engineerService.getDashboard().catch(() => null);
        if (active && dashRes?.data?.profile) {
          setProfile((prev) => ({ ...prev, completion: dashRes.data.profile.completion, completionLabel: dashRes.data.profile.completionLabel }));
        }
      } catch {
        if (active) setError('Failed to load profile');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-32 w-32 bg-slate-200 rounded-full mx-auto" />
          <div className="h-8 w-64 bg-slate-200 rounded-2xl mx-auto" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-navy mb-2">Could not load profile</h2>
        <p className="text-slate-600">{error}</p>
      </div>
    );
  }

  const ep = profile?.engineerProfile || {};
  const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Your Name';
  const completion = profile?.completion ?? 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName !== undefined ? form.firstName : profile?.firstName,
        lastName: form.lastName !== undefined ? form.lastName : profile?.lastName,
        phone: form.phone !== undefined ? form.phone : profile?.phone,
        engineerProfile: {
          bio: form.bio,
          title: form.title,
          yearsOfExperience: form.yearsOfExperience,
          specializations: form.specializations,
          hourlyRate: form.hourlyRate,
          company: form.company,
        },
      };
      const res = await engineerService.updateProfile(payload);
      const updated = res.data;
      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
        engineerProfile: updated.engineerProfile,
      });
      setProfile((prev) => ({ ...prev, ...updated, engineerProfile: updated.engineerProfile }));
      setEditing(false);
} catch (e) {
      console.error('Profile save failed:', e);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    setForm({
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      phone: profile?.phone,
      bio: ep.bio || '',
      title: ep.title || '',
      yearsOfExperience: ep.yearsOfExperience || 0,
      specializations: ep.specializations || [],
      hourlyRate: ep.hourlyRate || 0,
      company: ep.company || '',
    });
    setEditing(true);
  };

  const stats = [
    { label: 'Years Exp', value: ep.yearsOfExperience || 0, icon: Briefcase, color: 'text-blue-600' },
    { label: 'Specializations', value: ep.specializations?.length || 0, icon: Award, color: 'text-gold' },
    { label: 'Rating', value: (ep.rating?.average || 0).toFixed(1), icon: Star, color: 'text-gold' },
    { label: 'Portfolio', value: ep.portfolio?.length || 0, icon: FileText, color: 'text-emerald-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 lg:px-8">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-block relative mb-8">
          <div className="w-32 h-32 rounded-full border-8 border-white shadow-2xl mx-auto overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
            <img
              src={profile?.avatar || `https://i.pravatar.cc/150?u=${user?.id}`}
              alt={fullName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-navy to-slate-800 bg-clip-text text-transparent mb-3">
          {fullName}
        </h1>
        <p className="text-xl text-slate-500 font-bold uppercase tracking-wider mb-2">
          {ep.title || 'Structural Engineer'}
        </p>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed mb-6">
          {ep.bio || 'Experienced engineer crafting exceptional residential designs.'}
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
          <CompletionBadge completion={completion} />
          <VerificationBadge status={ep.verificationStatus || 'pending'} />
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-3xl border">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn('w-5 h-5', i < Math.round((ep.rating?.average || 0)) ? 'text-gold fill-current' : 'text-slate-300')} />
            ))}
            <span className="font-bold text-lg ml-1 text-navy">{(ep.rating?.average || 0).toFixed(1)}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {!editing ? (
            <button onClick={startEdit} className="btn-gold py-4 px-8 text-lg font-bold shadow-xl hover:shadow-gold/20 inline-flex items-center gap-2">
              <Pencil className="w-5 h-5" /> Edit Profile
            </button>
          ) : (
            <>
              <button onClick={handleSave} disabled={saving} className="btn-gold py-4 px-8 text-lg font-bold shadow-xl hover:shadow-gold/20">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditing(false)} className="border-2 border-slate-200 text-navy py-4 px-8 rounded-3xl font-bold hover:bg-slate-50 transition-all">
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <ProfileForm form={form} setForm={setForm} />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map(({ label, value, icon, color }, i) => (
              <div key={i} className="group p-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50/50 to-transparent">
                <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center mb-3">
                  {React.createElement(icon, { className: cn('w-7 h-7', color) })}
                </div>
                <p className="text-3xl font-extrabold text-navy mb-1">{value}</p>
                <p className="text-slate-500 uppercase text-xs font-bold tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Professional Info */}
            <ProfileSection title={() => null} icon={Briefcase}>
              <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-gold" /> Professional Information
                </h3>
                <InfoRow icon={Briefcase} label="Professional Title" value={ep.title || 'Not set'} />
                <InfoRow icon={Award} label="Years of Experience" value={ep.yearsOfExperience ? `${ep.yearsOfExperience} years` : 'Not set'} />
                <InfoRow
                  icon={Award}
                  label="Specializations"
                  value={ep.specializations?.length ? ep.specializations.join(', ') : 'None yet'}
                />
                <InfoRow icon={BadgeCheck} label="Company" value={ep.company || 'Independent'} />
                <InfoRow icon={FileText} label="Hourly Rate" value={ep.hourlyRate ? `₹${ep.hourlyRate}/hr` : 'Not set'} />
                <InfoRow icon={MapPin} label="Service Areas" value={ep.serviceAreas?.length ? `${ep.serviceAreas.length} area(s)` : 'Not set'} />
              </div>
            </ProfileSection>

            {/* Education & Certifications */}
            <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-gold" /> Education & Certifications
              </h3>
              <h4 className="font-bold text-slate-600 mb-3">Education</h4>
              {ep.education?.length ? (
                ep.education.map((ed, i) => (
                  <div key={i} className="mb-3 p-3 bg-slate-50 rounded-2xl">
                    <p className="font-semibold text-navy">{ed.degree}</p>
                    <p className="text-sm text-slate-500">{ed.institution} · {ed.year}</p>
                  </div>
                ))
              ) : <p className="text-sm text-slate-500 mb-4">No education added.</p>}

              <h4 className="font-bold text-slate-600 mb-3">Certifications</h4>
              {ep.certifications?.length ? (
                ep.certifications.map((c, i) => (
                  <div key={i} className="mb-3 p-3 bg-slate-50 rounded-2xl">
                    <p className="font-semibold text-navy">{c.name}</p>
                    <p className="text-sm text-slate-500">{c.issuer} · {c.year}</p>
                  </div>
                ))
              ) : <p className="text-sm text-slate-500">No certifications added.</p>}
            </div>

            {/* Contact */}
            <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
                <Mail className="w-6 h-6 text-gold" /> Contact
              </h3>
              <InfoRow icon={Mail} label="Email" value={user?.email || 'Not set'} />
              <InfoRow icon={Phone} label="Phone" value={profile?.phone || 'Not set'} />
              <InfoRow icon={Languages} label="Languages" value={user?.languages?.length ? user.languages.join(', ') : 'Not set'} />
              <InfoRow icon={MapPin} label="Location" value="—" />
            </div>

            {/* Verification */}
            <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
                <BadgeCheck className="w-6 h-6 text-gold" /> Verification
              </h3>
              <InfoRow icon={BadgeCheck} label="Status" value={ep.verificationStatus || 'pending'} />
              <InfoRow icon={FileText} label="License Number" value={ep.licenseNumber || 'Not submitted'} />
              {ep.rejectionReason && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-red-700 mb-1">Rejection reason</p>
                  <p className="text-sm text-red-600">{ep.rejectionReason}</p>
                </div>
              )}
              <a href="/engineer/verification" className="mt-4 inline-block btn-gold px-6 py-3 rounded-3xl font-bold">
                Go to Verification
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-4 py-3 border-b border-slate-100 last:border-0">
    {React.createElement(icon, { className: 'w-5 h-5 text-slate-400 mt-0.5 shrink-0' })}
    <div>
      <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">{label}</p>
      <p className="text-navy font-semibold">{value || '—'}</p>
    </div>
  </div>
);

const ProfileSection = ({ children }) => <>{children}</>;

const ProfileForm = ({ form, setForm }) => {
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  return (
    <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold text-navy mb-6">Edit Professional Profile</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="First Name" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
        <FormField label="Last Name" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
        <FormField label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        <FormField label="Professional Title" value={form.title} placeholder="Senior Architect" onChange={(e) => set('title', e.target.value)} />
        <FormField label="Company" value={form.company} onChange={(e) => set('company', e.target.value)} />
        <FormField label="Years of Experience" type="number" value={form.yearsOfExperience} onChange={(e) => set('yearsOfExperience', Number(e.target.value))} />
        <FormField label="Hourly Rate (₹)" type="number" value={form.hourlyRate} onChange={(e) => set('hourlyRate', Number(e.target.value))} />
      </div>
      <div className="mt-6">
        <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => set('bio', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/40"
          placeholder="Tell clients about your experience..."
        />
      </div>
      <div className="mt-6">
        <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
          Specializations (comma-separated)
        </label>
        <input
          value={Array.isArray(form.specializations) ? form.specializations.join(', ') : ''}
          onChange={(e) => set('specializations', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/40"
          placeholder="Structural, Residential, Commercial"
        />
      </div>
    </div>
  );
};

const FormField = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">{label}</label>
    <input
      type={type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/40"
    />
  </div>
);

export default EngineerProfile;
