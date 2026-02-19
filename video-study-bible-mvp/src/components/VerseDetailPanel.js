import React from 'react';
import VideoList from './VideoList';
import './VerseDetailPanel.css';

function VerseDetailPanel({ isOpen, verseRef, studyData, onClose, onVideoSelect, onTimestampClick }) {
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
        role="region"
        aria-label="Vers-Details"
      >
        <div className="panel-header">
          <div className="panel-handle" />
          <span className="panel-verse-ref">{verseRef}</span>
          <button
            className="panel-close-btn"
            onClick={onClose}
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        <div className="panel-body">
          <VideoList
            verse={verseRef}
            studyData={studyData}
            onVideoSelect={onVideoSelect}
            onTimestampClick={onTimestampClick}
          />
        </div>
      </div>
    </>
  );
}

export default VerseDetailPanel;
