import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, Heart, Share2, Download, Eye,
  BedDouble, Bath, Square, Layers, MapPin, Star,
  Calendar, Users, CheckCircle, XCircle, ChevronDown,
  ChevronUp, ExternalLink, Clock, Percent, Home,
  FileText, Ruler, Sun, Wind,
} from 'lucide-react';
import { blueprintService } from '../../services/blueprintService';
import { cn } from '../../utils/cn';

const DesignDetailEnhanced = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await blueprintService.getById(id);
        setBlueprint(response.data);
        setIsLiked(false);

        // Fetch related
        try {
          const rel = await blueprintService.getRelated(id, 4);
          setRelated(rel.data || []);
        } catch (e) { /* ignore */ }
      } catch (err) {
        toast.error('Design not found');
        navigate('/user/designs');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleLike = async () => {
    try {
      const res = await blueprintService.toggleLike(id);
      setIsLiked(res.data?.liked || false);
      toast.success(res.data?.liked ? 'Added to favorites' : 'Removed from favorites');
    } catch (err) {
      toast.error('Please login to like designs');
    }
  };

  const formatCurrency = (val) => {
    if (!val) return '—';
    return '₹' + Number(val).toLocaleString('en-IN');
  };

  const getImages = () => {
    const files = blueprint?.files;
    const all = [];
    if (files?.images) all.push(...files.images);
    if (files?.floorPlans) {
      all.push(...files.floorPlans.map(fp => ({
        url: fp.url,
        alt: fp.name || `Floor ${fp.floor}`,
        isFloorPlan: true,
        floor: fp.floor,
      })));
    }
    return all;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blueprint) return null;

  const images = getImages();
  const specs = blueprint.specs || {};
  const engineer = blueprint.engineerId || {};
  const files = blueprint.files || {};
  const vastu = blueprint.vastu || {};
  const sustainability = blueprint.sustainability || {};
  const materials = blueprint.materials || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-navy transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Designs
      </button>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative h-96 bg-slate-100 rounded-3xl overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[activeImage]?.url || images[activeImage]?.thumbnailUrl}
                alt={images[activeImage]?.alt || blueprint.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Eye className="w-20 h-20 text-slate-300" />
              </div>
            )}

            {/* Overlay actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleLike}
                className={cn(
                  "p-3 rounded-2xl backdrop-blur-sm transition-all",
                  isLiked ? 'bg-red-500 text-white' : 'bg-white/80 text-slate-600 hover:bg-white'
                )}
              >
                <Heart className={cn("w-5 h-5", isLiked && 'fill-current')} />
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-white transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Labels */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              {blueprint.accessTier && blueprint.accessTier !== 'free' && (
                <span className="bg-gold text-navy text-sm font-bold px-4 py-2 rounded-xl uppercase">{blueprint.accessTier}</span>
              )}
              {vastu.compliant && (
                <span className="bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-xl">Vastu Compliant</span>
              )}
            </div>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all",
                    activeImage === i ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100'
                  )}
                >
                  <img src={img.thumbnailUrl || img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-navy mb-3">{blueprint.title}</h1>
            <p className="text-slate-600 text-lg leading-relaxed">{blueprint.description}</p>
          </div>

          {/* Tags */}
          {blueprint.tags && blueprint.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blueprint.tags.map((tag, i) => (
                <span key={i} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-xl text-sm font-medium">#{tag}</span>
              ))}
            </div>
          )}

          {/* Price Card */}
          <div className="bg-gradient-to-br from-navy to-slate-800 text-white p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/60 font-medium">Estimated Cost</p>
              {blueprint.accessTier && (
                <span className="bg-gold/20 text-gold px-3 py-1 rounded-xl text-sm font-bold uppercase">{blueprint.accessTier}</span>
              )}
            </div>
            <p className="text-4xl font-black mb-2">{formatCurrency(specs.estimatedCost)}</p>
            <div className="flex items-center gap-4 text-white/70">
              {specs.costPerSqft > 0 && <span>₹{specs.costPerSqft}/sq.ft</span>}
              {specs.estimatedDuration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />{specs.estimatedDuration} days
                </span>
              )}
            </div>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Square, label: 'Area', value: specs.builtUpArea ? `${specs.builtUpArea.toLocaleString()} sq.ft` : '—' },
              { icon: BedDouble, label: 'Bedrooms', value: specs.bedrooms || '—' },
              { icon: Bath, label: 'Bathrooms', value: specs.bathrooms || '—' },
              { icon: Layers, label: 'Floors', value: specs.floors || '—' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-2xl text-center">
                <stat.icon className="w-5 h-5 text-gold mx-auto mb-2" />
                <p className="text-lg font-black text-navy">{stat.value}</p>
                <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Engineer Info */}
          <div className="border border-slate-200 rounded-3xl p-6">
            <h3 className="font-bold text-navy mb-4">Design Engineer</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center text-2xl font-black text-navy">
                {engineer.firstName?.[0] || 'E'}
              </div>
              <div>
                <p className="font-bold text-navy text-lg">
                  {engineer.firstName} {engineer.lastName}
                </p>
                {engineer.engineerProfile?.title && (
                  <p className="text-slate-500 text-sm">{engineer.engineerProfile.title}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 text-gold fill-current" />
                  <span className="font-bold">
                    {engineer.engineerProfile?.rating?.average?.toFixed(1) || '—'}
                  </span>
                  <span className="text-slate-400 text-sm">
                    ({engineer.engineerProfile?.rating?.count || 0} reviews)
                  </span>
                </div>
              </div>
              <Link
                to={`/user/engineers/${engineer._id}`}
                className="ml-auto bg-slate-100 hover:bg-slate-200 px-6 py-3 rounded-2xl font-bold text-navy transition-all"
              >
                View Profile
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 btn-gold py-4 font-bold text-lg rounded-2xl">
              Book Consultation
            </button>
            <button className="px-6 py-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main specs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Construction Details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8">
            <h2 className="text-2xl font-black text-navy mb-6">Construction Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Style', value: specs.style, icon: Home },
                { label: 'Construction Type', value: specs.constructionType, icon: Ruler },
                { label: 'Plot Required', value: specs.plotAreaRequired ? `${specs.plotAreaRequired} sq.ft` : '—', icon: MapPin },
                { label: 'Kitchen', value: specs.kitchen, icon: Home },
                { label: 'Parking', value: specs.parking, icon: Home },
                { label: 'Garage', value: specs.garage || '—', icon: Home },
                { label: 'Living Rooms', value: specs.livingRooms || '—', icon: Home },
                { label: 'Plot Width', value: specs.plotWidth ? `${specs.plotWidth} ft` : '—', icon: Ruler },
                { label: 'Plot Length', value: specs.plotLength ? `${specs.plotLength} ft` : '—', icon: Ruler },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-xs text-slate-400 font-medium uppercase mb-1">{item.label}</p>
                  <p className="font-bold text-navy capitalize">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vastu & Sustainability */}
          {(vastu.compliant || sustainability.score > 0) && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8">
              <h2 className="text-2xl font-black text-navy mb-6">Vastu & Sustainability</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vastu.compliant && (
                  <div className="bg-emerald-50 p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Sun className="w-6 h-6 text-emerald-600" />
                      <h3 className="font-bold text-emerald-800">Vastu Compliant</h3>
                    </div>
                    <div className="space-y-3">
                      {vastu.score > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-700">Vastu Score</span>
                          <span className="font-bold text-emerald-800">{vastu.score}%</span>
                        </div>
                      )}
                      {vastu.orientation && (
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-700">Orientation</span>
                          <span className="font-bold text-emerald-800 capitalize">{vastu.orientation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {sustainability.score > 0 && (
                  <div className="bg-green-50 p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Wind className="w-6 h-6 text-green-600" />
                      <h3 className="font-bold text-green-800">Sustainability</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-green-700">Score</span>
                        <span className="font-bold text-green-800">{sustainability.score}%</span>
                      </div>
                      {sustainability.features?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {sustainability.features.slice(0, 4).map((f, i) => (
                            <span key={i} className="bg-white/60 px-2 py-1 rounded-lg text-xs text-green-700">
                              {f.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Material Estimates */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8">
            <h2 className="text-2xl font-black text-navy mb-6">Material Estimates</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Cement', value: materials.cementBags ? `${materials.cementBags} bags` : '—' },
                { label: 'Steel', value: materials.steelTons ? `${materials.steelTons} tons` : '—' },
                { label: 'Bricks', value: materials.bricks ? `${materials.bricks.toLocaleString()}` : '—' },
                { label: 'Sand', value: materials.sandCubicFeet ? `${materials.sandCubicFeet} cu.ft` : '—' },
                { label: 'Aggregate', value: materials.aggregateCubicFeet ? `${materials.aggregateCubicFeet} cu.ft` : '—' },
                { label: 'Flooring', value: materials.flooringArea ? `${materials.flooringArea} sq.ft` : '—' },
                { label: 'Paint', value: materials.paintArea ? `${materials.paintArea} sq.ft` : '—' },
                { label: 'Tiles', value: materials.tilesArea ? `${materials.tilesArea} sq.ft` : '—' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                  <p className="font-bold text-navy text-lg mt-1">{item.value}</p>
                </div>
              ))}
            </div>
            {materials.customMaterials?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="font-bold text-navy mb-3">Custom Materials</p>
                <div className="space-y-2">
                  {materials.customMaterials.map((cm, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-2xl">
                      <span className="font-medium text-navy">{cm.name}</span>
                      <span className="text-slate-500">{cm.quantity} {cm.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Files/Documents */}
          {(files.floorPlans?.length > 0 || files.cadFiles?.length > 0 || files.documents?.length > 0) && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8">
              <h2 className="text-2xl font-black text-navy mb-6">Blueprints & Documents</h2>

              {files.floorPlans?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-navy mb-4">Floor Plans</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {files.floorPlans.map((fp, i) => (
                      <a key={i} href={fp.url} target="_blank" rel="noopener noreferrer"
                        className="bg-slate-50 p-4 rounded-2xl hover:bg-slate-100 transition-all text-center"
                      >
                        <FileText className="w-8 h-8 text-gold mx-auto mb-2" />
                        <p className="text-sm font-bold text-navy">{fp.name || `Floor ${fp.floor}`}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {files.cadFiles?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-navy mb-4">CAD Files</h3>
                  <div className="space-y-2">
                    {files.cadFiles.map((cf, i) => (
                      <a key={i} href={cf.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl hover:bg-slate-100 transition-all"
                      >
                        <FileText className="w-5 h-5 text-gold" />
                        <span className="font-medium text-navy">{cf.name}</span>
                        <span className="text-xs text-slate-400 ml-auto">{cf.format}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {files.documents?.length > 0 && (
                <div>
                  <h3 className="font-bold text-navy mb-4">Documents</h3>
                  <div className="space-y-2">
                    {files.documents.map((doc, i) => (
                      <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl hover:bg-slate-100 transition-all"
                      >
                        <FileText className="w-5 h-5 text-gold" />
                        <span className="font-medium text-navy">{doc.name}</span>
                        <span className="text-xs text-slate-400 ml-auto uppercase">{doc.type}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Overview Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6">
            <h3 className="font-bold text-navy mb-4">Design Overview</h3>
            <div className="space-y-4">
              {[
                { label: 'Status', value: blueprint.status, color: blueprint.status === 'approved' ? 'text-emerald-600' : 'text-gold' },
                { label: 'Published', value: blueprint.publishedAt ? new Date(blueprint.publishedAt).toLocaleDateString() : '—' },
                { label: 'Views', value: blueprint.metrics?.views?.toLocaleString() || '0' },
                { label: 'Likes', value: blueprint.metrics?.likes?.toLocaleString() || '0' },
                { label: 'Downloads', value: blueprint.downloadCount?.toLocaleString() || '0' },
                { label: 'Location', value: blueprint.location?.city || '—' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500 text-sm">{item.label}</span>
                  <span className={`font-bold text-sm ${item.color || 'text-navy'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Similar Designs */}
          {related.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6">
              <h3 className="font-bold text-navy mb-4">Similar Designs</h3>
              <div className="space-y-4">
                {related.map((r) => (
                  <Link
                    key={r._id}
                    to={`/blueprints/${r._id}`}
                    className="flex gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      {r.files?.images?.[0]?.thumbnailUrl ? (
                        <img src={r.files.images[0].thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Eye className="w-5 h-5 text-slate-300" /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-navy text-sm group-hover:text-gold transition-colors line-clamp-1">{r.title}</p>
                      <p className="text-xs text-slate-400">{r.specs?.bedrooms || '—'} Beds · {r.specs?.floors || '—'} Floors</p>
                      {r.specs?.estimatedCost && (
                        <p className="text-xs font-bold text-navy">{formatCurrency(r.specs.estimatedCost)}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignDetailEnhanced;

