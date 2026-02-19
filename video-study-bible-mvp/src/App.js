import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import BibleViewer from './components/BibleViewer';
import VideoPlayer from './components/VideoPlayer';
import Commentary from './components/Commentary';
import CrossReferences from './components/CrossReferences';
import TopicExplorer from './components/TopicExplorer';
import AIInsights from './components/AIInsights';
import VideoList from './components/VideoList';
import VerseDetailPanel from './components/VerseDetailPanel';
import SearchBar from './components/SearchBar';
import { Book, Video, MessageSquare, Link2, Hash, Sparkles } from 'lucide-react';

const DEFAULT_TRANSLATION = { id: 'LUT', name: 'Lutherbibel 2017', abbreviation: 'LUT' };

function App() {
  const [studyData, setStudyData] = useState(null);
  const [selectedVerse, setSelectedVerse] = useState('Genesis 1:1');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [currentClipEnd, setCurrentClipEnd] = useState(null);
  const [activeTab, setActiveTab] = useState('commentary');
  const [bibleText, setBibleText] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTranslation, setSelectedTranslation] = useState(DEFAULT_TRANSLATION);
  const sessionUUIDRef = useRef(null);

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

  // Load Bible text from Bibel TV API — always Genesis 1, refetch on translation change
  useEffect(() => {
    const fetchBibleText = async () => {
      try {
        const query = encodeURIComponent('Genesis 1');
        const bibleAbbr = selectedTranslation.id;
        let url = `https://bibelthek-backend.bibeltv.de/search.json?query=${query}&bible_abbr=${bibleAbbr}`;
        if (sessionUUIDRef.current) {
          url += `&session_uuid=${sessionUUIDRef.current}`;
        }

        const response = await fetch(url, {
          headers: {
            'Key': process.env.REACT_APP_BIBELTHEK_API_KEY,
            'Accept': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.session_uuid) {
            sessionUUIDRef.current = data.session_uuid;
          }
          // Parse the verses out of contents_by_bible_abbr
          const abbr = selectedTranslation.id;
          const contents = data?.content?.contents_by_bible_abbr?.[abbr]?.contents || [];
          const verses = contents
            .filter(item => item.type === 'verse' && item.verse_number)
            .reduce((acc, item) => {
              acc[parseInt(item.verse_number, 10)] = item.content;
              return acc;
            }, {});
          setBibleText({ verses });
        } else {
          setBibleText({ verses: {} });
        }
      } catch (err) {
        console.error('Error fetching Bible text:', err);
        setBibleText({ verses: {} });
      }
    };

    fetchBibleText();
  }, [selectedTranslation]);

  const handleVerseSelect = (verse) => {
    setSelectedVerse(verse);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handleVideoSelect = (video, timestamp = 0, endTime = null) => {
    setCurrentVideo(video);
    setCurrentTimestamp(timestamp);
    setCurrentClipEnd(endTime);
    setIsDetailOpen(false);
  };

  const handleTimestampClick = (timestamp) => {
    setCurrentTimestamp(timestamp);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Video-Studienbibel wird geladen…</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Book size={28} />
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
        {/* Left Panel: Bible Text + Video Player */}
        <div className="left-panel">
          <BibleViewer
            verse={selectedVerse}
            bibleText={bibleText}
            studyData={studyData}
            onVerseSelect={handleVerseSelect}
            onVideoSelect={handleVideoSelect}
            selectedTranslation={selectedTranslation}
            onTranslationChange={setSelectedTranslation}
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

        {/* Verse Detail Panel: fixed bottom sheet on mobile, sticky sidebar column on desktop */}
        <VerseDetailPanel
          isOpen={isDetailOpen}
          verseRef={selectedVerse}
          studyData={studyData}
          onClose={handleCloseDetail}
          onVideoSelect={handleVideoSelect}
          onTimestampClick={handleTimestampClick}
        />

        {/* Right Panel: Study Features (desktop sidebar / mobile tabs) */}
        <div className="right-panel">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'commentary' ? 'active' : ''}`}
              onClick={() => setActiveTab('commentary')}
            >
              <MessageSquare size={15} />
              Kommentar
            </button>
            <button
              className={`tab ${activeTab === 'cross-refs' ? 'active' : ''}`}
              onClick={() => setActiveTab('cross-refs')}
            >
              <Link2 size={15} />
              Querverweise
            </button>
            <button
              className={`tab ${activeTab === 'topics' ? 'active' : ''}`}
              onClick={() => setActiveTab('topics')}
            >
              <Hash size={15} />
              Themen
            </button>
            <button
              className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              <Video size={15} />
              Videos
            </button>
            <button
              className={`tab ${activeTab === 'ai-insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai-insights')}
            >
              <Sparkles size={15} />
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
