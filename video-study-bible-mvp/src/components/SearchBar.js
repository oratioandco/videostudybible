import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

function SearchBar({ studyData, onVerseSelect, onVideoSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);

    if (!searchQuery.trim() || !studyData) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const searchResults = [];

    // Search in verses
    Object.entries(studyData.verses.all).forEach(([verseRef, videos]) => {
      if (verseRef.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          type: 'verse',
          ref: verseRef,
          label: verseRef,
          count: videos.length
        });
      }
    });

    // Search in video titles
    studyData.videos.forEach(video => {
      if (video.title.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          type: 'video',
          ref: video.video_id,
          label: video.title,
          video: video
        });
      }
    });

    // Search in topics
    Object.keys(studyData.topics).forEach(topic => {
      if (topic.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          type: 'topic',
          ref: topic,
          label: topic.replace(/_/g, ' '),
          count: studyData.topics[topic].length
        });
      }
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
    setShowResults(true);
  };

  const handleResultClick = (result) => {
    if (result.type === 'verse') {
      onVerseSelect(result.ref);
    } else if (result.type === 'video') {
      onVideoSelect(result.video);
    } else if (result.type === 'topic') {
      // Find first video with this topic
      const topicVideos = studyData.topics[result.ref];
      if (topicVideos && topicVideos.length > 0) {
        const videoId = topicVideos[0].video_id;
        const video = studyData.videos.find(v => v.video_id === videoId);
        if (video) {
          onVideoSelect(video);
        }
      }
    }

    setQuery('');
    setShowResults(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Vers, Video oder Thema suchen..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setShowResults(true)}
        />
        {query && (
          <button className="clear-btn" onClick={clearSearch}>
            <X size={16} />
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="search-results">
          {results.map((result, idx) => (
            <button
              key={idx}
              className={`search-result-item ${result.type}`}
              onClick={() => handleResultClick(result)}
            >
              <span className="result-type">{result.type === 'verse' ? 'Vers' : result.type === 'video' ? 'Video' : 'Thema'}</span>
              <span className="result-label">{result.label}</span>
              {result.count !== undefined && (
                <span className="result-count">{result.count}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
