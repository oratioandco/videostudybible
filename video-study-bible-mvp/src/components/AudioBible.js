import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  ChevronLeft, Sparkles, Send,
  Radio, Headphones, BookOpen, Mic2, Moon,
  AlignLeft, ArrowRight, Volume2, Church, FileText, Clock
} from 'lucide-react';
import './AudioBible.css';

// ── Simulated content library ────────────────────────────────────────────────

const AUDIOBIBEL_PLAYLISTS = [
  {
    id: 'gen',
    title: '1. Mose',
    subtitle: '50 Kapitel · Lutherbibel 2017',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
    chapters: 50,
  },
  {
    id: 'psalmen',
    title: 'Psalmen',
    subtitle: '150 Kapitel · Lutherbibel 2017',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    chapters: 150,
  },
  {
    id: 'johannes',
    title: 'Johannes',
    subtitle: '21 Kapitel · Lutherbibel 2017',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)',
    chapters: 21,
  },
  {
    id: 'roemer',
    title: 'Römer',
    subtitle: '16 Kapitel · Lutherbibel 2017',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #451a03 0%, #92400e 100%)',
    chapters: 16,
  },
  {
    id: 'lukas',
    title: 'Lukas',
    subtitle: '24 Kapitel · Lutherbibel 2017',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #500724 0%, #9d174d 100%)',
    chapters: 24,
  },
  {
    id: 'spr',
    title: 'Sprüche',
    subtitle: '31 Kapitel · Lutherbibel 2017',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #431407 0%, #9a3412 100%)',
    chapters: 31,
  },
];

const STREAMS = [
  {
    id: 'schlafpsalmen',
    title: 'Schlafpsalmen',
    subtitle: 'Ruhig gesprochene Psalmen für die Nacht',
    icon: Moon,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    live: false,
    duration: 'Loop',
  },
  {
    id: 'predigtstream',
    title: 'Predigtstream',
    subtitle: 'Aktuelle Predigten von BibleTV rund um die Uhr',
    icon: Radio,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #450a0a 0%, #991b1b 100%)',
    live: true,
    duration: 'Live',
  },
  {
    id: 'morgenandacht',
    title: 'Morgenandacht',
    subtitle: 'Täglich neu · 5 Minuten für den Start in den Tag',
    icon: Mic2,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #1c0500 0%, #78350f 100%)',
    live: false,
    duration: 'Tägl. neu',
  },
  {
    id: 'lobpreisradio',
    title: 'Lobpreis-Radio',
    subtitle: 'Zeitgenössische Worship-Musik aus christlichen Gemeinden',
    icon: Radio,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #022c22 0%, #065f46 100%)',
    live: true,
    duration: 'Live',
  },
];

const PODCASTS = [
  {
    id: 'bibelerklaert',
    title: 'Bibel erklärt',
    host: 'Christian Weghart',
    avatar: 'https://bibeltv.imgix.net/christian-weghart.jpg',
    episodes: 142,
    lastEp: 'Genesis 1 — Der Anfang aller Dinge',
    duration: '28 min',
    color: '#3b82f6',
  },
  {
    id: 'glaubensfragen',
    title: 'Glaubensfragen',
    host: 'Baylis Conley',
    avatar: 'https://bibeltv.imgix.net/baylis-conley.jpg',
    episodes: 87,
    lastEp: 'Kann ich Gott wirklich vertrauen?',
    duration: '34 min',
    color: '#8b5cf6',
  },
  {
    id: 'gnadenreich',
    title: 'Gnadenreich',
    host: 'Joseph Prince',
    avatar: 'https://bibeltv.imgix.net/joseph-prince.jpg',
    episodes: 211,
    lastEp: 'Die Gnade, die befreit',
    duration: '41 min',
    color: '#f59e0b',
  },
];

const CURATED_PLAYLISTS = [
  {
    id: 'sleep',
    title: 'Schlafen & Loslassen',
    subtitle: 'Psalmen · sanfte Worte · Nacht',
    tracks: 12,
    icon: '🌙',
    color: '#312e81',
  },
  {
    id: 'morgen',
    title: 'Morgenroutine',
    subtitle: 'Andachten · Lobpreis · Kraft',
    tracks: 8,
    icon: '🌅',
    color: '#78350f',
  },
  {
    id: 'hoffnung',
    title: 'Hoffnung in der Krise',
    subtitle: 'Trost · Klagelieder · Verheißung',
    tracks: 15,
    icon: '💙',
    color: '#1e3a5f',
  },
  {
    id: 'advent',
    title: 'Advent & Weihnachten',
    subtitle: 'Besinnlich · festlich · heilig',
    tracks: 24,
    icon: '✦',
    color: '#1a1a2e',
  },
];

const GOTTESDIENSTE = [
  {
    id: 'gs1',
    church: 'Christengemeinde Elim',
    location: 'Hamburg',
    title: 'Sonntagsgottesdienst',
    date: 'So., 23. Feb. · 10:00 Uhr',
    live: true,
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)',
    viewers: '1.2k',
  },
  {
    id: 'gs2',
    church: 'BibleTV Gemeinde',
    location: 'München',
    title: 'Lobpreis & Wort',
    date: 'So., 23. Feb. · 11:30 Uhr',
    live: false,
    gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
    viewers: null,
  },
  {
    id: 'gs3',
    church: 'Freie Christengemeinde',
    location: 'Stuttgart',
    title: 'Abendgottesdienst',
    date: 'So., 23. Feb. · 18:00 Uhr',
    live: false,
    gradient: 'linear-gradient(135deg, #451a03 0%, #92400e 100%)',
    viewers: null,
  },
  {
    id: 'gs4',
    church: 'Vineyard Köln',
    location: 'Köln',
    title: 'Sonntagsgottesdienst',
    date: 'So., 23. Feb. · 10:30 Uhr',
    live: true,
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
    viewers: '843',
  },
];

const ARTIKEL = [
  {
    id: 'a1',
    title: 'Was bedeutet Gnade wirklich?',
    category: 'Theologie',
    readTime: '6 min',
    author: 'Christian Weghart',
    avatar: 'https://bibeltv.imgix.net/christian-weghart.jpg',
    color: '#3b82f6',
    excerpt: 'Gnade ist mehr als nur Vergebung — sie ist Gottes aktive Zuwendung zu Menschen, die es nicht verdienen.',
  },
  {
    id: 'a2',
    title: 'Gebet in der Krise — was hilft?',
    category: 'Spiritualität',
    readTime: '4 min',
    author: 'Baylis Conley',
    avatar: 'https://bibeltv.imgix.net/baylis-conley.jpg',
    color: '#8b5cf6',
    excerpt: 'Wenn Worte fehlen und die Stille drückt, zeigt die Bibel erstaunliche Wege, wie Menschen mit Gott in Kontakt treten können.',
  },
  {
    id: 'a3',
    title: 'Die Schöpfung und die Wissenschaft',
    category: 'Glaube & Vernunft',
    readTime: '8 min',
    author: 'Redaktion BibleTV',
    avatar: null,
    color: '#10b981',
    excerpt: 'Genesis 1 und moderne Kosmologie — ein Widerspruch? Theologen und Wissenschaftler suchen nach Verbindungen.',
  },
  {
    id: 'a4',
    title: 'Vergebung: Für den anderen oder für mich?',
    category: 'Seelsorge',
    readTime: '5 min',
    author: 'Joseph Prince',
    avatar: 'https://bibeltv.imgix.net/joseph-prince.jpg',
    color: '#f59e0b',
    excerpt: 'Wer vergibt, befreit sich selbst. Aber was passiert, wenn der andere keine Reue zeigt?',
  },
];

// ── Simulated verse text for read-along (Genesis 1) ──────────────────────────

const GENESIS_1_VERSES = [
  { v: 1,  t: 0,   text: 'Am Anfang schuf Gott Himmel und Erde.' },
  { v: 2,  t: 10,  text: 'Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser.' },
  { v: 3,  t: 25,  text: 'Und Gott sprach: Es werde Licht! Und es ward Licht.' },
  { v: 4,  t: 36,  text: 'Und Gott sah, dass das Licht gut war. Da schied Gott das Licht von der Finsternis' },
  { v: 5,  t: 48,  text: 'und nannte das Licht Tag und die Finsternis Nacht. Da ward aus Abend und Morgen der erste Tag.' },
  { v: 6,  t: 62,  text: 'Und Gott sprach: Es werde eine Feste zwischen den Wassern, die da scheide zwischen Wassern und Wassern.' },
  { v: 7,  t: 76,  text: 'Da machte Gott die Feste und schied das Wasser unter der Feste von dem Wasser über der Feste. Und es geschah so.' },
  { v: 8,  t: 93,  text: 'Und Gott nannte die Feste Himmel. Da ward aus Abend und Morgen der zweite Tag.' },
  { v: 9,  t: 106, text: 'Und Gott sprach: Es sammle sich das Wasser unter dem Himmel an besondere Örter, dass man das Trockene sehe. Und es geschah so.' },
  { v: 10, t: 122, text: 'Und Gott nannte das Trockene Erde, und die Sammlung der Wasser nannte er Meer. Und Gott sah, dass es gut war.' },
  { v: 11, t: 138, text: 'Und Gott sprach: Es lasse die Erde aufgehen Gras und Kraut, das Samen bringe, und fruchtbare Bäume, da ein jeglicher nach seiner Art Früchte trage und seinen eigenen Samen habe auf Erden. Und es geschah so.' },
  { v: 12, t: 158, text: 'Und die Erde ließ aufgehen Gras und Kraut, das Samen brachte, ein jegliches nach seiner Art, und Bäume, die Früchte trugen und ihren eigenen Samen hatten, ein jeglicher nach seiner Art. Und Gott sah, dass es gut war.' },
  { v: 13, t: 180, text: 'Da ward aus Abend und Morgen der dritte Tag.' },
  { v: 14, t: 190, text: 'Und Gott sprach: Es werden Lichter an der Feste des Himmels, die da scheiden Tag und Nacht und geben Zeichen, Zeiten, Tage und Jahre.' },
  { v: 15, t: 206, text: 'und seien Lichter an der Feste des Himmels, dass sie scheinen auf Erden. Und es geschah so.' },
  { v: 16, t: 218, text: 'Und Gott machte zwei große Lichter: ein großes Licht, das den Tag regiere, und ein kleines Licht, das die Nacht regiere, dazu auch die Sterne.' },
  { v: 17, t: 234, text: 'Und Gott setzte sie an die Feste des Himmels, dass sie schienen auf die Erde' },
  { v: 18, t: 244, text: 'und den Tag und die Nacht regierten und schieden Licht und Finsternis. Und Gott sah, dass es gut war.' },
  { v: 19, t: 258, text: 'Da ward aus Abend und Morgen der vierte Tag.' },
  { v: 20, t: 268, text: 'Und Gott sprach: Es errege sich das Wasser mit webenden und lebendigen Tieren, und Gevögel fliege über der Erde unter der Feste des Himmels.' },
  { v: 21, t: 284, text: 'Und Gott schuf große Walfische und allerlei Tier, das da lebt und webt, davon das Wasser wimmelte, ein jegliches nach seiner Art, und allerlei gefiedertes Gevögel, ein jegliches nach seiner Art. Und Gott sah, dass es gut war.' },
  { v: 22, t: 305, text: 'Und Gott segnete sie und sprach: Seid fruchtbar und mehret euch und erfüllet das Wasser im Meer; und das Gevögel mehre sich auf Erden.' },
  { v: 23, t: 318, text: 'Da ward aus Abend und Morgen der fünfte Tag.' },
];

// AI chat responses
const AI_RESPONSES = [
  'In Genesis 1 entfaltet sich die Schöpfungserzählung als Hymnus – nicht als wissenschaftlicher Bericht, sondern als poetische Proklamation: Gott ist Schöpfer, und seine Schöpfung ist „sehr gut".',
  'Das hebräische Wort „bara" (schaffen) wird im Alten Testament ausschließlich für Gottes Handeln verwendet – nie für menschliches Schaffen. Es geht um etwas grundlegend Neues, das nur Gott hervorbringen kann.',
  'Die Wiederholung „Und Gott sah, dass es gut war" ist eine theologische Aussage: Die Welt, wie sie geschaffen wurde, ist grundlegend gut. Sünde und Leid kamen hinzu, sind aber nicht das letzte Wort.',
  'Der siebte Tag wird nicht mit „und es war Abend und Morgen" abgeschlossen. Viele Ausleger sehen darin einen Hinweis: Die Ruhe Gottes ist nicht abgeschlossen, sie dauert an.',
];
let aiIdx = 0;

const SIMULATED_DURATION = 324;

// ── Audio player hook ────────────────────────────────────────────────────────

function useAudioPlayer(duration) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(t => {
          if (t >= duration) { setIsPlaying(false); return duration; }
          return t + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, duration]);

  const togglePlay = () => setIsPlaying(p => !p);
  const seek = (s) => setCurrentTime(Math.max(0, Math.min(s, duration)));
  const skipBack = () => seek(currentTime - 15);
  const skipForward = () => seek(currentTime + 30);
  const reset = () => { setCurrentTime(0); setIsPlaying(false); };

  return { isPlaying, currentTime, togglePlay, seek, skipBack, skipForward, reset };
}

function formatTime(s) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

// ── Shared section header ────────────────────────────────────────────────────

function SectionHeader({ label, icon: Icon, color, showAll }) {
  return (
    <div className="topic-row-header">
      <div className="topic-row-label" style={{ '--topic-color': color || 'var(--text-primary)' }}>
        {Icon && <Icon size={15} />}
        <span>{label}</span>
      </div>
      {showAll && (
        <button className="topic-row-more">Alle <ArrowRight size={13} /></button>
      )}
    </div>
  );
}

// ── Audiobibel playlist cards (horizontal scroll) ────────────────────────────

function AudiobookCard({ book, onPlay }) {
  return (
    <div className="audio-book-card" onClick={() => onPlay(book)}>
      <div className="audio-book-cover" style={{ background: book.gradient }}>
        <BookOpen size={28} className="audio-book-icon" />
        <div className="audio-book-play-overlay">
          <Play size={18} fill="white" />
        </div>
      </div>
      <p className="audio-book-title">{book.title}</p>
      <p className="audio-book-sub">{book.chapters} Kap.</p>
    </div>
  );
}

// ── Stream / Radio cards ─────────────────────────────────────────────────────

function StreamCard({ stream, onPlay }) {
  const Icon = stream.icon;
  return (
    <div className="stream-card" onClick={() => onPlay(stream)}>
      <div className="stream-card-visual" style={{ background: stream.gradient }}>
        <Icon size={22} className="stream-card-icon" />
        {stream.live && <span className="stream-live-badge">LIVE</span>}
      </div>
      <div className="stream-card-info">
        <p className="stream-card-title">{stream.title}</p>
        <p className="stream-card-sub">{stream.subtitle}</p>
      </div>
      <div className="stream-card-right">
        <span className="stream-card-duration">{stream.duration}</span>
        <button className="stream-play-btn" aria-label="Abspielen">
          <Play size={14} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}

// ── Curated playlist cards ───────────────────────────────────────────────────

function CuratedCard({ playlist, onPlay }) {
  return (
    <div className="curated-card" onClick={() => onPlay(playlist)}>
      <div className="curated-card-art" style={{ background: playlist.color }}>
        <span className="curated-card-emoji">{playlist.icon}</span>
      </div>
      <p className="curated-card-title">{playlist.title}</p>
      <p className="curated-card-sub">{playlist.subtitle}</p>
    </div>
  );
}

// ── Gottesdienst cards ────────────────────────────────────────────────────────

function GottesdiensteCard({ service, onPlay }) {
  return (
    <div className="gottesdienst-card" onClick={() => onPlay(service)}>
      <div className="gottesdienst-card-visual" style={{ background: service.gradient }}>
        <Church size={22} className="gottesdienst-card-icon" />
        {service.live && <span className="stream-live-badge">LIVE</span>}
      </div>
      <div className="gottesdienst-card-info">
        <div className="gottesdienst-card-top">
          <p className="gottesdienst-card-church">{service.church}</p>
          {service.live && service.viewers && (
            <span className="gottesdienst-viewers">{service.viewers} schauen</span>
          )}
        </div>
        <p className="gottesdienst-card-title">{service.title}</p>
        <p className="gottesdienst-card-meta">{service.location} · {service.date}</p>
      </div>
      <button className="stream-play-btn" aria-label="Ansehen">
        <Play size={14} fill="currentColor" />
      </button>
    </div>
  );
}

// ── Artikel cards ────────────────────────────────────────────────────────────

function ArtikelCard({ article }) {
  return (
    <div className="artikel-card">
      <div className="artikel-card-accent" style={{ background: article.color }} />
      <div className="artikel-card-body">
        <div className="artikel-card-top">
          <span className="artikel-card-category">{article.category}</span>
          <span className="artikel-card-readtime"><Clock size={11} /> {article.readTime}</span>
        </div>
        <p className="artikel-card-title">{article.title}</p>
        <p className="artikel-card-excerpt">{article.excerpt}</p>
        <p className="artikel-card-author">
          {article.avatar && (
            <img
              src={article.avatar}
              alt={article.author}
              className="artikel-card-avatar"
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}
          <span>{article.author}</span>
        </p>
      </div>
    </div>
  );
}

// ── Podcast cards ────────────────────────────────────────────────────────────

function PodcastCard({ podcast, onPlay }) {
  return (
    <div className="podcast-card" onClick={() => onPlay(podcast)}>
      <div className="podcast-card-avatar" style={{ borderColor: podcast.color }}>
        <img
          src={podcast.avatar}
          alt={podcast.host}
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>
      <div className="podcast-card-info">
        <p className="podcast-card-title">{podcast.title}</p>
        <p className="podcast-card-host">{podcast.host}</p>
        <p className="podcast-card-ep">{podcast.lastEp}</p>
        <p className="podcast-card-meta">{podcast.duration} · {podcast.episodes} Folgen</p>
      </div>
      <button className="podcast-play-btn" aria-label="Abspielen" style={{ background: podcast.color }}>
        <Play size={14} fill="white" />
      </button>
    </div>
  );
}

// ── Mini player bar ──────────────────────────────────────────────────────────

function MiniPlayer({ item, isPlaying, currentTime, duration, onToggle, onSkipBack, onSkipForward, onExpand }) {
  const progress = (currentTime / duration) * 100;
  return (
    <div className="audio-mini-player">
      <div className="mini-player-progress-track">
        <div className="mini-player-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="mini-player-body">
        <div className="mini-player-info" onClick={onExpand}>
          <div className="mini-player-thumb" style={{ background: item?.gradient || 'var(--accent-action)' }}>
            <Headphones size={12} />
          </div>
          <div className="mini-player-text">
            <span className="mini-player-title">{item?.title || 'Audiobibel'}</span>
            <span className="mini-player-sub">{item?.subtitle || formatTime(currentTime)}</span>
          </div>
        </div>
        <div className="mini-player-controls">
          <button className="mini-ctrl-btn" onClick={onSkipBack} aria-label="−15s"><SkipBack size={16} /></button>
          <button className="mini-ctrl-btn mini-ctrl-play" onClick={onToggle} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
          <button className="mini-ctrl-btn" onClick={onSkipForward} aria-label="+30s"><SkipForward size={16} /></button>
        </div>
      </div>
    </div>
  );
}

// ── Expanded player modal ────────────────────────────────────────────────────

function ExpandedPlayer({ item, isPlaying, currentTime, duration, onToggle, onSkipBack, onSkipForward, onClose, onSeek }) {
  const progress = currentTime / duration;
  const [activeTab, setActiveTab] = useState('readalong');

  const activeIndex = GENESIS_1_VERSES.reduce((best, verse, i) => {
    return verse.t <= currentTime ? i : best;
  }, 0);
  const verseRefs = useRef([]);
  useEffect(() => {
    verseRefs.current[activeIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIndex]);

  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Ich begleite dich durch ${item?.title || '1. Mose'} Kapitel 1. Was möchtest du verstehen oder vertiefen?` },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, chatLoading]);

  const sendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 700));
    setMessages(prev => [...prev, { role: 'assistant', text: AI_RESPONSES[aiIdx++ % AI_RESPONSES.length] }]);
    setChatLoading(false);
  };

  const handleBarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onSeek(Math.round(((e.clientX - rect.left) / rect.width) * duration));
  };

  return (
    <div className="expanded-player-backdrop" onClick={onClose}>
      <div className="expanded-player" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="expanded-player-header">
          <button className="expanded-player-close" onClick={onClose}>
            <ChevronLeft size={22} />
          </button>
          <div className="expanded-player-title-row">
            <span className="expanded-player-label">{item?.title || 'Audiobibel'}</span>
            <span className="expanded-player-sublabel">Kapitel 1 · Lutherbibel 2017</span>
          </div>
          <div style={{ width: 34 }} />
        </div>

        {/* Cover art */}
        <div className="expanded-player-cover" style={{ background: item?.gradient || 'var(--accent-action)' }}>
          <BookOpen size={48} className="expanded-cover-icon" />
        </div>

        {/* Progress bar */}
        <div className="expanded-progress" onClick={handleBarClick}>
          <div className="expanded-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="expanded-time-row">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="expanded-controls">
          <button className="exp-ctrl-btn exp-ctrl-skip" onClick={onSkipBack}>
            <SkipBack size={22} />
            <span className="exp-skip-label">15</span>
          </button>
          <button className="exp-ctrl-btn exp-ctrl-play" onClick={onToggle}>
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
          </button>
          <button className="exp-ctrl-btn exp-ctrl-skip" onClick={onSkipForward}>
            <SkipForward size={22} />
            <span className="exp-skip-label">30</span>
          </button>
        </div>

        {/* Tabs: Mitlesen / KI-Chat */}
        <div className="expanded-tabs">
          <button className={`expanded-tab ${activeTab === 'readalong' ? 'active' : ''}`} onClick={() => setActiveTab('readalong')}>
            <AlignLeft size={13} /> Mitlesen
          </button>
          <button className={`expanded-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
            <Sparkles size={13} /> KI-Chat
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'readalong' && (
          <div className="expanded-readalong">
            {GENESIS_1_VERSES.map((verse, i) => (
              <span
                key={verse.v}
                ref={el => { verseRefs.current[i] = el; }}
                className={`read-along-verse ${i === activeIndex ? 'active' : ''}`}
                onClick={() => onSeek(verse.t)}
              >
                <sup className="read-along-num">{verse.v}</sup>
                {verse.text}{' '}
              </span>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="expanded-chat">
            <div className="expanded-chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`ai-chat-bubble ${m.role}`}>{m.text}</div>
              ))}
              {chatLoading && (
                <div className="ai-chat-bubble assistant ai-chat-thinking">
                  <span className="mood-loading-dot" /><span className="mood-loading-dot" /><span className="mood-loading-dot" />
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="ai-chat-composer">
              <textarea
                className="ai-chat-input"
                placeholder="Frage stellen…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                rows={1}
              />
              <button className="ai-chat-send" onClick={sendMessage} disabled={!chatInput.trim() || chatLoading}>
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main AudioBible page ─────────────────────────────────────────────────────

function AudioBible() {
  const [nowPlaying, setNowPlaying] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const { isPlaying, currentTime, togglePlay, seek, skipBack, skipForward, reset } = useAudioPlayer(SIMULATED_DURATION);

  const play = (item) => {
    setNowPlaying(item);
    reset();
    setTimeout(() => togglePlay(), 50);
  };

  return (
    <div className="audio-page">
      {/* ── Hero ── */}
      <div className="audio-hero">
        <Headphones size={28} className="audio-hero-icon" />
        <div>
          <h2 className="audio-hero-title">Hören</h2>
          <p className="audio-hero-sub">Hörbibel · Radio · Podcasts · Gottesdienste · Artikel</p>
        </div>
      </div>

      {/* ── Hörbibel ── */}
      <section className="home-section">
        <SectionHeader label="Hörbibel" icon={BookOpen} color="#3b82f6" showAll />
        <div className="audio-books-scroll">
          {AUDIOBIBEL_PLAYLISTS.map(book => (
            <AudiobookCard key={book.id} book={book} onPlay={play} />
          ))}
        </div>
      </section>

      {/* ── Kuratierte Playlists ── */}
      <section className="home-section">
        <SectionHeader label="Playlists" icon={Volume2} color="#8b5cf6" showAll />
        <div className="audio-books-scroll">
          {CURATED_PLAYLISTS.map(pl => (
            <CuratedCard key={pl.id} playlist={pl} onPlay={play} />
          ))}
        </div>
      </section>

      {/* ── Radio & Streams ── */}
      <section className="home-section">
        <SectionHeader label="Radio & Streams" icon={Radio} color="#ef4444" showAll />
        <div className="streams-list">
          {STREAMS.map(s => (
            <StreamCard key={s.id} stream={s} onPlay={play} />
          ))}
        </div>
      </section>

      {/* ── Podcasts ── */}
      <section className="home-section">
        <SectionHeader label="Podcasts" icon={Mic2} color="#f59e0b" showAll />
        <div className="podcasts-list">
          {PODCASTS.map(p => (
            <PodcastCard key={p.id} podcast={p} onPlay={play} />
          ))}
        </div>
      </section>

      {/* ── Gottesdienste ── */}
      <section className="home-section">
        <SectionHeader label="Gottesdienste" icon={Church} color="#6366f1" showAll />
        <div className="streams-list">
          {GOTTESDIENSTE.map(s => (
            <GottesdiensteCard key={s.id} service={s} onPlay={play} />
          ))}
        </div>
      </section>

      {/* ── Artikel ── */}
      <section className="home-section">
        <SectionHeader label="Artikel" icon={FileText} color="#10b981" showAll />
        <div className="artikel-list">
          {ARTIKEL.map(a => (
            <ArtikelCard key={a.id} article={a} />
          ))}
        </div>
      </section>

      {/* ── Mini player (persistent bottom bar when something is playing) ── */}
      {nowPlaying && (
        <MiniPlayer
          item={nowPlaying}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={SIMULATED_DURATION}
          onToggle={togglePlay}
          onSkipBack={skipBack}
          onSkipForward={skipForward}
          onExpand={() => setExpanded(true)}
        />
      )}

      {/* ── Expanded player modal ── */}
      {expanded && nowPlaying && (
        <ExpandedPlayer
          item={nowPlaying}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={SIMULATED_DURATION}
          onToggle={togglePlay}
          onSkipBack={skipBack}
          onSkipForward={skipForward}
          onSeek={seek}
          onClose={() => setExpanded(false)}
        />
      )}
    </div>
  );
}

export default AudioBible;
