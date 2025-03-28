import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Bars3Icon as MenuIcon, XMarkIcon as XIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  
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
          
          <div className="hidden sm:flex sm:items-center">
            {!loading && (
              <>
                {session ? (
                  <div className="ml-3 relative flex items-center">
                    <div className="flex items-center space-x-2">
                      <Link href="/profile">
                        <div className="flex items-center space-x-2 cursor-pointer">
                          {session.user.image ? (
                            <img
                              className="h-8 w-8 rounded-full"
                              src={session.user.image}
                              alt={session.user.name || "User profile"}
                            />
                          ) : (
                            <UserCircleIcon className="h-8 w-8 text-gray-400" />
                          )}
                          <span className="text-sm font-medium text-gray-700">{session.user.name}</span>
                        </div>
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="ml-2 px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href="/auth/signin">
                    <span className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer">
                      Sign in
                    </span>
                  </Link>
                )}
              </>
            )}
          </div>
          
          <div className="sm:hidden flex items-center">
            {!loading && !session && (
              <Link href="/auth/signin">
                <span className="mr-2 px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 cursor-pointer">
                  Sign in
                </span>
              </Link>
            )}
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
            
            {session && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Link href="/profile">
                  <div 
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {session.user.image ? (
                      <img
                        className="h-8 w-8 rounded-full mr-2"
                        src={session.user.image}
                        alt={session.user.name || "User profile"}
                      />
                    ) : (
                      <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
                    )}
                    <span className="text-sm font-medium text-gray-700">{session.user.name}</span>
                  </div>
                </Link>
                <Link href="/profile">
                  <span 
                    className={`block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 cursor-pointer`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
