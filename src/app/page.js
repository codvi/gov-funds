'use client';
import React from 'react';
import Link from 'next/link';

export default function Home() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container mx-auto px-4 py-24 text-center relative">
          <div className="inline-block">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-8">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
              </span>
              Blockchain-Powered Government Spending
            </span>
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Government Spending Registry
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            A revolutionary platform for transparent and efficient government spending management, powered by blockchain technology.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => scrollToSection('select-role')}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/25 flex items-center gap-2 group"
            >
              Select Your Role
              <svg className="w-5 h-5 transform group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-white/10 flex items-center gap-2"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-purple-400 mb-2">$2.5B+</div>
            <div className="text-gray-400">Total Funds Tracked</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
            <div className="text-gray-400">Government Entities</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-green-400 mb-2">99.9%</div>
            <div className="text-gray-400">Transaction Accuracy</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-pink-400 mb-2">1M+</div>
            <div className="text-gray-400">Active Users</div>
          </div>
        </div>
      </div>

      {/* Quotes Section */}
      <div className="container mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <p className="text-gray-300 italic mb-4">
              "Transparency in government spending is not just about accountability; it's about building trust with citizens."
            </p>
            <p className="text-gray-400">- Blockchain Governance Expert</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <p className="text-gray-300 italic mb-4">
              "Blockchain technology revolutionizes how we track and verify government expenditures."
            </p>
            <p className="text-gray-400">- Public Finance Specialist</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <p className="text-gray-300 italic mb-4">
              "Real-time tracking of government funds ensures efficient resource allocation and prevents misuse."
            </p>
            <p className="text-gray-400">- Government Accountability Advocate</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Key Features</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover how our platform revolutionizes government spending management with cutting-edge features.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="text-purple-400 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Transparent</h3>
            <p className="text-gray-400">Blockchain-powered security ensures tamper-proof records and complete transparency.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="text-purple-400 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-gray-400">Advanced analytics and visualization tools for better decision-making.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="text-purple-400 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Processing</h3>
            <p className="text-gray-400">Lightning-fast transaction processing and fund allocation.</p>
          </div>
        </div>
      </div>

      {/* Role Selection Section */}
      <div id="select-role" className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Select Your Role</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose your role to access specialized features and tools for government spending management.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Central Government Card */}
          <Link 
            href="/dashboard/central-government"
            className="block bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 transform transition-all hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-500/20 border border-gray-700 group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👑</div>
            <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-blue-400 transition-colors">Central Government</h3>
            <p className="text-gray-300 mb-6">
              Manage government entities, issue funds, and monitor spending records.
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Register new entities
              </li>
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Issue funds to entities
              </li>
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Monitor spending records
              </li>
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Process fund requests
              </li>
            </ul>
          </Link>

          {/* Government Entity Card */}
          <Link 
            href="/dashboard/entity"
            className="block bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 transform transition-all hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-500/20 border border-gray-700 group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏛️</div>
            <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-blue-400 transition-colors">Government Entity</h3>
            <p className="text-gray-300 mb-6">
              Record spending, request funds, and manage your entity's transactions.
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Record spending transactions
              </li>
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Request additional funds
              </li>
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                View transaction history
              </li>
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Track fund balance
              </li>
            </ul>
          </Link>

          {/* Voter Card */}
          <Link 
            href="/dashboard/voter"
            className="block bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 transform transition-all hover:-translate-y-2 hover:shadow-lg hover:shadow-yellow-500/20 border border-gray-700 group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🗳️</div>
            <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-yellow-400 transition-colors">Voter</h3>
            <p className="text-gray-300 mb-6">
              Rate government entities and participate in performance evaluation.
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Rate entity performance
              </li>
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                View entity ratings
              </li>
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Track voting history
              </li>
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Monitor bonus distribution
              </li>
            </ul>
          </Link>

          {/* Citizen Card */}
          <Link 
            href="/dashboard/audit"
            className="block bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 transform transition-all hover:-translate-y-2 hover:shadow-lg hover:shadow-purple-500/20 border border-gray-700 group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👥</div>
            <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-purple-400 transition-colors">Audit</h3>
            <p className="text-gray-300 mb-6">
              View spending records, track fund allocation, and monitor government performance.
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                View spending records
              </li>
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Track fund allocation
              </li>
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Monitor entity performance
              </li>
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Access public reports
              </li>
            </ul>
          </Link>

          {/* PDF Analysis Card */}
          <Link 
            href="/summerizer"
            className="block bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 transform transition-all hover:-translate-y-2 hover:shadow-lg hover:shadow-green-500/20 border border-gray-700 group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
            <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-green-400 transition-colors">PDF Analysis</h3>
            <p className="text-gray-300 mb-6">
              Upload and analyze PDF reports with advanced visualization and insights.
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Upload PDF reports
              </li>
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                View financial insights
              </li>
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Interactive charts
              </li>
              <li className="flex items-center group-hover:text-gray-300 transition-colors">
                <span className="text-green-500 mr-2">✓</span>
                Track fund utilization
              </li>
            </ul>
          </Link>
        </div>
      </div>

      

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Government Spending?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Join thousands of government officials and citizens who are already using our platform to make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Get Started
            </Link>
            <Link href="#features" className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-400">
        <p>Built with Next.js and Ethereum</p>
        <p className="mt-2">© 2024 Government Spending Registry. All rights reserved.</p>
      </footer>
    </div>
  );
}
