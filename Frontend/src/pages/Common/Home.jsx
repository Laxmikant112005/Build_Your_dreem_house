import React, { useState, useEffect } from 'react';
import { Search, MapPin, ArrowRight, ShieldCheck, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { designService } from '../../services/designService';
import DesignCard from '../../components/DesignCard';

const Home = () => {
  const [featuredDesigns, setFeaturedDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const data = await designService.getAll();
        setFeaturedDesigns(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (err) {
        console.error('Failed to fetch designs:', err);
        toast.error('Failed to load featured designs');
        setFeaturedDesigns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-navy">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920" 
            alt="Luxury Home" 
            className="w-full h-full object-cover opacity-30 scale-110 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/40 to-navy"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Build Your <span className="text-gold">Dream House</span> <br className="hidden md:block" /> With Expert Engineers
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-medium">
            Discover premium house designs and connect with world-class engineers to bring your vision to life.
          </p>

          <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-2xl flex flex-col md:flex-row gap-3 max-w-3xl mx-auto">
            <div className="flex-grow flex items-center bg-white rounded-xl px-4 py-3 shadow-inner">
              <Search className="w-5 h-5 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search styles (Modern, Minimalist...)" 
                className="w-full bg-transparent border-none outline-none text-navy font-medium placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center bg-white rounded-xl px-4 py-3 shadow-inner md:w-1/3">
              <MapPin className="w-5 h-5 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Location" 
                className="w-full bg-transparent border-none outline-none text-navy font-medium placeholder:text-slate-400"
              />
            </div>
            <button className="bg-gold hover:bg-gold-light text-navy font-bold px-8 py-3 rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95">
              Refine Search
            </button>
          </div>
        </div>
      </section>

      {/* Featured Designs */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 px-4">
            <div>
              <h2 className="text-4xl font-bold text-navy mb-4">Featured House Designs</h2>
              <div className="h-1.5 w-24 bg-gold rounded-full"></div>
              <p className="text-slate-500 mt-6 text-lg max-w-xl">
                Explore our most popular architectural masterpieces from top independent engineers.
              </p>
            </div>
            <Link to="/designs" className="mt-8 md:mt-0 flex items-center gap-2 text-gold font-bold hover:gap-4 transition-all">
              View All Collection <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={`skeleton-${i}`} className="h-[450px] bg-slate-100 rounded-2xl animate-pulse"></div>
              ))
            ) : (
              featuredDesigns?.map(design => (
                <DesignCard key={design.id || `design-${Math.random()}`} design={design} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mb-6 border border-gold/20 group-hover:bg-gold transition-all duration-500">
              <ShieldCheck className="w-8 h-8 text-gold group-hover:text-navy" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">Verified Engineers</h3>
            <p className="text-slate-500">Every professional is vetted for quality and reliability.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mb-6 border border-gold/20 group-hover:bg-gold transition-all duration-500">
              <Users className="w-8 h-8 text-gold group-hover:text-navy" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">Collaborative Spirit</h3>
            <h3 className="text-xl font-bold text-navy mb-2"></h3>
            <p className="text-slate-500">Work directly with designers to refine every detail.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mb-6 border border-gold/20 group-hover:bg-gold transition-all duration-500">
              <Clock className="w-8 h-8 text-gold group-hover:text-navy" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">Timely Delivery</h3>
            <p className="text-slate-500">Fast-track your dream with efficiency and precision.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-navy px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to Build Your Dream?</h2>
        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
          Join thousands of homeowners who found their perfect architectural match.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link to="/register" className="btn-gold text-lg px-10 py-4">Create Account</Link>
          <Link to="/register?role=engineer" className="btn-outline text-lg px-10 py-4">Join as Engineer</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
