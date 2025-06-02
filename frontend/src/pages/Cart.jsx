import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { Trash2, Plus, Minus, CreditCard } from 'lucide-react';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, fetchCart, clearCartState } = useContext(CartContext);
  const navigate = useNavigate();

  const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

  const handleCheckout = async () => {
    try {
      await axios.post('http://localhost:5000/api/orders');
      alert('Order placed successfully!');
      clearCartState();
      navigate('/orders');
    } catch (error) {
      alert('Failed to place order');
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '20px' }}>
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Your Cart</h1>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', alignItems: 'start' }}>
        <div className="card" style={{ padding: '20px' }}>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid var(--border)' }}>
              <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginRight: '20px' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{item.name}</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>₹{parseFloat(item.price).toFixed(2)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '8px', background: 'var(--background)' }}><Minus size={16} /></button>
                  <span style={{ padding: '0 15px', fontWeight: '500' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '8px', background: 'var(--background)' }}><Plus size={16} /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="btn btn-outline" style={{ border: 'none', color: '#dc3545', padding: '10px' }}>
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-muted)' }}>
            <span>Tax (10%)</span>
            <span>₹{(total * 0.1).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '2px solid var(--border)', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>₹{(total * 1.1).toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCheckout} 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '15px' }}
          >
            <CreditCard size={20} /> Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
