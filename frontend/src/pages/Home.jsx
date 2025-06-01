import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { Plus } from 'lucide-react';

const Home = () => {
  const [foods, setFoods] = useState([]);
  const [category, setCategory] = useState('All');
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/foods');
        setFoods(res.data);
      } catch (error) {
        console.error('Error fetching foods', error);
      }
    };
    fetchFoods();
  }, []);

  const categories = ['All', ...new Set(foods.map(food => food.category))];
  const filteredFoods = category === 'All' ? foods : foods.filter(f => f.category === category);

  return (
    <div>
      <div className="page-header">
        <h1>Our Menu</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={category === c ? 'btn btn-primary' : 'btn btn-outline'}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid">
        {filteredFoods.map(food => (
          <div key={food.id} className="card">
            {food.image && <img src={food.image} alt={food.name} className="card-img" />}
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 className="card-title" style={{ margin: 0 }}>{food.name}</h3>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.2rem' }}>
                  ₹{parseFloat(food.price).toFixed(2)}
                </span>
              </div>
              <p className="card-text">{food.category}</p>
              <button 
                onClick={() => addToCart(food.id)}
                className="btn btn-primary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}
              >
                <Plus size={18} /> Add to Cart
              </button>
            </div>
          </div>
        ))}
        {filteredFoods.length === 0 && (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>No foods found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
