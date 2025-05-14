import { MapPin, Globe, Users, CheckCircle, Phone, Mail, Clock } from 'lucide-react';

const About = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <Globe className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-4xl font-bold mb-2">57+</h3>
              <p className="text-lg">Countries Covered</p>
            </div>
            <div className="p-6">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-4xl font-bold mb-2">10,000+</h3>
              <p className="text-lg">Happy Travelers</p>
            </div>
            <div className="p-6">
              <MapPin className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-4xl font-bold mb-2">250+</h3>
              <p className="text-lg">Unique Experiences</p>
            </div>
          </div>
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

      {/* Contact Section */}
      {/* <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 bg-blue-700 text-white p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="flex-shrink-0 mt-1 mr-4" />
                    <div>
                      <h3 className="font-semibold text-lg">Our Office</h3>
                      <p>123 Travel Street, Suite 456<br />Adventure City, AC 12345</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="flex-shrink-0 mt-1 mr-4" />
                    <div>
                      <h3 className="font-semibold text-lg">Call Us</h3>
                      <p>+1 (555) 123-4567<br />Mon-Fri, 9am-6pm</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="flex-shrink-0 mt-1 mr-4" />
                    <div>
                      <h3 className="font-semibold text-lg">Email Us</h3>
                      <p>hello@wanderlustadventures.com<br />We reply within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 p-8 md:p-12">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Send Us a Message</h3>
                {isSubmitted ? (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Thank you! Your message has been sent. We'll get back to you soon.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 mb-2">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-gray-700 mb-2">Your Message</label>
                      <textarea
                        id="message"
                        name="message"
                        rows="4"
                        value={formData.message}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                      ></textarea>
                      {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default About;