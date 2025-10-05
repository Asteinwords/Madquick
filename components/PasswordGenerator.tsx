'use client';
import { useState } from 'react';

interface Props {
  onGenerate: (password: string) => void;
}

export default function PasswordGenerator({ onGenerate }: Props) {
  const [length, setLength] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeLookAlikes, setExcludeLookAlikes] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const charset = {
    letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '23456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };

  async function generatePassword() {
    setIsGenerating(true);
    
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let chars = charset.letters;
    if (includeNumbers) chars += charset.numbers;
    if (includeSymbols) chars += charset.symbols;
    if (excludeLookAlikes) {
      chars = chars.replace(/[Il0O]/g, '');
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    onGenerate(password);
    setIsGenerating(false);
    return password;
  }

  // Calculate strength score
  const getStrengthScore = () => {
    let score = 0;
    if (length >= 12) score += 2;
    else if (length >= 8) score += 1;
    if (includeNumbers) score += 1;
    if (includeSymbols) score += 2;
    if (excludeLookAlikes) score += 1;
    return Math.min(score, 6);
  };

  const strengthScore = getStrengthScore();
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent'];
  const strengthColors = [
    'from-red-500 to-red-600',
    'from-orange-500 to-red-500',
    'from-yellow-500 to-orange-500',
    'from-yellow-400 to-yellow-500',
    'from-green-400 to-yellow-400',
    'from-green-500 to-green-400',
    'from-emerald-500 to-green-500'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2M7 7a2 2 0 012 2m0 0a2 2 0 012 2M7 9a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2H7z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Password Generator</h3>
        <p className="text-sm text-slate-600 dark:text-gray-400">Create secure passwords instantly</p>
      </div>

      <div className="space-y-4">
        {/* Length Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
              Password Length
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
                {length}
              </span>
            </div>
          </div>
          <div className="relative">
            <input
              type="range"
              min="8"
              max="32"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 slider"
            />
            <div 
              className="absolute top-0 left-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg pointer-events-none"
              style={{ width: `${((length - 8) / (32 - 8)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-gray-700/50 rounded-xl border border-slate-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Include Numbers</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={includeNumbers} 
                onChange={(e) => setIncludeNumbers(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-600 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-gray-700/50 rounded-xl border border-slate-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Include Symbols</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={includeSymbols} 
                onChange={(e) => setIncludeSymbols(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 dark:peer-focus:ring-purple-600 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-gray-700/50 rounded-xl border border-slate-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 16.121m6.878-6.243L16.121 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Exclude Look-alikes</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={excludeLookAlikes} 
                onChange={(e) => setExcludeLookAlikes(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 dark:peer-focus:ring-green-600 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>

        {/* Strength Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700 dark:text-gray-300">Password Strength</span>
            <span className={`text-sm font-bold bg-gradient-to-r ${strengthColors[strengthScore]} bg-clip-text text-transparent`}>
              {strengthLabels[strengthScore]}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${strengthColors[strengthScore]} transition-all duration-300`}
              style={{ width: `${(strengthScore / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Generate Button */}
        <button 
          onClick={generatePassword}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Password
            </div>
          )}
        </button>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 25
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
          border: 2px solid white;
        }
        .slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 25%
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }
      `}</style>
    </div>
  );
}