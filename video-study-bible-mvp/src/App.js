import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import BibleViewer, { TranslationSwitcher } from './components/BibleViewer';
import VideoPlayer from './components/VideoPlayer';
import VerseDetailPanel from './components/VerseDetailPanel';
import NotesChatPanel from './components/NotesChatPanel';
import HomeScreen from './components/HomeScreen';
import AudioBible from './components/AudioBible';
import { Book, Play, Sun, Moon, BookOpen, BookText, Home, Headphones } from 'lucide-react';

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
  const [selectedVerse, setSelectedVerse] = useState('Genesis 1:1');
  const [selectedVerseText, setSelectedVerseText] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [currentClipEnd, setCurrentClipEnd] = useState(null);
  const [bibleText, setBibleText] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTranslation, setSelectedTranslation] = useState(DEFAULT_TRANSLATION);
  const [highlights, setHighlights] = useState({
    'Genesis 1:1':  'yellow',
    'Genesis 1:3':  'green',
    'Genesis 1:5':  'blue',
    'Genesis 1:10': 'purple',
    'Genesis 1:14': 'yellow',
    'Genesis 1:26': 'green',
    'Genesis 1:27': 'blue',
    'Genesis 1:31': 'purple',
  });
  const [notes, setNotes] = useState({
    'Genesis 1:1': [
      { id: 'demo-1', text: 'Der Anfang aller Dinge — „bara" (schaffen) beschreibt ein souveränes Handeln Gottes, das kein Vorbild braucht.' },
    ],
    'Genesis 1:3': [
      { id: 'demo-2', text: 'Licht vor Sonne und Mond — ein Hinweis darauf, dass Gott selbst die Quelle des Lichts ist (vgl. Offb 22:5).' },
    ],
    'Genesis 1:27': [
      { id: 'demo-3', text: 'Imago Dei: Mann und Frau gemeinsam spiegeln das Bild Gottes wider. Einzigartiger Würdebegriff im antiken Kontext.' },
      { id: 'demo-4', text: 'Vergleich mit dem babylonischen Schöpfungsmythos Enuma Elisch: dort ist der Mensch Sklave der Götter — hier Ebenbild.' },
    ],
  });
  const [page, setPage] = useState('home'); // 'home' | 'bible' | 'audio'
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const sessionUUIDRef = useRef(null);
  const homeContainerRef = useRef(null);

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
    // Auto-open notes panel on desktop (≥1200px)
    if (window.innerWidth >= 1200) {
      setIsNotesPanelOpen(true);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setIsNotesPanelOpen(false);
  };

  const handleOpenNotesPanel = () => {
    setIsNotesPanelOpen(true);
  };

  const handleCloseNotesPanel = () => {
    setIsNotesPanelOpen(false);
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

  const handleSaveChatAsNote = (verseRef, content) => {
    if (!content || !verseRef) return;
    handleAddNote(verseRef, {
      id: Date.now().toString(),
      text: `[Aus KI-Chat] ${content}`,
      createdAt: new Date().toISOString(),
    });
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
              onClick={() => { setPage('home'); setTimeout(() => homeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 0); }}
            >
              <Home size={14} />
              <span>Home</span>
            </button>
            <button
              className={`page-nav-btn ${page === 'audio' ? 'active' : ''}`}
              onClick={() => setPage('audio')}
            >
              <Headphones size={14} />
              <span>Hören</span>
            </button>
            <button
              className={`page-nav-btn ${page === 'bible' ? 'active' : ''}`}
              onClick={() => setPage('bible')}
            >
              <BookOpen size={14} />
              <span>Bibel</span>
            </button>
          </nav>
          <div className="header-right">
            {page === 'bible' && (
              <TranslationSwitcher
                selected={selectedTranslation}
                onChange={setSelectedTranslation}
              />
            )}

            {/* Mode toggle: Studienmodus / Lesemodus — only in Bibel */}
            {page === 'bible' && (
            <div className="view-toggle" aria-label="Anzeigemodus">
              <button
                className={`view-toggle-btn ${viewMode === 'study' ? 'active' : ''}`}
                onClick={() => setViewMode('study')}
                title="Studienmodus"
              >
                <BookOpen size={14} />
                <span>Studie</span>
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'reading' ? 'active' : ''}`}
                onClick={() => setViewMode('reading')}
                title="Lesemodus"
              >
                <BookText size={14} />
                <span>Lesen</span>
              </button>
            </div>
            )}

            {/* Theme toggle: Dunkel / Hell / Sepia */}
            <div className="view-toggle" aria-label="Farbschema">
              <button
                className={`view-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
                title="Dunkles Design"
              >
                <Moon size={14} />
              </button>
              <button
                className={`view-toggle-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
                title="Helles Design"
              >
                <Sun size={14} />
              </button>
              <button
                className={`view-toggle-btn ${theme === 'sepia' ? 'active' : ''}`}
                onClick={() => setTheme('sepia')}
                title="Sepia-Design"
              >
                <Book size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {page === 'home' && (
        <div className="home-container" ref={homeContainerRef}>
          <HomeScreen
            onBibleOpen={() => setPage('bible')}
            onVideoSelect={handleVideoSelect}
            onAudioOpen={() => setPage('audio')}
          />
        </div>
      )}

      {page === 'audio' && (
        <div className="home-container">
          <AudioBible />
        </div>
      )}

      {page === 'bible' && <div className="main-container">

        {/* Left col: Video player (when active) + Detail panel stacked vertically */}
        <div className={`left-column ${currentVideo ? 'has-video' : ''}`}>
          {currentVideo && (
            <div className="video-player-wrapper">
              <VideoPlayer
                video={currentVideo}
                timestamp={currentTimestamp}
                endTime={currentClipEnd}
                onTimestampChange={setCurrentTimestamp}
                onClose={handleCloseVideo}
              />
            </div>
          )}
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
            onOpenNotesPanel={handleOpenNotesPanel}
          />
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

        {/* Far right col: Notes/Chat panel (desktop only) */}
        <NotesChatPanel
          isOpen={isNotesPanelOpen && isDetailOpen}
          verseRef={selectedVerse}
          studyData={studyData}
          onClose={handleCloseNotesPanel}
          highlights={highlights}
          onHighlight={handleHighlight}
          notes={notes}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onSaveChatAsNote={handleSaveChatAsNote}
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
