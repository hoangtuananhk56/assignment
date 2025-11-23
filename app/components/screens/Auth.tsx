import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ChevronDown, ArrowRight } from 'lucide-react';
import { Button, Input, Select } from '../UI';
import { ViewState } from '../../types';

interface AuthProps {
  onLogin: () => void;
  onNavigate: (view: ViewState) => void;
  view: 'LOGIN' | 'REGISTER';
}

export const AuthScreen: React.FC<AuthProps> = ({ onLogin, onNavigate, view }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAction = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  // --- REGISTER SCREEN ---
  if (view === 'REGISTER') {
    return (
      <div className="min-h-screen flex w-full bg-white">
        {/* Left Split - Hero Image */}
        <div className="hidden lg:flex w-1/2 bg-brand-600 relative overflow-hidden flex-col justify-end p-12 text-white">
            {/* Placeholder for the image in the photo */}
            <div className="absolute inset-0">
                <img 
                    src="https://picsum.photos/1000/1200?grayscale" 
                    alt="Smiling patient" 
                    className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-700/90 to-transparent"></div>
            </div>
            
            <div className="relative z-10 mb-12">
                <h1 className="text-4xl font-bold mb-4">Welcome to 32Co</h1>
                <p className="text-xl font-medium opacity-90 mb-8">Join the UK & Ireland's fastest growing clear aligner system.</p>
                
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 inline-block">
                    <p className="font-bold">Did you know?</p>
                    <p className="text-sm opacity-90 mt-1">96% of our dentists prefer 32Co's treatment plans over other providers.</p>
                </div>
            </div>
        </div>

        {/* Right Split - Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2">
               <div className="flex items-center gap-2 mb-6">
                 <div className="h-1 w-8 bg-dark-900 rounded-full"></div>
                 <div className="h-1 w-8 bg-gray-200 rounded-full"></div>
                 <span className="text-xs font-semibold text-gray-500 ml-2">Step 1 of 2</span>
               </div>
               <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Your Dentist Account</h2>
            </div>

            <form onSubmit={handleAuthAction} className="space-y-5">
              <Input placeholder="First Name" className="bg-gray-50" />
              <Input placeholder="Last Name" className="bg-gray-50" />
              <Input type="email" placeholder="Email Address" className="bg-gray-50" />
              
              {/* Phone Input Simulation */}
              <div className="flex gap-2">
                <div className="w-24 flex-shrink-0">
                    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg h-[42px] flex items-center justify-center gap-1 px-2 text-gray-700">
                        <span>🇬🇧</span>
                        <span className="text-sm">+44</span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </div>
                </div>
                <Input placeholder="7000 000 000" className="bg-gray-50" />
              </div>

              <Select 
                className="bg-gray-50 text-gray-500"
                options={[
                    { value: '', label: 'Which of the following best describes you?' },
                    { value: 'gdp', label: 'General Dentist' },
                    { value: 'ortho', label: 'Orthodontist' }
                ]} 
              />

              <div className="relative">
                <Input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Password" 
                    className="bg-gray-50 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full py-3 bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200 font-semibold shadow-none"
                isLoading={isLoading}
              >
                Create Free Dentist Account
              </Button>
            </form>

            <div className="text-sm text-center space-y-4">
                <p className="text-gray-600">
                    Already have an account? <button onClick={() => onNavigate('LOGIN')} className="font-medium text-dark-900 hover:underline">Sign in</button>
                </p>
                <p className="text-gray-500 text-xs">
                    Not a dentist? <a href="#" className="underline hover:text-gray-700">Click here</a>
                </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LOGIN SCREEN ---
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-brand-600">32Co</h1>
            <h2 className="text-3xl font-bold text-gray-900">Login. Welcome back</h2>
        </div>

        <form onSubmit={handleAuthAction} className="space-y-5">
          <Input 
            placeholder="Email Address" 
            type="email"
            className="py-3"
          />
          
          <div className="relative">
            <Input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Password" 
                className="py-3 pr-10"
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full py-3 bg-dark-900 text-white hover:bg-dark-800 shadow-lg shadow-dark-900/20 rounded-lg text-base" 
            isLoading={isLoading}
          >
            Login
          </Button>
        </form>

        <div className="text-center space-y-6">
            <button className="text-sm text-gray-600 hover:text-gray-900">Forgot Password</button>
            
            <div className="pt-8">
                <p className="text-sm text-gray-600">
                    New Here? <button onClick={() => onNavigate('REGISTER')} className="text-dark-900 font-medium hover:underline">Create Your Account</button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
