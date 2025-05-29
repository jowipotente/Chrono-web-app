import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';
import { useNavigate } from 'react-router-dom';

// Signup component integrated with new users table and bcrypt password hashing
export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      // Hash password before storing
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      // Insert new user into users table
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            email,
            username,
            password_hash: passwordHash,
            phone_number: phoneNumber,
          },
        ]);

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setSuccessMessage('Signup successful! Redirecting to homepage...');
      setEmail('');
      setPassword('');
      setUsername('');
      setPhoneNumber('');

      // Redirect to homepage after signup
      navigate('/home');
    } catch (err) {
      setError('An unexpected error occurred during signup.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Sign Up</h2>
      {error && <p className="text-red-600">{error}</p>}
      {successMessage && <p className="text-green-600">{successMessage}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
        Sign Up
      </button>
    </form>
  );
}

// Signin component integrated with new users table and bcrypt password verification
export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Fetch user by email
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError || !users) {
        setError('Invalid email or password.');
        return;
      }

      // Verify password
      const passwordMatch = bcrypt.compareSync(password, users.password_hash);
      if (!passwordMatch) {
        setError('Invalid email or password.');
        return;
      }

      // Set user in sessionStorage for auth state
      sessionStorage.setItem('user', JSON.stringify(users));

      setEmail('');
      setPassword('');
      navigate('/home');
    } catch (err) {
      setError('An unexpected error occurred during login.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Sign In</h2>
      {error && <p className="text-red-600">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
        Sign In
      </button>
    </form>
  );
}
