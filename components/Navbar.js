import React, { useState, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import { 
  Bars3Icon as MenuIcon, 
  XMarkIcon as XIcon, 
  UserCircleIcon,
  MagnifyingGlassIcon,
  ArrowUpCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useTeams } from '../context/TeamContext';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, UserGroupIcon } from '@heroicons/react/20/solid';

const FREE_PLAN_PROMPT_LIMIT = 10;

const Navbar = ({ userPlan, userPromptCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const { teams, selectedTeamId, setSelectedTeamId, isLoading: teamsLoading } = useTeams();

  const selectedTeam = teams?.find(team => team._id === selectedTeamId);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const isActive = (path) => {
    return router.pathname === path ? 'text-primary-600 font-semibold' : 'text-gray-700 hover:text-primary-600';
  };
  
  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-2xl font-bold text-primary-600 cursor-pointer">PromptPro</span>
              </Link>
            </div>
            
            {session && !teamsLoading && teams && teams.length > 0 && (
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <Listbox value={selectedTeamId} onChange={setSelectedTeamId}>
                  {({ open }) => (
                    <div className="relative">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6 min-w-[150px]">
                        <span className="flex items-center">
                          <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
                          <span className="block truncate">{selectedTeam ? selectedTeam.name : 'Select Team'}</span>
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>

                      <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {teams.map((team) => (
                            <Listbox.Option
                              key={team._id}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-3 pr-9 ${active ? 'bg-primary-600 text-white' : 'text-gray-900'}`
                              }
                              value={team._id}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                    {team.name}
                                  </span>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active ? 'text-white' : 'text-primary-600'}`}
                                    >
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  )}
                </Listbox>
              </div>
            )}

            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex space-x-4">
                <Link href="/">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')} cursor-pointer`}>
                    Home
                  </span>
                </Link>
                {session && (
                  <>
                    <Link href="/dashboard">
                      <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')} cursor-pointer`}>
                        Dashboard
                      </span>
                    </Link>
                    <Link href="/prompts/my-prompts">
                      <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/prompts/my-prompts')} cursor-pointer`}>
                        My Prompts
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
                    <Link href="/teams">
                      <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/teams')} cursor-pointer`}>
                        Teams
                      </span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex sm:items-center">
            {session && (
              <div className="mr-4 relative">
                <form 
                  action="/search" 
                  method="GET" 
                  className="flex items-center"
                  onSubmit={(e) => {
                    if (e.target.q.value.trim() === '') {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="relative">
                    <input
                      type="text"
                      name="q"
                      placeholder="Search prompts..."
                      className="w-64 h-9 pl-3 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                    <button
                      type="submit"
                      className="absolute right-0 top-0 h-full px-2 flex items-center justify-center text-gray-400 hover:text-primary-600"
                    >
                      <MagnifyingGlassIcon className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {!loading && (
              <>
                {session ? (
                  <div className="ml-3 relative flex items-center space-x-3">
                    <div className="flex items-center space-x-2 border-r border-gray-200 pr-3">
                      {userPlan === 'Free' ? (
                        <>
                          <span className="text-sm text-gray-600 hidden lg:inline">Plan: Free</span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                            {typeof userPromptCount === 'number' ? `${userPromptCount} / ${FREE_PLAN_PROMPT_LIMIT}` : '-'} Prompts
                          </span>
                          <Link href="/upgrade">
                            <span className="flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer">
                              <ArrowUpCircleIcon className="h-4 w-4 mr-1" />
                              Upgrade
                            </span>
                          </Link>
                        </>
                      ) : userPlan === 'Pro' ? (
                        <span className="flex items-center text-sm font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-md">
                          <CheckCircleIcon className="h-4 w-4 mr-1 text-purple-600" />
                          Pro Plan
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Plan: {userPlan || '...'}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href="/profile">
                        <div className="flex items-center space-x-2 cursor-pointer" title="Profile">
                          {session.user.image ? (
                            <img
                              className="h-8 w-8 rounded-full"
                              src={session.user.image}
                              alt={session.user.name || "User profile"}
                            />
                          ) : (
                            <UserCircleIcon className="h-8 w-8 text-gray-400" />
                          )}
                          <span className="text-sm font-medium text-gray-700 hidden md:inline">{session.user.name}</span>
                        </div>
                      </Link>
                      <button
                        onClick={() => signOut()}
                        title="Sign Out"
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
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
            {session && (
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
            )}
          </div>
        </div>
      </div>
      
      {isMenuOpen && session && (
        <div className="sm:hidden border-t border-gray-200">
          {!teamsLoading && teams && teams.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-200">
              <Listbox value={selectedTeamId} onChange={setSelectedTeamId}>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm">
                    <span className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
                      <span className="block truncate">{selectedTeam ? selectedTeam.name : 'Select Team'}</span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                  
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {teams.map((team) => (
                        <Listbox.Option key={team._id} className={({ active }) => `relative cursor-default select-none py-2 pl-3 pr-9 ${ active ? 'bg-primary-600 text-white' : 'text-gray-900' }`} value={team._id}>
                          {({ selected, active }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{team.name}</span>
                              {selected ? (<span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${ active ? 'text-white' : 'text-primary-600' }`}><CheckIcon className="h-5 w-5" aria-hidden="true" /></span>) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          )}
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="p-2 mb-2 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center space-x-2 cursor-pointer flex-grow">
                    {session.user.image ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={session.user.image}
                        alt={session.user.name || "User profile"}
                      />
                    ) : (
                      <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    )}
                    <span className="text-base font-medium text-gray-800">{session.user.name}</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="ml-auto px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </div>
              <div className="flex items-center justify-between space-x-2 mt-2">
                {userPlan === 'Free' ? (
                  <>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {typeof userPromptCount === 'number' ? `${userPromptCount} / ${FREE_PLAN_PROMPT_LIMIT}` : '-'} Prompts
                    </span>
                    <Link href="/upgrade" onClick={() => setIsMenuOpen(false)}>
                      <span className="flex items-center px-3 py-1 text-sm font-medium text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 rounded-md shadow-sm cursor-pointer">
                        <ArrowUpCircleIcon className="h-4 w-4 mr-1" />
                        Upgrade
                      </span>
                    </Link>
                  </>
                ) : userPlan === 'Pro' ? (
                  <span className="flex items-center text-sm font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-md">
                    <CheckCircleIcon className="h-4 w-4 mr-1 text-purple-600" />
                    Pro Plan
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">Plan: {userPlan || '...'}</span>
                )}
              </div>
            </div>
            <Link href="/">
              <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')} cursor-pointer`}>
                Home
              </span>
            </Link>
            <Link href="/dashboard">
              <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard')} cursor-pointer`}>
                Dashboard
              </span>
            </Link>
            <Link href="/prompts/my-prompts">
              <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/prompts/my-prompts')} cursor-pointer`}>
                My Prompts
              </span>
            </Link>
            <Link href="/prompts/create">
              <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/prompts/create')} cursor-pointer`}>
                Create Prompt
              </span>
            </Link>
            <Link href="/collections">
              <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/collections')} cursor-pointer`}>
                Collections
              </span>
            </Link>
            <Link href="/teams">
              <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/teams')} cursor-pointer`}>
                Teams
              </span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
