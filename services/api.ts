
import { User } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const getMockUsers = () => JSON.parse(localStorage.getItem('mock_db_users') || '[]');
const saveMockUsers = (users: any[]) => localStorage.setItem('mock_db_users', JSON.stringify(users));

export const apiService = {
  isSimulated: false,

  async register(data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Registration failed');
      }
      return await response.json();
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        this.isSimulated = true;
        const users = getMockUsers();
        if (users.find((u: any) => u.email === data.email)) throw new Error('User exists (Simulated)');
        const newUser = { ...data, id: Date.now() };
        users.push(newUser);
        saveMockUsers(users);
        return { message: "Success (Simulated)", userId: newUser.id };
      }
      throw error;
    }
  },

  async login(data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Login failed');
      }
      return await response.json();
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        this.isSimulated = true;
        const users = getMockUsers();
        const user = users.find((u: any) => u.email === data.email && u.password === data.password);
        if (!user) throw new Error('Invalid credentials (Simulated)');
        return {
          token: "mock-jwt-" + Date.now(),
          user: { id: user.id, username: user.username, email: user.email }
        };
      }
      throw error;
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      this.isSimulated = false;
      return await response.json();
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        this.isSimulated = true;
        return getMockUsers().map(({ id, username, email }: any) => ({ id, username, email }));
      }
      throw error;
    }
  },

  async updateUser(id: number, data: Partial<User>) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Update failed');
      }
      return await response.json();
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        this.isSimulated = true;
        const users = getMockUsers();
        const index = users.findIndex((u: any) => u.id === id);
        if (index === -1) throw new Error('User not found in Simulation DB');
        users[index] = { ...users[index], ...data };
        saveMockUsers(users);
        return { message: "Updated (Simulated)" };
      }
      throw error;
    }
  },

  async deleteUser(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Delete failed');
      }
      return await response.json();
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        this.isSimulated = true;
        const users = getMockUsers();
        const filtered = users.filter((u: any) => u.id !== id);
        saveMockUsers(filtered);
        return { message: "Deleted (Simulated)" };
      }
      throw error;
    }
  }
};
