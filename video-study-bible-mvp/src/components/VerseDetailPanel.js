import React, { useState, useRef, useEffect } from 'react';
import VideoList from './VideoList';
import Commentary from './Commentary';
import CrossReferences from './CrossReferences';
import TopicExplorer from './TopicExplorer';
import AIInsights from './AIInsights';
import { Video, MessageSquare, Link2, Hash, Sparkles, ChevronLeft, Share2, NotebookPen, Mic, Image } from 'lucide-react';
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
  highlights,
  onHighlight,
  notes,
  onAddNote,
  onDeleteNote,
}) {
  const [activeTab, setActiveTab] = useState('commentary');
  // Composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [composerAttachment, setComposerAttachment] = useState(null); // 'audio' | 'image' | null
  const composerRef = useRef(null);

  const highlightColor = (highlights && verseRef) ? (highlights[verseRef] || null) : null;

  const handleHighlight = (colorId) => {
    if (!verseRef || !onHighlight) return;
    onHighlight(verseRef, highlightColor === colorId ? null : colorId);
  };

  const activeHighlight = HIGHLIGHT_COLORS.find(c => c.id === highlightColor);

  const verseNotes = (notes && verseRef) ? (notes[verseRef] || []) : [];

  const openComposer = (attachment = null) => {
    setActiveTab('notes');
    setComposerOpen(true);
    setComposerAttachment(attachment);
  };

  useEffect(() => {
    if (composerOpen && composerRef.current) {
      composerRef.current.focus();
      composerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [composerOpen]);

  const handleSaveNote = () => {
    if (!composerText.trim() || !verseRef || !onAddNote) return;
    onAddNote(verseRef, {
      id: Date.now().toString(),
      text: composerText.trim(),
      attachment: composerAttachment,
      createdAt: new Date().toISOString(),
    });
    setComposerText('');
    setComposerAttachment(null);
    setComposerOpen(false);
  };

  const handleCancelComposer = () => {
    setComposerText('');
    setComposerAttachment(null);
    setComposerOpen(false);
  };

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
        className={`verse-detail-panel ${isOpen ? 'is-open' : ''} ${composerOpen ? 'composer-open' : ''}`}
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

        {/* ── Verse text (mobile only — hidden on desktop via CSS, collapsed when composer open) ── */}
        {verseText && !composerOpen && (
          <div
            className="panel-verse-section"
            style={activeHighlight ? { background: activeHighlight.color + '22', borderColor: activeHighlight.color + '55' } : {}}
          >
            <p className="panel-verse-text">{verseText}</p>
          </div>
        )}

        {/* ── Action toolbar — always visible when a verse is selected ── */}
        {verseRef && (
          <div className="panel-action-bar">
            <div className="panel-action-group">
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
                  onClick={() => handleHighlight(highlightColor)}
                  aria-label="Markierung entfernen"
                >
                  ×
                </button>
              )}
            </div>
            <div className="panel-action-group panel-action-group--right">
              <button
                className="panel-action-btn"
                onClick={() => openComposer(null)}
                aria-label="Notiz hinzufügen"
                title="Notiz"
              >
                <NotebookPen size={15} strokeWidth={1.5} />
              </button>
              <button
                className="panel-action-btn panel-action-btn--stub"
                onClick={() => openComposer('audio')}
                aria-label="Audionotiz hinzufügen (demnächst)"
                title="Audionotiz (demnächst)"
              >
                <Mic size={15} strokeWidth={1.5} />
              </button>
              <button
                className="panel-action-btn panel-action-btn--stub"
                onClick={() => openComposer('image')}
                aria-label="Bild anhängen (demnächst)"
                title="Bild (demnächst)"
              >
                <Image size={15} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        {verseRef && (
        <div className="panel-tabs">
          {TABS.map(({ id, icon: Icon, label }) => {
            const count = id === 'notes' ? verseNotes.length : 0;
            return (
              <button
                key={id}
                className={`panel-tab ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={13} />
                {label}
                {count > 0 && <span className="panel-tab-count">{count}</span>}
              </button>
            );
          })}
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
              {/* Existing notes list */}
              {verseNotes.length === 0 && !composerOpen && (
                <div className="notes-empty">
                  <p>Noch keine Notizen zu {verseRef}.</p>
                </div>
              )}
              {verseNotes.map(note => (
                <div key={note.id} className="note-card">
                  {note.attachment === 'audio' && (
                    <span className="note-attachment-badge note-attachment-badge--audio">
                      <Mic size={11} strokeWidth={1.5} /> Audio
                    </span>
                  )}
                  {note.attachment === 'image' && (
                    <span className="note-attachment-badge note-attachment-badge--image">
                      <Image size={11} strokeWidth={1.5} /> Bild
                    </span>
                  )}
                  <p className="note-card-text">{note.text}</p>
                  <div className="note-card-footer">
                    <span className="note-card-date">
                      {new Date(note.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <button
                      className="note-card-delete"
                      onClick={() => onDeleteNote && onDeleteNote(verseRef, note.id)}
                      aria-label="Notiz löschen"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              {/* Composer */}
              {composerOpen ? (
                <div className="note-composer">
                  {composerAttachment && (
                    <div className="note-composer-attachment">
                      {composerAttachment === 'audio' && <><Mic size={13} strokeWidth={1.5} /> Audionotiz</>}
                      {composerAttachment === 'image' && <><Image size={13} strokeWidth={1.5} /> Bild</>}
                      <button className="note-composer-attachment-remove" onClick={() => setComposerAttachment(null)}>×</button>
                    </div>
                  )}
                  <textarea
                    ref={composerRef}
                    className="note-composer-textarea"
                    value={composerText}
                    onChange={e => setComposerText(e.target.value)}
                    placeholder="Gedanken, Fragen, Einsichten…"
                    rows={5}
                  />
                  <div className="note-composer-actions">
                    <div className="note-composer-attachments">
                      <button
                        className={`note-composer-attach-btn ${composerAttachment === 'audio' ? 'active' : ''}`}
                        onClick={() => setComposerAttachment(a => a === 'audio' ? null : 'audio')}
                        title="Audionotiz"
                      >
                        <Mic size={14} strokeWidth={1.5} />
                      </button>
                      <button
                        className={`note-composer-attach-btn ${composerAttachment === 'image' ? 'active' : ''}`}
                        onClick={() => setComposerAttachment(a => a === 'image' ? null : 'image')}
                        title="Bild"
                      >
                        <Image size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="note-composer-submit">
                      <button className="note-composer-cancel" onClick={handleCancelComposer}>Abbrechen</button>
                      <button
                        className="note-composer-save"
                        onClick={handleSaveNote}
                        disabled={!composerText.trim()}
                      >
                        Speichern
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button className="note-add-btn" onClick={() => openComposer(null)}>
                  <NotebookPen size={14} strokeWidth={1.5} />
                  Neue Notiz
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default VerseDetailPanel;
