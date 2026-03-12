"use client";

import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        username,
        password,
      });
      login(res.data.token);
    } catch (err) {
      setError("User already exists or server error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden px-4 sm:px-6 py-8 sm:py-12">
      {/* Animated background blobs - responsive sizes */}
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div
        className="absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-slate-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="w-full max-w-sm relative z-10">
        {/* Card with glass-morphism effect */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-slate-700/50 p-6 sm:p-8 md:p-10">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
              Create Account
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base">
              Sign up to get started
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-xs sm:text-sm font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Username input */}
            <div>
              <label className="block text-slate-300 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-600"
                required
              />
            </div>

            {/* Password input */}
            <div>
              <label className="block text-slate-300 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-600"
                required
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 active:scale-95 mt-1 sm:mt-2"
            >
              Sign Up
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600/50"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 sm:px-3 bg-slate-800/40 text-slate-400">
                or
              </span>
            </div>
          </div>

          {/* Login link */}
          <p className="text-center text-slate-400 text-xs sm:text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer text */}
        <p className="text-center text-slate-500 text-xs mt-6 sm:mt-8 px-4">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Signup;