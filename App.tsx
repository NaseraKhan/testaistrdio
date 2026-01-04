
import React, { useState } from 'react';
import { Page, User } from './types';
import { Input } from './components/Input';
import { MySQLGuide } from './components/MySQLGuide';

const API_BASE_URL = 'http://localhost:5000/api';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({ username: '', email: '', password: '', confirm: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Success
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      setCurrentPage('dashboard');
    } catch (err: any) {
      setApiError(err.message === 'Failed to fetch' 
        ? 'Cannot connect to backend. Please ensure the Node.js server is running on port 5000.' 
        : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regData.password !== regData.confirm) {
      setApiError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regData.username,
          email: regData.email,
          password: regData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Success - For ease of use, we auto-login or just send to login page
      alert("Registration successful! Please login.");
      setCurrentPage('login');
    } catch (err: any) {
      setApiError(err.message === 'Failed to fetch' 
        ? 'Cannot connect to backend. Please ensure the Node.js server is running on port 5000.' 
        : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const Navbar = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => setCurrentPage('login')}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <span className="font-bold text-gray-900 tracking-tight">SecureAuth</span>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setCurrentPage('guide')}
            className={`text-sm font-medium transition-colors ${currentPage === 'guide' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Connection Guide
          </button>
          {user ? (
            <button 
              onClick={() => { setUser(null); localStorage.removeItem('auth_token'); setCurrentPage('login'); }}
              className="text-sm font-medium text-red-500 hover:text-red-600"
            >
              Sign Out
            </button>
          ) : (
            <button 
              onClick={() => setCurrentPage('login')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4">
      <Navbar />

      <main className="max-w-md mx-auto">
        {apiError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm animate-in fade-in zoom-in duration-300">
            <strong>Error:</strong> {apiError}
          </div>
        )}

        {currentPage === 'login' && (
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500 mb-8 text-sm">Sign in to your account via the Node.js API.</p>
            
            <form onSubmit={handleLogin}>
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="you@example.com"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-200 disabled:opacity-70"
              >
                {isLoading ? <span>Connecting...</span> : <span>Sign In</span>}
              </button>
            </form>
            
            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <button 
                onClick={() => { setCurrentPage('register'); setApiError(null); }}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Register here
              </button>
            </p>
          </div>
        )}

        {currentPage === 'register' && (
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
            <p className="text-gray-500 mb-8 text-sm">Join the community via our secure backend.</p>
            
            <form onSubmit={handleRegister}>
              <Input 
                label="Username" 
                type="text" 
                placeholder="johndoe"
                value={regData.username}
                onChange={(e) => setRegData({...regData, username: e.target.value})}
                required
              />
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="you@example.com"
                value={regData.email}
                onChange={(e) => setRegData({...regData, email: e.target.value})}
                required
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••"
                value={regData.password}
                onChange={(e) => setRegData({...regData, password: e.target.value})}
                required
              />
              <Input 
                label="Confirm Password" 
                type="password" 
                placeholder="••••••••"
                value={regData.confirm}
                onChange={(e) => setRegData({...regData, confirm: e.target.value})}
                required
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-200 disabled:opacity-70"
              >
                {isLoading ? <span>Saving...</span> : <span>Register Now</span>}
              </button>
            </form>
            
            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button 
                onClick={() => { setCurrentPage('login'); setApiError(null); }}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        )}

        {currentPage === 'dashboard' && (
          <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100 text-center space-y-6 max-w-lg mx-auto animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Access Granted!</h1>
            <p className="text-gray-500">Verified as <span className="font-bold text-indigo-600">{user?.username}</span> via MySQL.</p>
            <div className="pt-4 flex flex-col space-y-3">
              <button 
                onClick={() => setCurrentPage('guide')}
                className="bg-indigo-50 text-indigo-600 py-3 rounded-xl font-medium hover:bg-indigo-100 transition-colors"
              >
                Review Connection Logic
              </button>
              <button 
                onClick={() => { setUser(null); localStorage.removeItem('auth_token'); setCurrentPage('login'); }}
                className="text-gray-400 text-sm hover:text-gray-600 underline"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </main>

      <div className="mt-12">
        {currentPage === 'guide' && <MySQLGuide />}
      </div>
    </div>
  );
};

export default App;
