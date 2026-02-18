import React, { useState, useEffect } from 'react';
import './App.css';
import BibleViewer from './components/BibleViewer';
import VideoPlayer from './components/VideoPlayer';
import Commentary from './components/Commentary';
import CrossReferences from './components/CrossReferences';
import TopicExplorer from './components/TopicExplorer';
import AIInsights from './components/AIInsights';
import VideoList from './components/VideoList';
import SearchBar from './components/SearchBar';
import { Book, Video, MessageSquare, Link2, Hash, Sparkles } from 'lucide-react';

function App() {
  const [studyData, setStudyData] = useState(null);
  const [selectedVerse, setSelectedVerse] = useState('Genesis 1:1');
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [currentClipEnd, setCurrentClipEnd] = useState(null);
  const [activeTab, setActiveTab] = useState('commentary');
  const [bibleText, setBibleText] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load study Bible data
  useEffect(() => {
    fetch('/study_bible_data/study_bible_database.json')
      .then(res => res.json())
      .then(data => {
        setStudyData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading study data:', err);
        setLoading(false);
      });
  }, []);

  // Load Bible text from Bibel TV API
  useEffect(() => {
    if (!selectedVerse) return;

    // Parse verse reference for API call
    const fetchBibleText = async () => {
      try {
        // TODO: Adjust API call based on correct authentication method
        const query = selectedVerse.replace(' ', '%20');
        const response = await fetch(
          `https://bibelthek-backend.bibeltv.de/search.json?query=${query}`,
          {
            headers: {
              // Try different auth methods - adjust based on what works
              'X-API-KEY': '9063d9c81d111797641719a3b86651eb',
              'Authorization': 'Bearer 9063d9c81d111797641719a3b86651eb'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setBibleText(data);
        } else {
          // Fallback to mock data for MVP
          setBibleText({
            verses: [
              {
                verse: 1,
                text: 'Am Anfang schuf Gott Himmel und Erde.'
              }
            ]
          });
        }
      } catch (err) {
        console.error('Error fetching Bible text:', err);
        // Use fallback
        setBibleText({
          verses: [{verse: 1, text: 'Am Anfang schuf Gott Himmel und Erde.'}]
        });
      }
    };

    fetchBibleText();
  }, [selectedVerse]);

  const handleVerseSelect = (verse) => {
    setSelectedVerse(verse);
  };

  const handleVideoSelect = (video, timestamp = 0, endTime = null) => {
    setCurrentVideo(video);
    setCurrentTimestamp(timestamp);
    setCurrentClipEnd(endTime);
  };

  const handleTimestampClick = (timestamp) => {
    setCurrentTimestamp(timestamp);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Video-Studienbibel wird geladen...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Book size={32} />
            <h1>Video-Studienbibel</h1>
            <span className="beta-badge">Beta</span>
          </div>
          <SearchBar
            studyData={studyData}
            onVerseSelect={handleVerseSelect}
            onVideoSelect={handleVideoSelect}
          />
        </div>
      </header>

      <div className="main-container">
        {/* Left Panel: Bible Text + Videos */}
        <div className="left-panel">
          <BibleViewer
            verse={selectedVerse}
            bibleText={bibleText}
            studyData={studyData}
            onVerseSelect={handleVerseSelect}
            onVideoSelect={handleVideoSelect}
          />

          {currentVideo && (
            <VideoPlayer
              video={currentVideo}
              timestamp={currentTimestamp}
              endTime={currentClipEnd}
              onTimestampChange={setCurrentTimestamp}
            />
          )}
        </div>

        {/* Right Panel: Study Features */}
        <div className="right-panel">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'commentary' ? 'active' : ''}`}
              onClick={() => setActiveTab('commentary')}
            >
              <MessageSquare size={16} />
              Kommentar
            </button>
            <button
              className={`tab ${activeTab === 'cross-refs' ? 'active' : ''}`}
              onClick={() => setActiveTab('cross-refs')}
            >
              <Link2 size={16} />
              Querverweise
            </button>
            <button
              className={`tab ${activeTab === 'topics' ? 'active' : ''}`}
              onClick={() => setActiveTab('topics')}
            >
              <Hash size={16} />
              Themen
            </button>
            <button
              className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              <Video size={16} />
              Videos
            </button>
            <button
              className={`tab ${activeTab === 'ai-insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai-insights')}
            >
              <Sparkles size={16} />
              KI-Einblicke
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'commentary' && (
              <Commentary
                verse={selectedVerse}
                studyData={studyData}
                onTimestampClick={handleTimestampClick}
                onVideoSelect={handleVideoSelect}
              />
            )}

            {activeTab === 'cross-refs' && (
              <CrossReferences
                verse={selectedVerse}
                studyData={studyData}
                onVerseSelect={handleVerseSelect}
              />
            )}

            {activeTab === 'topics' && (
              <TopicExplorer
                verse={selectedVerse}
                studyData={studyData}
                onVerseSelect={handleVerseSelect}
              />
            )}

            {activeTab === 'videos' && (
              <VideoList
                verse={selectedVerse}
                studyData={studyData}
                onVideoSelect={handleVideoSelect}
                onTimestampClick={handleTimestampClick}
              />
            )}

            {activeTab === 'ai-insights' && (
              <AIInsights
                verse={selectedVerse}
                studyData={studyData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
