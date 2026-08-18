import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { MapPin, Save, RotateCcw, Home, Ruler, Compass, Crosshair } from 'lucide-react';
import { plotService } from '../../services/plotService';
import { cn } from '../../utils/cn';

const AddProperty = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Map Drawing, 3: Details
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: {
      full: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
    },
    terrainType: '',
    soilType: '',
    roadAccess: '',
    zoning: 'residential',
  });

  // Map drawing state
  const [points, setPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [centerCoords, setCenterCoords] = useState({ lat: 20.5937, lng: 78.9629 });

  const calculateArea = useCallback((coords) => {
    if (coords.length < 3) return 0;
    // Shoelace formula on cartesian plane (rough approximation)
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i].lat * coords[j].lng;
      area -= coords[j].lat * coords[i].lng;
    }
    // Convert from degrees to rough sqm (1 deg ≈ 111km)
    const sqDegrees = Math.abs(area / 2);
    return sqDegrees * 111320 * 111320; // rough conversion
  }, []);

  const addPoint = useCallback((lat, lng) => {
    if (isDrawing && points.length < 20) {
      setPoints((prev) => [...prev, { lat, lng }]);
    }
  }, [isDrawing, points.length]);

  const clearPoints = () => {
    setPoints([]);
  };

  const removeLastPoint = () => {
    setPoints((prev) => prev.slice(0, -1));
  };

  const handleInputChange = (field, value) => {
    if (field.startsWith('address.')) {
      const addrField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addrField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    // Validate
    if (!formData.name.trim()) {
      toast.error('Property name is required');
      return;
    }
    if (points.length < 3) {
      toast.error('Please mark at least 3 corners on the map');
      return;
    }

    setSaving(true);
    try {
      const area = calculateArea(points);
      const centerLng = points.reduce((acc, p) => acc + p.lng, 0) / points.length;
      const centerLat = points.reduce((acc, p) => acc + p.lat, 0) / points.length;

      // Convert points to GeoJSON format: [lng, lat]
      const coordinates = points.map((p) => [p.lng, p.lat]);
      // Close the polygon
      coordinates.push([points[0].lng, points[0].lat]);

      const plotPayload = {
        name: formData.name,
        description: formData.description,
        geojson: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
        dimensions: {
          area: Math.round(area),
          areaUnit: 'sqft',
        },
        address: {
          full: formData.address.full,
          city: formData.address.city,
          state: formData.address.state,
          country: formData.address.country,
          postalCode: formData.address.postalCode,
          location: {
            type: 'Point',
            coordinates: [centerLng, centerLat],
          },
        },
        terrainType: formData.terrainType || undefined,
        zoning: formData.zoning,
        isPrimary: true,
      };

      await plotService.createPlot(plotPayload);
      toast.success('Property registered successfully!');
      navigate('/user/properties');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  const terrainTypes = ['Flat', 'Gentle Slope', 'Steep Slope', 'Hilly', 'Rocky', 'Coastal', 'Floodplain', 'Irregular'];
  const soilTypes = ['Alluvial', 'Black Cotton', 'Laterite', 'Sandy', 'Clay', 'Loamy', 'Rocky', 'Red'];
  const roadAccessTypes = ['Front', 'Rear', 'Side', 'Corner', 'Cul-de-sac', 'No Access'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-black text-navy mb-2">Register Property</h1>
        <p className="text-slate-500 text-lg">Add your land details for personalized design recommendations</p>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center items-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all',
                step >= s ? 'bg-gold text-navy' : 'bg-slate-200 text-slate-400'
              )}
            >
              {s}
            </div>
            <span className={cn('text-sm font-medium', step >= s ? 'text-navy' : 'text-slate-400')}>
              {s === 1 ? 'Basic Info' : s === 2 ? 'Map Drawing' : 'Details'}
            </span>
            {s < 3 && <div className="w-12 h-0.5 bg-slate-200" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-4xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-navy mb-6">Property Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Property Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
                  placeholder="e.g., My Dream Home Plot"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all resize-none"
                  rows={3}
                  placeholder="Describe your property..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address.full}
                  onChange={(e) => handleInputChange('address.full', e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
                  placeholder="Full address"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">State</label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Postal Code</label>
                <input
                  type="text"
                  value={formData.address.postalCode}
                  onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
                  placeholder="Postal code"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={() => setStep(2)} className="bg-gold hover:bg-gold/90 text-navy font-bold px-10 py-4 rounded-2xl shadow-lg transition-all">
                Next: Draw on Map →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Map Drawing */}
        {step === 2 && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-navy mb-2">Draw Property Boundary</h2>
                <p className="text-slate-500">
                  Click on the grid to mark corners. Minimum 3 points required.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsDrawing(!isDrawing)}
                  className={cn(
                    'px-6 py-3 rounded-2xl font-bold text-sm transition-all',
                    isDrawing
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gold text-navy hover:bg-gold/90'
                  )}
                >
                  {isDrawing ? 'Stop Drawing' : 'Start Drawing'}
                </button>
                <button
                  onClick={removeLastPoint}
                  disabled={points.length === 0}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition-all disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={clearPoints}
                  disabled={points.length === 0}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition-all disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Mock Interactive Map */}
            <div className="relative h-[400px] bg-gradient-to-br from-slate-50 to-slate-200 rounded-3xl border-2 border-dashed border-slate-300 overflow-hidden">
              {/* Grid overlay for click handling */}
              <div
                className="absolute inset-0 grid grid-cols-6 gap-2 p-4 cursor-crosshair"
                onClick={(e) => {
                  if (!isDrawing) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  const y = (e.clientY - rect.top) / rect.height;
                  const lat = centerCoords.lat + (y - 0.5) * 0.02;
                  const lng = centerCoords.lng + (x - 0.5) * 0.02;
                  addPoint(lat, lng);
                }}
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="bg-white/40 rounded-xl hover:bg-white/60 transition-colors" />
                ))}
              </div>

              {/* Drawn polygon overlay */}
              {points.length > 0 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <polygon
                    points={points
                      .map((p) => {
                        const x = ((p.lng - centerCoords.lng) / 0.02 + 0.5) * 100;
                        const y = ((p.lat - centerCoords.lat) / 0.02 + 0.5) * 100;
                        return `${x}%,${y}%`;
                      })
                      .join(' ')}
                    fill="rgba(246, 199, 55, 0.2)"
                    stroke="#F6C737"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                  />
                  {points.map((p, i) => {
                    const x = ((p.lng - centerCoords.lng) / 0.02 + 0.5) * 100;
                    const y = ((p.lat - centerCoords.lat) / 0.02 + 0.5) * 100;
                    return (
                      <circle
                        key={i}
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="8"
                        fill="#F6C737"
                        stroke="white"
                        strokeWidth="2"
                      >
                        <title>Point {i + 1}</title>
                      </circle>
                    );
                  })}
                </svg>
              )}

              {/* Empty state */}
              {points.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
                    <Crosshair className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-bold mb-2">Click "Start Drawing" then click the grid</p>
                    <p className="text-slate-400 text-sm">Mark the corners of your property</p>
                  </div>
                </div>
              )}

              {/* Point counter */}
              <div className="absolute bottom-4 left-4 bg-navy/80 text-white px-4 py-2 rounded-2xl text-sm font-bold">
                {points.length} points | Area: {calculateArea(points).toFixed(0)} sqft
              </div>

              {/* Map help */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl text-xs text-slate-500 shadow-lg border border-slate-200">
                <Compass className="w-4 h-4 inline mr-1" />
                Click to add points
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all">
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={points.length < 3}
                className="bg-gold hover:bg-gold/90 text-navy font-bold px-10 py-4 rounded-2xl shadow-lg transition-all disabled:opacity-50"
              >
                Next: Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Details & Submit */}
        {step === 3 && (
          <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-navy mb-6">Property Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Terrain Type</label>
                <select
                  value={formData.terrainType}
                  onChange={(e) => handleInputChange('terrainType', e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all bg-white"
                >
                  <option value="">Select terrain type</option>
                  {terrainTypes.map((t) => (
                    <option key={t} value={t.toLowerCase().replace(' ', '_')}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Soil Type</label>
                <select
                  value={formData.soilType}
                  onChange={(e) => handleInputChange('soilType', e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all bg-white"
                >
                  <option value="">Select soil type</option>
                  {soilTypes.map((t) => (
                    <option key={t} value={t.toLowerCase().replace(' ', '_')}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Road Access</label>
                <select
                  value={formData.roadAccess}
                  onChange={(e) => handleInputChange('roadAccess', e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all bg-white"
                >
                  <option value="">Select road access</option>
                  {roadAccessTypes.map((t) => (
                    <option key={t} value={t.toLowerCase().replace('-', '_').replace(' ', '_')}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Zoning</label>
                <select
                  value={formData.zoning}
                  onChange={(e) => handleInputChange('zoning', e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all bg-white"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="agricultural">Agricultural</option>
                  <option value="mixed">Mixed Use</option>
                </select>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 rounded-3xl p-6 space-y-3 border border-slate-200">
              <h3 className="font-bold text-navy text-lg mb-3">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Property Name</p>
                  <p className="font-bold text-navy">{formData.name || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400">City</p>
                  <p className="font-bold text-navy">{formData.address.city || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Map Points</p>
                  <p className="font-bold text-navy">{points.length}</p>
                </div>
                <div>
                  <p className="text-slate-400">Est. Area</p>
                  <p className="font-bold text-navy">
                    {calculateArea(points).toFixed(0)} sqft
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(2)} className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-gold hover:bg-gold/90 text-navy font-bold px-10 py-4 rounded-2xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Register Property
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProperty;

