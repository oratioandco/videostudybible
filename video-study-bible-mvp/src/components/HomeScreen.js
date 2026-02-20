import React, { useState } from 'react';
import { Play, BookOpen, ChevronRight, Flame, Heart, Anchor, Sunrise, Users, Leaf, Star, ArrowRight } from 'lucide-react';
import './HomeScreen.css';

// ── Simulated data (mirrors real BibleTV catalogue structure) ──────────────

const VERSE_OF_DAY = {
  ref: 'Jeremia 29:11',
  text: 'Denn ich weiß wohl, was ich für Gedanken über euch habe, spricht der HERR: Gedanken des Friedens und nicht des Leides, euch eine Zukunft und eine Hoffnung zu geben.',
  clips: 3,
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

// ── Sub-components ──────────────────────────────────────────────────────────

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

// ── Main HomeScreen ─────────────────────────────────────────────────────────

function HomeScreen({ onBibleOpen, onVideoSelect }) {
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
        <p>Was bewegt dich heute?</p>
      </div>

      {/* Verse of the day */}
      <VerseOfDay verse={VERSE_OF_DAY} onBibleOpen={onBibleOpen} />

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
