// src/components/Login.jsx
import React, { useState } from 'react';

const Login = ({ login, loginError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl mb-4 text-center">Login</h2>
        {loginError && <p className="text-red-500 mb-4 text-center">{loginError}</p>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
          required
        />
        <button type="submit" className="w-full p-2 bg-pink-600 rounded hover:bg-pink-700 transition">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
