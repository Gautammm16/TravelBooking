import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactUs = () => {
  return (
    <section className="bg-gradient-to-b from-white to-blue-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-4">Get in Touch</h2>
        <p className="text-center text-gray-500 max-w-2xl mx-auto mb-16">
          We'd love to hear from you! Fill out the form and we’ll get back to you as soon as possible.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-xl p-10 animate-fade-in">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows="5"
                  placeholder="Your message"
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-10">
            <div className="flex items-start space-x-4">
              <MapPin className="text-blue-600 w-6 h-6 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Our Office</h4>
                <p className="text-gray-600">123 Wanderlust Road, New Delhi, India</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Mail className="text-blue-600 w-6 h-6 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Email</h4>
                <p className="text-gray-600">contact@toursite.com</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Phone className="text-blue-600 w-6 h-6 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Phone</h4>
                <p className="text-gray-600">+91 98765 43210</p>
              </div>
            </div>
            <div className="bg-blue-100 rounded-xl p-6 text-center shadow">
              <h4 className="text-lg font-semibold text-blue-700 mb-1">Business Hours</h4>
              <p className="text-blue-800 font-medium">Mon–Fri: 9am – 6pm<br />Sat: 10am – 4pm</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
