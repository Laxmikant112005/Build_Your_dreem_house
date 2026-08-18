import React, { useState, useEffect } from 'react';
import { constructionService } from '../../services/constructionService';
import { projectService } from '../../services/projectService';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/cn';
import {
  BarChart3, Calendar, Camera, AlertTriangle, CheckCircle2, Clock,
  FileText, Plus, ChevronRight, X, Play, Pause, Flag, Image,
  HardHat, TrendingUp, ListTodo, ShieldAlert
} from 'lucide-react';

const STAGE_COLORS = {
  pending: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-600',
  completed: 'bg-emerald-100 text-emerald-600',
  delayed: 'bg-red-100 text-red-600',
};

const ConstructionMonitoring = () => {
  const [projects, setProjects] = useState([]);
  const [construction, setConstruction] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showInitModal, setShowInitModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [initData, setInitData] = useState({ startDate: '', estimatedEndDate: '' });
  const [logData, setLogData] = useState({ description: '', weather: '', workersPresent: '', hoursWorked: '' });
  const [alertData, setAlertData] = useState({ message: '', severity: 'warning' });
  const [milestoneData, setMilestoneData] = useState({ name: '', targetDate: '', description: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, sumRes] = await Promise.all([
        projectService.getAll(),
        constructionService.getProgressSummary(),
      ]);
      setProjects(projRes.data?.data || []);
      setSummary(sumRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadConstruction = async (projectId) => {
    try {
      const res = await constructionService.getByProject(projectId);
      setConstruction(res.data);
    } catch (err) {
      setConstruction(null);
    }
  };

  useEffect(() => {
    if (selectedProject) loadConstruction(selectedProject);
    else setConstruction(null);
  }, [selectedProject]);

  const handleInit = async (e) => {
    e.preventDefault();
    try {
      await constructionService.initialize({ projectId: selectedProject, ...initData });
      toast.success('Construction tracking initialized!');
      setShowInitModal(false);
      loadConstruction(selectedProject);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to initialize'); }
  };

  const handleStageUpdate = async (e) => {
    e.preventDefault();
    try {
      await constructionService.updateStage(selectedProject, editingStage._id, {
        status: editingStage.status,
        progressPercent: Number(editingStage.progressPercent),
        notes: editingStage.notes,
      });
      toast.success('Stage updated!');
      setShowStageModal(false);
      loadConstruction(selectedProject);
    } catch (err) { toast.error('Failed to update stage'); }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      await constructionService.addMilestone(selectedProject, milestoneData);
      toast.success('Milestone added!');
      setShowMilestoneModal(false);
      setMilestoneData({ name: '', targetDate: '', description: '' });
      loadConstruction(selectedProject);
    } catch (err) { toast.error('Failed to add milestone'); }
  };

  const handleCompleteMilestone = async (milestoneId) => {
    try {
      await constructionService.updateMilestone(selectedProject, milestoneId, { status: 'completed' });
      toast.success('Milestone completed!');
      loadConstruction(selectedProject);
    } catch (err) { toast.error('Failed to update milestone'); }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      await constructionService.addDailyLog(selectedProject, {
        ...logData,
        workersPresent: Number(logData.workersPresent) || 0,
        hoursWorked: Number(logData.hoursWorked) || 0,
      });
      toast.success('Daily log added!');
      setShowLogModal(false);
      setLogData({ description: '', weather: '', workersPresent: '', hoursWorked: '' });
      loadConstruction(selectedProject);
    } catch (err) { toast.error('Failed to add log'); }
  };

  const handleAddAlert = async (e) => {
    e.preventDefault();
    try {
      await constructionService.addDelayAlert(selectedProject, alertData);
      toast.success('Alert added!');
      setShowAlertModal(false);
      setAlertData({ message: '', severity: 'warning' });
      loadConstruction(selectedProject);
    } catch (err) { toast.error('Failed to add alert'); }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await constructionService.resolveAlert(selectedProject, alertId);
      toast.success('Alert resolved');
      loadConstruction(selectedProject);
    } catch (err) { toast.error('Failed to resolve alert'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" /></div>;

  return (
    <div className="space-y-6 py-8 px-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-navy">Construction Monitoring</h1>
        <p className="text-slate-600">Track progress, manage stages, and monitor your construction projects</p>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center border border-slate-200">
            <HardHat className="w-6 h-6 text-navy mx-auto mb-1" />
            <p className="text-2xl font-black text-navy">{summary.total}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-emerald-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-black text-emerald-600">{summary.completed}</p>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-blue-200">
            <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-black text-blue-600">{summary.inProgress}</p>
            <p className="text-xs text-slate-500">In Progress</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-red-200">
            <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-black text-red-600">{summary.delayed}</p>
            <p className="text-xs text-slate-500">Delayed</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-amber-200">
            <BarChart3 className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-black text-amber-600">{summary.averageProgress}%</p>
            <p className="text-xs text-slate-500">Avg Progress</p>
          </div>
        </div>
      )}

      {/* Project Selector */}
      <div className="flex flex-wrap gap-4 items-center">
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
          className="p-3 border border-slate-200 rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-gold/30 flex-1 max-w-md">
          <option value="">Select a project...</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        {selectedProject && !construction && (
          <button onClick={() => setShowInitModal(true)} className="btn-gold px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5" /> Initialize Tracking
          </button>
        )}
        {construction && (
          <>
            <button onClick={() => setShowLogModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all">
              <Plus className="w-5 h-5" /> Daily Log
            </button>
            <button onClick={() => setShowMilestoneModal(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all">
              <Flag className="w-5 h-5" /> Milestone
            </button>
            <button onClick={() => setShowAlertModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all">
              <AlertTriangle className="w-5 h-5" /> Report Delay
            </button>
          </>
        )}
      </div>

      {!selectedProject && (
        <div className="text-center py-20 bg-slate-50 rounded-4xl border border-slate-200">
          <HardHat className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-navy mb-2">Select a Project</h3>
          <p className="text-slate-500">Choose a project to start monitoring construction progress</p>
        </div>
      )}

      {selectedProject && !construction && !loading && (
        <div className="text-center py-20 bg-slate-50 rounded-4xl border border-slate-200">
          <BarChart3 className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-navy mb-2">Not Tracking Yet</h3>
          <p className="text-slate-500 mb-6">Initialize construction tracking for this project</p>
        </div>
      )}

      {construction && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'stages', label: 'Stages', icon: ListTodo },
              { id: 'milestones', label: 'Milestones', icon: Flag },
              { id: 'logs', label: 'Daily Logs', icon: FileText },
              { id: 'alerts', label: 'Alerts', icon: ShieldAlert },
              { id: 'photos', label: 'Photos', icon: Image },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn('px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap',
                  activeTab === tab.id ? 'bg-navy text-white' : 'text-slate-500 hover:bg-slate-100')}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Progress Ring */}
              <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-lg">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative w-40 h-40">
                    <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                      <circle cx="60" cy="60" r="54" fill="none" stroke={construction.overallProgress >= 80 ? '#10b981' : construction.overallProgress >= 40 ? '#f59e0b' : '#ef4444'} strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={`${2 * Math.PI * 54 * (1 - construction.overallProgress / 100)}`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-4xl font-black text-navy">{construction.overallProgress}%</p>
                        <p className="text-xs text-slate-400">Complete</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div><p className="text-sm text-slate-400">Status</p><p className="font-bold text-navy capitalize">{construction.status.replace('_', ' ')}</p></div>
                      <div><p className="text-sm text-slate-400">Start Date</p><p className="font-bold text-navy">{formatDate(construction.startDate)}</p></div>
                      <div><p className="text-sm text-slate-400">Est. End</p><p className="font-bold text-navy">{formatDate(construction.estimatedEndDate)}</p></div>
                      <div><p className="text-sm text-slate-400">Days Elapsed</p><p className="font-bold text-navy">{construction.daysElapsed || 0}</p></div>
                    </div>
                    {construction.daysRemaining !== null && (
                      <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-3">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <span className="text-sm text-slate-600">{construction.daysRemaining} days remaining</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stage Overview */}
              <div className="bg-white rounded-4xl border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-navy mb-4">Stage Progress</h3>
                <div className="space-y-3">
                  {construction.stages.sort((a, b) => a.order - b.order).map(stage => (
                    <div key={stage._id} className="flex items-center gap-4">
                      <span className={cn('px-3 py-1 rounded-full text-xs font-bold', STAGE_COLORS[stage.status])}>{stage.status.replace('_', ' ')}</span>
                      <div className="flex-1">
                        <p className="font-bold text-navy text-sm">{stage.name}</p>
                        <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                          <div className={cn('h-full rounded-full transition-all', stage.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-500')}
                            style={{ width: `${stage.progressPercent}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-navy w-12 text-right">{stage.progressPercent}%</span>
                      <button onClick={() => { setEditingStage(stage); setShowStageModal(true); }}
                        className="p-2 hover:bg-slate-100 rounded-xl text-sm text-slate-400">Edit</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Delay Alerts */}
              {construction.delayAlerts?.filter(a => !a.resolved).length > 0 && (
                <div className="bg-red-50 rounded-4xl border border-red-200 p-6">
                  <h3 className="font-bold text-lg text-red-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Active Alerts
                  </h3>
                  {construction.delayAlerts.filter(a => !a.resolved).map(alert => (
                    <div key={alert._id} className="flex items-center justify-between bg-white rounded-2xl p-4 mb-2 border border-red-100">
                      <div>
                        <p className="font-bold text-navy">{alert.message}</p>
                        <p className="text-xs text-slate-400">{formatDate(alert.date)} • {alert.severity}</p>
                      </div>
                      <button onClick={() => handleResolveAlert(alert._id)} className="text-emerald-600 font-bold text-sm hover:bg-emerald-50 px-4 py-2 rounded-xl">
                        Resolve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STAGES TAB */}
          {activeTab === 'stages' && (
            <div className="space-y-4">
              {construction.stages.sort((a, b) => a.order - b.order).map((stage, i) => (
                <div key={stage._id} className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-sm font-bold">{i + 1}</span>
                        <h3 className="text-xl font-bold text-navy">{stage.name}</h3>
                      </div>
                      {stage.description && <p className="text-sm text-slate-500 ml-11">{stage.description}</p>}
                    </div>
                    <span className={cn('px-4 py-2 rounded-2xl text-sm font-bold', STAGE_COLORS[stage.status])}>{stage.status.replace('_', ' ')}</span>
                  </div>
                  <div className="ml-11 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="w-full bg-slate-100 rounded-full h-3">
                          <div className={cn('h-full rounded-full transition-all', stage.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-500')}
                            style={{ width: `${stage.progressPercent}%` }} />
                        </div>
                      </div>
                      <span className="font-bold text-navy">{stage.progressPercent}%</span>
                    </div>
                    <div className="flex gap-4 text-sm text-slate-400">
                      {stage.startDate && <span>Start: {formatDate(stage.startDate)}</span>}
                      {stage.endDate && <span>Target End: {formatDate(stage.endDate)}</span>}
                      {stage.actualEndDate && <span>Completed: {formatDate(stage.actualEndDate)}</span>}
                    </div>
                    {stage.photos?.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {stage.photos.map((p, pi) => (
                          <img key={pi} src={p.url} alt={p.caption} className="w-20 h-20 object-cover rounded-2xl" />
                        ))}
                      </div>
                    )}
                    {stage.notes && <p className="text-sm text-slate-500 bg-slate-50 rounded-2xl p-3 italic">{stage.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MILESTONES TAB */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              {construction.milestones.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-4xl border border-slate-200">
                  <Flag className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-navy">No milestones yet</p>
                  <p className="text-slate-500 text-sm">Add milestones to track key project events</p>
                </div>
              ) : (
                construction.milestones.map((m, i) => (
                  <div key={m._id} className="flex items-center gap-4 bg-white rounded-3xl border border-slate-200 p-5">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center',
                      m.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      m.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400')}>
                      {m.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                       m.status === 'overdue' ? <AlertTriangle className="w-5 h-5" /> : <Flag className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-navy">{m.name}</p>
                      <p className="text-xs text-slate-400">
                        Target: {formatDate(m.targetDate)}
                        {m.completedDate && ` • Completed: ${formatDate(m.completedDate)}`}
                      </p>
                    </div>
                    <span className={cn('px-3 py-1 rounded-full text-xs font-bold',
                      m.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      m.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500')}>
                      {m.status}
                    </span>
                    {m.status !== 'completed' && (
                      <button onClick={() => handleCompleteMilestone(m._id)}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100" title="Mark complete">
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* DAILY LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              {construction.dailyLogs?.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-4xl border border-slate-200">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-navy">No daily logs yet</p>
                  <button onClick={() => setShowLogModal(true)} className="btn-gold px-6 py-3 rounded-2xl font-bold mt-4 inline-flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Add First Log
                  </button>
                </div>
              ) : (
                [...construction.dailyLogs].reverse().map((log, i) => (
                  <div key={log._id || i} className="bg-white rounded-3xl border border-slate-200 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-navy">{formatDate(log.date)}</p>
                        <div className="flex gap-3 text-sm text-slate-400">
                          {log.weather && <span>🌤 {log.weather}</span>}
                          {log.workersPresent > 0 && <span>👷 {log.workersPresent} workers</span>}
                          {log.hoursWorked > 0 && <span>⏱ {log.hoursWorked}h</span>}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-700">{log.description}</p>
                    {log.photos?.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {log.photos.map((p, pi) => (
                          <img key={pi} src={p.url} alt={p.caption} className="w-24 h-24 object-cover rounded-2xl" />
                        ))}
                      </div>
                    )}
                    {log.notes && <p className="text-sm text-slate-400 mt-2 italic">{log.notes}</p>}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ALERTS TAB */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {construction.delayAlerts?.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-4xl">
                  <ShieldAlert className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-navy">No alerts recorded</p>
                </div>
              ) : (
                [...construction.delayAlerts].reverse().map(alert => (
                  <div key={alert._id} className={cn('bg-white rounded-3xl border p-5 flex items-center gap-4',
                    alert.severity === 'critical' ? 'border-red-300 bg-red-50' :
                    alert.severity === 'warning' ? 'border-amber-300 bg-amber-50' : 'border-slate-200')}>
                    <AlertTriangle className={cn('w-8 h-8',
                      alert.severity === 'critical' ? 'text-red-500' :
                      alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500')} />
                    <div className="flex-1">
                      <p className="font-bold text-navy">{alert.message}</p>
                      <p className="text-xs text-slate-400">{formatDate(alert.date)}</p>
                    </div>
                    {!alert.resolved ? (
                      <button onClick={() => handleResolveAlert(alert._id)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50">
                        Resolve
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-bold text-sm">Resolved {formatDate(alert.resolvedAt)}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* PHOTOS TAB */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              {/* Collect all photos from stages and daily logs */}
              {(() => {
                const allPhotos = [
                  ...(construction.stages?.flatMap(s => s.photos?.map(p => ({ ...p, source: s.name })) || []) || []),
                  ...(construction.dailyLogs?.flatMap(l => l.photos?.map(p => ({ ...p, source: formatDate(l.date) })) || []) || []),
                ];
                return allPhotos.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-4xl">
                    <Camera className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-navy">No photos uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {allPhotos.map((p, i) => (
                      <div key={i} className="relative group rounded-3xl overflow-hidden bg-slate-100">
                        <img src={p.url} alt={p.caption} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end p-3">
                          <p className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-all">{p.source}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}

      {/* Init Modal */}
      {showInitModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowInitModal(false)}>
          <div className="bg-white rounded-4xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-navy mb-6">Initialize Construction Tracking</h3>
            <form onSubmit={handleInit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                <input type="date" required value={initData.startDate} onChange={e => setInitData({...initData, startDate: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Estimated End Date</label>
                <input type="date" required value={initData.estimatedEndDate} onChange={e => setInitData({...initData, estimatedEndDate: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInitModal(false)} className="flex-1 p-3 bg-slate-100 rounded-2xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 p-3 bg-gold text-navy rounded-2xl font-bold">Initialize</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stage Edit Modal */}
      {showStageModal && editingStage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowStageModal(false)}>
          <div className="bg-white rounded-4xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-navy mb-6">Update Stage: {editingStage.name}</h3>
            <form onSubmit={handleStageUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                <select value={editingStage.status} onChange={e => setEditingStage({...editingStage, status: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-2xl">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Progress (%)</label>
                <input type="number" min="0" max="100" value={editingStage.progressPercent}
                  onChange={e => setEditingStage({...editingStage, progressPercent: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-2xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Notes</label>
                <textarea value={editingStage.notes || ''} onChange={e => setEditingStage({...editingStage, notes: e.target.value})}
                  rows={3} className="w-full p-3 border border-slate-200 rounded-2xl" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowStageModal(false)} className="flex-1 p-3 bg-slate-100 rounded-2xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 p-3 bg-gold text-navy rounded-2xl font-bold">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowMilestoneModal(false)}>
          <div className="bg-white rounded-4xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-navy mb-6">Add Milestone</h3>
            <form onSubmit={handleAddMilestone} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                <input required value={milestoneData.name} onChange={e => setMilestoneData({...milestoneData, name: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Target Date</label>
                <input type="date" value={milestoneData.targetDate} onChange={e => setMilestoneData({...milestoneData, targetDate: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-2xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea value={milestoneData.description} onChange={e => setMilestoneData({...milestoneData, description: e.target.value})}
                  rows={2} className="w-full p-3 border border-slate-200 rounded-2xl" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowMilestoneModal(false)} className="flex-1 p-3 bg-slate-100 rounded-2xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 p-3 bg-gold text-navy rounded-2xl font-bold">Add Milestone</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowLogModal(false)}>
          <div className="bg-white rounded-4xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-navy mb-6">Add Daily Log</h3>
            <form onSubmit={handleAddLog} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description *</label>
                <textarea required value={logData.description} onChange={e => setLogData({...logData, description: e.target.value})}
                  rows={3} className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weather</label>
                  <input value={logData.weather} onChange={e => setLogData({...logData, weather: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-2xl" placeholder="Sunny" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Workers</label>
                  <input type="number" value={logData.workersPresent} onChange={e => setLogData({...logData, workersPresent: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-2xl" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hours</label>
                  <input type="number" value={logData.hoursWorked} onChange={e => setLogData({...logData, hoursWorked: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-2xl" placeholder="0" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowLogModal(false)} className="flex-1 p-3 bg-slate-100 rounded-2xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 p-3 bg-blue-500 text-white rounded-2xl font-bold">Add Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delay Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowAlertModal(false)}>
          <div className="bg-white rounded-4xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-navy mb-6">Report Delay</h3>
            <form onSubmit={handleAddAlert} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Message *</label>
                <textarea required value={alertData.message} onChange={e => setAlertData({...alertData, message: e.target.value})}
                  rows={3} className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30" placeholder="Describe the delay..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Severity</label>
                <select value={alertData.severity} onChange={e => setAlertData({...alertData, severity: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-2xl">
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAlertModal(false)} className="flex-1 p-3 bg-slate-100 rounded-2xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 p-3 bg-red-500 text-white rounded-2xl font-bold">Report Delay</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructionMonitoring;

