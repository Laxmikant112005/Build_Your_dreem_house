import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EngineerForm from '../../components/engineers/EngineerForm';
import { engineerService } from '../../services/engineerService';

const EditEngineer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchEngineer();
    }
  }, [id]);

  const fetchEngineer = async () => {
    setLoading(true);
    try {
      const data = await engineerService.getEngineerById(id);
      setEngineer(data);
    } catch (error) {
      setError('Failed to load engineer data');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    setSaving(true);
    setError('');
    try {
      await engineerService.updateEngineer(id, formData);
      alert('Engineer updated successfully!');
      navigate('/admin/engineers');
    } catch (error) {
      setError('Failed to save changes');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/engineers');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl font-bold text-slate-600">Loading engineer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button 
            onClick={handleCancel}
            className="inline-flex items-center gap-3 text-slate-600 hover:text-navy font-bold mb-6 p-3 rounded-2xl hover:bg-slate-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to List
          </button>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl mb-8">
              {error}
            </div>
          )}
        </div>

        {/* Form */}
        <EngineerForm
          engineer={engineer}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={saving}
        />
      </div>
    </div>
  );
};

export default EditEngineer;
