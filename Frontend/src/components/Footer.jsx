import React from 'react';
import { Home, Mail, Phone, MapPin, Camera, Code2, Send, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-navy text-white pt-16 pb-8 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gold p-2 rounded-lg">
                <Home className="w-5 h-5 text-navy" />
              </div>
              <span className="text-white font-bold text-xl">Dream<span className="text-gold">House</span></span>
            </Link>
            <p className="text-slate-400 leading-relaxed">
              Transforming visions into reality. We connect you with top-tier engineers to build the home of your dreams with premium designs.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-gold font-bold text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-slate-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/register" className="text-slate-400 hover:text-white transition-colors">Join as Engineer</Link></li>
              <li><Link to="/login" className="text-slate-400 hover:text-white transition-colors">Client Login</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-gold font-bold text-lg">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors group">
                <Mail className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                <span>info@dreamhouse.com</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors group">
                <Phone className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                <span>+1 (234) 567-890</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors group">
                <MapPin className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                <span>123 Design St, Beverly Hills, CA</span>
              </li>
            </ul>
          </div>

          {/* Social Social */}
          <div className="space-y-4">
            <h3 className="text-gold font-bold text-lg">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full border border-white/10 hover:border-gold hover:text-gold transition-all duration-300">
                <Camera className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full border border-white/10 hover:border-gold hover:text-gold transition-all duration-300">
                <Code2 className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full border border-white/10 hover:border-gold hover:text-gold transition-all duration-300">
                <Send className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full border border-white/10 hover:border-gold hover:text-gold transition-all duration-300">
                <Briefcase className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Build Your Dream House. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
