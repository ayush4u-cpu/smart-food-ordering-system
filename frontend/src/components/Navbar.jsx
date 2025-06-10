import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, LogOut, User, Menu, Coffee } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <Coffee size={24} color="var(--primary)" /> SmartFood
        </Link>
        <div className="navbar-nav">
          <Link to="/" className="nav-link">Home</Link>
          
          {user ? (
            <>
              <Link to="/orders" className="nav-link">Orders</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link">Dashboard</Link>
              )}
              <Link to="/cart" className="nav-link" style={{ position: 'relative' }}>
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>{cartCount}</span>
                )}
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '15px', paddingLeft: '15px', borderLeft: '1px solid var(--border)' }}>
                <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <User size={18} /> {user.name}
                </span>
                <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px' }}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
