import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import BibleViewer, { TranslationSwitcher } from './components/BibleViewer';
import VideoPlayer from './components/VideoPlayer';
import VerseDetailPanel from './components/VerseDetailPanel';
import HomeScreen from './components/HomeScreen';
import { Book, Play, Sun, Moon, BookOpen, BookText, SlidersHorizontal, Check, Home } from 'lucide-react';

const DEFAULT_TRANSLATION = { id: 'LUT', name: 'Lutherbibel 2017', abbreviation: 'LUT' };

function App() {
  const [theme, setTheme] = useState(() => {
    // Default to dark to match previous behaviour; user can toggle
    const saved = localStorage.getItem('vsb-theme');
    return saved || 'dark';
  });
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('vsb-view-mode');
    return (saved === 'reading' || saved === 'study') ? saved : 'study';
  });
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
  const [highlights, setHighlights] = useState({}); // { verseRef: colorId | null }
  const [notes, setNotes] = useState({}); // { verseRef: Note[] }
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [page, setPage] = useState('home'); // 'home' | 'bible'
  const sessionUUIDRef = useRef(null);

  // Apply theme class to <html>
  useEffect(() => {
    const el = document.documentElement;
    el.classList.remove('dark', 'sepia');
    if (theme !== 'light') el.classList.add(theme);
    localStorage.setItem('vsb-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('vsb-view-mode', viewMode);
  }, [viewMode]);

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

  const handleCloseVideo = () => {
    setCurrentVideo(null);
    setCurrentTimestamp(0);
    setCurrentClipEnd(null);
  };

  const handleHighlight = (verseRef, colorId) => {
    setHighlights(prev => ({ ...prev, [verseRef]: colorId }));
  };

  const handleAddNote = (verseRef, note) => {
    setNotes(prev => ({
      ...prev,
      [verseRef]: [...(prev[verseRef] || []), note],
    }));
  };

  const handleDeleteNote = (verseRef, noteId) => {
    setNotes(prev => ({
      ...prev,
      [verseRef]: (prev[verseRef] || []).filter(n => n.id !== noteId),
    }));
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
          <nav className="page-nav">
            <button
              className={`page-nav-btn ${page === 'home' ? 'active' : ''}`}
              onClick={() => setPage('home')}
            >
              <Home size={14} />
              <span>Home</span>
            </button>
            <button
              className={`page-nav-btn ${page === 'bible' ? 'active' : ''}`}
              onClick={() => setPage('bible')}
            >
              <BookOpen size={14} />
              <span>Genesis 1</span>
            </button>
          </nav>
          <div className="header-right">
            {page === 'bible' && (
              <TranslationSwitcher
                selected={selectedTranslation}
                onChange={setSelectedTranslation}
              />
            )}
            <div className="settings-menu">
              <button
                className={`settings-btn ${settingsOpen ? 'active' : ''}`}
                onClick={() => setSettingsOpen(o => !o)}
                aria-label="Anzeigeeinstellungen"
              >
                <SlidersHorizontal size={14} />
                <span>Ansicht</span>
              </button>
              {settingsOpen && (
                <>
                  <div className="settings-backdrop" onClick={() => setSettingsOpen(false)} />
                  <div className="settings-dropdown">
                    <p className="settings-section-label">Modus</p>
                    <button
                      className={`settings-option ${viewMode === 'study' ? 'active' : ''}`}
                      onClick={() => { setViewMode('study'); setSettingsOpen(false); }}
                    >
                      <BookOpen size={14} />
                      Studienmodus
                      {viewMode === 'study' && <Check size={13} className="settings-check" />}
                    </button>
                    <button
                      className={`settings-option ${viewMode === 'reading' ? 'active' : ''}`}
                      onClick={() => { setViewMode('reading'); setSettingsOpen(false); }}
                    >
                      <BookText size={14} />
                      Lesemodus
                      {viewMode === 'reading' && <Check size={13} className="settings-check" />}
                    </button>
                    <div className="settings-divider" />
                    <p className="settings-section-label">Design</p>
                    <button
                      className={`settings-option ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => { setTheme('dark'); setSettingsOpen(false); }}
                    >
                      <Moon size={14} />
                      Dunkel
                      {theme === 'dark' && <Check size={13} className="settings-check" />}
                    </button>
                    <button
                      className={`settings-option ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => { setTheme('light'); setSettingsOpen(false); }}
                    >
                      <Sun size={14} />
                      Hell
                      {theme === 'light' && <Check size={13} className="settings-check" />}
                    </button>
                    <button
                      className={`settings-option ${theme === 'sepia' ? 'active' : ''}`}
                      onClick={() => { setTheme('sepia'); setSettingsOpen(false); }}
                    >
                      <Book size={14} />
                      Sepia
                      {theme === 'sepia' && <Check size={13} className="settings-check" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {page === 'home' && (
        <div className="home-container">
          <HomeScreen
            onBibleOpen={() => setPage('bible')}
            onVideoSelect={handleVideoSelect}
          />
        </div>
      )}

      {page === 'bible' && <div className="main-container">

        {/* Left col: video player (desktop only — collapses when no video) */}
        <div className={`video-column ${currentVideo ? 'has-video' : ''}`}>
          {currentVideo ? (
            <VideoPlayer
              video={currentVideo}
              timestamp={currentTimestamp}
              endTime={currentClipEnd}
              onTimestampChange={setCurrentTimestamp}
              onClose={handleCloseVideo}
            />
          ) : null}
        </div>

        {/* Center col: Bible reader */}
        <div className="bible-column">
          <BibleViewer
            verse={selectedVerse}
            bibleText={bibleText}
            studyData={studyData}
            onVerseSelect={handleVerseSelect}
            onVideoSelect={handleVideoSelect}
            viewMode={viewMode}
            highlights={highlights}
            notes={notes}
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
          highlights={highlights}
          onHighlight={handleHighlight}
          notes={notes}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
        />
      </div>}

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
