import React, { useState } from 'react';
import { Search, Play } from 'lucide-react';
import './VideoList.css';

const CATEGORIES = [
  { key: null,               label: 'Alle' },
  { key: 'textanalyse',      label: 'Textanalyse' },
  { key: 'theologisch',      label: 'Theologisch' },
  { key: 'christologisch',   label: 'Christologisch' },
  { key: 'anwendung',        label: 'Anwendung' },
  { key: 'illustrationen',   label: 'Illustrationen' },
];

const CAT = {
  textanalyse:    { label: 'Textanalyse',    fg: '#60a5fa', bg: 'rgba(59,130,246,0.15)', border: '#3b82f6' },
  theologisch:    { label: 'Theologisch',    fg: '#a78bfa', bg: 'rgba(139,92,246,0.15)', border: '#7c3aed' },
  christologisch: { label: 'Christologisch', fg: '#fbbf24', bg: 'rgba(245,158,11,0.15)', border: '#d97706' },
  anwendung:      { label: 'Anwendung',      fg: '#34d399', bg: 'rgba(16,185,129,0.15)', border: '#059669' },
  illustrationen: { label: 'Illustrationen', fg: '#f472b6', bg: 'rgba(236,72,153,0.15)', border: '#db2777' },
};

function cleanTitle(raw) {
  if (!raw) return '';
  let t = raw.replace(/\.mp4$/i, '').replace(/_\d{5,}$/, '').replace(/_/g, ' ');
  if (t.length > 60) t = t.slice(0, 60).replace(/\s+\S*$/, '');
  return t.trim();
}

function dedupeByTimestamp(mentions) {
  const seen = new Set();
  return mentions.filter(m => { if (seen.has(m.timestamp)) return false; seen.add(m.timestamp); return true; });
}

function formatDuration(startMs, endMs) {
  const s = Math.round((endMs - startMs) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function buildClips(videos) {
  const clips = [];
  for (const video of videos) {
    const base = {
      displayTitle: video.display_title || cleanTitle(video.title),
      speaker: video.speaker || null,
      speakerAvatar: video.speaker_avatar || null,
      thumb: video.thumb || null,
      series: video.series || null,
      organization: video.organization || null,
    };
    for (const mention of dedupeByTimestamp(video.mentions || [])) {
      clips.push({ mention, video, ...base, hasClipData: mention.clip_start_ms != null });
    }
  }
  clips.sort((a, b) => Number(b.hasClipData) - Number(a.hasClipData));
  return clips;
}

function ClipCard({ clip, onPlayClip }) {
  const { mention, video, displayTitle, speaker, speakerAvatar, thumb, series, hasClipData } = clip;
  const cat = CAT[mention.category] || null;
  const accentColor = cat?.border || 'rgba(255,255,255,0.2)';
  const duration = hasClipData ? formatDuration(mention.clip_start_ms, mention.clip_end_ms) : null;
  const title = mention.clip_title || displayTitle;
  const description = mention.clip_description || mention.context || null;

  return (
    <div
      className="cc-card"
      onClick={() => onPlayClip(video, mention.clip_start_ms ?? mention.timestamp_ms, mention.clip_end_ms ?? null)}
      style={{
        background: 'var(--bg-elevated)',
        borderRadius: '10px',
        border: '1px solid var(--bg-border)',
        borderLeft: `3px solid ${accentColor}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        gap: 0,
        cursor: 'pointer',
        minHeight: 72,
      }}
    >
      {/* Thumbnail — fixed 96px wide */}
      <div style={{ width: 96, flexShrink: 0, position: 'relative', background: 'rgba(255,255,255,0.04)' }}>
        {thumb ? (
          <img
            src={thumb}
            alt={title}
            onError={e => { e.target.style.display = 'none'; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={18} color="rgba(255,255,255,0.15)" />
          </div>
        )}
        {/* Duration badge */}
        {duration && (
          <span style={{
            position: 'absolute', bottom: 4, right: 4,
            background: 'rgba(0,0,0,0.75)', color: '#fff',
            fontSize: '.6rem', fontWeight: 600, fontFamily: 'monospace',
            padding: '1px 5px', borderRadius: 4,
          }}>
            {duration}
          </span>
        )}
      </div>

      {/* Text content */}
      <div style={{ flex: 1, padding: '9px 12px 9px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3, minWidth: 0 }}>

        {/* Category badge */}
        {cat && (
          <span style={{
            display: 'inline-block', alignSelf: 'flex-start',
            fontSize: '.58rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase',
            padding: '1px 7px', borderRadius: '20px',
            background: cat.bg, color: cat.fg,
          }}>
            {cat.label}
          </span>
        )}

        {/* Title */}
        <div style={{
          fontSize: '.85rem', fontWeight: 600, color: 'var(--text-primary)',
          lineHeight: 1.3, overflow: 'hidden',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {title}
        </div>

        {/* Description (1 line) */}
        {description && (
          <div style={{
            fontSize: '.73rem', color: 'var(--text-muted)', lineHeight: 1.35,
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>
            {description}
          </div>
        )}

        {/* Source line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
          {speakerAvatar ? (
            <img
              src={speakerAvatar}
              alt={speaker}
              style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor, flexShrink: 0, display: 'inline-block', opacity: 0.6 }} />
          )}
          <span style={{ fontSize: '.7rem', color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {speaker || series || displayTitle}
          </span>
          {!duration && mention.timestamp && (
            <span style={{ fontSize: '.68rem', color: 'var(--text-disabled)', fontFamily: 'monospace', marginLeft: 'auto', flexShrink: 0 }}>
              {mention.timestamp}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoList({ verse, studyData, onVideoSelect, onTimestampClick }) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState(null);

  const g1 = studyData?.verses?.genesis1 || {};
  const altVerse = (verse || '').replace(/^Genesis (\d+):(\d+)$/, '1. Mose $1:$2');
  const allVideos = [...(g1[verse] || []), ...(verse !== altVerse ? (g1[altVerse] || []) : [])];

  const allClips = buildClips(allVideos);
  const catFiltered = activeCat ? allClips.filter(c => c.mention.category === activeCat) : allClips;
  const q = search.trim().toLowerCase();
  const clips = q
    ? catFiltered.filter(c =>
        [c.displayTitle, c.mention.clip_title, c.mention.clip_description, c.mention.context, c.speaker]
          .some(s => (s || '').toLowerCase().includes(q)))
    : catFiltered;

  const presentCats = new Set(allClips.map(c => c.mention.category).filter(Boolean));

  const handlePlayClip = (video, startMs, endMs) => {
    onVideoSelect(video, startMs, endMs);
    if (startMs) onTimestampClick(startMs);
  };

  if (allVideos.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Keine Videos für diesen Vers.</p>
        <p style={{ fontSize: '.875rem', fontStyle: 'italic', marginTop: '.5rem', color: 'var(--text-disabled)' }}>
          Wähle einen Vers mit blauem Symbol.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Clips zu {verse}
        </h3>
        <span style={{
          fontSize: '.71rem', fontWeight: 700, background: 'var(--accent-action)', color: '#fff',
          padding: '2px 10px', borderRadius: '12px',
        }}>
          {clips.length}/{allClips.length}
        </span>
      </div>

      {/* search */}
      <div className="vl-search" style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--bg-border)',
        borderRadius: '8px', padding: '8px 12px',
      }}>
        <Search size={14} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Clips durchsuchen…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* category filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {CATEGORIES.filter(c => !c.key || presentCats.has(c.key)).map(c => {
          const active = activeCat === c.key;
          return (
            <button
              key={c.key}
              className={`vl-chip ${active ? 'active' : ''}`}
              onClick={() => setActiveCat(c.key)}
              style={{
                background: active ? 'var(--accent-action)' : 'rgba(255,255,255,0.07)',
                color: active ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${active ? 'var(--accent-action)' : 'var(--bg-border)'}`,
                padding: '4px 13px', borderRadius: '20px',
                fontSize: '.71rem', fontWeight: 500, cursor: 'pointer',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* feed */}
      {clips.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-disabled)', fontSize: '.85rem', padding: '1.5rem' }}>
          Keine Clips für diese Filterung.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {clips.map((clip, idx) => (
            <ClipCard key={idx} clip={clip} onPlayClip={handlePlayClip} />
          ))}
        </div>
      )}
    </div>
  );
}

export default VideoList;
