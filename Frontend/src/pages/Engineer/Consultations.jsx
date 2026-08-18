import React, { useState, useEffect } from 'react';
import { Calendar, User, Check, Clock, AlertCircle, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { appointmentService } from '../../services/appointmentService';
import { cn } from '../../utils/cn';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
  rejected: 'bg-slate-100 text-slate-600',
  rescheduled: 'bg-purple-100 text-purple-700',
  no_show: 'bg-slate-100 text-slate-600',
};

const Consultations = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getMyEngineerAppointments({ limit: 100 });
      const list = res?.data?.appointments || res?.data || [];
      setAppointments(list);
    } catch (e) {
      setError('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAction = async (action, id) => {
    try {
      if (action === 'accept') {
        await appointmentService.accept(id);
        toast.success('Consultation accepted');
      } else if (action === 'complete') {
        await appointmentService.complete(id);
        toast.success('Consultation completed');
      }
      fetchAppointments();
    } catch (e) {
      toast.error('Action failed');
    }
  };

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter((a) => (a.status || '').toLowerCase() === filter);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-slate-200 rounded-2xl" />
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-4xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-navy rounded-3xl flex items-center justify-center">
          <Calendar className="w-7 h-7 text-gold" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-navy">Consultations</h1>
          <p className="text-slate-600 font-medium">Manage your appointment schedule</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-3xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-8">
        {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-bold capitalize transition-colors',
              filter === f ? 'bg-navy text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-gold'
            )}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-4xl bg-slate-50">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-600 mb-4">No consultations scheduled</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            When clients book a consultation with you, your appointments will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((appt) => (
            <div key={appt.id || appt._id} className="bg-white rounded-4xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-3xl flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-bold text-navy">
                      {appt.clientId?.firstName || 'Client'} {appt.clientId?.lastName || ''}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(appt.startAt).toLocaleDateString()} {new Date(appt.startAt).toLocaleTimeString()}
                      </span>
                      <span className="inline-flex items-center gap-1"><Video className="w-3.5 h-3.5" /> {appt.mode}</span>
                    </div>
                  </div>
                </div>
                <span className={cn('inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase self-start', STATUS_STYLES[(appt.status || '').toLowerCase()] || 'bg-slate-100 text-slate-600')}>
                  {appt.status?.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>{appt.type?.replace('_', ' ')}</span>
                {appt.meetingLink && <a href={appt.meetingLink} target="_blank" rel="noreferrer" className="text-gold font-bold ml-2">Join Link</a>}
              </div>

              {appt.status === 'pending' && (
                <button onClick={() => handleAction('accept', appt.id)} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-3xl font-bold hover:bg-emerald-600">
                  <Check className="w-4 h-4" /> Accept
                </button>
              )}
              {appt.status === 'accepted' && (
                <button onClick={() => handleAction('complete', appt.id)} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-3xl font-bold hover:bg-navy/90">
                  <Clock className="w-4 h-4" /> Mark Completed
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Consultations;
