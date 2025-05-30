import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Globe, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-blue-900 to-blue-800 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold flex items-center">
              <Globe className="mr-2" />
              Travel Agency
            </h3>
            <p className="text-blue-100">
              Making your travel dreams come true since 2010. Explore the world with our expertly crafted tours.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-blue-700 pb-2">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-blue-100 hover:text-white transition-colors flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  All Tours
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-blue-100 hover:text-white transition-colors flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  About
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-blue-100 hover:text-white transition-colors flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/custom-tour-request" className="text-blue-100 hover:text-white transition-colors flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Custom Tour Request
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-blue-700 pb-2">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="flex-shrink-0 mt-1 mr-3 text-blue-300" size={18} />
                <span className="text-blue-100">123 Travel Street, Adventure City, 10101</span>
              </li>
              <li className="flex items-center">
                <Phone className="flex-shrink-0 mr-3 text-blue-300" size={18} />
                <span className="text-blue-100">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="flex-shrink-0 mr-3 text-blue-300" size={18} />
                <span className="text-blue-100">info@travelease.com</span>
              </li>
              <li className="flex items-center">
                <Clock className="flex-shrink-0 mr-3 text-blue-300" size={18} />
                <span className="text-blue-100">Mon-Fri: 9AM - 6PM</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-700 pt-6 pb-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-blue-200 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Travel Agency. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="text-blue-200 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-blue-200 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/faq" className="text-blue-200 hover:text-white text-sm transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;