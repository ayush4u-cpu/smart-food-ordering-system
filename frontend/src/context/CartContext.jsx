import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }
    try {
      const res = await axios.get('http://localhost:5000/api/cart');
      setCart(res.data);
    } catch (error) {
      console.error('Error fetching cart', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (food_id, quantity = 1) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/cart', { food_id, quantity });
      alert('Added to cart');
      fetchCart();
    } catch (error) {
      alert('Failed to add to cart');
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(id);
      } else {
        await axios.put(`http://localhost:5000/api/cart/${id}`, { quantity });
        fetchCart();
      }
    } catch (error) {
      alert('Failed to update quantity');
    }
  };

  const removeFromCart = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${id}`);
      alert('Item removed from cart');
      fetchCart();
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  const clearCartState = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, fetchCart, clearCartState }}>
      {children}
    </CartContext.Provider>
  );
};
