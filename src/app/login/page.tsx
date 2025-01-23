'use client';

import api from '@/lib/api';
import { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/login', {
        username,
        password,
      });
      if (response && response.data) {
        const user = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error adding text:', error);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="h-screen flex flex-col items-center justify-center p-5"
      >
        <div className="w-1/3 p-12 bg-blue-600">
          <p className="text-5xl font-bold mb-5">Login</p>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name..."
              className="text-sm border-none outline-none text-black p-4 rounded-2xl w-full"
            />
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password..."
              className="text-sm border-none outline-none text-black p-4 rounded-2xl w-full"
            />
            <button
              type="submit"
              className="flex justify-center items-center text-xs bg-yellow-500 text-white p-4 rounded-2xl"
            >
              {loading ? (
                <ArrowPathIcon className="h-5 w-5 text-white animate-spin" />
              ) : (
                'Login'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;