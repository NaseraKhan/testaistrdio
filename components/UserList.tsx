
import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/api';
import { User } from '../types';
import { Input } from './Input';

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ username: '', email: '' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = useCallback(async (searchTerm?: string) => {
    try {
      setLoading(true);
      const data = await apiService.getAllUsers(searchTerm);
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(search);
    }, 400); // 400ms debounce

    return () => clearTimeout(timeoutId);
  }, [search, fetchUsers]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await apiService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleEditInit = (user: User) => {
    setEditingUser(user);
    setEditForm({ username: user.username, email: user.email });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.id) return;
    
    setIsSaving(true);
    try {
      await apiService.updateUser(editingUser.id, editForm);
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u));
      setEditingUser(null);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && users.length === 0) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Directory</h2>
          <p className="text-gray-500">
            {search ? `Searching for "${search}"` : 'Viewing all accounts'} on {apiService.isSimulated ? 'Simulation DB' : 'MySQL Database'}
          </p>
        </div>
        <div className="relative group">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 transition-all"
          />
          <div className="absolute left-3 top-2.5">
            {loading ? (
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => fetchUsers(search)} className="text-sm font-bold underline">Retry</button>
        </div>
      )}

      {!loading && users.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 animate-in fade-in zoom-in-95">
          <div className="mb-4 text-gray-300">
             <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
             </svg>
          </div>
          <p className="text-gray-500 font-medium">No results for "{search}"</p>
          <button onClick={() => setSearch('')} className="mt-2 text-indigo-600 text-sm hover:underline">Clear search</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <div key={user.id} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{user.username}</h3>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEditInit(user)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit User"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  onClick={() => user.id && handleDelete(user.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete User"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="ml-2 group-hover:hidden">
                <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-1 rounded font-mono uppercase">
                  ID: {user.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit User Profile</h3>
            <form onSubmit={handleEditSave} className="space-y-4">
              <Input 
                label="Username" 
                value={editForm.username} 
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} 
                required 
              />
              <Input 
                label="Email Address" 
                type="email" 
                value={editForm.email} 
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} 
                required 
              />
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
