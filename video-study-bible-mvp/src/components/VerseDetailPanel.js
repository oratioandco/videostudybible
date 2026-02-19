import React, { useState } from 'react';
import VideoList from './VideoList';
import Commentary from './Commentary';
import CrossReferences from './CrossReferences';
import TopicExplorer from './TopicExplorer';
import AIInsights from './AIInsights';
import { Video, MessageSquare, Link2, Hash, Sparkles, ChevronLeft, Share2, NotebookPen } from 'lucide-react';
import './VerseDetailPanel.css';

const HIGHLIGHT_COLORS = [
  { id: 'yellow', label: 'Gelb', color: '#fbbf24' },
  { id: 'green',  label: 'Grün', color: '#34d399' },
  { id: 'blue',   label: 'Blau', color: '#60a5fa' },
  { id: 'purple', label: 'Lila', color: '#a78bfa' },
];

const TABS = [
  { id: 'commentary',  icon: MessageSquare, label: 'Kommentar'   },
  { id: 'videos',      icon: Video,         label: 'Videos'      },
  { id: 'ai',          icon: Sparkles,      label: 'KI-Chat'     },
  { id: 'notes',       icon: NotebookPen,   label: 'Notizen'     },
  { id: 'cross-refs',  icon: Link2,         label: 'Querverweise'},
  { id: 'topics',      icon: Hash,          label: 'Themen'      },
];

function VerseDetailPanel({
  isOpen,
  verseRef,
  verseText,
  studyData,
  onClose,
  onVideoSelect,
  onTimestampClick,
  onVerseSelect,
}) {
  const [activeTab, setActiveTab] = useState('commentary');
  const [highlightColor, setHighlightColor] = useState(null);
  const [notes, setNotes] = useState('');

  const handleHighlight = (colorId) => {
    setHighlightColor(prev => prev === colorId ? null : colorId);
  };

  const activeHighlight = HIGHLIGHT_COLORS.find(c => c.id === highlightColor);

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className={`verse-detail-backdrop ${isOpen ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`verse-detail-panel ${isOpen ? 'is-open' : ''}`}
        role="complementary"
        aria-label="Vers-Details"
      >
        {/* ── Header ── */}
        <div className="panel-header">
          <div className="panel-handle" />
          <button
            className="panel-icon-btn"
            onClick={onClose}
            aria-label="Schließen"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <span className="panel-verse-ref">{verseRef}</span>
          <button
            className="panel-icon-btn"
            onClick={() => {
              if (navigator.share && verseRef) {
                navigator.share({ title: verseRef, text: verseText || verseRef, url: window.location.href }).catch(() => {});
              }
            }}
            aria-label="Teilen"
          >
            <Share2 size={17} strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Verse text + highlight ── */}
        {verseText && (
          <div
            className="panel-verse-section"
            style={activeHighlight ? { background: activeHighlight.color + '22', borderColor: activeHighlight.color + '55' } : {}}
          >
            <p className="panel-verse-text">{verseText}</p>
            <div className="panel-highlight-row">
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c.id}
                  className={`highlight-dot ${highlightColor === c.id ? 'active' : ''}`}
                  style={{ background: c.color }}
                  onClick={() => handleHighlight(c.id)}
                  aria-label={`Markierung: ${c.label}`}
                  title={c.label}
                />
              ))}
              {highlightColor && (
                <button
                  className="highlight-clear"
                  onClick={() => setHighlightColor(null)}
                  aria-label="Markierung entfernen"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        {verseRef && (
        <div className="panel-tabs">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`panel-tab ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
        )}

        {/* ── Tab content ── */}
        <div className="panel-body">
          {!verseRef && (
            <p className="panel-empty">Wähle einen Vers aus, um Details zu sehen.</p>
          )}
          {verseRef && activeTab === 'videos' && (
            <VideoList
              verse={verseRef}
              studyData={studyData}
              onVideoSelect={onVideoSelect}
              onTimestampClick={onTimestampClick}
            />
          )}
          {verseRef && activeTab === 'commentary' && (
            <Commentary
              verse={verseRef}
              studyData={studyData}
              onTimestampClick={onTimestampClick}
              onVideoSelect={onVideoSelect}
            />
          )}
          {verseRef && activeTab === 'cross-refs' && (
            <CrossReferences
              verse={verseRef}
              studyData={studyData}
              onVerseSelect={onVerseSelect}
            />
          )}
          {verseRef && activeTab === 'topics' && (
            <TopicExplorer
              verse={verseRef}
              studyData={studyData}
              onVerseSelect={onVerseSelect}
            />
          )}
          {verseRef && activeTab === 'ai' && (
            <AIInsights
              verse={verseRef}
              studyData={studyData}
            />
          )}
          {verseRef && activeTab === 'notes' && (
            <div className="notes-container">
              <p className="notes-label">Persönliche Notizen zu {verseRef}</p>
              <textarea
                className="notes-textarea"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Gedanken, Fragen, Einsichten…"
                rows={12}
              />
              {notes && (
                <p className="notes-char-count">{notes.length} Zeichen</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default VerseDetailPanel;
