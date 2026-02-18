import React from 'react';
import { BookOpen, Languages, History, Lightbulb, Heart, BookMarked } from 'lucide-react';
import './Commentary.css';

const CATEGORY_CONFIG = {
  textanalyse: {
    label: 'Textanalyse',
    icon: Languages,
    description: 'Wortbedeutungen, Sprache, Struktur',
    color: '#3b82f6'
  },
  historisch_kulturell: {
    label: 'Historisch & Kulturell',
    icon: History,
    description: 'Hintergrund, Zeitkontext',
    color: '#8b5cf6'
  },
  theologisch: {
    label: 'Theologische Einsichten',
    icon: Lightbulb,
    description: 'Lehraussagen & Glaubensinhalte',
    color: '#f59e0b'
  },
  christologisch: {
    label: 'Christologische Perspektive',
    icon: BookMarked,
    description: 'Verbindung zu Jesus & NT',
    color: '#10b981'
  },
  anwendung: {
    label: 'Lebensanwendung',
    icon: Heart,
    description: 'Praktisch & persönlich',
    color: '#ef4444'
  },
  illustrationen: {
    label: 'Illustrationen & Geschichten',
    icon: BookOpen,
    description: 'Bilder, Analogien, Erlebnisse',
    color: '#6366f1'
  }
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

function Commentary({ verse, studyData, onTimestampClick, onVideoSelect }) {
  // Look up commentary under both "Genesis X:Y" and "1. Mose X:Y" key variants
  const vc = studyData?.verse_commentaries || {};
  const altVerse = verse.replace(/^Genesis (\d+):(\d+)$/, '1. Mose $1:$2');
  const primary = vc[verse] || null;
  const alt = (verse !== altVerse ? vc[altVerse] : null) || null;
  const synthesized = mergeCommentaries(primary, alt);

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
          <span className="source-badge">
            {synthesized.source_count} Videos
          </span>
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
                  <span className="category-desc">{config.description}</span>
                </div>
                <ul className="category-items">
                  {items.map((item, idx) => (
                    <li key={idx}>
                      <span className="item-text">{item.text}</span>
                      {item.source && (
                        <span className="item-source">{item.source}</span>
                      )}
                    </li>
                  ))}
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
