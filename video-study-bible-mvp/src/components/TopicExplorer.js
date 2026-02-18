import React, { useState, useMemo } from 'react';
import { Hash, ChevronDown, ChevronUp, ArrowRight, Beaker } from 'lucide-react';
import './TopicExplorer.css';

const TOPIC_DE = {
  humanity: 'Menschheit', marriage: 'Ehe', time: 'Zeit', animals: 'Tiere',
  creation: 'Schöpfung', water: 'Wasser', redemption: 'Erlösung', light: 'Licht',
  sin: 'Sünde', space: 'Kosmos', sabbath: 'Sabbat', plants: 'Pflanzen',
  atmosphere: 'Atmosphäre', god: 'Gott', spirit: 'Heiliger Geist', word: 'Wort Gottes',
  faith: 'Glaube', prayer: 'Gebet', salvation: 'Erlösung', love: 'Liebe',
  grace: 'Gnade', heaven: 'Himmel', earth: 'Erde', darkness: 'Finsternis',
  day: 'Tag', rest: 'Ruhe', image: 'Ebenbild', work: 'Arbeit', blessing: 'Segen',
  covenant: 'Bund', prophecy: 'Prophetie', worship: 'Anbetung', truth: 'Wahrheit',
  eternity: 'Ewigkeit', kingdom: 'Königreich', life: 'Leben', death: 'Tod',
  man: 'Mann', woman: 'Frau', family: 'Familie', nature: 'Natur',
};

function translateTopic(key) {
  return TOPIC_DE[key.toLowerCase()] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function verseSort(a, b) {
  // Sort "Genesis 1:3" before "Genesis 1:10" numerically
  const numA = parseInt((a.match(/(\d+)$/) || [0, 0])[1]);
  const numB = parseInt((b.match(/(\d+)$/) || [0, 0])[1]);
  return numA - numB;
}

function isSingleVerse(ref) {
  // Keep only specific verse refs like "Genesis 1:3", "1. Mose 1:27"
  return /:\d+$/.test(ref) && !ref.includes('(') && !ref.includes('-');
}

function TopicExplorer({ verse, studyData, onVerseSelect }) {
  const [expandedTopic, setExpandedTopic] = useState(null);

  // Build: topic → { verseRef → videoCount }
  const topicVerseMap = useMemo(() => {
    const topics = studyData?.topics || {};
    const g1 = studyData?.verses?.genesis1 || {};
    const map = {};
    for (const [topicKey, topicVideos] of Object.entries(topics)) {
      const topicVideoIds = new Set(topicVideos.map(tv => tv.video_id));
      const coveredVerses = {};
      for (const [verseRef, verseVideos] of Object.entries(g1)) {
        if (!isSingleVerse(verseRef)) continue;
        const matching = verseVideos.filter(v => topicVideoIds.has(v.video_id));
        if (matching.length > 0) coveredVerses[verseRef] = matching.length;
      }
      if (Object.keys(coveredVerses).length > 0) map[topicKey] = coveredVerses;
    }
    return map;
  }, [studyData]);

  const sortedTopics = Object.entries(topicVerseMap)
    .sort((a, b) => Object.keys(b[1]).length - Object.keys(a[1]).length);

  if (sortedTopics.length === 0) {
    return (
      <div className="topic-explorer">
        <h3><Hash size={18} /> Themen</h3>
        <p className="empty">Keine Themen verfügbar.</p>
      </div>
    );
  }

  return (
    <div className="topic-explorer">
      <div className="te-header">
        <h3><Hash size={18} /> Themen</h3>
        <span className="demo-badge"><Beaker size={11} /> Demo</span>
      </div>
      <p className="te-desc">
        Durchsuche biblische Themen — klicke einen Vers um direkt dorthin zu springen.
        In der Vollversion erstrecken sich die Themen über die gesamte Bibel.
      </p>

      <div className="topic-list">
        {sortedTopics.map(([topicKey, verseMap]) => {
          const label = translateTopic(topicKey);
          const verseSorted = Object.entries(verseMap).sort(([a], [b]) => verseSort(a, b));
          const isOpen = expandedTopic === topicKey;
          const totalVideos = Object.values(verseMap).reduce((s, n) => s + n, 0);

          return (
            <div key={topicKey} className="topic-item">
              <button
                className="topic-header"
                onClick={() => setExpandedTopic(isOpen ? null : topicKey)}
              >
                <div className="topic-info">
                  <span className="topic-name">{label}</span>
                  <span className="occurrence-count">
                    {verseSorted.length} Vers{verseSorted.length !== 1 ? 'e' : ''} · {totalVideos} Videos
                  </span>
                </div>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isOpen && (
                <div className="topic-content">
                  <div className="verse-grid">
                    {verseSorted.map(([verseRef, videoCount]) => (
                      <button
                        key={verseRef}
                        className={`verse-chip ${verseRef === verse ? 'active' : ''}`}
                        onClick={() => onVerseSelect(verseRef)}
                        title={`${videoCount} Video${videoCount !== 1 ? 's' : ''}`}
                      >
                        <ArrowRight size={11} />
                        <span>{verseRef.replace(/^Genesis /, '').replace(/^1\. Mose /, '')}</span>
                        <span className="chip-count">{videoCount}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TopicExplorer;
