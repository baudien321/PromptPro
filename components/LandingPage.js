import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';
import { 
  SparklesIcon, 
  MagnifyingGlassIcon, 
  FolderIcon, 
  ShareIcon, 
  ChartBarIcon, 
  LightBulbIcon 
} from '@heroicons/react/24/outline';
import Button from './Button';

const LandingPage = () => {
  const { data: session } = useSession();

  const features = [
    {
      icon: <SparklesIcon className="h-6 w-6 text-primary-600" />,
      title: 'Create Powerful Prompts',
      description: 'Build, test, and refine prompts that consistently deliver great results with any AI platform.'
    },
    {
      icon: <MagnifyingGlassIcon className="h-6 w-6 text-primary-600" />,
      title: 'Advanced Search & Filtering',
      description: 'Find the perfect prompt instantly with powerful search capabilities and filtering options.'
    },
    {
      icon: <FolderIcon className="h-6 w-6 text-primary-600" />,
      title: 'Organize in Collections',
      description: 'Group related prompts into collections for better organization and easier access.'
    },
    {
      icon: <ShareIcon className="h-6 w-6 text-primary-600" />,
      title: 'Share & Collaborate',
      description: 'Share your best prompts with the community or collaborate with your team.'
    },
    {
      icon: <ChartBarIcon className="h-6 w-6 text-primary-600" />,
      title: 'Track Performance',
      description: 'Monitor prompt effectiveness with usage statistics and success metrics.'
    },
    {
      icon: <LightBulbIcon className="h-6 w-6 text-primary-600" />,
      title: 'Discover Inspiration',
      description: 'Explore top-rated prompts from the community to spark new ideas.'
    }
  ];

  const platforms = [
    'ChatGPT',
    'Claude',
    'DALL-E',
    'Midjourney',
    'Gemini',
    'GPT-4',
    'Stable Diffusion'
  ];

  return (
    <div className="mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-100 to-primary-50 py-16 px-4 sm:px-6 lg:px-8 rounded-2xl mb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Master AI with <span className="text-primary-600">Perfect Prompts</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Create, manage, and share powerful AI prompts across all platforms. 
              Boost your productivity and AI results with PromptPro.
            </p>
            
            {/* Quick Search Box */}
            <div className="mb-8">
              <div className="relative">
                <form 
                  action="/search" 
                  method="GET" 
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      name="q"
                      placeholder="Search for prompts by keyword, platform, or tag..."
                      className="w-full border-2 border-primary-300 bg-white h-12 px-5 pr-16 rounded-lg text-md focus:outline-none focus:border-primary-500"
                    />
                    <div className="absolute right-3 top-3">
                      <MagnifyingGlassIcon className="h-6 w-6 text-primary-500" />
                    </div>
                  </div>
                  
                  <div className="inline-flex gap-2">
                    <select 
                      name="platform" 
                      className="border-2 border-primary-300 h-12 px-4 rounded-lg focus:outline-none focus:border-primary-500 text-gray-700"
                    >
                      <option value="">All Platforms</option>
                      {platforms.map(platform => (
                        <option key={platform} value={platform}>{platform}</option>
                      ))}
                    </select>
                    
                    <button
                      type="submit"
                      className="bg-primary-600 text-white h-12 px-6 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-500">Popular:</span>
                <Link href="/search?tag=writing" className="text-sm text-primary-600 hover:text-primary-800 hover:underline">
                  writing
                </Link>
                <Link href="/search?tag=coding" className="text-sm text-primary-600 hover:text-primary-800 hover:underline">
                  coding
                </Link>
                <Link href="/search?tag=marketing" className="text-sm text-primary-600 hover:text-primary-800 hover:underline">
                  marketing
                </Link>
                <Link href="/search?tag=images" className="text-sm text-primary-600 hover:text-primary-800 hover:underline">
                  images
                </Link>
              </div>
            </div>
            
            {session ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/prompts/create">
                  <Button variant="primary" size="lg">Create Your First Prompt</Button>
                </Link>
                <Link href="/collections">
                  <Button variant="secondary" size="lg">Browse Collections</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => signIn('google')}
                >
                  Get Started for Free
                </Button>
                <Link href="/auth/signin">
                  <Button variant="secondary" size="lg">Learn More</Button>
                </Link>
              </div>
            )}
          </div>
          
          <div className="relative h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 opacity-90 z-10"></div>
            <div className="absolute inset-0 p-6 z-20 text-white font-mono text-sm overflow-hidden">
              <div className="bg-black bg-opacity-50 p-4 rounded-lg mb-4">
                <p className="text-green-400 mb-2">{">"} Generate creative story</p>
                <p className="text-white opacity-75 leading-relaxed">
                  Write a short story about a world where gravity works in reverse, with trees growing downward and clouds forming on the ground.
                </p>
              </div>
              <div className="bg-black bg-opacity-50 p-4 rounded-lg">
                <p className="text-green-400 mb-2">{">"} Design product description</p>
                <p className="text-white opacity-75 leading-relaxed">
                  Write a compelling product description for [PRODUCT] that highlights its [KEY FEATURES] and appeals to [TARGET AUDIENCE].
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for AI Prompt Mastery
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive toolkit helps you create, organize, and optimize your prompts across all AI platforms.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* AI Platforms Section */}
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Works With All Your Favorite AI Platforms
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create and manage prompts for any AI tool in your workflow. One app for all your prompt needs.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 items-center">
            {platforms.map((platform, index) => (
              <div 
                key={index} 
                className="bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200 text-lg font-medium text-gray-800"
              >
                {platform}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-primary-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                Ready to elevate your AI game?
                <span className="block text-primary-200">Join PromptPro today.</span>
              </h2>
              <p className="mt-4 text-lg text-primary-100">
                Create your account for free and start building better prompts in minutes.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 lg:ml-8 flex flex-shrink-0 flex-col sm:flex-row gap-4">
              {session ? (
                <Link href="/prompts/create">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="whitespace-nowrap"
                  >
                    Create Your First Prompt
                  </Button>
                </Link>
              ) : (
                <>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="whitespace-nowrap"
                    onClick={() => signIn('google')}
                  >
                    Sign Up Free
                  </Button>
                  <Link href="/auth/signin">
                    <Button 
                      variant="primary" 
                      size="lg"
                      className="whitespace-nowrap bg-primary-800 hover:bg-primary-900"
                    >
                      Learn More
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;