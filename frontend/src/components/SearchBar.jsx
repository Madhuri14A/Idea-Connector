import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, allTags = [] }) {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('recent');

  // Handle search input - just update the query
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  // Handle Enter key - trigger search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  // Actually trigger the search
  const triggerSearch = () => {
    const tags = selectedTags.length > 0 ? selectedTags.join(',') : '';
    onSearch({ q: query, tags, sort: sortBy });
  };

  // Toggle tag selection
  const handleTagToggle = (tag) => {
    const updated = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(updated);
    const tags = updated.length > 0 ? updated.join(',') : '';
    onSearch({ q: query, tags, sort: sortBy });
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
    const tags = selectedTags.length > 0 ? selectedTags.join(',') : '';
    onSearch({ q: query, tags, sort: value });
  };

  return (
    <div className="search-bar">
      {/* Search Input */}
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Search notes by title or content... (Press Enter)"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      {/* Sort Dropdown */}
      <div className="sort-wrapper">
        <label htmlFor="sort">Sort:</label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="sort-select"
        >
          <option value="recent">Recent First</option>
          <option value="oldest">Oldest First</option>
          <option value="alphabetical">A-Z</option>
        </select>
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="tags-filter">
          <label>Filter by tags:</label>
          <div className="tags-list">
            {allTags.map(tag => (
              <button
                key={tag}
                className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
