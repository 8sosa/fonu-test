import { useState } from 'react';
import { Login } from './pages/Login';
import { Register } from './pages/Register'; // Import your new page
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerPortal } from './pages/CustomerPortal';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false); // Toggle for Auth pages
  
  const role = localStorage.getItem('role');
  const userEmail = localStorage.getItem('userEmail'); // Tip: Store this on login too

  // --- AUTHENTICATION FLOW ---
  if (!isAuthenticated) {
    return showRegister ? (
      <Register onBackToLogin={() => setShowRegister(false)} />
    ) : (
      <Login 
        onLoginSuccess={() => setIsAuthenticated(true)} 
        onRegisterClick={() => setShowRegister(true)} 
      />
    );
  }

  // --- PROTECTED APP CONTENT ---
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Universal Navigation */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="font-black text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            FONU
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
            role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {role} WORKSPACE
          </span>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-xs text-slate-400 font-medium hidden sm:block italic">
            Signed in as {userEmail || 'User'}
          </span>
          <button 
            onClick={() => { 
              localStorage.clear(); 
              setIsAuthenticated(false); 
              setShowRegister(false);
            }}
            className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Role-based Dashboard Selection */}
      <main className="animate-in fade-in duration-500">
        {role === 'ADMIN' ? <AdminDashboard /> : <CustomerPortal />}
      </main>
    </div>
  );
}

export default App;