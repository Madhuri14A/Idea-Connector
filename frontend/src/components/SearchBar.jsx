import React, { useState } from 'react';
import { SearchIcon } from './Icons';
import './SearchBar.css';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch({ q: query, tags: '', sort: sortBy });
    }
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    onSearch({ q: query, tags: '', sort: value });
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <SearchIcon className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search notes..."
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
      </div>

      <select
        value={sortBy}
        onChange={(e) => handleSortChange(e.target.value)}
        className="sort-select"
      >
        <option value="recent">Recent First</option>
        <option value="oldest">Oldest First</option>
        <option value="alphabetical">A-Z</option>
      </select>
    </div>
  );
}

export default SearchBar;
