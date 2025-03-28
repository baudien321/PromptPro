import React, { useState } from 'react';
import { MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ onSearch, placeholder = "Search prompts..." }) => {
  const [query, setQuery] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };
  
  return (
    <form onSubmit={handleSearch} className="max-w-lg w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input pl-10 pr-16"
          placeholder={placeholder}
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="submit"
            className="btn-primary py-1 px-3 text-sm"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
