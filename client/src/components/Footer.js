import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <footer className="bg-black text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">TechMart</h3>
            <p className="text-gray-300">
              Your trusted destination for the latest technology products.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
              <li><a href="/products" className="text-gray-300 hover:text-white transition-colors">Products</a></li>
              <li><a href="/cart" className="text-gray-300 hover:text-white transition-colors">Cart</a></li>
              <li><a href="/orders" className="text-gray-300 hover:text-white transition-colors">Orders</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><span className="text-gray-300">Mobile</span></li>
              <li><span className="text-gray-300">Tablet</span></li>
              <li><span className="text-gray-300">Laptop</span></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-gray-300">Email: ameykadwe19@gmail.com</li>
              <li className="text-gray-300">Phone: +91 12345 67890</li>
              <li className="text-gray-300">Support: 24/7 Available</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} TechMart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;