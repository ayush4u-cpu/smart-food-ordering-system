import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('foods');
  
  const [formData, setFormData] = useState({ name: '', price: '', category: '', image: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchFoods();
    fetchOrders();
  }, []);

  const fetchFoods = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/foods');
      setFoods(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders/admin');
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/foods/${editId}`, formData);
        alert('Food updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/foods', formData);
        alert('Food added successfully');
      }
      setFormData({ name: '', price: '', category: '', image: '' });
      setEditId(null);
      fetchFoods();
    } catch (error) {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure?')) {
      try {
        await axios.delete(`http://localhost:5000/api/foods/${id}`);
        alert('Food deleted successfully');
        fetchFoods();
      } catch (error) {
        alert('Delete failed');
      }
    }
  };

  const handleEdit = (food) => {
    setFormData({ name: food.name, price: food.price, category: food.category, image: food.image });
    setEditId(food.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status });
      alert('Status updated successfully');
      fetchOrders();
    } catch (error) {
      alert('Update failed');
    }
  };

  if (!user || user.role !== 'admin') {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}><h2>Access Denied</h2></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Shield size={28} color="var(--primary)" /> Admin Dashboard</h1>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button className={`btn ${activeTab === 'foods' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('foods')}>Manage Foods</button>
        <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('orders')}>Manage Orders</button>
      </div>

      {activeTab === 'foods' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '30px' }}>
          <div className="card" style={{ padding: '20px', height: 'fit-content' }}>
            <h3>{editId ? 'Edit Food' : 'Add New Food'}</h3>
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Price</label>
                <input type="number" step="0.01" className="form-control" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input type="text" className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input type="url" className="form-control" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editId ? 'Update' : 'Add Food'}</button>
                {editId && <button type="button" className="btn btn-outline" onClick={() => { setEditId(null); setFormData({name:'', price:'', category:'', image:''}); }}>Cancel</button>}
              </div>
            </form>
          </div>

          <div className="card" style={{ padding: '0' }}>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map(food => (
                    <tr key={food.id}>
                      <td><img src={food.image} alt={food.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                      <td>{food.name}</td>
                      <td>{food.category}</td>
                      <td>₹{parseFloat(food.price).toFixed(2)}</td>
                      <td>
                        <button onClick={() => handleEdit(food)} className="btn btn-outline" style={{ padding: '6px', marginRight: '10px', border: 'none', color: '#007bff' }}><Edit size={18} /></button>
                        <button onClick={() => handleDelete(food.id)} className="btn btn-outline" style={{ padding: '6px', border: 'none', color: '#dc3545' }}><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="card" style={{ padding: '0' }}>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.user_name} <br/><small style={{ color: 'var(--text-muted)' }}>{order.user_email}</small></td>
                    <td style={{ fontWeight: '500' }}>₹{parseFloat(order.total).toFixed(2)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        className="form-control" 
                        style={{ width: 'auto', padding: '6px' }}
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
