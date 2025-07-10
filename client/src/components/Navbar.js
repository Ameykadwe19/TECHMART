import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../utils/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, fetchCart } = useCart();
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser(decoded);
        fetchCart();
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
      fetchCart();
    }
  }, [token]);

  const fetchCartCount = async () => {
    try {
      const response = await API.get('/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartCount(response.data.cart?.length || 0);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCartCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    fetchCart()
    navigate('/login');
  };

  return (
    <nav className={`${isHomePage ? 'absolute top-0 left-0 right-0 z-20 text-white' : 'bg-blue-600 text-white'} p-4`}>
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-2 sm:mb-0">
            <Link to="/" className="text-xl font-bold mr-4 sm:mr-8">
              Tech<span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent font-extrabold">Mart</span>
            </Link>
            <div className="hidden sm:flex gap-6">
              {!token || (token && user?.role !== 'admin') ? (
                <>
                  <Link to="/" className={`hover:text-blue-200 pb-1 border-b-2 transition-all ${
                    location.pathname === '/' ? 'border-white' : 'border-transparent hover:border-blue-200'
                  }`}>Home</Link>
                  <Link to="/products" className={`hover:text-blue-200 pb-1 border-b-2 transition-all ${
                    location.pathname === '/products' ? 'border-white' : 'border-transparent hover:border-blue-200'
                  }`}>Products</Link>
                </>
              ) : null}

              {token && user?.role === 'admin' ? (
                <>
                  <Link to="/admin" className={`text-yellow-300 hover:text-yellow-100 pb-1 border-b-2 transition-all ${
                    location.pathname === '/admin' ? 'border-yellow-100' : 'border-transparent hover:border-yellow-100'
                  }`}>Products</Link>
                  <Link to="/admin/orders" className={`text-yellow-300 hover:text-yellow-100 pb-1 border-b-2 transition-all ${
                    location.pathname === '/admin/orders' ? 'border-yellow-100' : 'border-transparent hover:border-yellow-100'
                  }`}>Orders</Link>
                </>
              ) : token ? (
                <>
                  <Link to="/cart" className={`hover:text-blue-200 pb-1 border-b-2 transition-all ${
                    location.pathname === '/cart' ? 'border-white' : 'border-transparent hover:border-blue-200'
                  }`}>
                    Cart {cartCount > 0 && <span className="ml-1 bg-red-500 text-white rounded-full px-2 text-xs">{cartCount}</span>}
                  </Link>
                  <Link to="/orders" className={`hover:text-blue-200 pb-1 border-b-2 transition-all ${
                    location.pathname === '/orders' ? 'border-white' : 'border-transparent hover:border-blue-200'
                  }`}>Orders</Link>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {token ? (
              <>
                <span className={`${user?.role === 'admin' ? 'text-yellow-200' : 'text-blue-200'} font-bold text-sm`}>
                  {user?.role === 'admin' ? 'Admin' : user?.email}
                </span>
                <button onClick={handleLogout} className="hover:text-blue-200">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">Login</Link>
                <Link to="/register" className="hover:text-blue-200">Register</Link>
              </>
            )}
          </div>

          <div className="sm:hidden flex flex-wrap justify-center gap-2 mt-2">
            {!token || (token && user?.role !== 'admin') ? (
              <>
                <Link to="/" className="hover:text-blue-200 px-2 py-1 text-sm">Home</Link>
                <Link to="/products" className="hover:text-blue-200 px-2 py-1 text-sm">Products</Link>
              </>
            ) : null}
            {token && user?.role === 'admin' ? (
              <>
                <Link to="/admin" className="text-yellow-300 hover:text-yellow-100 px-2 py-1 text-sm">Products</Link>
                <Link to="/admin/orders" className="text-yellow-300 hover:text-yellow-100 px-2 py-1 text-sm">Orders</Link>
              </>
            ) : token ? (
              <>
                <Link to="/cart" className="hover:text-blue-200 px-2 py-1 text-sm">
                  Cart {cartCount > 0 && <span className="ml-1 bg-red-500 text-white rounded-full px-2 text-xs">{cartCount}</span>}
                </Link>
                <Link to="/orders" className="hover:text-blue-200 px-2 py-1 text-sm">Orders</Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
