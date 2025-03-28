import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';

const Layout = ({ children, title = 'PromptPro - AI Prompt Management' }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content="PromptPro - AI Prompt Management Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600">
            &copy; {new Date().getFullYear()} PromptPro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
