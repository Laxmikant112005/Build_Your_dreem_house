import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Phone, Mail, MapPin, Star, Clock, Shield, Calendar, FileText, BadgeCheck, Trash2, Plus } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { engineerService } from '../../services/engineerService';
import { cn } from '../../utils/cn';

const EngineerDetails = () => {
  const { id } = useParams();
  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchEngineer();
  }, [id]);

  const fetchEngineer = async () => {
    setLoading(true);
    try {
      const data = await engineerService.getEngineerById(id);
      setEngineer(data);
    } catch (error) {
      console.error('Failed to fetch engineer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Approve this engineer? Their status will change to active.')) return;

    setApproving(true);
    try {
      await engineerService.approveEngineer(id);
      setEngineer(prev => ({ ...prev, status: 'active' }));
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Failed to approve engineer');
    } finally {
      setApproving(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
      pending: 'bg-amber-100 text-amber-800 ring-amber-200',
      inactive: 'bg-slate-100 text-slate-600 ring-slate-200'
    };
    return cn('inline-flex px-4 py-2 rounded-full text-sm font-bold ring-1 ring-inset uppercase tracking-wide', colors[status]);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12">
        <div className="animate-pulse space-y-8">
          <div className="h-12 w-64 bg-slate-200 rounded-2xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="h-64 bg-slate-200 rounded-3xl"></div>
              <div className="h-20 bg-slate-200 rounded-2xl"></div>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="h-10 w-48 bg-slate-200 rounded-xl"></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="h-20 bg-slate-200 rounded-2xl"></div>
                <div className="h-20 bg-slate-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!engineer) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center">
        <Shield className="w-24 h-24 text-slate-400 mx-auto mb-8" />
        <h1 className="text-3xl font-bold text-slate-600 mb-4">Engineer Not Found</h1>
        <p className="text-xl text-slate-500 mb-8">The engineer profile could not be located.</p>
        <Link to="/admin/engineers" className="btn-gold px-12 py-4 text-lg font-bold">
          Back to Engineers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-6 mb-12">
        <Link to="/admin/engineers" className="p-3 hover:bg-slate-100 rounded-2xl text-slate-500 hover:text-navy transition-all -ml-3">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="w-28 h-28 rounded-3xl overflow-hidden ring-8 ring-slate-100/50 shadow-2xl">
            <img 
              src={engineer.avatar} 
              alt={engineer.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-extrabold text-navy">{engineer.name}</h1>
              <span className={getStatusBadge(engineer.status)}>{engineer.status}</span>
            </div>
            <p className="text-2xl font-bold text-slate-600">{engineer.specialization}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-bold text-navy mb-8 flex items-center gap-3">
              <FileText className="w-7 h-7 text-slate-400" />
              Professional Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gold/10 to-gold/20 rounded-2xl flex items-center justify-center p-2">
                    <Star className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Rating</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={cn('w-5 h-5', i < engineer.rating ? 'text-gold fill-gold' : 'text-slate-200')}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-2xl text-navy">{engineer.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-500/10 to-slate-400/10 rounded-2xl flex items-center justify-center p-2">
                    <Clock className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Experience</p>
                    <p className="text-2xl font-bold text-navy">{engineer.experience} years</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-7 h-7 text-slate-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Location</p>
                    <p className="font-semibold text-navy">{engineer.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="w-7 h-7 text-slate-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">License Status</p>
                    <p className="font-bold text-emerald-600 flex items-center gap-2">
                      <BadgeCheck className="w-5 h-5" />
                      Verified Professional
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
              <Mail className="w-7 h-7 text-slate-400" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all">
                  <Mail className="w-6 h-6 text-slate-400 group-hover:text-navy" />
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Email</p>
                    <a href={`mailto:${engineer.email}`} className="font-semibold text-navy hover:text-gold block">
                      {engineer.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all">
                  <Phone className="w-6 h-6 text-slate-400 group-hover:text-navy" />
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Phone</p>
                    <a href={`tel:${engineer.phone}`} className="font-semibold text-navy hover:text-gold block">
                      {engineer.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-5 bg-slate-50 rounded-2xl">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-3">
                    <Calendar className="w-5 h-5" />
                    Account Created
                  </p>
                  <p className="text-lg font-bold text-navy">January 15, 2024</p>
                </div>

                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <p className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-3 flex items-center gap-3">
                    <BadgeCheck className="w-5 h-5" />
                    Verification Status
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="font-bold text-emerald-700 text-lg">Fully Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-navy to-slate-900 text-white p-8 rounded-4xl shadow-2xl">
            <h4 className="text-xl font-bold mb-6 text-gold flex items-center gap-3">
              <Shield className="w-6 h-6" />
              Quick Actions
            </h4>
            <div className="space-y-4">
              {engineer.status === 'pending' && (
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="w-full bg-gold/20 hover:bg-gold/30 text-gold font-bold py-4 px-6 rounded-2xl border-2 border-gold/30 transition-all flex items-center gap-3 group hover:scale-[1.02] shadow-xl"
                >
                  {approving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                      Approve Engineer
                    </>
                  )}
                </button>
              )}
              
              <Link 
                to={`/admin/engineers/edit/${engineer.id}`}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-6 rounded-2xl border-2 border-white/30 transition-all flex items-center gap-3 group hover:scale-[1.02] shadow-xl block"
              >
                <Edit3 className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Edit Profile
              </Link>

              <button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-200 font-bold py-4 px-6 rounded-2xl border-2 border-red-500/30 transition-all flex items-center gap-3 group hover:scale-[1.02]">
                <Trash2 className="w-5 h-5" />
                Delete Account
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center group hover:border-slate-300 transition-all">
            <div className="w-20 h-20 bg-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-300 transition-colors">
              <Plus className="w-10 h-10 text-slate-500" />
            </div>
            <h4 className="text-xl font-bold text-slate-700 mb-3">Need Help?</h4>
            <p className="text-slate-500 mb-6">Contact support for accreditation issues</p>
            <button className="btn-outline px-8 py-3 font-bold text-sm">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerDetails;
