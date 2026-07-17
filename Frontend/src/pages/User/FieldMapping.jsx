import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
// Leaflet CSS imported via CDN or main.css
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { Save, Edit3, Trash2 } from 'lucide-react';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Drawing component for map clicks
function LocationMarker({ onDraw }) {
  useMapEvents({
    click(e) {
      onDraw(e.latlng);
    },
  });
  return null;
}

const FieldMapping = () => {
  const { user } = useAuth();
  const [position, setPosition] = useState([20.5937, 78.9629]); // India center
  const [fieldPoints, setFieldPoints] = useState([]);
  const [editing, setEditing] = useState(false);
  const [fieldData, setFieldData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ length: '', width: '' });
  const mapRef = useRef();

useEffect(() => {
    fieldService.getUserFields()
      .then(({ data }) => {
        if (data.length > 0) {
          const field = data.find(f => f.isPrimary) || data[0];
          setFieldData(field);
          setFieldPoints(field.geoJSON.coordinates[0].map(c => [c[1], c[0]]));
          setPosition(field.address.location.coordinates.reverse());
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const calculateArea = (points) => {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i][0] * points[j][1];
      area -= points[j][0] * points[i][1];
    }
    return Math.abs(area / 2);
  };

  const addPoint = (latlng) => {
    const newPoints = [...fieldPoints, [latlng.lat, latlng.lng]];
    setFieldPoints(newPoints);
  };

  const clearField = () => {
    setFieldPoints([]);
  };

const saveField = async () => {
    const centerLng = fieldPoints.reduce((acc, p) => acc + p[1], 0) / fieldPoints.length;
    const centerLat = fieldPoints.reduce((acc, p) => acc + p[0], 0) / fieldPoints.length;
    const areaSqm = calculateArea(fieldPoints) * 111000 * 111000; // rough sqm
    const fieldDataToSave = {
      name: 'My Land Plot',
      geoJSON: {
        type: 'Polygon',
        coordinates: [fieldPoints.map(p => [p[1], p[0]])]
      },
      dimensions: {
        ...dimensions,
        area: Math.round(areaSqm)
      },
      address: {
        location: {
          type: 'Point',
          coordinates: [centerLng, centerLat]
        }
      }
    };
    
    try {
      const result = await fieldService.createField(fieldDataToSave);
      toast.success('Field saved to account!');
      setFieldData(result);
    } catch (err) {
      toast.error('Save failed, using local');
      localStorage.setItem('userField', JSON.stringify(fieldDataToSave));
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">Loading map...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Map Container */}
        <div className="flex-1 min-h-[500px] md:min-h-[600px] rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          <MapContainer 
            center={position} 
            zoom={5} 
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker onDraw={addPoint} />
            {fieldPoints.length > 0 && (
              <Marker position={position}>
                <Popup>Field Center</Popup>
              </Marker>
            )}
            {fieldPoints.length > 0 && (
              <LayerGroup>
                {fieldPoints.map((p, i) => (
                  <Marker key={i} position={[p[0], p[1]]}>
                    <Popup>Point {i + 1}</Popup>
                  </Marker>
                ))}
              </LayerGroup>
            )}
          </MapContainer>
        </div>

        {/* Control Panel */}
        <div className="lg:w-80 space-y-6">
          {/* Mapping Controls */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Field Mapping</h2>
            <div className="space-y-4">
              <button 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Stop Drawing' : 'Start Drawing'}
                <Edit3 className="w-5 h-5" />
              </button>
              
              {fieldPoints.length > 0 && (
                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200">
                  <div className="text-sm font-medium text-emerald-800 mb-2">Field Status</div>
                  <div className="text-2xl font-bold text-emerald-700 mb-1">{fieldPoints.length} points</div>
                  <div className="text-sm text-emerald-600">
                    Approx. Area: {calculateArea(fieldPoints).toFixed(1)} units²
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1"
                  onClick={clearField}
                  disabled={fieldPoints.length === 0}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
                <button 
                  className="bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                  onClick={saveField}
                  disabled={fieldPoints.length < 3}
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Manual Dimensions */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-5">Field Dimensions</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Length (meters)</label>
                <input 
                  type="number" 
                  value={dimensions.length}
                  onChange={(e) => setDimensions({...dimensions, length: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-3 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="e.g. 100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Width (meters)</label>
                <input 
                  type="number" 
                  value={dimensions.width}
                  onChange={(e) => setDimensions({...dimensions, width: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-3 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="e.g. 50"
                />
              </div>
              {dimensions.length && dimensions.width && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                  <div className="font-bold text-lg text-blue-800">
                    Total: {parseFloat(dimensions.length) * parseFloat(dimensions.width)} m²
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-b from-slate-50 to-slate-100 p-6 rounded-3xl text-sm space-y-3 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              How to map
            </h4>
            <ol className="space-y-2 text-slate-700 list-decimal list-inside pl-2">
              <li>Click "Start Drawing"</li>
              <li>Click map corners (min 3 points)</li>
              <li>Enter dimensions above</li>
              <li>Click "Save Field"</li>
            </ol>
            <div className="text-xs text-slate-500 mt-4 p-3 bg-slate-100 rounded-xl">
              Data saved locally for design recommendations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldMapping;

