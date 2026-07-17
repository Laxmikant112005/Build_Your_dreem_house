import React, { useState, useCallback } from 'react';
import { MapPin, Ruler, RotateCcw, Save, Download } from 'lucide-react';
import { cn } from '../../utils/cn';

const MapField = () => {
  const [points, setPoints] = useState([]);
  const [area, setArea] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // India center

  const addPoint = useCallback((lat, lng) => {
    if (isDrawing) {
      const newPoints = [...points, { lat, lng }];
      setPoints(newPoints);
      
      if (newPoints.length >= 3) {
        const calculatedArea = calculateArea(newPoints);
        setArea(calculatedArea);
      }
    }
  }, [points, isDrawing]);

  const calculateArea = (coords) => {
    // Simple shoelace formula for polygon area (sq meters mock)
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i].lat * coords[j].lng;
      area -= coords[j].lat * coords[i].lng;
    }
    return Math.abs(area / 2 * 10000).toFixed(0); // Mock conversion to sqm
  };

  const startDrawing = () => {
    setPoints([]);
    setArea(0);
    setIsDrawing(true);
  };

  const clearField = () => {
    setPoints([]);
    setArea(0);
  };

  const saveField = () => {
    // Save to localStorage or context
    localStorage.setItem('userField', JSON.stringify({ points, area, center }));
    alert(`Field saved! Area: ${area} sqm`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Map Canvas */}
        <div className="lg:w-2/3 bg-white rounded-4xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6" />
              <div>
                <h1 className="text-2xl font-bold">Map My Field</h1>
                <p className="text-slate-300 text-sm">Draw your field boundary for accurate design recommendations</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={startDrawing} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all">
                Start Drawing
              </button>
              <button onClick={clearField} className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all">
                <RotateCcw className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>

          <div className="relative h-[600px] bg-gradient-to-br from-slate-200 to-slate-300 p-8">
            {/* Mock Map */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwMCAxMDAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRTlGQUY1Ii8+CjxjaXJjbGUgY3g9IjUwMCIgY3k9IjMwMCIgcj0iMjAiIGZpbGw9IiNGRjgwODAiLz4KPGNpcmNsZSBjeD0iNzAwIiBjeT0iNDAwIiByPSIyNSIgZmlsbD0iIzQ0OUJCMCIvPgo8cGF0aCBkPSJNMzUwIDUwMGw0MCA0MGw0MCAtNDAiIHN0cm9rZT0iI0ZGRjgwOCIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==')] bg-repeat">
              {/* Field Polygon */}
              {points.length > 0 && (
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000">
                  <polygon 
                    points={points.map(p => `${p.lng * 10 + 100},${p.lat * 10 + 100}`).join(' ')} 
                    fill="rgba(59, 130, 246, 0.3)" 
                    stroke="#3B82F6" 
                    strokeWidth="4"
                    strokeDasharray="10,5"
                  />
                  {points.map((point, i) => (
                    <circle 
                      key={i}
                      cx={point.lng * 10 + 100} 
                      cy={point.lat * 10 + 100} 
                      r="8"
                      fill="#3B82F6"
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              )}
              
              {/* Click instructions */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center max-w-md border border-slate-200">
                  <MapPin className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-navy mb-2">Mark Field Corners</h3>
                  <p className="text-slate-600 mb-6">Click on map to add points (min 3). Area auto-calculates.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={startDrawing} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-emerald-500/50 transition-all">
                      Start Marking
                    </button>
                    <button onClick={saveField} disabled={area === 0 || !isDrawing} className="px-6 py-3 bg-gold text-navy rounded-2xl font-bold shadow-lg hover:shadow-gold/50 transition-all disabled:opacity-50">
                      <Save className="w-4 h-4 inline mr-1" /> Save ({area} m²)
                    </button>
                  </div>
                </div>
              </div>

              {/* Mock clickable areas */}
              <div className="h-full grid grid-cols-4 gap-4 p-20 cursor-pointer" onClick={(e) => {
                if (isDrawing && points.length < 10) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const lat = center.lat + (y / rect.height - 0.5) * 0.1;
                  const lng = center.lng + (x / rect.width - 0.5) * 0.1;
                  addPoint(lat, lng);
                }
              }}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="bg-slate-400/30 rounded-xl hover:bg-slate-400/50 transition-colors cursor-pointer h-24" />
                ))}
              </div>
            </div>

            {/* Bottom toolbar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm font-bold">
                <span>Points: {points.length}</span>
                <span>Area: <span className="text-emerald-600">{area} m²</span></span>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-medium transition-all flex items-center gap-1">
                  <Download className="w-4 h-4" /> Export KML
                </button>
                <button onClick={saveField} className="px-6 py-2 bg-navy text-white rounded-xl font-bold shadow-lg hover:shadow-navy/50 transition-all" disabled={area === 0}>
                  Save Field Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:w-1/3 space-y-6">
          {/* Saved Fields */}
          <div className="bg-white rounded-4xl p-6 border border-slate-200 shadow-xl">
            <h3 className="text-xl font-bold text-navy mb-4">Saved Fields</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {JSON.parse(localStorage.getItem('userField') || 'null') ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <p className="font-bold text-emerald-800">{JSON.parse(localStorage.getItem('userField')).area} m²</p>
                  <p className="text-sm text-emerald-600">Saved on {new Date().toLocaleDateString()}</p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">No fields saved. Draw your first field!</p>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-4xl p-6 border border-emerald-100">
            <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Pro Tips
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Minimum 3 corners for accurate area</li>
              <li>• Walk field edges for precision</li>
              <li>• Used for design matching</li>
              <li>• Export for architect reference</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapField;

