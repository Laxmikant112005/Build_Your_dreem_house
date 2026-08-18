import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Edit3, Trash2, Calendar, DollarSign, Users, 
  Construction, Clock, CheckCircle2, AlertCircle, FileText,
  Plus, UserPlus, X, Save, Activity
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import { cn } from '../../utils/cn';

const statusConfig = {
  planning: { label: 'Planning', color: 'bg-blue-100 text-blue-800', icon: Clock },
  design_approval: { label: 'Design Approval', color: 'bg-purple-100 text-purple-800', icon: Clock },
  permit_pending: { label: 'Permit Pending', color: 'bg-amber-100 text-amber-800', icon: AlertCircle },
  construction_ready: { label: 'Ready', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  under_construction: { label: 'Under Construction', color: 'bg-cyan-100 text-cyan-800', icon: Construction },
  on_hold: { label: 'On Hold', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-500', icon: AlertCircle },
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', dueDate: '' });
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await projectService.getById(id);
      setProject(res.data);
      setEditForm({
        name: res.data.name,
        description: res.data.description || '',
        budget: { estimated: res.data.budget?.estimated || '' },
        timeline: {
          startDate: res.data.timeline?.startDate?.split('T')[0] || '',
          estimatedEndDate: res.data.timeline?.estimatedEndDate?.split('T')[0] || '',
        },
      });
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/user/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await projectService.update(id, editForm);
      setProject(res.data);
      setEditing(false);
      toast.success('Project updated');
    } catch (err) {
      toast.error('Failed to update project');
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const res = await projectService.updateStatus(id, status);
      setProject(res.data);
      toast.success(`Status changed to ${statusConfig[status]?.label || status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project permanently?')) return;
    try {
      await projectService.delete(id);
      toast.success('Project deleted');
      navigate('/user/projects');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.title) return;
    try {
      const res = await projectService.addMilestone(id, newMilestone);
      setProject(res.data);
      setNewMilestone({ title: '', description: '', dueDate: '' });
      setShowMilestoneForm(false);
      toast.success('Milestone added');
    } catch (err) {
      toast.error('Failed to add milestone');
    }
  };

  const formatDate = (d) => {
    if (!d) return 'Not set';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) return null;
  const StatusIcon = statusConfig[project.status]?.icon || Clock;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'milestones', label: 'Milestones' },
    { id: 'team', label: 'Team' },
    { id: 'documents', label: 'Documents' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="space-y-6 py-8 px-4 max-w-6xl mx-auto">
      {/* Back & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <button onClick={() => navigate('/user/projects')} className="flex items-center gap-2 text-slate-500 hover:text-navy transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Projects
        </button>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="p-3 border border-slate-200 rounded-2xl hover:border-gold transition-all">
            <Edit3 className="w-5 h-5 text-slate-600" />
          </button>
          <button onClick={handleDelete} className="p-3 border border-red-200 rounded-2xl hover:border-red-400 transition-all">
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>

      {/* Project Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Construction className="w-6 h-6 text-gold" />
              <span className={cn("px-3 py-1 rounded-xl text-xs font-bold uppercase", statusConfig[project.status]?.color)}>
                <StatusIcon className="w-3 h-3 inline mr-1" />
                {statusConfig[project.status]?.label || project.status}
              </span>
            </div>
            {editing ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="text-3xl font-black text-navy w-full p-2 border border-gold rounded-xl"
              />
            ) : (
              <h1 className="text-3xl md:text-4xl font-black text-navy">{project.name}</h1>
            )}
            {editing ? (
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={2}
                className="mt-2 w-full p-2 border border-gold rounded-xl text-slate-600"
              />
            ) : (
              <p className="text-slate-500 mt-2">{project.description || 'No description'}</p>
            )}
          </div>

          {/* Status Change */}
          <div className="flex-shrink-0">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Change Status</label>
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold bg-white"
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Save/Cancel Editing */}
        {editing && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
            <button onClick={() => setEditing(false)} className="px-6 py-3 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button onClick={handleUpdate} className="px-6 py-3 bg-gold text-navy font-bold rounded-2xl hover:bg-gold/90 transition-all flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 text-gold mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Budget</span>
          </div>
          <p className="text-xl font-black text-navy">₹{(project.budget?.estimated || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 text-gold mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Start</span>
          </div>
          <p className="text-sm font-bold text-navy">{formatDate(project.timeline?.startDate)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 text-gold mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-200 rounded-full h-2">
              <div className="bg-gold h-2 rounded-full" style={{ width: `${project.progress?.percentage || 0}%` }}></div>
            </div>
            <span className="text-sm font-bold text-navy">{project.progress?.percentage || 0}%</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 text-gold mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Team</span>
          </div>
          <p className="text-xl font-black text-navy">{project.members?.length || 1}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white p-2 rounded-2xl border border-slate-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
              activeTab === tab.id ? 'bg-slate-100 text-navy shadow-sm' : 'text-slate-500 hover:text-navy'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 min-h-[300px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Construction Details */}
            <div>
              <h3 className="text-lg font-bold text-navy mb-4">Construction Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 uppercase font-bold">Total Area</p>
                  <p className="text-lg font-bold text-navy">{project.construction?.totalArea || '-'} sq.ft</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 uppercase font-bold">Floors</p>
                  <p className="text-lg font-bold text-navy">{project.construction?.floors || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 uppercase font-bold">Bedrooms</p>
                  <p className="text-lg font-bold text-navy">{project.construction?.bedrooms || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 uppercase font-bold">Bathrooms</p>
                  <p className="text-lg font-bold text-navy">{project.construction?.bathrooms || '-'}</p>
                </div>
              </div>
            </div>

            {/* Linked Resources */}
            <div>
              <h3 className="text-lg font-bold text-navy mb-4">Linked Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {project.plotId && (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <p className="text-xs text-emerald-600 uppercase font-bold mb-1">Property</p>
                    <p className="font-bold text-navy">{project.plotId.name}</p>
                    <p className="text-sm text-slate-500">{project.plotId.address?.city}</p>
                  </div>
                )}
                {project.engineerId && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-xs text-blue-600 uppercase font-bold mb-1">Engineer</p>
                    <p className="font-bold text-navy">{project.engineerId.firstName} {project.engineerId.lastName}</p>
                  </div>
                )}
                {!project.plotId && !project.engineerId && (
                  <p className="text-slate-400 col-span-3">No resources linked yet</p>
                )}
              </div>
            </div>

            {/* Progress Stages */}
            {project.progress?.stages?.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-navy mb-4">Construction Stages</h3>
                <div className="space-y-3">
                  {project.progress.stages.map((stage, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-navy">{stage.name}</p>
                        <p className="text-sm text-slate-500 capitalize">{stage.status?.replace(/_/g, ' ')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div className={cn("h-2 rounded-full", stage.status === 'completed' ? 'bg-emerald-500' : 'bg-gold')} style={{ width: `${stage.percentage}%` }}></div>
                        </div>
                        <span className="text-sm font-bold">{stage.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-navy">Milestones</h3>
              <button onClick={() => setShowMilestoneForm(!showMilestoneForm)} className="flex items-center gap-2 bg-gold text-navy font-bold px-4 py-2 rounded-xl hover:bg-gold/90 transition-all">
                <Plus className="w-4 h-4" />
                Add Milestone
              </button>
            </div>

            {showMilestoneForm && (
              <div className="bg-slate-50 rounded-2xl p-6 mb-6 space-y-4 border border-gold/30">
                <input
                  type="text"
                  placeholder="Milestone title"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
                <input
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowMilestoneForm(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold">Cancel</button>
                  <button onClick={handleAddMilestone} className="px-4 py-2 bg-gold text-navy rounded-xl text-sm font-bold">Save Milestone</button>
                </div>
              </div>
            )}

            {project.milestones?.length > 0 ? (
              <div className="space-y-3">
                {project.milestones.map((ms, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className={cn(
                      "w-3 h-3 rounded-full mt-1.5",
                      ms.status === 'completed' ? 'bg-emerald-500' :
                      ms.status === 'overdue' ? 'bg-red-500' :
                      ms.status === 'in_progress' ? 'bg-gold' : 'bg-slate-300'
                    )}></div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-navy">{ms.title}</p>
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-lg uppercase",
                          ms.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          ms.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          ms.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        )}>{ms.status?.replace('_', ' ')}</span>
                      </div>
                      {ms.description && <p className="text-sm text-slate-500 mt-1">{ms.description}</p>}
                      {ms.dueDate && <p className="text-xs text-slate-400 mt-2">Due: {formatDate(ms.dueDate)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-12">No milestones added yet</p>
            )}
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-navy">Team Members</h3>
            </div>
            <div className="space-y-3">
              {project.members?.map((member, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center font-bold text-navy">
                      {member.userId?.firstName?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-navy">
                        {member.userId?.firstName} {member.userId?.lastName}
                        {member.role === 'owner' && <span className="text-gold text-xs ml-2">(Owner)</span>}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">{member.role}</p>
                    </div>
                  </div>
                  {member.acceptedAt && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg font-bold">Active</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-navy">Documents</h3>
            </div>
            {project.documents?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {project.documents.map((doc, idx) => (
                  <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all group">
                    <FileText className="w-8 h-8 text-slate-400 group-hover:text-gold transition-colors" />
                    <div className="min-w-0">
                      <p className="font-bold text-navy truncate">{doc.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{doc.category?.replace(/_/g, ' ')}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-12">No documents uploaded yet</p>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div>
            <h3 className="text-lg font-bold text-navy mb-6">Activity Log</h3>
            {project.activities?.length > 0 ? (
              <div className="space-y-4">
                {[...project.activities].reverse().map((act, idx) => (
                  <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-b-0">
                    <Activity className="w-5 h-5 text-gold mt-0.5" />
                    <div>
                      <p className="font-bold text-navy">{act.action?.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-slate-500">{act.description}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatDate(act.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-12">No activity recorded yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;

