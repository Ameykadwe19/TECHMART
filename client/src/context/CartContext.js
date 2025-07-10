import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartCount(response.data.cart?.length || 0);
    } catch (error) {
      console.error('Cart fetch error:', error);
      setCartCount(0);
    }
  };

  const incrementCart = () => {
    setCartCount(prev => prev + 1);
  };

  const decrementCart = () => {
    setCartCount(prev => (prev > 0 ? prev - 1 : 0));
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, fetchCart, incrementCart, decrementCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
