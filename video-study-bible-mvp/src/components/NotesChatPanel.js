import React, { useState, useRef, useEffect } from 'react';
import AIInsights from './AIInsights';
import { NotebookPen, Sparkles, Mic, Image, ChevronLeft } from 'lucide-react';
import './NotesChatPanel.css';

const TABS = [
  { id: 'chat',  icon: Sparkles,    label: 'KI-Chat' },
  { id: 'notes', icon: NotebookPen, label: 'Notizen' },
];

function NotesChatPanel({
  isOpen,
  verseRef,
  studyData,
  onClose,
  highlights,
  onHighlight,
  notes,
  onAddNote,
  onDeleteNote,
  onSaveChatAsNote,
}) {
  const [activeTab, setActiveTab] = useState('chat');
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [composerAttachment, setComposerAttachment] = useState(null);
  const composerRef = useRef(null);

  const verseNotes = (notes && verseRef) ? (notes[verseRef] || []) : [];

  const openComposer = (attachment = null) => {
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

  if (!verseRef) {
    return (
      <div className={`notes-chat-panel ${isOpen ? 'is-open' : ''}`}>
        <div className="ncp-header">
          <span className="ncp-title">Notizen & Chat</span>
        </div>
        <div className="ncp-empty">
          <p>Wähle einen Vers aus, um Notizen zu sehen oder mit der KI zu chatten.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`notes-chat-panel ${isOpen ? 'is-open' : ''}`}>
      {/* Header */}
      <div className="ncp-header">
        <button
          className="ncp-close-btn"
          onClick={onClose}
          aria-label="Schließen"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <span className="ncp-title">Notizen & Chat</span>
        <div className="ncp-spacer" />
      </div>

      {/* Tabs */}
      <div className="ncp-tabs">
        {TABS.map(({ id, icon: Icon, label }) => {
          const count = id === 'notes' ? verseNotes.length : 0;
          return (
            <button
              key={id}
              className={`ncp-tab ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={14} />
              <span>{label}</span>
              {count > 0 && <span className="ncp-tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="ncp-body">
        {activeTab === 'notes' && (
          <div className="ncp-notes">
            {verseNotes.length === 0 && !composerOpen && (
              <div className="ncp-notes-empty">
                <p>Noch keine Notizen zu {verseRef}.</p>
              </div>
            )}
            {verseNotes.map(note => (
              <div key={note.id} className="ncp-note-card">
                {note.attachment === 'audio' && (
                  <span className="ncp-note-badge ncp-note-badge--audio">
                    <Mic size={11} strokeWidth={1.5} /> Audio
                  </span>
                )}
                {note.attachment === 'image' && (
                  <span className="ncp-note-badge ncp-note-badge--image">
                    <Image size={11} strokeWidth={1.5} /> Bild
                  </span>
                )}
                <p className="ncp-note-text">{note.text}</p>
                <div className="ncp-note-footer">
                  <span className="ncp-note-date">
                    {new Date(note.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <button
                    className="ncp-note-delete"
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
              <div className="ncp-composer">
                {composerAttachment && (
                  <div className="ncp-composer-attachment">
                    {composerAttachment === 'audio' && <><Mic size={13} strokeWidth={1.5} /> Audionotiz</>}
                    {composerAttachment === 'image' && <><Image size={13} strokeWidth={1.5} /> Bild</>}
                    <button className="ncp-composer-remove" onClick={() => setComposerAttachment(null)}>×</button>
                  </div>
                )}
                <textarea
                  ref={composerRef}
                  className="ncp-composer-textarea"
                  value={composerText}
                  onChange={e => setComposerText(e.target.value)}
                  placeholder="Gedanken, Fragen, Einsichten…"
                  rows={5}
                />
                <div className="ncp-composer-actions">
                  <div className="ncp-composer-attach-btns">
                    <button
                      className={`ncp-composer-attach-btn ${composerAttachment === 'audio' ? 'active' : ''}`}
                      onClick={() => setComposerAttachment(a => a === 'audio' ? null : 'audio')}
                      title="Audionotiz"
                    >
                      <Mic size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      className={`ncp-composer-attach-btn ${composerAttachment === 'image' ? 'active' : ''}`}
                      onClick={() => setComposerAttachment(a => a === 'image' ? null : 'image')}
                      title="Bild"
                    >
                      <Image size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="ncp-composer-submit">
                    <button className="ncp-composer-cancel" onClick={handleCancelComposer}>Abbrechen</button>
                    <button
                      className="ncp-composer-save"
                      onClick={handleSaveNote}
                      disabled={!composerText.trim()}
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button className="ncp-add-btn" onClick={() => openComposer(null)}>
                <NotebookPen size={14} strokeWidth={1.5} />
                Neue Notiz
              </button>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="ncp-chat">
            <AIInsights
              verse={verseRef}
              studyData={studyData}
              onSaveAsNote={onSaveChatAsNote}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default NotesChatPanel;
