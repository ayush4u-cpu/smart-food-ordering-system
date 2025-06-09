import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Clock, CheckCircle } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders');
        setOrders(res.data);
      } catch (error) {
        console.error('Error fetching orders', error);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#28a745';
      case 'processing': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#17a2b8';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={18} />;
      case 'pending': return <Clock size={18} />;
      default: return <Package size={18} />;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Your Orders</h1>
      </div>
      
      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '50px' }}>You haven't placed any orders yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => (
            <div key={order.id} className="card" style={{ padding: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>Order #{order.id}</h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {getStatusIcon(order.status)} {order.status}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: '500' }}>{item.name}</p>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span style={{ fontWeight: '500' }}>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed var(--border)' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  Total: <span style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>₹{parseFloat(order.total).toFixed(2)}</span>
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
