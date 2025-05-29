// src/pages/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen min-w-screen bg-white">
      {/* Navigation Header - Mobile Responsive */}
      <nav className="flex justify-between items-center px-4 py-3 sm:px-6 sm:py-4 bg-white shadow-sm">
        {/* Logo Section */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center">
           <img src='./src/assets/chrono-logo.png'></img>
          </div>
          <span className="text-blue-950 font-bold text-lg sm:text-xl md:text-2xl">Chrono</span>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={handleSignIn}
            className="text-white-600 hover:scale-105 font-medium px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-purple-600 hover:bg-purple-50 transition-all duration-200 text-sm sm:text-base"
          >
            Sign In
          </button>
          <button
            onClick={handleSignUp}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 sm:px-6 sm:py-2 rounded-lg transition-all duration-200 hover:scale-105 text-sm sm:text-base"
          >
            Sign Up Free
          </button>
        </div>
      </nav>

      {/* Hero Section - Mobile Responsive */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Capture Every Thought.
            <br />
            <span className="block mt-1 sm:mt-2">Organize Your World.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-purple-100 mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-2">
            Chrono Notes is the intuitive and powerful note-taking app designed to 
            boost your productivity and creativity.
          </p>

          {/* CTA Button */}
          <button
            onClick={handleSignUp}
            className="bg-white hover:bg-gray-50 text-white-600 font-bold text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl active:scale-95"
          >
            Start Taking Notes Free
          </button>

          {/* Social Proof */}
          <div className="mt-8 sm:mt-12 text-purple-200">
            <p className="text-xs sm:text-sm">Trusted by thousands of productive individuals</p>
          </div>
        </div>
      </div>

      {/* Features Section - Mobile Responsive */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Choose Chrono Notes?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-xl sm:max-w-2xl mx-auto px-2">
              Experience the perfect blend of simplicity and power in note-taking
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-purple-600 text-xl sm:text-2xl">📝</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Intuitive Writing</h3>
              <p className="text-sm sm:text-base text-gray-600">Clean, distraction-free interface that lets you focus on your ideas</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-purple-600 text-xl sm:text-2xl">🗂️</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Smart Organization</h3>
              <p className="text-sm sm:text-base text-gray-600">Powerful tagging and categorization to keep everything organized</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-4 sm:p-6 sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-purple-600 text-xl sm:text-2xl">⚡</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-sm sm:text-base text-gray-600">Quick capture and instant search to access your notes anytime</p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-8 sm:mt-12">
            <button
              onClick={handleSignUp}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;