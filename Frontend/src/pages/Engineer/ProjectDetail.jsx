import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Home, MapPin, Users, Calendar, AlertCircle, CheckCircle2,
  DollarSign, FileText, Clock, Milestone, Activity, ArrowLeft,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { projectService } from '../../services/projectService';
import { cn } from '../../utils/cn';

const STATUS_STYLES = {
  planning: 'bg-slate-100 text-slate-600',
  design_approval: 'bg-purple-100 text-purple-700',
  permit_pending: 'bg-amber-100 text-amber-800',
  construction_ready: 'bg-blue-100 text-blue-700',
  under_construction: 'bg-indigo-100 text-indigo-700',
  on_hold: 'bg-orange-100 text-orange-700',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
};

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [progressNote, setProgressNote] = useState('');
  const [newDoc, setNewDoc] = useState({ name: '', url: '', type: 'pdf' });
  const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: '', budgetAllocated: '' });

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await projectService.getAssignedProjectById(id);
      setProject(res?.data || res?.data?.project || null);
    } catch (e) {
      setError(e?.response?.status === 403 ? 'You do not have access to this project' : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const updateStage = async (index) => {
    try {
      await projectService.updateStage(id, index, { status: 'completed', percentage: 100 });
      toast.success('Stage updated');
      fetchProject();
    } catch (e) {
      toast.error('Failed to update stage');
    }
  };

  const updateMilestoneStatus = async (milestoneId, status) => {
    try {
      await projectService.updateMilestone(id, milestoneId, { status });
      toast.success('Milestone updated');
      fetchProject();
    } catch (e) {
      toast.error('Failed to update milestone');
    }
  };

  const addDocument = async (e) => {
    e.preventDefault();
    if (!newDoc.name || !newDoc.url) return;
    try {
      await projectService.addDocument(id, newDoc);
      toast.success('Document added');
      setNewDoc({ name: '', url: '', type: 'pdf' });
      fetchProject();
    } catch (err) {
      toast.error('Failed to add document');
    }
  };

  const addMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestone.title) return;
    try {
      await projectService.addMilestone(id, newMilestone);
      toast.success('Milestone added');
      setNewMilestone({ title: '', dueDate: '', budgetAllocated: '' });
      fetchProject();
    } catch (err) {
      toast.error('Failed to add milestone');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-slate-200 rounded-2xl" />
          <div className="h-64 bg-slate-200 rounded-4xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-navy mb-2">Could not load project</h2>
        <p className="text-slate-600 mb-6">{error}</p>
      </div>
    );
  }

  if (!project) return null;
  const p = project;

  const tabs = ['overview', 'milestones', 'documents', 'progress'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <a href="/engineer/projects" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-gold mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </a>

      {/* Header */}
      <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-navy">{p.name}</h1>
            <p className="text-slate-500 mt-1">{p.description}</p>
          </div>
          <span className={cn('inline-flex px-4 py-2 rounded-full text-sm font-bold uppercase self-start', STATUS_STYLES[p.status] || 'bg-slate-100 text-slate-600')}>
            {p.status?.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Stat icon={Users} label="Owner" value={`${p.userId?.firstName || ''} ${p.userId?.lastName || ''}`} />
          <Stat icon={MapPin} label="Plot" value={p.plotId?.name || '—'} />
          <Stat icon={DollarSign} label="Budget" value={p.budget?.estimated ? `₹${Number(p.budget.estimated).toLocaleString('en-IN')}` : '—'} />
          <Stat icon={Home} label="Area" value={p.construction?.totalArea ? `${p.construction.totalArea} sqft` : '—'} />
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
            <span>Overall Progress</span>
            <span>{p.progress?.percentage || 0}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${p.progress?.percentage || 0}%` }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-colors whitespace-nowrap',
              activeTab === tab ? 'bg-navy text-white' : 'bg-white border border-slate-200 text-slate-600'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-navy mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-gold" /> Construction Stages</h3>
            {p.progress?.stages?.length ? (
              <div className="space-y-4">
                {p.progress.stages.map((stage, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-3xl">
                    <div>
                      <p className="font-semibold text-navy">{stage.name}</p>
                      <p className="text-sm text-slate-500">{stage.percentage}% · {stage.status?.replace('_', ' ')}</p>
                    </div>
                    {stage.status !== 'completed' && (
                      <button onClick={() => updateStage(i)} className="px-4 py-2 bg-emerald-500 text-white rounded-3xl text-sm font-bold hover:bg-emerald-600">
                        Mark Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No stages defined yet.</p>
            )}
          </div>

          <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-navy mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-gold" /> Recent Activity</h3>
            {p.activities?.length ? (
              <div className="space-y-3">
                {p.activities.slice(-10).reverse().map((act, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
                    <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-navy">{act.action?.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-500">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No activity yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Milestones */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-navy mb-6 flex items-center gap-2"><Milestone className="w-5 h-5 text-gold" /> Milestones</h3>
            {p.milestones?.length ? (
              <div className="space-y-4">
                {p.milestones.map((m) => (
                  <div key={m.id || m._id} className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-3xl">
                    <div>
                      <p className="font-semibold text-navy">{m.title}</p>
                      {m.description && <p className="text-sm text-slate-500">{m.description}</p>}
                      <p className="text-xs text-slate-400 mt-1">
                        Due {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : '—'} · {m.status?.replace('_', ' ')}
                      </p>
                    </div>
                    {m.status !== 'completed' && (
                      <button onClick={() => updateMilestoneStatus(m.id || m._id, 'completed')} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-3xl text-sm font-bold hover:bg-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No milestones defined.</p>
            )}
          </div>

          <form onSubmit={addMilestone} className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-navy mb-6">Add Milestone</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input value={newMilestone.title} onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })} placeholder="Milestone title" className="px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/40" required />
              <input type="date" value={newMilestone.dueDate} onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })} className="px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/40" />
              <input type="number" value={newMilestone.budgetAllocated} onChange={(e) => setNewMilestone({ ...newMilestone, budgetAllocated: e.target.value })} placeholder="Budget (₹)" className="px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/40" />
            </div>
            <button type="submit" className="mt-4 btn-gold px-6 py-3 rounded-3xl font-bold">Add Milestone</button>
          </form>
        </div>
      )}

      {/* Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-navy mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-gold" /> Documents</h3>
            {p.documents?.length ? (
              <div className="space-y-3">
                {p.documents.map((doc, i) => (
                  <div key={doc.id || i} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl">
                    <div>
                      <p className="font-semibold text-navy">{doc.name}</p>
                      <p className="text-xs text-slate-400">{doc.type} · {doc.category} · {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    {doc.url && <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-gold hover:underline">View</a>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No documents uploaded.</p>
            )}
          </div>

          <form onSubmit={addDocument} className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-navy mb-6">Add Document</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input value={newDoc.name} onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })} placeholder="Document name" className="px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/40" required />
              <input value={newDoc.url} onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })} placeholder="Document URL" className="px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/40" required />
              <select value={newDoc.type} onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })} className="px-4 py-3 border rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-gold/40">
                <option value="pdf">PDF</option>
                <option value="image">Image</option>
                <option value="doc">Document</option>
              </select>
            </div>
            <button type="submit" className="mt-4 btn-gold px-6 py-3 rounded-3xl font-bold">Add Document</button>
          </form>
        </div>
      )}

      {/* Progress / Site reporting */}
      {activeTab === 'progress' && (
        <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-navy mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-gold" /> Submit Progress Update</h3>
          <p className="text-sm text-slate-500 mb-4">
            Update construction stages to reflect completed work. Overall progress is calculated from stage completion.
          </p>
          <div className="space-y-4">
            {p.progress?.stages?.map((stage, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl">
                <div>
                  <p className="font-semibold text-navy">{stage.name}</p>
                  <p className="text-sm text-slate-500">{stage.notes || 'No notes'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-navy">{stage.percentage}%</span>
                  {stage.status !== 'completed' && (
                    <button onClick={() => updateStage(i)} className="px-4 py-2 bg-navy text-white rounded-3xl text-sm font-bold hover:bg-navy/90">
                      Mark {stage.percentage < 100 ? 'Complete' : 'Done'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-slate-500" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">{label}</p>
      <p className="font-bold text-navy truncate">{value}</p>
    </div>
  </div>
);

export default ProjectDetail;
