// src/components/Login.jsx
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/dashboard"); // Ensure this route exists in your routing setup
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <h2 className="text-3xl font-semibold mb-4">
        {isLogin ? "Login" : "Sign Up"}
      </h2>
      <form onSubmit={handleAuth} className="flex flex-col items-center">
        <input
          type="email"
          placeholder="Email"
          className="mb-2 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-2 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button
          type="submit"
          className="py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="mt-4 text-blue-600 hover:underline"
      >
        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
      </button>
    </div>
  );
};

export default Login;
