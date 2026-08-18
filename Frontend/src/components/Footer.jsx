import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-teal-400 to-emerald-400 p-2 rounded-lg">
                <Compass className="w-6 h-6 text-navy" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                Plan<span className="text-teal-400">ova</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed">
              Your AI-powered platform for discovering house blueprints, exploring land, and building your dream home.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Explore</h3>
            <ul className="space-y-4">
              <li><Link to="/blueprints" className="text-slate-400 hover:text-teal-400 transition-colors">Blueprints</Link></li>
              <li><Link to="/engineers" className="text-slate-400 hover:text-teal-400 transition-colors">Engineers</Link></li>
              <li><Link to="/marketplace" className="text-slate-400 hover:text-teal-400 transition-colors">Materials</Link></li>
              <li><Link to="/user/field-mapping" className="text-slate-400 hover:text-teal-400 transition-colors">Find Land</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Support</h3>
            <ul className="space-y-4">
              <li><Link to="/faq" className="text-slate-400 hover:text-teal-400 transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-teal-400 transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="text-slate-400 hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-400 hover:text-teal-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-400">
                <Mail className="w-5 h-5 text-teal-400" />
                hello@planova.build
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Phone className="w-5 h-5 text-teal-400" />
                +1 (555) 000-0000
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-5 h-5 text-teal-400" />
                San Francisco, CA
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Planova. All rights reserved. Building dreams, one blueprint at a time.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
