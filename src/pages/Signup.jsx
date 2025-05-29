import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ChronoDesign from '../assets/ChronoDesign.png';
import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      // Hash password before storing
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(formData.password, salt);

      // Insert new user into users table
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            email: formData.email,
            username: formData.username,
            password_hash: passwordHash,
            phone_number: formData.phoneNumber,
          },
        ]);

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setSuccess('Account created successfully! Redirecting to homepage...');

      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err) {
      setError('An unexpected error occurred during signup.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 flex flex-col justify-center px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
      {/* Header Section - Mobile Optimized */}
      <div className="w-full max-w-sm mx-auto sm:max-w-md">
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-purple-600 rounded-lg flex items-center justify-center">
             <img src={ChronoDesign} alt="ChronoDesign" className="w-full h-full object-contain" />
          </div>
        </div>
        
        <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-6">
          Create your account
        </h2>
        
        <p className="text-center text-sm text-gray-600 mb-6 sm:mb-8">
          Or{' '}
          <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 active:text-purple-700">
            sign in to your existing account
          </Link>
        </p>
      </div>

      {/* Form Section - Mobile Optimized */}
      <div className="w-full max-w-sm mx-auto sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-lg rounded-lg sm:py-8 sm:px-10 sm:rounded-lg">
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm">
              {success}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="Enter your username"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="Confirm your password"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent rounded-md shadow-sm text-base sm:text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 active:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Account
              </button>
            </div>
          </form>

          {/* Back to Home Link */}
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-sm text-purple-600 hover:text-purple-500 active:text-purple-700 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
