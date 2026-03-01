import { useState } from 'react';
import { Login } from './pages/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerPortal } from './pages/CustomerPortal';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const role = localStorage.getItem('role');

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="p-4 bg-white shadow-sm flex justify-between items-center">
        <span className="font-bold text-xl text-blue-600">Fonu Finance</span>
        <button 
          onClick={() => { localStorage.clear(); setIsAuthenticated(false); }}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition"
        >
          Logout
        </button>
      </nav>

      {/* Role-based view selection */}
      {role === 'ADMIN' ? <AdminDashboard /> : <CustomerPortal />}
    </div>
  );
}

export default App;