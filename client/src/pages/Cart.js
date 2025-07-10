import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useCart } from '../context/CartContext';


const Cart = () => {
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingAddress, setShippingAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [pincode, setPincode] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { fetchCart } = useCart();


  useEffect(() => {
    fetchCartData();
  }, []);

  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  const fetchCartData = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await API.get('/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(data.cart || []);
    } catch (error) {
      console.error('Error fetching cart');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await API.put(`/cart/${productId}`, { quantity }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Cart updated successfully');
      fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error.response?.data || error.message);
      setErrorMsg('Failed to update cart');
    }
  };

  const removeItem = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Item removed successfully');
      await fetchCartData()
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error.response?.data || error.message);
      setErrorMsg('Failed to remove item');
      await fetchCartData();
      fetchCart();
    }
  };

  const placeOrder = async () => {
    if (cart.length === 0) return setErrorMsg('Your cart is empty');
    if (!shippingAddress.trim()) return setErrorMsg('Please enter a shipping address');
    if (!mobileNumber.trim()) return setErrorMsg('Please enter a mobile number');
    if (!pincode.trim()) return setErrorMsg('Please enter a pincode');
    if (!/^\d{10}$/.test(mobileNumber.trim())) return setErrorMsg('Enter a valid 10-digit mobile number');
    if (!/^\d{6}$/.test(pincode.trim())) return setErrorMsg('Enter a valid 6-digit pincode');

    const orderData = {
      items: cart.map(item => ({
        productId: parseInt(item.productId, 10),
        quantity: item.quantity,
        price: parseFloat(item.Product?.price || 0)
      })),
      totalAmount: parseFloat(total),
      shippingAddress,
      mobileNumber: mobileNumber.trim(),
      pincode: pincode.trim(),
      paymentMethod
    };

    try {
      const token = localStorage.getItem('token');
      const response = await API.post('/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const orderId = response.data.orderId;
        if (paymentMethod === 'online') {
          processOnlinePayment(orderId, parseFloat(total));
        } else {
          setSuccessMsg(`Order #${orderId} placed successfully with Cash on Delivery!`);
          fetchCart();
          setTimeout(() => { window.location.href = '/orders'; }, 2000);
        }
      } else {
        setErrorMsg(response.data.message || 'Order failed');
      }
    } catch (error) {
      const outOfStock = error.response?.data?.outOfStockProducts;
      if (outOfStock) {
        let msg = 'Out of stock:\n';
        outOfStock.forEach(p => { msg += `${p.name}: Requested ${p.requested}, Available ${p.available}\n`; });
        setErrorMsg(msg);
      } else {
        setErrorMsg(error.response?.data?.message || 'Order failed. Try again.');
      }
      fetchCart();
    }
  };

  const processOnlinePayment = async (orderId, amount) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.post('/payments/stripe', { orderId, amount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSuccessMsg('Redirecting to payment gateway...');
        setTimeout(() => { window.location.href = '/orders'; }, 2000);
      }
    } catch (error) {
      setErrorMsg('Payment failed. Try again.');
    }
  };

  const total = cart.reduce((sum, item) => {
    const price = parseFloat(item.Product?.price || 0);
    return sum + (price * item.quantity);
  }, 0).toFixed(2);

  return (
    <div className="container mx-auto p-4">
      {(successMsg || errorMsg) && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg text-white z-50 ${successMsg ? 'bg-green-500' : 'bg-red-500'}`}>
          {successMsg || errorMsg}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-600">Your cart is empty</p>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.productId} className="bg-white p-4 mb-4 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">{item.Product?.name}</h3>
                <p className="text-gray-600">₹{parseFloat(item.Product?.price || 0).toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="bg-gray-300 px-2 py-1 rounded">-</button>
                <span className="px-4">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="bg-gray-300 px-2 py-1 rounded">+</button>
                <button onClick={() => removeItem(item.productId)} className="bg-red-500 text-white px-3 py-1 rounded ml-4">Remove</button>
              </div>
            </div>
          ))}

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Total: ₹{total}</h3>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Shipping Address:</label>
              <textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} className="w-full p-2 border rounded" rows="2" placeholder="Enter your full address" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Mobile Number:</label>
                <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className="w-full p-2 border rounded" placeholder="10-digit mobile number" maxLength="10" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Pincode:</label>
                <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full p-2 border rounded" placeholder="6-digit pincode" maxLength="6" required />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Payment Method:</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mr-2" />
                  Cash on Delivery
                </label>
                <label className="flex items-center">
                  <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="mr-2" />
                  Online Payment
                </label>
              </div>
            </div>

            <button onClick={placeOrder} className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700" disabled={!shippingAddress.trim() || !mobileNumber.trim() || !pincode.trim()}>
              {paymentMethod === 'cod' ? 'Place Order (COD)' : 'Proceed to Payment'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
