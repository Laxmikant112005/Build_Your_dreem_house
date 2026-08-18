import React, { useState, useEffect } from 'react';
import { Search, MapPin, ArrowRight, ShieldCheck, Clock, Users, Compass, Star, Layers, BedDouble } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { blueprintService } from '../../services/blueprintService';

const formatCurrency = (amount) => {
  if (!amount) return 'Price TBD';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

const Home = () => {
  const navigate = useNavigate();
  const [featuredBlueprints, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    blueprintService.getFeatured()
      .then((res) => {
        const list = res?.data || res || [];
        setFeatured(Array.isArray(list) ? list.slice(0, 6) : []);
      })
      .catch(() => { /* graceful fallback */ })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/blueprints?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-navy">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920"
            alt="Dream Home"
            className="w-full h-full object-cover opacity-25 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/40 to-navy"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full mb-8">
            <Compass className="w-5 h-5 text-teal-400" />
            <span className="text-white/80 font-medium text-sm">AI-Powered Blueprint Discovery</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Your Dream Home Starts <br className="hidden md:block" /> with <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Planova</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-medium">
            Discover thousands of professional house blueprints, explore land with interactive maps, 
            and connect with verified engineers — all in one platform.
          </p>

          <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-2xl flex flex-col md:flex-row gap-3 max-w-3xl mx-auto">
            <div className="flex-grow flex items-center bg-white rounded-xl px-4 py-3 shadow-inner">
              <Search className="w-5 h-5 text-slate-400 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by style, size, or features..."
                className="w-full bg-transparent border-none outline-none text-navy font-medium placeholder:text-slate-400"
              />
            </div>
            <button type="submit" className="bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 text-navy font-bold px-10 py-3 rounded-xl transition-all shadow-lg hover:shadow-teal-400/30">
              Explore Blueprints
            </button>
          </form>

          <div className="flex justify-center gap-8 mt-12 text-white/60 text-sm">
            <span>🏗️ 5000+ Blueprints</span>
            <span>📍 200+ Cities</span>
            <span>👷 1000+ Engineers</span>
          </div>
        </div>
      </section>

      {/* Featured Blueprints */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-bold text-navy mb-4">Featured Blueprints</h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"></div>
              <p className="text-slate-500 mt-6 text-lg max-w-xl">
                Professional-grade house plans curated for every style and budget.
              </p>
            </div>
            <Link to="/blueprints" className="mt-8 md:mt-0 flex items-center gap-2 text-teal-600 font-bold hover:gap-4 transition-all">
              View All Blueprints <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-[400px] bg-slate-100 rounded-3xl animate-pulse" />
              ))
            ) : featuredBlueprints.length > 0 ? (
              featuredBlueprints.map((bp) => (
                <Link key={bp._id || bp.id} to={`/blueprints/${bp._id || bp.id}`} className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-200">
                  <div className="relative h-52 overflow-hidden">
                    <img src={bp.files?.images?.[0]?.url || bp.image || '/images/placeholder-design.jpg'}
                      alt={bp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-navy/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs font-bold">
                      {bp.specs?.style || 'Modern'}
                    </div>
                    {bp.specs?.builtUpArea > 0 && (
                      <div className="absolute bottom-4 left-4 bg-teal-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold">
                        {bp.specs.builtUpArea} sqft
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-navy mb-3 group-hover:text-teal-600 transition-colors">{bp.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                      {bp.specs?.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{bp.specs.bedrooms}</span>}
                      {bp.specs?.bathrooms > 0 && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{bp.specs.bathrooms}</span>}
                      {bp.specs?.floors > 0 && <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{bp.specs.floors}</span>}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Est. Cost</p>
                        <p className="text-xl font-black text-navy">{formatCurrency(bp.specs?.estimatedCost)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase">Engineer</p>
                        <p className="text-sm font-bold text-slate-700">{bp.engineerId?.firstName || 'Professional'}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-20">
                <Compass className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-navy mb-4">Blueprints Coming Soon</h3>
                <p className="text-slate-500 mb-6">Be the first to explore when we launch.</p>
                <Link to="/register" className="bg-gradient-to-r from-teal-400 to-emerald-400 text-navy font-bold px-8 py-3 rounded-xl">Get Notified</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-4">Everything You Need</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">From blueprint discovery to construction — we've got you covered.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center group p-8">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 border border-teal-200 group-hover:bg-teal-500 transition-all">
                <Compass className="w-8 h-8 text-teal-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">AI Recommendations</h3>
              <p className="text-slate-500">Smart blueprints matched to your plot, budget, and lifestyle preferences.</p>
            </div>
            <div className="flex flex-col items-center text-center group p-8">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-200 group-hover:bg-emerald-500 transition-all">
                <MapPin className="w-8 h-8 text-emerald-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">Interactive Map</h3>
              <p className="text-slate-500">Explore land with polygon drawing, GeoJSON, and area calculation tools.</p>
            </div>
            <div className="flex flex-col items-center text-center group p-8">
              <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mb-6 border border-cyan-200 group-hover:bg-cyan-500 transition-all">
                <Users className="w-8 h-8 text-cyan-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">Verified Engineers</h3>
              <p className="text-slate-500">Connect, chat, and book appointments with top-rated professionals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '5000+', label: 'Blueprints' },
            { value: '1000+', label: 'Engineers' },
            { value: '200+', label: 'Cities' },
            { value: '98%', label: 'Satisfaction' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border border-slate-200">
              <div className="text-3xl font-black text-navy mb-2">{stat.value}</div>
              <p className="text-slate-500 font-bold uppercase tracking-wide text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-navy px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5" />
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to Build Your Dream?</h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Join thousands of homeowners who found their perfect blueprint on Planova.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/register" className="bg-gradient-to-r from-teal-400 to-emerald-400 text-navy font-bold text-lg px-10 py-4 rounded-xl hover:shadow-lg hover:shadow-teal-400/30 transition-all">
              Get Started Free
            </Link>
            <Link to="/register?role=engineer" className="border-2 border-white/20 text-white font-bold text-lg px-10 py-4 rounded-xl hover:bg-white/10 transition-all">
              Join as Engineer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

