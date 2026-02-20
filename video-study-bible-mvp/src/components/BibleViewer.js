import React, { useState } from 'react';
import { ChevronRight, MonitorPlay, NotebookPen } from 'lucide-react';
import './BibleViewer.css';

const HIGHLIGHT_COLORS = {
  yellow: '#fbbf24',
  green:  '#34d399',
  blue:   '#60a5fa',
  purple: '#a78bfa',
};

const TRANSLATIONS = [
  { id: 'LUT', name: 'Lutherbibel 2017', abbreviation: 'LUT' },
  { id: 'GNB', name: 'Gute Nachricht Bibel', abbreviation: 'GNB' },
  { id: 'ELB', name: 'Elberfelder Bibel', abbreviation: 'ELB' },
  { id: 'EU',  name: 'Einheitsübersetzung 2016', abbreviation: 'EÜ' },
  { id: 'NGÜ', name: 'Neue Genfer Übersetzung', abbreviation: 'NGÜ' },
  { id: 'SLT', name: 'Schlachter 2000', abbreviation: 'SLT' },
];

function TranslationSwitcher({ selected, onChange }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (t) => {
    onChange(t);
    setOpen(false);
  };

  return (
    <div className="translation-switcher">
      <button
        className="translation-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Übersetzung wählen"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ flexShrink: 0, opacity: 0.7 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span>Genesis 1 · {selected.abbreviation}</span>
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ flexShrink: 0, opacity: 0.5 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 199 }}
            onClick={() => setOpen(false)}
          />
          <ul className="translation-dropdown">
            {TRANSLATIONS.map(t => (
              <li
                key={t.id}
                className={`translation-option ${t.id === selected.id ? 'selected' : ''}`}
                onClick={() => handleSelect(t)}
              >
                <span className="translation-name">{t.name}</span>
                <span className="translation-abbr">{t.abbreviation}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function ReadingView({ verses, apiVerses, hasApiText, onVerseSelect, highlights, selectedVerse, studyData, notes }) {
  return (
    <p className="reading-paragraph">
      {verses.map(verseNum => {
        const verseRef = `Genesis 1:${verseNum}`;
        const altRef = `1. Mose 1:${verseNum}`;
        const text = hasApiText ? (apiVerses[verseNum] || '') : getVerseText(verseNum);
        const colorId = highlights?.[verseRef];
        const color = colorId ? HIGHLIGHT_COLORS[colorId] : null;
        const isSelected = verseRef === selectedVerse;
        const style = color
          ? { background: color + '55', borderRadius: '3px', padding: '0 2px' }
          : isSelected
            ? { background: 'rgba(59,130,246,0.12)', borderRadius: '3px', padding: '0 2px' }
            : {};

        const g1 = studyData?.verses?.genesis1 || {};
        const hasVideos = (g1[verseRef]?.length > 0) || (g1[altRef]?.length > 0);
        const hasCommentary = !!(studyData?.verse_commentaries?.[altRef] || studyData?.verse_commentaries?.[verseRef]);
        const hasNotes = (notes?.[verseRef]?.length > 0);
        const hasContent = hasVideos || hasCommentary || hasNotes;

        return (
          <span
            key={verseNum}
            className="reading-verse"
            style={style}
            onClick={() => onVerseSelect(verseRef, text)}
          >
            <sup className={`reading-verse-num${hasContent ? ' has-content' : ''}`}>{verseNum}</sup>
            {text}
            {hasVideos && <MonitorPlay size={11} className="reading-verse-video-icon" aria-hidden="true" strokeWidth={1.5} />}
            {hasNotes && <NotebookPen size={11} className="reading-verse-note-icon" aria-hidden="true" strokeWidth={1.5} />}
            {' '}
          </span>
        );
      })}
    </p>
  );
}

function BibleViewer({ verse, bibleText, studyData, onVerseSelect, onVideoSelect, selectedTranslation, onTranslationChange, viewMode, highlights, notes }) {
  const verseNums = Array.from({ length: 31 }, (_, i) => i + 1);
  const apiVerses = bibleText?.verses || {};
  const hasApiText = Object.keys(apiVerses).length > 0;
  const currentTranslation = selectedTranslation || TRANSLATIONS[0];

  return (
    <div className="bible-viewer">
      <div className="bible-header">
        <h2>Genesis 1</h2>
        {!hasApiText && (
          <p className="bible-loading-hint">Wird geladen…</p>
        )}
      </div>

      <div className={`bible-text${viewMode === 'reading' ? ' reading-mode' : ''}`}>
        {viewMode === 'reading' ? (
          <ReadingView
            verses={verseNums}
            apiVerses={apiVerses}
            hasApiText={hasApiText}
            onVerseSelect={onVerseSelect}
            highlights={highlights}
            selectedVerse={verse}
            studyData={studyData}
            notes={notes}
          />
        ) : (
          verseNums.map(verseNum => {
            const verseRef = `Genesis 1:${verseNum}`;
            const altRef = `1. Mose 1:${verseNum}`;
            const isSelected = verse === verseRef;
            const g1 = studyData?.verses?.genesis1 || {};
            const hasVideos = (g1[verseRef]?.length > 0) || (g1[altRef]?.length > 0);
            const hasCommentary = !!(studyData?.verse_commentaries?.[altRef] || studyData?.verse_commentaries?.[verseRef]);
            const hasNotes = (notes?.[verseRef]?.length > 0);
            const text = hasApiText ? (apiVerses[verseNum] || '') : getVerseText(verseNum);
            const colorId = highlights?.[verseRef];
            const highlightColor = colorId ? HIGHLIGHT_COLORS[colorId] : null;

            return (
              <div
                key={verseNum}
                className={`verse ${isSelected ? 'selected' : ''} ${hasVideos ? 'has-videos' : ''}`}
                style={highlightColor ? { background: highlightColor + '33', borderRadius: '12px' } : {}}
                onClick={() => onVerseSelect(verseRef, text)}
              >
                <span className="verse-number">{verseNum}</span>
                <span className="verse-text">{text}</span>
                {(hasVideos || hasCommentary || hasNotes) && (
                  <span className="verse-indicators" aria-hidden="true">
                    {hasCommentary && <span className="verse-dot verse-dot--commentary" title="Kommentar" />}
                    {hasVideos    && <span className="verse-dot verse-dot--video"       title="Videos"    />}
                    {hasNotes     && <span className="verse-dot verse-dot--note"        title="Notizen"   />}
                  </span>
                )}
                <span className="verse-chevron" aria-hidden="true">
                  <ChevronRight size={14} />
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Genesis 1 text (Luther 2017)
function getVerseText(verseNum) {
  const genesis1 = {
    1: 'Am Anfang schuf Gott Himmel und Erde.',
    2: 'Und die Erde war wüst und leer, und Finsternis lag auf der Tiefe; und der Geist Gottes schwebte über dem Wasser.',
    3: 'Und Gott sprach: Es werde Licht! Und es ward Licht.',
    4: 'Und Gott sah, dass das Licht gut war. Da schied Gott das Licht von der Finsternis',
    5: 'und nannte das Licht Tag und die Finsternis Nacht. Da ward aus Abend und Morgen der erste Tag.',
    6: 'Und Gott sprach: Es werde eine Feste zwischen den Wassern, die da scheide zwischen den Wassern.',
    7: 'Da machte Gott die Feste und schied das Wasser unter der Feste von dem Wasser über der Feste. Und es geschah so.',
    8: 'Und Gott nannte die Feste Himmel. Da ward aus Abend und Morgen der zweite Tag.',
    9: 'Und Gott sprach: Es sammle sich das Wasser unter dem Himmel an einen Ort, dass man das Trockene sehe. Und es geschah so.',
    10: 'Und Gott nannte das Trockene Erde, und die Sammlung der Wasser nannte er Meer. Und Gott sah, dass es gut war.',
    11: 'Und Gott sprach: Es lasse die Erde aufgehen Gras und Kraut, das Samen bringe, und fruchtbare Bäume, die ein jeder nach seiner Art Früchte tragen, in denen ihr Same ist auf der Erde. Und es geschah so.',
    12: 'Und die Erde ließ aufgehen Gras und Kraut, das Samen bringt, ein jedes nach seiner Art, und Bäume, die da Früchte tragen, in denen ihr Same ist, ein jeder nach seiner Art. Und Gott sah, dass es gut war.',
    13: 'Da ward aus Abend und Morgen der dritte Tag.',
    14: 'Und Gott sprach: Es werden Lichter an der Feste des Himmels, die da scheiden Tag und Nacht. Sie seien Zeichen für Zeiten, Tage und Jahre',
    15: 'und seien Lichter an der Feste des Himmels, dass sie scheinen auf die Erde. Und es geschah so.',
    16: 'Und Gott machte zwei große Lichter: ein großes Licht, das den Tag regiere, und ein kleines Licht, das die Nacht regiere, dazu auch die Sterne.',
    17: 'Und Gott setzte sie an die Feste des Himmels, dass sie schienen auf die Erde',
    18: 'und den Tag und die Nacht regierten und schieden Licht und Finsternis. Und Gott sah, dass es gut war.',
    19: 'Da ward aus Abend und Morgen der vierte Tag.',
    20: 'Und Gott sprach: Es wimmle das Wasser von lebendigem Getier, und Vögel sollen fliegen auf Erden unter der Feste des Himmels.',
    21: 'Und Gott schuf große Seeungeheuer und alles Getier, das da lebt und webt, davon das Wasser wimmelt, ein jedes nach seiner Art, und alle gefiederten Vögel, einen jeden nach seiner Art. Und Gott sah, dass es gut war.',
    22: 'Und Gott segnete sie und sprach: Seid fruchtbar und mehret euch und erfüllet das Wasser im Meer, und die Vögel sollen sich mehren auf Erden.',
    23: 'Da ward aus Abend und Morgen der fünfte Tag.',
    24: 'Und Gott sprach: Die Erde bringe hervor lebendiges Getier, ein jedes nach seiner Art: Vieh, Gewürm und Tiere des Feldes, ein jedes nach seiner Art. Und es geschah so.',
    25: 'Und Gott machte die Tiere des Feldes, ein jedes nach seiner Art, und das Vieh nach seiner Art und alles Gewürm auf Erden nach seiner Art. Und Gott sah, dass es gut war.',
    26: 'Und Gott sprach: Lasset uns Menschen machen, ein Bild, das uns gleich sei, die da herrschen über die Fische im Meer und über die Vögel unter dem Himmel und über das Vieh und über alle Tiere des Feldes und über alles Gewürm, das auf Erden kriecht.',
    27: 'Und Gott schuf den Menschen zu seinem Bilde, zum Bilde Gottes schuf er ihn; und schuf sie als Mann und Frau.',
    28: 'Und Gott segnete sie und sprach zu ihnen: Seid fruchtbar und mehret euch und füllet die Erde und machet sie euch untertan und herrschet über die Fische im Meer und über die Vögel unter dem Himmel und über alles Getier, das auf Erden kriecht.',
    29: 'Und Gott sprach: Seht da, ich habe euch gegeben alle Pflanzen, die Samen bringen, auf der ganzen Erde, und alle Bäume mit Früchten, die Samen bringen, zu eurer Speise.',
    30: 'Und allen Tieren auf Erden und allen Vögeln unter dem Himmel und allem Gewürm, das auf Erden lebt, habe ich alle grünen Pflanzen zur Nahrung gegeben. Und es geschah so.',
    31: 'Und Gott sah an alles, was er gemacht hatte, und siehe, es war sehr gut. Da ward aus Abend und Morgen der sechste Tag.',
  };
  return genesis1[verseNum] || '';
}

export { TranslationSwitcher };
export default BibleViewer;
