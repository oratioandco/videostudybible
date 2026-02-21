import React, { useState, useRef } from 'react';
import { Play, BookOpen, ChevronRight, Flame, Heart, Anchor, Sunrise, Users, Leaf, Star, ArrowRight, Sparkles, Send, BookMarked, CheckCircle2, Circle, Headphones, CalendarDays } from 'lucide-react';
import './HomeScreen.css';

// ── Simulated data ───────────────────────────────────────────────────────────

// ── Kirchenjahr ──────────────────────────────────────────────────────────────
// Manually curated for the current liturgical season.
// In a real app this would be fetched from a Kirchenjahr API.
const KIRCHENJAHR = {
  sonntag: '7. Sonntag nach Epiphanias',
  datum: '22. Februar 2026',
  saison: 'Epiphanias',
  farbe: '#2e7d32',        // liturgisches Grün
  farbeHell: '#43a047',
  predigttext: 'Lukas 6,27–38',
  predigttextKurz: 'Lk 6,27–38',
  thema: 'Liebet eure Feinde',
  wochenspruch: 'Seid barmherzig, wie auch euer Vater barmherzig ist.',
  wochenspruchRef: 'Lukas 6,36',
};

const VERSE_OF_DAY = {
  ref: 'Jeremia 29:11',
  text: 'Denn ich weiß wohl, was ich für Gedanken über euch habe, spricht der HERR: Gedanken des Friedens und nicht des Leides, euch eine Zukunft und eine Hoffnung zu geben.',
  clips: 3,
};

const DAILY_REFLECTION = {
  text: 'Gottes Gedanken für unser Leben sind Gedanken des Friedens – auch wenn wir die Umstände nicht verstehen. Dieses Versprechen wurde an ein Volk in der Verbannung gegeben, und doch trägt es eine universelle Wahrheit: In jeder Situation hält Gott die Zukunft in seinen Händen. Vertrauen heißt nicht, alles zu verstehen, sondern zu wissen, wer führt.',
  source: 'KI-Reflexion',
};

const SERMON_OF_DAY = {
  title: 'Geschaffen nach dem Bild Gottes',
  speaker: 'Christian Weghart',
  speaker_avatar: 'https://bibeltv.imgix.net/christian-weghart.jpg',
  duration: '42 min',
  verse: 'Genesis 1:26',
  video_file: 'Geschaffen_nach_dem_Bild_Gottes_332835.mp4',
  description: 'Was bedeutet es, als Ebenbild Gottes erschaffen zu sein? Eine tiefe Betrachtung über Würde, Berufung und unsere Beziehung zu Gott.',
  category: 'Schöpfung',
};

const READING_PLANS = {
  active: {
    id: 'biz',
    title: 'Bibel in einem Jahr',
    day: 52,
    total: 365,
    todayRef: '2. Mose 3–4',
    todayDone: false,
    color: '#3b82f6',
  },
  catalog: [
    {
      id: 'liturgisch',
      title: 'Liturgischer Kalender',
      subtitle: 'Kirchenjahr 2026',
      duration: 'Ganzjährig',
      icon: '✦',
      color: '#8b5cf6',
    },
    {
      id: 'thematisch',
      title: 'Thematisch: Glaube & Zweifel',
      subtitle: '8 Wochen · 56 Texte',
      duration: '8 Wochen',
      icon: '⚓',
      color: '#f59e0b',
    },
    {
      id: 'psalmen',
      title: 'Die Psalmen',
      subtitle: '150 Psalmen in 30 Tagen',
      duration: '30 Tage',
      icon: '♪',
      color: '#10b981',
    },
    {
      id: 'evangelien',
      title: 'Die vier Evangelien',
      subtitle: 'Jesus in seinem Leben & Wirken',
      duration: '6 Wochen',
      icon: '✝',
      color: '#ec4899',
    },
  ],
};

const TOPIC_ROWS = [
  {
    id: 'encouragement',
    icon: Flame,
    label: 'Ermutigung',
    color: '#f59e0b',
    clips: [
      { title: 'Gottes Kraft in der Schwachheit', speaker: 'Joseph Prince', speaker_avatar: 'https://bibeltv.imgix.net/joseph-prince.jpg', duration: '4:32', verse: '2. Kor 12:9', video_file: 'Schließ_Gottes_Kraft_auf_Bitte_so_wird_dir_gegeben_331446.mp4' },
      { title: 'Du bist nicht allein', speaker: 'Baylis Conley', speaker_avatar: 'https://bibeltv.imgix.net/baylis-conley.jpg', duration: '6:15', verse: 'Psalm 23:4', video_file: 'Arbeit_selbst_Gott_arbeitet_303178.mp4' },
      { title: 'Gott hält sein Wort', speaker: 'Christian Weghart', speaker_avatar: 'https://bibeltv.imgix.net/christian-weghart.jpg', duration: '5:44', verse: 'Jesaja 40:31', video_file: 'Im_Anfang_schuf_Gott_die_Himmel_und_die_Erde_332830.mp4' },
      { title: 'Freude als Kraft', speaker: 'Joseph Prince', speaker_avatar: 'https://bibeltv.imgix.net/joseph-prince.jpg', duration: '3:58', verse: 'Nehemia 8:10', video_file: 'Findings_Labora_5_344158.mp4' },
      { title: 'Schluss mit der Angst', speaker: 'Baylis Conley', speaker_avatar: 'https://bibeltv.imgix.net/baylis-conley.jpg', duration: '7:20', verse: 'Philipper 4:6', video_file: 'Arbeit_selbst_Gott_arbeitet_303178.mp4' },
    ],
  },
  {
    id: 'grief',
    icon: Heart,
    label: 'Trost & Trauer',
    color: '#8b5cf6',
    clips: [
      { title: 'Gott weint mit uns', speaker: 'Christian Weghart', speaker_avatar: 'https://bibeltv.imgix.net/christian-weghart.jpg', duration: '5:10', verse: 'Johannes 11:35', video_file: 'Geschaffen_nach_dem_Bild_Gottes_332835.mp4' },
      { title: 'Der Gott des Trostes', speaker: 'Baylis Conley', speaker_avatar: 'https://bibeltv.imgix.net/baylis-conley.jpg', duration: '8:02', verse: '2. Kor 1:3', video_file: 'Arbeit_selbst_Gott_arbeitet_303178.mp4' },
      { title: 'Hoffnung im Dunkel', speaker: 'Joseph Prince', speaker_avatar: 'https://bibeltv.imgix.net/joseph-prince.jpg', duration: '6:30', verse: 'Psalm 34:19', video_file: 'Schließ_Gottes_Kraft_auf_Bitte_so_wird_dir_gegeben_331446.mp4' },
      { title: 'Warum lässt Gott das zu?', speaker: 'Christian Weghart', speaker_avatar: 'https://bibeltv.imgix.net/christian-weghart.jpg', duration: '9:15', verse: 'Römer 8:28', video_file: 'Im_Anfang_schuf_Gott_die_Himmel_und_die_Erde_332830.mp4' },
    ],
  },
  {
    id: 'faith',
    icon: Anchor,
    label: 'Glaube & Vertrauen',
    color: '#3b82f6',
    clips: [
      { title: 'Was ist Glaube?', speaker: 'Baylis Conley', speaker_avatar: 'https://bibeltv.imgix.net/baylis-conley.jpg', duration: '5:55', verse: 'Hebräer 11:1', video_file: 'Arbeit_selbst_Gott_arbeitet_303178.mp4' },
      { title: 'Wenn der Glaube wackelt', speaker: 'Joseph Prince', speaker_avatar: 'https://bibeltv.imgix.net/joseph-prince.jpg', duration: '4:40', verse: 'Markus 9:24', video_file: 'Findings_Labora_5_344158.mp4' },
      { title: 'Gott vertrauen ohne zu verstehen', speaker: 'Christian Weghart', speaker_avatar: 'https://bibeltv.imgix.net/christian-weghart.jpg', duration: '6:18', verse: 'Sprüche 3:5', video_file: 'Glaubenskunde_Schöpfung_Sechs_Tage_oder_Milliarden_Jahre_331326.mp4' },
      { title: 'Glaubenshelden', speaker: 'Baylis Conley', speaker_avatar: 'https://bibeltv.imgix.net/baylis-conley.jpg', duration: '7:45', verse: 'Hebräer 11', video_file: 'Arbeit_selbst_Gott_arbeitet_303178.mp4' },
      { title: 'Bete und vertrau', speaker: 'Joseph Prince', speaker_avatar: 'https://bibeltv.imgix.net/joseph-prince.jpg', duration: '5:02', verse: 'Matthäus 7:7', video_file: 'Schließ_Gottes_Kraft_auf_Bitte_so_wird_dir_gegeben_331446.mp4' },
    ],
  },
  {
    id: 'identity',
    icon: Star,
    label: 'Identität in Christus',
    color: '#ec4899',
    clips: [
      { title: 'Du bist geliebt — bedingungslos', speaker: 'Joseph Prince', speaker_avatar: 'https://bibeltv.imgix.net/joseph-prince.jpg', duration: '6:50', verse: 'Römer 8:38', video_file: 'Schließ_Gottes_Kraft_auf_Bitte_so_wird_dir_gegeben_331446.mp4' },
      { title: 'Neu erschaffen in Christus', speaker: 'Christian Weghart', speaker_avatar: 'https://bibeltv.imgix.net/christian-weghart.jpg', duration: '5:22', verse: '2. Kor 5:17', video_file: 'Geschaffen_nach_dem_Bild_Gottes_332835.mp4' },
      { title: 'Das Ebenbild Gottes', speaker: 'Christian Weghart', speaker_avatar: 'https://bibeltv.imgix.net/christian-weghart.jpg', duration: '8:11', verse: 'Genesis 1:27', video_file: 'Im_Anfang_schuf_Gott_die_Himmel_und_die_Erde_332830.mp4' },
      { title: 'Kinder Gottes', speaker: 'Baylis Conley', speaker_avatar: 'https://bibeltv.imgix.net/baylis-conley.jpg', duration: '4:55', verse: '1. Johannes 3:1', video_file: 'Arbeit_selbst_Gott_arbeitet_303178.mp4' },
    ],
  },
  {
    id: 'creation',
    icon: Leaf,
    label: 'Schöpfung & Anfang',
    color: '#10b981',
    clips: [
      { title: 'Im Anfang schuf Gott', speaker: 'Christian Weghart', speaker_avatar: 'https://bibeltv.imgix.net/christian-weghart.jpg', duration: '7:30', verse: 'Genesis 1:1', video_file: 'Im_Anfang_schuf_Gott_die_Himmel_und_die_Erde_332830.mp4' },
      { title: 'Sechs Tage oder Milliarden Jahre?', speaker: null, duration: '10:05', verse: 'Genesis 1', video_file: 'Glaubenskunde_Schöpfung_Sechs_Tage_oder_Milliarden_Jahre_331326.mp4' },
      { title: 'Ora et Labora — Beten und Arbeiten', speaker: null, duration: '5:18', verse: 'Genesis 2:15', video_file: 'Findings_Labora_5_344158.mp4' },
      { title: 'Gottes Auftrag für die Erde', speaker: 'Baylis Conley', speaker_avatar: 'https://bibeltv.imgix.net/baylis-conley.jpg', duration: '6:40', verse: 'Genesis 1:28', video_file: 'Arbeit_selbst_Gott_arbeitet_303178.mp4' },
    ],
  },
  {
    id: 'morning',
    icon: Sunrise,
    label: 'Morgenimpulse',
    color: '#f97316',
    clips: [
      { title: 'Jeden Morgen neu', speaker: 'Baylis Conley', speaker_avatar: 'https://bibeltv.imgix.net/baylis-conley.jpg', duration: '3:12', verse: 'Klagelieder 3:23', video_file: 'Arbeit_selbst_Gott_arbeitet_303178.mp4' },
      { title: 'Starte den Tag mit Gott', speaker: 'Joseph Prince', speaker_avatar: 'https://bibeltv.imgix.net/joseph-prince.jpg', duration: '2:55', verse: 'Psalm 5:4', video_file: 'Findings_Labora_5_344158.mp4' },
      { title: 'Gnade für heute', speaker: 'Joseph Prince', speaker_avatar: 'https://bibeltv.imgix.net/joseph-prince.jpg', duration: '4:08', verse: '2. Kor 12:9', video_file: 'Schließ_Gottes_Kraft_auf_Bitte_so_wird_dir_gegeben_331446.mp4' },
      { title: 'Dankbarkeit als Lebenshaltung', speaker: 'Christian Weghart', speaker_avatar: 'https://bibeltv.imgix.net/christian-weghart.jpg', duration: '3:44', verse: '1. Thess 5:18', video_file: 'Im_Anfang_schuf_Gott_die_Himmel_und_die_Erde_332830.mp4' },
      { title: 'Gottes Gegenwart suchen', speaker: 'Baylis Conley', speaker_avatar: 'https://bibeltv.imgix.net/baylis-conley.jpg', duration: '5:01', verse: 'Psalm 27:4', video_file: 'Arbeit_selbst_Gott_arbeitet_303178.mp4' },
    ],
  },
];

const SPEAKERS = [
  { name: 'Christian Weghart', avatar: 'https://bibeltv.imgix.net/christian-weghart.jpg', role: 'Bibellehrer', clips: 47 },
  { name: 'Joseph Prince', avatar: 'https://bibeltv.imgix.net/joseph-prince.jpg', role: 'Pastor, Singapur', clips: 38 },
  { name: 'Baylis Conley', avatar: 'https://bibeltv.imgix.net/baylis-conley.jpg', role: 'Pastor & Autor', clips: 29 },
  { name: 'Christengemeinde Elim', avatar: null, role: 'Hamburg', clips: 22 },
];

// Simulated AI search results based on mood keywords
const AI_SEARCH_SUGGESTIONS = [
  { label: 'Angst & Sorge', icon: '😔' },
  { label: 'Dankbarkeit', icon: '🙏' },
  { label: 'Trauer', icon: '💙' },
  { label: 'Zweifel', icon: '🤔' },
  { label: 'Hoffnung', icon: '✨' },
  { label: 'Kraft', icon: '💪' },
];

// ── Sub-components ──────────────────────────────────────────────────────────

function KirchenjahrBanner({ kj, onBibleOpen }) {
  return (
    <div className="kirchenjahr-banner" style={{ '--kj-color': kj.farbe, '--kj-color-hell': kj.farbeHell }}>
      <div className="kirchenjahr-season-bar" />
      <div className="kirchenjahr-body">
        <div className="kirchenjahr-top">
          <div className="kirchenjahr-label">
            <CalendarDays size={12} />
            <span>Kirchenjahr</span>
          </div>
          <span className="kirchenjahr-datum">{kj.datum}</span>
        </div>
        <p className="kirchenjahr-sonntag">{kj.sonntag}</p>
        <p className="kirchenjahr-thema">{kj.thema}</p>
        <div className="kirchenjahr-wochenspruch">
          <span className="kirchenjahr-wochenspruch-text">„{kj.wochenspruch}"</span>
          <span className="kirchenjahr-wochenspruch-ref">{kj.wochenspruchRef}</span>
        </div>
        <button className="kirchenjahr-cta" onClick={onBibleOpen}>
          <BookOpen size={12} />
          Predigttext: {kj.predigttextKurz}
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

function MoodSearch({ onVideoSelect }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const inputRef = useRef(null);

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setResults(null);

    // Simulate AI response with delay
    await new Promise(r => setTimeout(r, 1200));

    setResults({
      message: `Hier sind Clips, die zu „${q}" passen könnten:`,
      clips: TOPIC_ROWS[0].clips.slice(0, 3),
    });
    setIsLoading(false);
  };

  const handleSuggestion = (suggestion) => {
    setQuery(suggestion.label);
    handleSearch(suggestion.label);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="mood-search">
      <div className="mood-search-input-row">
        <Sparkles size={16} className="mood-search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="mood-search-input"
          placeholder="Was beschäftigt dich heute?"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="mood-search-send"
          onClick={() => handleSearch()}
          disabled={!query.trim() || isLoading}
          aria-label="Suchen"
        >
          <Send size={14} />
        </button>
      </div>

      {!results && !isLoading && (
        <div className="mood-search-suggestions">
          {AI_SEARCH_SUGGESTIONS.map((s, i) => (
            <button key={i} className="mood-suggestion-chip" onClick={() => handleSuggestion(s)}>
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="mood-search-loading">
          <span className="mood-loading-dot" />
          <span className="mood-loading-dot" />
          <span className="mood-loading-dot" />
        </div>
      )}

      {results && (
        <div className="mood-search-results">
          <p className="mood-results-label">{results.message}</p>
          <div className="mood-results-clips">
            {results.clips.map((clip, i) => (
              <button
                key={i}
                className="mood-result-item"
                onClick={() => onVideoSelect && onVideoSelect({ video_file: clip.video_file, display_title: clip.title, title: clip.title, speaker: clip.speaker })}
              >
                <div className="mood-result-thumb">
                  <Play size={10} fill="white" />
                </div>
                <div className="mood-result-info">
                  <span className="mood-result-title">{clip.title}</span>
                  <span className="mood-result-meta">{clip.speaker} · {clip.duration}</span>
                </div>
              </button>
            ))}
          </div>
          <button className="mood-results-clear" onClick={() => { setResults(null); setQuery(''); }}>
            Neue Suche
          </button>
        </div>
      )}
    </div>
  );
}

function DailyReflection({ reflection }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="daily-reflection">
      <div className="daily-reflection-header">
        <Sparkles size={13} className="reflection-icon" />
        <span className="reflection-label">KI-Reflexion zum Vers</span>
      </div>
      <p className={`reflection-text ${expanded ? 'expanded' : ''}`}>
        {reflection.text}
      </p>
      {!expanded && (
        <button className="reflection-expand" onClick={() => setExpanded(true)}>
          Mehr lesen <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

function VerseOfDay({ verse, onBibleOpen }) {
  return (
    <div className="vod-card" onClick={onBibleOpen}>
      <div className="vod-label">
        <BookOpen size={12} />
        Vers des Tages
      </div>
      <p className="vod-ref">{verse.ref}</p>
      <p className="vod-text">„{verse.text}"</p>
      <div className="vod-cta">
        <span>{verse.clips} Clips zu diesem Vers</span>
        <ChevronRight size={14} />
      </div>
    </div>
  );
}

function SermonCard({ sermon, onPlay }) {
  return (
    <div className="sermon-card" onClick={() => onPlay(sermon)}>
      <div className="sermon-thumbnail">
        <div className="sermon-thumb-bg" />
        <div className="sermon-play-btn">
          <Play size={22} fill="white" />
        </div>
        <span className="sermon-duration">{sermon.duration}</span>
        <span className="sermon-category-badge">{sermon.category}</span>
      </div>
      <div className="sermon-info">
        <p className="sermon-verse">{sermon.verse}</p>
        <h3 className="sermon-title">{sermon.title}</h3>
        <p className="sermon-desc">{sermon.description}</p>
        <div className="sermon-speaker">
          <img
            src={sermon.speaker_avatar}
            alt={sermon.speaker}
            className="sermon-speaker-avatar"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <span>{sermon.speaker}</span>
        </div>
      </div>
    </div>
  );
}

function ActivePlanCard({ plan, onContinue }) {
  const progress = Math.round((plan.day / plan.total) * 100);
  return (
    <div className="active-plan-card" style={{ '--plan-color': plan.color }}>
      <div className="active-plan-top">
        <div className="active-plan-meta">
          <BookMarked size={14} className="active-plan-icon" />
          <span className="active-plan-name">{plan.title}</span>
        </div>
        <span className="active-plan-day">Tag {plan.day} / {plan.total}</span>
      </div>
      <div className="active-plan-progress-bar">
        <div className="active-plan-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="active-plan-bottom">
        <div className="active-plan-today">
          {plan.todayDone ? (
            <CheckCircle2 size={15} className="plan-check-done" />
          ) : (
            <Circle size={15} className="plan-check-todo" />
          )}
          <span className="active-plan-ref">Heute: {plan.todayRef}</span>
        </div>
        <button className="active-plan-btn" onClick={onContinue}>
          {plan.todayDone ? 'Wiederholen' : 'Weiterlesen'}
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

function PlanCatalogCard({ plan }) {
  return (
    <div className="plan-catalog-card" style={{ '--plan-color': plan.color }}>
      <div className="plan-catalog-icon">{plan.icon}</div>
      <div className="plan-catalog-info">
        <p className="plan-catalog-title">{plan.title}</p>
        <p className="plan-catalog-subtitle">{plan.subtitle}</p>
      </div>
      <div className="plan-catalog-right">
        <span className="plan-catalog-duration">{plan.duration}</span>
        <ChevronRight size={14} className="plan-catalog-chevron" />
      </div>
    </div>
  );
}

function ReadingPlansSection({ plans, onBibleOpen }) {
  return (
    <section className="home-section">
      <div className="topic-row-header">
        <div className="topic-row-label" style={{ '--topic-color': '#3b82f6' }}>
          <BookMarked size={15} />
          <span>Lesepläne</span>
        </div>
        <button className="topic-row-more">
          Alle Pläne <ArrowRight size={13} />
        </button>
      </div>
      <ActivePlanCard plan={plans.active} onContinue={onBibleOpen} />
      <div className="plan-catalog-list">
        {plans.catalog.map(plan => (
          <PlanCatalogCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}

function ClipCard({ clip, onPlay }) {
  return (
    <div className="home-clip-card" onClick={() => onPlay(clip)}>
      <div className="home-clip-thumb">
        <div className="home-clip-thumb-bg" />
        <div className="home-clip-play">
          <Play size={14} fill="white" />
        </div>
        <span className="home-clip-duration">{clip.duration}</span>
      </div>
      <div className="home-clip-info">
        <p className="home-clip-title">{clip.title}</p>
        <div className="home-clip-meta">
          {clip.speaker_avatar && (
            <img
              src={clip.speaker_avatar}
              alt={clip.speaker}
              className="home-clip-avatar"
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}
          <span className="home-clip-speaker">{clip.speaker || 'BibleTV'}</span>
          <span className="home-clip-verse">{clip.verse}</span>
        </div>
      </div>
    </div>
  );
}

function TopicRow({ row, onPlay }) {
  const Icon = row.icon;
  return (
    <section className="topic-row">
      <div className="topic-row-header">
        <div className="topic-row-label" style={{ '--topic-color': row.color }}>
          <Icon size={15} />
          <span>{row.label}</span>
        </div>
        <button className="topic-row-more">
          Alle <ArrowRight size={13} />
        </button>
      </div>
      <div className="topic-row-scroll">
        {row.clips.map((clip, i) => (
          <ClipCard key={i} clip={clip} onPlay={onPlay} />
        ))}
      </div>
    </section>
  );
}

function SpeakerSection({ speakers }) {
  return (
    <section className="speakers-section">
      <div className="topic-row-header">
        <div className="topic-row-label" style={{ '--topic-color': '#6366f1' }}>
          <Users size={15} />
          <span>Unsere Sprecher</span>
        </div>
      </div>
      <div className="speakers-grid">
        {speakers.map((s, i) => (
          <div key={i} className="speaker-card">
            <div className="speaker-avatar-wrap">
              {s.avatar ? (
                <img
                  src={s.avatar}
                  alt={s.name}
                  className="speaker-avatar-img"
                  onError={e => { e.target.style.background = 'var(--bg-border)'; e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="speaker-avatar-placeholder">
                  {s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
              )}
            </div>
            <p className="speaker-name">{s.name}</p>
            <p className="speaker-role">{s.role}</p>
            <p className="speaker-clips">{s.clips} Clips</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AudioTeaser({ onAudioOpen }) {
  return (
    <div className="audio-teaser" onClick={onAudioOpen}>
      <div className="audio-teaser-icon">
        <Headphones size={22} />
      </div>
      <div className="audio-teaser-info">
        <p className="audio-teaser-title">Hörbibel</p>
        <p className="audio-teaser-sub">Genesis 1 · Lutherbibel 2017</p>
      </div>
      <div className="audio-teaser-play">
        <Play size={16} fill="currentColor" />
      </div>
    </div>
  );
}

// ── Main HomeScreen ──────────────────────────────────────────────────────────

function HomeScreen({ onBibleOpen, onVideoSelect, onAudioOpen }) {
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Guten Morgen';
    if (h < 18) return 'Guten Tag';
    return 'Guten Abend';
  });

  const handleClipPlay = (clip) => {
    if (onVideoSelect) {
      onVideoSelect({ video_file: clip.video_file, display_title: clip.title, title: clip.title, speaker: clip.speaker });
    }
  };

  return (
    <div className="home-screen">
      {/* Greeting */}
      <div className="home-greeting">
        <h2>{greeting}</h2>
      </div>

      {/* Kirchenjahr */}
      <KirchenjahrBanner kj={KIRCHENJAHR} onBibleOpen={onBibleOpen} />

      {/* AI Mood Search */}
      <MoodSearch onVideoSelect={onVideoSelect} />

      {/* Verse of the day */}
      <VerseOfDay verse={VERSE_OF_DAY} onBibleOpen={onBibleOpen} />

      {/* Daily AI Reflection */}
      <DailyReflection reflection={DAILY_REFLECTION} />

      {/* Audio Teaser */}
      <AudioTeaser onAudioOpen={onAudioOpen} />

      {/* Sermon of the day */}
      <section className="home-section">
        <div className="topic-row-header">
          <div className="topic-row-label" style={{ '--topic-color': 'var(--accent-action)' }}>
            <Play size={15} />
            <span>Predigt des Tages</span>
          </div>
        </div>
        <SermonCard sermon={SERMON_OF_DAY} onPlay={handleClipPlay} />
      </section>

      {/* Reading Plans */}
      <ReadingPlansSection plans={READING_PLANS} onBibleOpen={onBibleOpen} />

      {/* Topic rows */}
      {TOPIC_ROWS.map(row => (
        <TopicRow key={row.id} row={row} onPlay={handleClipPlay} />
      ))}

      {/* Speakers */}
      <SpeakerSection speakers={SPEAKERS} />

      <div className="home-footer">
        <p>Video-Studienbibel · BibleTV</p>
        <p>Über 10.000 Video-Predigten</p>
      </div>
    </div>
  );
}

export default HomeScreen;
