import React from 'react';
import { SearchIcon } from './Icons';
import './SearchBar.css';

function SearchBar({ onSearch, searchParams = { q: '', tags: '', sort: 'recent' } }) {
  const { q = '', sort = 'recent' } = searchParams;

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    onSearch({ ...searchParams, q: newQuery });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Trigger search on Enter
      onSearch(searchParams);
    }
  };

  const handleSortChange = (value) => {
    onSearch({ ...searchParams, sort: value });
  };

  const handleClearSearch = () => {
    onSearch({ q: '', tags: '', sort: 'recent' });
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <SearchIcon className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search notes..."
          value={q}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        {q && (
          <button
            onClick={handleClearSearch}
            className="search-clear-btn"
            title="Clear search"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      <select
        value={sort}
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
