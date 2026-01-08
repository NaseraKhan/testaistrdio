
import React, { useState, useEffect } from 'react';
import { Page, User } from './types';
import { Input } from './components/Input';
import { MySQLGuide } from './components/MySQLGuide';
import { UserList } from './components/UserList';
import { apiService } from './services/api';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);

  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({ username: '', email: '', password: '', confirm: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);

    try {
      const data = await apiService.login(loginData);
      setIsSimulated(apiService.isSimulated);
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      setCurrentPage('dashboard');
    } catch (err: any) {
      setApiError(err.message);
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
      await apiService.register({
        username: regData.username,
        email: regData.email,
        password: regData.password
      });
      setIsSimulated(apiService.isSimulated);
      setCurrentPage('login');
      alert(apiService.isSimulated ? "Registered in Simulator!" : "Registered on Node Server!");
    } catch (err: any) {
      setApiError(err.message);
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
          {isSimulated && (
            <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
              Simulation Mode
            </span>
          )}
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setCurrentPage('users')}
            className={`text-sm font-medium transition-colors ${currentPage === 'users' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setCurrentPage('guide')}
            className={`text-sm font-medium transition-colors ${currentPage === 'guide' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Guide
          </button>
          {user ? (
            <div className="flex items-center space-x-4 border-l border-gray-200 pl-4">
              <span className="text-sm text-gray-600 hidden sm:inline"><b>{user.username}</b></span>
              <button 
                onClick={() => { setUser(null); localStorage.removeItem('auth_token'); setCurrentPage('login'); }}
                className="text-sm font-medium text-red-500 hover:text-red-600"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setCurrentPage('login')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4">
      <Navbar />

      <main className="mx-auto">
        {currentPage !== 'users' && currentPage !== 'guide' && (
          <div className="max-w-md mx-auto">
            {apiError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                <strong>Error:</strong> {apiError}
              </div>
            )}

            {currentPage === 'login' && (
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Login</h1>
                <p className="text-gray-500 mb-8 text-sm">Welcome back! Sign in to continue.</p>
                <form onSubmit={handleLogin}>
                  <Input label="Email Address" type="email" value={loginData.email} onChange={(e) => setLoginData({...loginData, email: e.target.value})} required />
                  <Input label="Password" type="password" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} required />
                  <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-70">
                    {isLoading ? "Checking..." : "Sign In"}
                  </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-500">
                  New here? <button onClick={() => setCurrentPage('register')} className="text-indigo-600 font-semibold hover:underline">Create Account</button>
                </p>
              </div>
            )}

            {currentPage === 'register' && (
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Register</h1>
                <p className="text-gray-500 mb-8 text-sm">Create your credentials for the secure database.</p>
                <form onSubmit={handleRegister}>
                  <Input label="Username" type="text" value={regData.username} onChange={(e) => setRegData({...regData, username: e.target.value})} required />
                  <Input label="Email Address" type="email" value={regData.email} onChange={(e) => setRegData({...regData, email: e.target.value})} required />
                  <Input label="Password" type="password" value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} required />
                  <Input label="Confirm Password" type="password" value={regData.confirm} onChange={(e) => setRegData({...regData, confirm: e.target.value})} required />
                  <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-70">
                    {isLoading ? "Saving..." : "Create Account"}
                  </button>
                </form>
              </div>
            )}

            {currentPage === 'dashboard' && (
              <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100 text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Success!</h1>
                <p className="text-gray-500 mt-2">Authenticated as <span className="text-indigo-600 font-bold">{user?.username}</span></p>
                <button onClick={() => setCurrentPage('users')} className="mt-8 bg-indigo-50 text-indigo-600 px-6 py-2 rounded-xl font-medium hover:bg-indigo-100 transition-colors">
                  View User Directory
                </button>
              </div>
            )}
          </div>
        )}

        {currentPage === 'users' && <UserList />}
        {currentPage === 'guide' && <MySQLGuide />}
      </main>
    </div>
  );
};

export default App;
