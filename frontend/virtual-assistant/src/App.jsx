import React from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Logged from './components/Logged';

const App = () => {
  const { user, loading, loginError, login, logout } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  return user ? <Logged user={user} logout={logout} /> : <Login login={login} loginError={loginError} />;
};

export default App;
