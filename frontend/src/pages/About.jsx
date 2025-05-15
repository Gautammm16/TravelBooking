import { useEffect, useState } from 'react';
import api from '../services/api';
import { MapPin, Globe, Users, CheckCircle, Phone, Mail, Clock } from 'lucide-react';
import { ThreeDots } from 'react-loader-spinner';

const About = () => {
    const [stats, setStats] = useState({
    countries: 0,
    travelers: 0,
    tours: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all stats in parallel
        const [countriesRes, bookingsRes, toursRes] = await Promise.all([
          api.get('/v1/tours/countries'),
          api.get('/v1/bookings/count'),
          api.get('/v1/tours/count')
        ]);

        setStats({
          countries: countriesRes.data.data.count || 0,
          travelers: bookingsRes.data.data.count || 0,
          tours: toursRes.data.data.count || 0,
          loading: false,
          error: null
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load statistics'
        }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-blue-700 text-white py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Story</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Discover the passion behind your perfect journey
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white transform skew-y-1 origin-top-left"></div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Who We Are</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Founded in 2010, Wanderlust Adventures has grown from a small family-run business to one of the most trusted travel agencies in the region. Our team of passionate travel experts is dedicated to crafting unforgettable experiences tailored to your unique preferences.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We believe travel should be transformative, not transactional. That's why we go beyond the standard tour packages to create journeys that inspire, educate, and connect you with the world in meaningful ways.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800">100% Customizable</h3>
                    <p className="text-gray-600 text-sm">Tailor every aspect of your trip</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Local Experts</h3>
                    <p className="text-gray-600 text-sm">Authentic experiences with insiders</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800">24/7 Support</h3>
                    <p className="text-gray-600 text-sm">We're with you every step</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Sustainable Travel</h3>
                    <p className="text-gray-600 text-sm">Eco-friendly experiences</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative rounded-xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                  alt="Our team on a trip" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <p className="text-sm font-medium">Our team exploring Bali, 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
   <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          {stats.loading ? (
            <div className="flex justify-center">
              <ThreeDots 
                height="50" 
                width="50" 
                color="#ffffff" 
                ariaLabel="loading" 
              />
            </div>
          ) : stats.error ? (
            <p className="text-center">{stats.error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <Globe className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-4xl font-bold mb-2">{stats.countries}+</h3>
                <p className="text-lg">Countries Covered</p>
              </div>
              <div className="p-6">
                <Users className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-4xl font-bold mb-2">{stats.travelers}+</h3>
                <p className="text-lg">Happy Travelers</p>
              </div>
              <div className="p-6">
                <MapPin className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-4xl font-bold mb-2">{stats.tours}+</h3>
                <p className="text-lg">Unique Experiences</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Team Section */}
     <section className="py-16 bg-white">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Meet Our Team</h2>
    <div className="flex justify-center">
      {/* <div className="grid grid-cols-1 gap-8 max-w-md"> */}
      <div className="max-w-l ">
        {[
          {
            name: "Gautam Jaisur",
            role: "Developer",
            bio: "Travel enthusiast",
            img: "https://i.pinimg.com/736x/8c/9b/07/8c9b07e5f25b7776190bf9de4da60c47.jpg"
          }
        ].map((member, index) => (
          <div key={index} className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
            <img src={member.img} alt={member.name} className="w-full h-64 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
              <p className="text-blue-600 font-medium mb-2">{member.role}</p>
              <p className="text-gray-600">{member.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

   
    </div>
  );
};

export default About;