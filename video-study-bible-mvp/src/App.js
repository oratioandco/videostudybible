import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import BibleViewer from './components/BibleViewer';
import VideoPlayer from './components/VideoPlayer';
import VerseDetailPanel from './components/VerseDetailPanel';
import SearchBar from './components/SearchBar';
import { Book, Play } from 'lucide-react';

const DEFAULT_TRANSLATION = { id: 'LUT', name: 'Lutherbibel 2017', abbreviation: 'LUT' };

function App() {
  const [studyData, setStudyData] = useState(null);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [selectedVerseText, setSelectedVerseText] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [currentClipEnd, setCurrentClipEnd] = useState(null);
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

  // Load Bible text from Bibel TV API via CRA proxy — refetch on translation change
  useEffect(() => {
    const fetchBibleText = async () => {
      try {
        const query = encodeURIComponent('Genesis 1');
        const bibleAbbr = selectedTranslation.id;
        let url = `/search.json?query=${query}&bible_abbr=${bibleAbbr}`;
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
          // API returns its own internal abbr key — take the first one
          const cba = data?.content?.contents_by_bible_abbr || {};
          const firstKey = Object.keys(cba)[0];
          const contents = firstKey ? (cba[firstKey]?.contents || []) : [];
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTranslation.id]);

  const handleVerseSelect = (verse, verseText) => {
    setSelectedVerse(verse);
    setSelectedVerseText(verseText || null);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
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
        <p>Video-Studienbibel wird geladen…</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Book size={24} />
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

        {/* Left col: video player (desktop only — collapses when no video) */}
        <div className={`video-column ${currentVideo ? 'has-video' : ''}`}>
          {currentVideo ? (
            <VideoPlayer
              video={currentVideo}
              timestamp={currentTimestamp}
              endTime={currentClipEnd}
              onTimestampChange={setCurrentTimestamp}
            />
          ) : (
            <div className="video-placeholder">
              <Book size={32} className="placeholder-icon" />
              <p>Wähle einen Vers aus,<br />um Videos abzuspielen</p>
            </div>
          )}
        </div>

        {/* Center col: Bible reader */}
        <div className="bible-column">
          <BibleViewer
            verse={selectedVerse}
            bibleText={bibleText}
            studyData={studyData}
            onVerseSelect={handleVerseSelect}
            onVideoSelect={handleVideoSelect}
            selectedTranslation={selectedTranslation}
            onTranslationChange={setSelectedTranslation}
          />
        </div>

        {/* Right col: Verse detail panel (bottom sheet on mobile, sidebar on desktop) */}
        <VerseDetailPanel
          isOpen={isDetailOpen}
          verseRef={selectedVerse}
          verseText={selectedVerseText}
          studyData={studyData}
          onClose={handleCloseDetail}
          onVideoSelect={handleVideoSelect}
          onTimestampClick={handleTimestampClick}
          onVerseSelect={handleVerseSelect}
        />
      </div>

      {/* Mini-player bar: mobile/tablet indicator when a video is active */}
      {currentVideo && (
        <div className="mini-player-bar">
          <div className="mini-player-icon">
            <Play size={14} />
          </div>
          <span className="mini-player-title">
            {currentVideo.display_title || currentVideo.title}
          </span>
        </div>
      )}
    </div>
  );
}

export default App;
