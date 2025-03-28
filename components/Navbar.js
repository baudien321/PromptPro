import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Bars3Icon as MenuIcon, XMarkIcon as XIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const isActive = (path) => {
    return router.pathname === path ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600';
  };
  
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-2xl font-bold text-primary-600 cursor-pointer">PromptPro</span>
              </Link>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex space-x-4">
                <Link href="/">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')} cursor-pointer`}>
                    Home
                  </span>
                </Link>
                <Link href="/prompts/create">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/prompts/create')} cursor-pointer`}>
                    Create Prompt
                  </span>
                </Link>
                <Link href="/collections">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/collections')} cursor-pointer`}>
                    Collections
                  </span>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="sm:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XIcon className="block h-6 w-6" />
              ) : (
                <MenuIcon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/">
              <span 
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')} cursor-pointer`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </span>
            </Link>
            <Link href="/prompts/create">
              <span 
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/prompts/create')} cursor-pointer`}
                onClick={() => setIsMenuOpen(false)}
              >
                Create Prompt
              </span>
            </Link>
            <Link href="/collections">
              <span 
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/collections')} cursor-pointer`}
                onClick={() => setIsMenuOpen(false)}
              >
                Collections
              </span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
