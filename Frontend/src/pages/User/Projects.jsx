import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Plus, FolderOpen, Clock, CheckCircle2, AlertCircle, 
  Construction, Users, DollarSign, Search, Filter
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

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      setProjects(response.data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectService.delete(id);
      toast.success('Project deleted');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
    return (
      <span className={cn("px-3 py-1 rounded-xl text-xs font-bold uppercase", config.color)}>
        {config.label}
      </span>
    );
  };

  const filteredProjects = projects.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = [
    { label: 'Total', value: projects.length, color: 'text-navy' },
    { label: 'In Progress', value: projects.filter(p => p.status === 'under_construction').length, color: 'text-cyan-600' },
    { label: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: 'text-blue-600' },
    { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-8 py-8 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-navy">My Projects</h1>
          <p className="text-slate-500 mt-2">Manage your construction projects</p>
        </div>
        <Link
          to="/user/projects/new"
          className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-navy font-bold px-6 py-3 rounded-2xl transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-slate-200 text-center">
            <div className={cn("text-3xl font-black mb-1", stat.color)}>{stat.value}</div>
            <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all bg-white"
        >
          <option value="all">All Status</option>
          {Object.entries(statusConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-navy mb-2">No projects yet</h3>
          <p className="text-slate-500 mb-8">Create your first construction project to get started.</p>
          <Link to="/user/projects/new" className="btn-gold px-8 py-3 font-bold">
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="bg-white rounded-2xl border border-slate-200 hover:shadow-xl hover:border-gold/30 transition-all group cursor-pointer"
              onClick={() => navigate(`/user/projects/${project._id}`)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
                    <Construction className="w-6 h-6 text-navy" />
                  </div>
                  {getStatusBadge(project.status)}
                </div>
                <h3 className="text-lg font-bold text-navy mb-2 group-hover:text-gold transition-colors">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{project.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-slate-400 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>₹{(project.budget?.estimated || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{project.progress?.percentage || 0}%</span>
                  </div>
                  {project.engineerId && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>Team</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;

