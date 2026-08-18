import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, BedDouble, Layers, Bath, Star, Calendar, Download,
  Share2, Heart, Compass, Users, Ruler, Sun, Wind, ChevronRight, Home, Shovel
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { blueprintService } from '../../services/blueprintService';
import { recommendationService } from '../../services/recommendationService';
import { collectionService } from '../../services/collectionService';
import { recentlyViewedService } from '../../services/recentlyViewedService';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const formatCurrency = (amount) => {
  if (!amount || amount === 0) return 'Price TBD';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

const SpecBadge = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
      <Icon className="w-5 h-5 text-teal-600" />
    </div>
    <div>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">{label}</p>
      <p className="text-lg font-bold text-navy">{value}</p>
    </div>
  </div>
);

const BlueprintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blueprint, setBlueprint] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [costEstimate, setCostEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await blueprintService.getById(id);
        const data = res?.data || res;
        setBlueprint(data);
        if (user) {
          recentlyViewedService.track({
            itemType: 'blueprint', itemId: id,
            title: data?.title,
            thumbnail: data?.files?.images?.[0]?.url,
          }).catch(() => {});
        }
        recommendationService.findSimilar(id, 4).then(r => setSimilar(r?.data || [])).catch(() => {});
        recommendationService.estimateCost(id).then(r => setCostEstimate(r?.data)).catch(() => {});
      } catch {
        toast.error('Failed to load blueprint');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id, user]);

  const toggleSave = async () => {
    if (!user) { toast.error('Login to save'); return; }
    try {
      const res = await collectionService.toggleItem('blueprints', id);
      setSaved(res.data?.saved);
      toast.success(res.data?.saved ? 'Saved to collection!' : 'Removed from collection');
    } catch { toast.error('Failed to save'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Compass className="w-16 h-16 text-slate-300 mb-6" />
        <h2 className="text-2xl font-bold text-navy mb-4">Blueprint Not Found</h2>
        <p className="text-slate-500 mb-8">The blueprint you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate('/blueprints')} className="bg-gradient-to-r from-teal-400 to-emerald-400 text-navy font-bold px-8 py-3 rounded-xl">
          Browse Blueprints
        </button>
      </div>
    );
  }

  const images = blueprint.files?.images || [];
  const specs = blueprint.specs || {};
  const metrics = blueprint.metrics || {};
  const tags = blueprint.tags || [];
  const engineer = blueprint.engineerId || {};
  const vastu = blueprint.vastu || {};
  const sustainability = blueprint.sustainability || {};
  const floorPlans = blueprint.files?.floorPlans || [];
  const ecoFeatures = sustainability.features || [];
  const materialSpecs = blueprint.materialSpecs || specs.materialSpecs || [];
  const hasMaterialSpecs = materialSpecs.length > 0;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'specs', label: 'Specifications' },
    { id: 'materials', label: 'Materials & Finishes' },
    { id: 'plans', label: 'Floor Plans' },
    { id: 'cost', label: 'Cost Estimate' },
  ];

  const features = Object.entries(specs)
    .filter(([key]) => ['builtUpArea', 'plotAreaRequired', 'plotWidth', 'plotLength', 'bedrooms', 'bathrooms', 'floors', 'kitchenType', 'parkingType', 'constructionType'].includes(key))
    .map(([key, val]) => ({
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
      value: typeof val === 'string' ? val.replace(/_/g, ' ') : val,
      icon: key.includes('bed') ? BedDouble : key.includes('bath') ? Bath : key.includes('floor') ? Layers : key.includes('kitchen') ? Home : key.includes('parking') ? Ruler : key.includes('area') || key.includes('plot') ? MapPin : key.includes('construction') ? Shovel : MapPin,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-teal-500 font-bold transition-all group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        <div className="flex items-center gap-3">
          <button onClick={toggleSave} className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border", saved ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-500')}>
            <Heart className={cn("w-4 h-4", saved && 'fill-current')} />
            {saved ? 'Saved' : 'Save'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white border border-slate-200 text-slate-600 hover:border-teal-200 hover:text-teal-600 transition-all">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white border border-slate-200 text-slate-600 hover:border-teal-200 hover:text-teal-600 transition-all">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-slate-200 h-[400px] lg:h-[500px] group">
              <img src={images[activeImage]?.url || blueprint.image || '/images/placeholder-design.jpg'}
                alt={blueprint.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />
              <div className="absolute top-6 left-6 bg-navy/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-bold text-sm">
                {specs.style || 'Modern'}
              </div>
              {specs.builtUpArea > 0 && (
                <div className="absolute bottom-6 left-6 bg-teal-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
                  {specs.builtUpArea.toLocaleString()} sqft
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={cn("w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all", activeImage === i ? 'border-teal-400 shadow-lg ring-2 ring-teal-400/20' : 'border-transparent opacity-60 hover:opacity-100')}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h1 className="text-3xl lg:text-4xl font-black text-navy mb-4">{blueprint.title}</h1>
            {blueprint.description && (
              <p className="text-slate-600 text-lg leading-relaxed mb-6">{blueprint.description}</p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <span key={t} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold">{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Key Specs Grid */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-navy mb-6">Key Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <SpecBadge key={i} icon={f.icon} label={f.label} value={f.value} />
              ))}
              {features.length === 0 && (
                <p className="text-slate-400 col-span-3 text-center py-8">No specifications available</p>
              )}
            </div>

            {/* Vastu Compliance */}
            {vastu.compliant && (
              <div className="mt-6 bg-emerald-50 rounded-3xl p-8 border border-emerald-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                    <Sun className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-800">Vastu Compliant</h3>
                    <p className="text-emerald-600 text-sm">Orientation: {vastu.orientation || 'East'}</p>
                  </div>
                </div>
                {vastu.notes && <p className="text-emerald-700 text-sm ml-16">{vastu.notes}</p>}
              </div>
            )}

            {/* Sustainability */}
            {ecoFeatures.length > 0 && (
              <div className="mt-6 bg-cyan-50 rounded-3xl p-8 border border-cyan-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center">
                    <Wind className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-cyan-800">Sustainable Design</h3>
                    <p className="text-cyan-600 text-sm">Score: {sustainability.score || 0}/100</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 ml-16">
                  {ecoFeatures.map(f => (
                    <span key={f} className="bg-white text-cyan-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-cyan-300">{f.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200 overflow-x-auto">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn("px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2", activeTab === tab.id ? 'text-teal-600 border-teal-400' : 'text-slate-500 border-transparent hover:text-slate-700')}
                >{tab.label}</button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-4">Design Highlights</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(blueprint.highlights && blueprint.highlights.length > 0) ? (
                        blueprint.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-700">
                            <span className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0" />
                            {h}
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400">No highlights listed</li>
                      )}
                    </ul>
                  </div>
                  {engineer._id && (
                    <div>
                      <h3 className="text-xl font-bold text-navy mb-4">Designed By</h3>
                      <Link to={`/engineers/${engineer._id}`} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-teal-50 transition-all group">
                        <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden">
                          {engineer.avatar ? <img src={engineer.avatar} alt="" className="w-full h-full object-cover" /> : <Users className="w-8 h-8 text-teal-600" />}
                        </div>
                        <div className="flex-grow">
                          <p className="font-bold text-navy group-hover:text-teal-600 transition-colors">{engineer.firstName} {engineer.lastName}</p>
                          <p className="text-sm text-slate-500">{engineer.engineerProfile?.title || 'Professional Engineer'}</p>
                          {engineer.engineerProfile?.rating && (
                            <div className="flex items-center gap-1 text-sm text-amber-500 mt-1">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-bold">{engineer.engineerProfile.rating.average?.toFixed(1)} ({engineer.engineerProfile.rating.count})</span>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { label: 'Style', value: specs.style },
                      { label: 'Construction', value: specs.constructionType },
                      { label: 'Floors', value: specs.floors },
                      { label: 'Bedrooms', value: specs.bedrooms },
                      { label: 'Bathrooms', value: specs.bathrooms },
                      { label: 'Kitchen', value: specs.kitchenType },
                      { label: 'Parking', value: specs.parkingType },
                      { label: 'Built-up Area', value: specs.builtUpArea ? `${specs.builtUpArea.toLocaleString()} sqft` : '-' },
                      { label: 'Plot Required', value: specs.plotAreaRequired ? `${specs.plotAreaRequired.toLocaleString()} sqft` : '-' },
                      { label: 'Plot Width', value: specs.plotWidth ? `${specs.plotWidth} ft` : '-' },
                      { label: 'Plot Length', value: specs.plotLength ? `${specs.plotLength} ft` : '-' },
                      { label: 'Estimated Duration', value: specs.estimatedDuration ? `${specs.estimatedDuration} days` : '-' },
                    ].map(s => (
                      <div key={s.label} className="flex justify-between items-center py-3 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">{s.label}</span>
                        <span className="font-bold text-navy">{s.value || '-'}</span>
                      </div>
                    ))}
                  </div>
                  {blueprint.additionalSpecs && Object.keys(blueprint.additionalSpecs).length > 0 && (
                    <div>
                      <h4 className="font-bold text-navy mb-4">Additional Specifications</h4>
                      <div className="grid grid-cols-2 gap-6">
                        {Object.entries(blueprint.additionalSpecs).map(([key, val]) => (
                          <div key={key} className="flex justify-between items-center py-3 border-b border-slate-100">
                            <span className="text-slate-500 font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-bold text-navy">{typeof val === 'string' ? val.replace(/_/g, ' ') : String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="space-y-6">
                  {hasMaterialSpecs ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {materialSpecs.map((mat, i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <p className="font-bold text-navy">{mat.name || mat.category}</p>
                          {mat.specification && <p className="text-sm text-slate-500 mt-1">{mat.specification}</p>}
                          {mat.quantity && <p className="text-sm text-teal-700 font-bold mt-2">Qty: {mat.quantity} {mat.unit || ''}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-500">Detailed material specifications not yet available for this blueprint.</p>
                      <p className="text-slate-400 text-sm mt-2">Contact the engineer for a comprehensive material list.</p>
                    </div>
                  )}
                  {costEstimate?.materialBreakdown && (
                    <div>
                      <h4 className="font-bold text-navy mb-4">Estimated Material Quantities</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(costEstimate.materialBreakdown).map(([key, val]) => (
                          <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <p className="text-xs text-slate-400 capitalize">{key}</p>
                            <p className="font-bold text-navy">{val?.toLocaleString() || 0}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'plans' && (
                <div className="space-y-6">
                  {floorPlans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {floorPlans.map((fp, i) => (
                        <div key={i} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 group cursor-pointer">
                          <div className="h-48 overflow-hidden">
                            <img src={fp.url} alt={fp.name || `Floor Plan ${i+1}`} className="w-full h-full object-contain bg-white p-2 group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="p-4">
                            <p className="font-bold text-navy">{fp.name || `Floor Plan ${i+1}`}</p>
                            {fp.description && <p className="text-sm text-slate-500">{fp.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">Floor plans are not yet available for this blueprint.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'cost' && (
                <div className="space-y-8">
                  {costEstimate ? (
                    <>
                      <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-8 text-white">
                        <p className="text-white/80 font-bold uppercase tracking-wider text-sm mb-2">Total Estimated Cost</p>
                        <p className="text-4xl font-black">{formatCurrency(costEstimate.breakdown?.totalEstimatedCost)}</p>
                        <div className="flex gap-6 mt-6 text-white/80 text-sm">
                          <span>📍 {costEstimate.location}</span>
                          <span>⭐ {costEstimate.quality}</span>
                          <span>📐 {costEstimate.costPerSqft?.toLocaleString()}/sqft</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                          <p className="text-sm text-slate-500 font-bold uppercase tracking-wide">Materials</p>
                          <p className="text-2xl font-black text-navy mt-2">{formatCurrency(costEstimate.breakdown?.materialCost)}</p>
                          <p className="text-xs text-slate-400 mt-1">55% of total</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                          <p className="text-sm text-slate-500 font-bold uppercase tracking-wide">Labor</p>
                          <p className="text-2xl font-black text-navy mt-2">{formatCurrency(costEstimate.breakdown?.laborCost)}</p>
                          <p className="text-xs text-slate-400 mt-1">30% of total</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                          <p className="text-sm text-slate-500 font-bold uppercase tracking-wide">Overhead</p>
                          <p className="text-2xl font-black text-navy mt-2">{formatCurrency(costEstimate.breakdown?.overheadCost)}</p>
                          <p className="text-xs text-slate-400 mt-1">15% of total</p>
                        </div>
                      </div>
                      {costEstimate.estimatedDurationDays && (
                        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                          <div className="flex items-center gap-4">
                            <Calendar className="w-8 h-8 text-amber-600" />
                            <div>
                              <p className="font-bold text-amber-800">Estimated Construction Duration</p>
                              <p className="text-2xl font-black text-amber-900">{costEstimate.estimatedDurationDays} days</p>
                              <p className="text-sm text-amber-700">~{Math.round(costEstimate.estimatedDurationDays / 30)} months</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Ruler className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">Cost estimation is being generated.</p>
                      <button onClick={() => recommendationService.estimateCost(id).then(r => setCostEstimate(r?.data)).catch(() => toast.error('Failed to estimate'))}
                        className="mt-4 bg-teal-50 text-teal-700 font-bold px-6 py-3 rounded-xl hover:bg-teal-100 transition-all">
                        Generate Estimate
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sticky Sidebar */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-navy p-8 rounded-3xl text-white border border-white/10 shadow-2xl sticky top-28">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-teal-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-1">Estimated Cost</p>
                <h3 className="text-4xl font-black">{formatCurrency(specs.estimatedCost || costEstimate?.breakdown?.totalEstimatedCost)}</h3>
              </div>
              <div className="bg-white/10 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-white/20">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-sm">{engineer?.engineerProfile?.rating?.average?.toFixed(1) || '4.8'}</span>
              </div>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-full bg-teal-400/20 flex items-center justify-center"><Calendar className="w-4 h-4 text-teal-400" /></div>
                <span className="text-sm font-medium">Free consultation included</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-full bg-teal-400/20 flex items-center justify-center"><Download className="w-4 h-4 text-teal-400" /></div>
                <span className="text-sm font-medium">Downloadable blueprints</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-full bg-teal-400/20 flex items-center justify-center"><MapPin className="w-4 h-4 text-teal-400" /></div>
                <span className="text-sm font-medium">Quality guaranteed</span>
              </div>
            </div>
            <div className="space-y-3">
              <button onClick={() => navigate(`/appointments/new?blueprint=${id}`)}
                className="w-full bg-gradient-to-r from-teal-400 to-emerald-400 text-navy font-black py-5 rounded-2xl text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-teal-400/30 transition-all">
                Book Consultation <Calendar className="w-5 h-5" />
              </button>
              <Link to={`/blueprints/compare?ids=${id}`}
                className="w-full block text-center border-2 border-white/20 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all">
                Compare with Others
              </Link>
            </div>
          </div>

          {engineer._id && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-6">Designed By</h4>
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full border-4 border-teal-200 p-1 mb-4">
                  <img src={engineer.avatar || '/images/placeholder.jpg'} alt={engineer.firstName} className="w-full h-full rounded-full object-cover" />
                </div>
                <h3 className="text-xl font-extrabold text-navy mb-1">{engineer.firstName} {engineer.lastName}</h3>
                <p className="text-slate-400 text-sm mb-4">{engineer.engineerProfile?.title || 'Professional Engineer'}</p>
                <div className="flex items-center gap-1 text-amber-500 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-4 h-4", i < Math.round(engineer.engineerProfile?.rating?.average || 4.5) ? 'fill-current' : 'text-slate-200')} />
                  ))}
                  <span className="text-navy font-bold ml-1">{(engineer.engineerProfile?.rating?.average || 4.5).toFixed(1)}</span>
                  <span className="text-slate-400 text-sm">({engineer.engineerProfile?.rating?.count || 27})</span>
                </div>
                <Link to={`/engineers/${engineer._id}`}
                  className="w-full bg-navy text-white font-bold py-4 rounded-2xl text-center hover:bg-navy/80 transition-all">
                  View Profile
                </Link>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-6">Blueprint Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-2xl">
                <p className="text-2xl font-black text-navy">{metrics.views || 0}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">Views</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl">
                <p className="text-2xl font-black text-navy">{metrics.likes || 0}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">Likes</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl">
                <p className="text-2xl font-black text-navy">{metrics.saves || 0}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">Saves</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl">
                <p className="text-2xl font-black text-navy">{metrics.appointments || 0}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">Appointments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Blueprints */}
      {similar.length > 0 && (
        <section className="mt-24">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-2">Similar Blueprints</h2>
              <p className="text-slate-500">Users who viewed this also liked these designs.</p>
            </div>
            <Link to="/blueprints" className="text-teal-600 font-bold flex items-center gap-2 hover:gap-4 transition-all">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {similar.map((bp) => (
              <Link key={bp._id || bp.id} to={`/blueprints/${bp._id || bp.id}`} className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all border border-slate-200">
                <div className="h-44 overflow-hidden">
                  <img src={bp.files?.images?.[0]?.url || bp.image || '/images/placeholder-design.jpg'}
                    alt={bp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-navy mb-2 line-clamp-1">{bp.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                    {bp.specs?.bedrooms > 0 && <span><BedDouble className="w-3 h-3 inline" /> {bp.specs.bedrooms}</span>}
                    {bp.specs?.bathrooms > 0 && <span><Bath className="w-3 h-3 inline" /> {bp.specs.bathrooms}</span>}
                    {bp.specs?.floors > 0 && <span><Layers className="w-3 h-3 inline" /> {bp.specs.floors}</span>}
                  </div>
                  <p className="text-lg font-black text-navy">{formatCurrency(bp.specs?.estimatedCost)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlueprintDetail;

