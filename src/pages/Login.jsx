import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ChronoDesign from '../assets/ChronoDesign.png';
import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
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

    try {
      // Fetch user by email from users table
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('email, username, password_hash, phone_number')
        .eq('email', formData.email)
        .single();

      if (fetchError || !user) {
        setError('Invalid email or password');
        return;
      }

      // Compare input password with stored password_hash
      const passwordMatch = bcrypt.compareSync(formData.password, user.password_hash);

      if (!passwordMatch) {
        setError('Invalid email or password');
        return;
      }

      // Store logged in user in session storage (excluding password_hash)
      const userSession = {
        email: user.email,
        username: user.username,
        phone_number: user.phone_number
      };
      sessionStorage.setItem('user', JSON.stringify(userSession));

      navigate('/home');
    } catch (err) {
      setError('An unexpected error occurred during login.');
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen min-w-screen bg-gray-50 flex flex-col justify-center px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
      <img
        src={ChronoDesign}
        alt="ChronoDesign Background"
        className="pointer-events-none absolute top-0 left-0 w-full h-full object-contain opacity-10 -z-10"
      />

      {/* Header Section - Mobile Optimized */}
      <div className="w-full max-w-sm mx-auto sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-purple-600 rounded-lg flex items-center justify-center">
            <img src={ChronoDesign} alt="ChronoDesign" className="w-full h-full object-contain" />
          </div>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 sm:mb-4">
          Sign in to your account
        </h2>

        <p className="text-center text-sm text-gray-600 mb-6 sm:mb-8">
          Or{' '}
          <Link to="/signup" className="font-medium text-purple-600 hover:text-purple-500 active:text-purple-700">
            create a new account
          </Link>
        </p>
      </div>

      {/* Form Section - Mobile Optimized */}
      <div className="w-full max-w-sm mx-auto sm:max-w-md relative z-10">
        <div className="bg-white py-6 px-4 shadow-lg rounded-lg sm:py-8 sm:px-10 sm:rounded-lg">
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
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

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent rounded-md shadow-sm text-base sm:text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 active:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign in
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

export default Login;
