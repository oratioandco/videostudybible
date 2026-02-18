import React, { useState } from 'react';
import { Search, Play, Clock } from 'lucide-react';
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
  textanalyse:    { label: 'Textanalyse',    fg: '#0369a1', bg: '#dbeafe', border: '#3b82f6' },
  theologisch:    { label: 'Theologisch',    fg: '#5b21b6', bg: '#ede9fe', border: '#7c3aed' },
  christologisch: { label: 'Christologisch', fg: '#92400e', bg: '#fef3c7', border: '#d97706' },
  anwendung:      { label: 'Anwendung',      fg: '#065f46', bg: '#d1fae5', border: '#059669' },
  illustrationen: { label: 'Illustrationen', fg: '#9d174d', bg: '#fce7f3', border: '#db2777' },
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
  const { mention, video, displayTitle, speaker, speakerAvatar, series, organization, hasClipData } = clip;
  const cat = CAT[mention.category] || null;
  const accentColor = cat?.border || '#d1d5db';
  const duration = hasClipData ? formatDuration(mention.clip_start_ms, mention.clip_end_ms) : null;
  const title = mention.clip_title || displayTitle;
  const description = mention.clip_description || null;
  const sourceLabel = speaker || organization || series || displayTitle;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '10px',
      border: '1px solid #e5e7eb',
      borderLeft: `3px solid ${accentColor}`,
      padding: '13px 15px 11px',
      boxShadow: '0 1px 3px rgba(0,0,0,.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>

      {/* Row 1: category + duration */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {cat && (
            <span style={{
              fontSize: '.62rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
              padding: '2px 8px', borderRadius: '20px',
              background: cat.bg, color: cat.fg,
            }}>
              {cat.label}
            </span>
          )}
          {!cat && <span style={{ fontSize: '.7rem', color: '#9ca3af' }}>{mention.category}</span>}
        </div>
        {duration ? (
          <span style={{ fontSize: '.72rem', fontWeight: 600, color: '#9ca3af', fontFamily: 'monospace' }}>
            {duration}
          </span>
        ) : mention.timestamp ? (
          <span style={{ fontSize: '.7rem', color: '#9ca3af', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={10} />{mention.timestamp}
          </span>
        ) : null}
      </div>

      {/* Row 2: title */}
      <div style={{ fontSize: '.95rem', fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
        {title}
      </div>

      {/* Row 3: description */}
      {description && (
        <div style={{ fontSize: '.79rem', color: '#6b7280', lineHeight: 1.5 }}>
          {description}
        </div>
      )}

      {/* Row 4: source + play — separated by subtle line */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: '4px', paddingTop: '9px',
        borderTop: '1px solid #f3f4f6',
        gap: '8px',
      }}>
        {/* source */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          {speakerAvatar ? (
            <img
              src={speakerAvatar}
              alt={sourceLabel}
              style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #e5e7eb' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor, flexShrink: 0, display: 'inline-block' }} />
          )}
          <div style={{ minWidth: 0 }}>
            {speaker && <div style={{ fontSize: '.75rem', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{speaker}</div>}
            {series && <div style={{ fontSize: '.69rem', color: '#9ca3af', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{series}</div>}
            {!speaker && !series && <div style={{ fontSize: '.75rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sourceLabel}</div>}
          </div>
        </div>

        {/* play */}
        <button
          className="clip-play-btn"
          onClick={() => onPlayClip(video, mention.clip_start_ms ?? mention.timestamp_ms, mention.clip_end_ms ?? null)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: '#667eea', color: '#fff', border: 'none',
            padding: '5px 13px', borderRadius: '20px',
            fontSize: '.77rem', fontWeight: 600, cursor: 'pointer',
            flexShrink: 0, whiteSpace: 'nowrap',
          }}
        >
          <Play size={11} fill="currentColor" />
          {hasClipData ? 'Abspielen' : 'Öffnen'}
        </button>
      </div>
    </div>
  );
}

function VideoList({ verse, studyData, onVideoSelect, onTimestampClick }) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState(null);

  const g1 = studyData?.verses?.genesis1 || {};
  const altVerse = verse.replace(/^Genesis (\d+):(\d+)$/, '1. Mose $1:$2');
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
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
        <p>Keine Videos für diesen Vers.</p>
        <p style={{ fontSize: '.875rem', fontStyle: 'italic', marginTop: '.5rem' }}>
          Wähle einen Vers mit blauem Symbol.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          Clips zu {verse}
        </h3>
        <span style={{
          fontSize: '.71rem', fontWeight: 700, background: '#667eea', color: '#fff',
          padding: '2px 10px', borderRadius: '12px',
        }}>
          {clips.length}/{allClips.length}
        </span>
      </div>

      {/* search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#f9fafb', border: '1px solid #e5e7eb',
        borderRadius: '8px', padding: '8px 12px',
      }}>
        <Search size={14} color="#9ca3af" />
        <input
          type="text"
          placeholder="Clips durchsuchen…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '.84rem', color: '#374151', flex: 1 }}
        />
      </div>

      {/* category filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {CATEGORIES.filter(c => !c.key || presentCats.has(c.key)).map(c => {
          const active = activeCat === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setActiveCat(c.key)}
              style={{
                background: active ? '#667eea' : '#f3f4f6',
                color: active ? '#fff' : '#6b7280',
                border: `1px solid ${active ? '#667eea' : '#e5e7eb'}`,
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
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '.85rem', padding: '1.5rem' }}>
          Keine Clips für diese Filterung.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {clips.map((clip, idx) => (
            <ClipCard key={idx} clip={clip} onPlayClip={handlePlayClip} />
          ))}
        </div>
      )}
    </div>
  );
}

export default VideoList;
