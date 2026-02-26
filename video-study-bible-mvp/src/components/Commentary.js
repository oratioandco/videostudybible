import React from 'react';
import { BookOpen, Languages, History, Lightbulb, Heart, BookMarked, Play, User } from 'lucide-react';
import './Commentary.css';

const CATEGORY_CONFIG = {
  textanalyse: { label: 'Textanalyse', icon: Languages, description: 'Wortbedeutungen, Sprache, Struktur', color: '#3b82f6' },
  historisch_kulturell: { label: 'Historisch & Kulturell', icon: History, description: 'Hintergrund, Zeitkontext', color: '#8b5cf6' },
  theologisch: { label: 'Theologische Einsichten', icon: Lightbulb, description: 'Lehraussagen & Glaubensinhalte', color: '#f59e0b' },
  christologisch: { label: 'Christologische Perspektive', icon: BookMarked, description: 'Verbindung zu Jesus & NT', color: '#10b981' },
  anwendung: { label: 'Lebensanwendung', icon: Heart, description: 'Praktisch & persönlich', color: '#ef4444' },
  illustrationen: { label: 'Illustrationen & Geschichten', icon: BookOpen, description: 'Bilder, Analogien, Erlebnisse', color: '#6366f1' }
};

function mergeCommentaries(a, b) {
  if (!a && !b) return null;
  if (!a) return b;
  if (!b) return a;
  const mergedCats = {};
  const allKeys = new Set([...Object.keys(a.categories || {}), ...Object.keys(b.categories || {})]);
  allKeys.forEach(k => {
    mergedCats[k] = [...(a.categories?.[k] || []), ...(b.categories?.[k] || [])];
  });
  return {
    ...a,
    summary: a.summary || b.summary,
    categories: mergedCats,
    source_count: (a.source_count || 0) + (b.source_count || 0),
    source_videos: [...new Set([...(a.source_videos || []), ...(b.source_videos || [])])],
    cross_references: [...new Set([...(a.cross_references || []), ...(b.cross_references || [])])],
  };
}

function formatTimestamp(ms) {
  if (!ms) return '';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function Commentary({ verse, studyData, onTimestampClick, onVideoSelect }) {
  const vc = studyData?.verse_commentaries || {};
  const altVerse = verse.replace(/^Genesis (\d+):(\d+)$/, '1. Mose $1:$2');
  const primary = vc[verse] || null;
  const alt = (verse !== altVerse ? vc[altVerse] : null) || null;
  const synthesized = mergeCommentaries(primary, alt);

  // Build lookup for speaker info from raw video data
  const videoSpeakerMap = {};
  const genesis1 = studyData?.verses?.genesis1 || {};
  Object.values(genesis1).forEach(videos => {
    videos.forEach(v => {
      if (v.video_id && v.speaker) {
        videoSpeakerMap[v.video_id] = v.speaker;
      }
    });
  });

  if (!synthesized) {
    return (
      <div className="commentary empty">
        <p>Kein Kommentar für diesen Vers verfügbar.</p>
        <p className="hint">Wähle einen Vers mit blauem Video-Symbol.</p>
      </div>
    );
  }

  const categories = synthesized.categories || {};
  const hasCategories = Object.values(categories).some(arr => arr?.length > 0);

  return (
    <div className="commentary">
      <div className="commentary-header">
        <h3>Was unsere Partner sagen zu {verse}</h3>
        {synthesized.source_count > 0 && (
          <span className="source-badge">{synthesized.source_count} Videos</span>
        )}
      </div>

      {synthesized.summary && (
        <p className="commentary-summary">{synthesized.summary}</p>
      )}

      {hasCategories ? (
        <div className="categories">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const items = categories[key];
            if (!items || items.length === 0) return null;
            const Icon = config.icon;

            return (
              <div key={key} className="category-section" style={{ '--cat-color': config.color }}>
                <div className="category-header">
                  <Icon size={16} />
                  <h4>{config.label}</h4>
                  {items.length > 1 && <span className="category-count">{items.length}</span>}
                </div>

                <ul className="category-items">
                  {items.map((item, idx) => {
                    // Look up speaker from video data if not in commentary item
                    const speakerName = item.speaker || videoSpeakerMap[item.video_id] || null;
                    const displayName = speakerName || item.source || 'Videoquelle';

                    const timestamp = formatTimestamp(item.timestamp_ms);

                    return (
                      <li key={idx} className="insight-card">
                        <div className="quote-card">
                          {/* Header: Avatar + Name */}
                          <div className="insight-card-header">
                            <div
                              className={`speaker-avatar-placeholder ${item.speaker_avatar ? 'has-avatar' : ''}`}
                              style={{ backgroundColor: config.color, color: '#fff' }}
                            >
                              {item.speaker_avatar ? (
                                <img src={item.speaker_avatar} alt={displayName} />
                              ) : (
                                <User size={18} />
                              )}
                            </div>
                            <div className="speaker-meta">
                              <span className="speaker-name">{displayName}</span>
                              <span className="speaker-role">{config.label}</span>
                            </div>
                          </div>

                          {/* Quote text */}
                          <div className="insight-text">
                            <p className="item-text">{item.text}</p>
                          </div>

                          {/* Verse reference */}
                          <div className="verse-ref">{verse}</div>

                          {/* Watch section */}
                          <div className="watch-section">
                            <button
                              className="watch-link"
                              onClick={() => {
                                const videoEntry = {
                                  video_id: item.video_id,
                                  title: item.source,
                                  display_title: item.source,
                                  thumb: item.thumb,
                                  speaker: speakerName,
                                  speaker_avatar: item.speaker_avatar,
                                };
                                onVideoSelect(videoEntry);
                                if (item.timestamp_ms) {
                                  onTimestampClick(item.timestamp_ms / 1000);
                                }
                              }}
                              title="Diesen Moment im Video ansehen"
                            >
                              <Play size={14} strokeWidth={2} />
                              <span className="watch-link-text">Video ansehen</span>
                              {timestamp && <span className="watch-link-time">{timestamp}</span>}
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="no-categories">Kommentar wird geladen...</p>
      )}

      {synthesized.cross_references?.length > 0 && (
        <div className="cross-refs-section">
          <strong>Erwähnte Bibelstellen:</strong>
          <span>{synthesized.cross_references.join(' · ')}</span>
        </div>
      )}

      {synthesized.source_videos?.length > 0 && (
        <div className="source-list">
          <BookOpen size={13} />
          <span>{synthesized.source_videos.join(' · ')}</span>
        </div>
      )}
    </div>
  );
}

export default Commentary;
