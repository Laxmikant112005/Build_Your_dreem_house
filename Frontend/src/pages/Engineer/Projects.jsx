import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HardHat, MapPin, AlertCircle, ArrowRight, Home, Users } from 'lucide-react';
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

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getAssignedProjects({ limit: 100 });
      setProjects(res?.data?.projects || res?.data || []);
    } catch (e) {
      setError('Failed to load assigned projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-slate-200 rounded-2xl" />
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-slate-200 rounded-4xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-navy rounded-3xl flex items-center justify-center">
          <HardHat className="w-7 h-7 text-gold" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-navy">My Projects</h1>
          <p className="text-slate-600 font-medium">Projects assigned to you</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-3xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-4xl bg-slate-50">
          <HardHat className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-600 mb-4">No assigned projects yet</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            When an owner assigns you to a construction project, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {projects.map((project) => (
            <Link
              key={project.id || project._id}
              to={`/engineer/projects/${project.id || project._id}`}
              className="block bg-white rounded-4xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-3xl flex items-center justify-center">
                    <Home className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-bold text-navy text-lg">{project.name}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      {project.plotId?.name && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {project.plotId.name}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {project.userId?.firstName || 'Owner'} {project.userId?.lastName || ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={cn('inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase', STATUS_STYLES[project.status] || 'bg-slate-100 text-slate-600')}>
                      {project.status?.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{project.progress?.percentage || 0}% complete</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
