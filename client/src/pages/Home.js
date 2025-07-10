import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const slides = [
    {
      title: "Latest Tech Collection",
      subtitle: "Discover cutting-edge technology",
      cta: "Explore Now"
    },
    {
      title: "Premium Quality Products",
      subtitle: "Best brands at competitive prices",
      cta: "Shop Now"
    },
    {
      title: "Fast & Secure Delivery",
      subtitle: "Get your tech delivered safely",
      cta: "Order Today"
    }
  ];
  
  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative hero-bg" style={{backgroundImage: 'url("/bg-image.jpg")'}}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        <style>{`
          @keyframes float {
            0%, 100% { transform: scale(1) rotate(0deg) translateY(0px); }
            25% { transform: scale(1.008) rotate(0.2deg) translateY(-2px); }
            50% { transform: scale(1.015) rotate(0.4deg) translateY(0px); }
            75% { transform: scale(1.008) rotate(-0.1deg) translateY(1px); }
          }
          @keyframes gentle-glow {
            0%, 100% { filter: brightness(1) contrast(1); }
            50% { filter: brightness(1.06) contrast(1.02); }
          }
          @keyframes breathing {
            0%, 100% { background-size: 100%; background-position: center center; }
            33% { background-size: 100.8%; background-position: center 49%; }
            66% { background-size: 101.2%; background-position: center 51%; }
          }
          .hero-bg {
            animation: 
              float 8s ease-in-out infinite,
              gentle-glow 6s ease-in-out infinite,
              breathing 10s ease-in-out infinite;
            background-attachment: fixed;
            transition: all 0.3s ease;
          }
          .hero-bg:hover {
            filter: brightness(1.04) saturate(1.08);
            transform: scale(1.008);
          }
        `}</style>
        <div className="container mx-auto p-4 relative z-10">
          <div className={`text-center py-32 pt-40 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-4">
              <span className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">Welcome to</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
              Tech<span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent font-extrabold">Mart</span>
            </h1>
            <div className="h-20 mb-8">
              <p className="text-xl sm:text-3xl text-white drop-shadow-lg transition-all duration-500">
                {slides[currentSlide].subtitle}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/products" 
                className="bg-yellow-500 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-400 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform"
              >
                {slides[currentSlide].cta} →
              </Link>
              <Link 
                to="/products?category=mobile" 
                className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-black shadow-xl transition-all duration-300 hover:scale-105 transform"
              >
                Browse Mobiles
              </Link>
            </div>
            
            {/* Slide Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'bg-yellow-500 scale-125' : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto p-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose TechMart?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Experience the best in technology shopping with our premium services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white px-6 py-8 rounded-3xl shadow-xl text-center border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-3xl w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">⚡</div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Premium Quality</h3>
              <p className="text-gray-600 leading-relaxed">Latest technology products from top brands at competitive prices</p>
            </div>
            <div className="group bg-white px-6 py-8 rounded-3xl shadow-xl text-center border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-3xl w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">🚀</div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">Quick and secure delivery service with real-time tracking</p>
            </div>
            <div className="group bg-white px-6 py-8 rounded-3xl shadow-xl text-center border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-3xl w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">💬</div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">24/7 Support</h3>
              <p className="text-gray-600 leading-relaxed">Round the clock customer support for all your queries</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories Section */}
      <div className="bg-gray-900 py-20">
        <div className="container mx-auto p-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Explore our wide range of technology products</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/products?category=mobile" className="group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-center">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📱</div>
                <h3 className="text-2xl font-bold text-white mb-2">Mobiles</h3>
                <p className="text-blue-100">Latest smartphones from top brands</p>
              </div>
            </Link>
            <Link to="/products?category=laptop" className="group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
              <div className="bg-gradient-to-br from-green-600 to-green-800 p-8 text-center">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">💻</div>
                <h3 className="text-2xl font-bold text-white mb-2">Laptops</h3>
                <p className="text-green-100">High-performance laptops for work & gaming</p>
              </div>
            </Link>
            <Link to="/products?category=tablet" className="group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 text-center">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📟</div>
                <h3 className="text-2xl font-bold text-white mb-2">Tablets</h3>
                <p className="text-purple-100">Versatile tablets for productivity & entertainment</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;