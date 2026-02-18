import React from 'react';
import { ArrowRight } from 'lucide-react';
import './CrossReferences.css';

const BOOK_DE = {
  'Genesis': '1. Mose', 'Exodus': '2. Mose', 'Leviticus': '3. Mose',
  'Numbers': '4. Mose', 'Deuteronomy': '5. Mose',
  'Joshua': 'Josua', 'Judges': 'Richter', 'Ruth': 'Rut',
  '1 Samuel': '1. Samuel', '2 Samuel': '2. Samuel',
  '1 Kings': '1. Könige', '2 Kings': '2. Könige',
  '1 Chronicles': '1. Chronik', '2 Chronicles': '2. Chronik',
  'Ezra': 'Esra', 'Nehemiah': 'Nehemia', 'Esther': 'Ester',
  'Job': 'Hiob', 'Psalms': 'Psalm', 'Psalm': 'Psalm',
  'Proverbs': 'Sprüche', 'Ecclesiastes': 'Prediger',
  'Song of Solomon': 'Hohelied', 'Isaiah': 'Jesaja', 'Jeremiah': 'Jeremia',
  'Lamentations': 'Klagelieder', 'Ezekiel': 'Hesekiel', 'Daniel': 'Daniel',
  'Hosea': 'Hosea', 'Joel': 'Joel', 'Amos': 'Amos', 'Obadiah': 'Obadja',
  'Jonah': 'Jona', 'Micah': 'Micha', 'Nahum': 'Nahum',
  'Habakkuk': 'Habakuk', 'Zephaniah': 'Zefanja', 'Haggai': 'Haggai',
  'Zechariah': 'Sacharja', 'Malachi': 'Maleachi',
  'Matthew': 'Matthäus', 'Mark': 'Markus', 'Luke': 'Lukas', 'John': 'Johannes',
  'Acts': 'Apostelgeschichte',
  'Romans': 'Römer',
  '1 Corinthians': '1. Korinther', '2 Corinthians': '2. Korinther',
  'Galatians': 'Galater', 'Ephesians': 'Epheser', 'Philippians': 'Philipper',
  'Colossians': 'Kolosser',
  '1 Thessalonians': '1. Thessalonicher', '2 Thessalonians': '2. Thessalonicher',
  '1 Timothy': '1. Timotheus', '2 Timothy': '2. Timotheus',
  'Titus': 'Titus', 'Philemon': 'Philemon', 'Hebrews': 'Hebräer',
  'James': 'Jakobus',
  '1 Peter': '1. Petrus', '2 Peter': '2. Petrus',
  '1 John': '1. Johannes', '2 John': '2. Johannes', '3 John': '3. Johannes',
  'Jude': 'Judas', 'Revelation': 'Offenbarung',
};

function translateRef(ref) {
  // Match "1 Corinthians 15:20", "Hebrews 1:3", "Genesis 3", etc.
  const m = ref.match(/^(\d\s)?([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)(.*)$/);
  if (!m) return ref;
  const prefix = m[1] ? m[1].trim() + ' ' : '';
  const book = prefix + m[2];
  const rest = m[3];
  if (BOOK_DE[book]) return BOOK_DE[book] + rest;
  return ref;
}

function CrossReferences({ verse, studyData, onVerseSelect }) {
  if (!verse || !studyData) return null;

  // Collect cross-refs: prefer verse_commentaries (already German), merge with stored cross_references (translated)
  const altVerse = verse.replace(/^Genesis (\d+):?(\d*)$/, (_, ch, v) => v ? `1. Mose ${ch}:${v}` : `1. Mose ${ch}`);
  const commentaryRefs = (
    studyData.verse_commentaries?.[verse]?.cross_references ||
    studyData.verse_commentaries?.[altVerse]?.cross_references ||
    []
  );
  const storedRefs = (studyData.cross_references?.[verse] || []).map(translateRef);
  // Deduplicate (commentaryRefs take priority)
  const seen = new Set(commentaryRefs.map(r => r.toLowerCase()));
  const extra = storedRefs.filter(r => !seen.has(r.toLowerCase()));
  const crossRefs = [...commentaryRefs, ...extra];

  // Group by book (handle "1. Mose", "2. Korinther" etc.)
  const groupedRefs = crossRefs.reduce((acc, ref) => {
    const parts = ref.split(' ');
    const book = (parts[0].match(/^\d+\.$/) ? parts[0] + ' ' + parts[1] : parts[0]);
    if (!acc[book]) acc[book] = [];
    acc[book].push(ref);
    return acc;
  }, {});

  if (crossRefs.length === 0) {
    return (
      <div className="cross-references empty">
        <p>Keine Querverweise für diesen Vers gefunden.</p>
        <p className="hint">
          Querverweise entstehen aus Versen, die gemeinsam in Videos besprochen werden.
        </p>
      </div>
    );
  }

  return (
    <div className="cross-references">
      <h3>Querverweise zu {verse}</h3>
      <p className="description">
        Diese Verse werden gemeinsam in den Videos besprochen:
      </p>

      <div className="ref-groups">
        {Object.entries(groupedRefs).map(([book, refs]) => (
          <div key={book} className="ref-group">
            <h4>{book}</h4>
            <div className="ref-list">
              {refs.map((ref, idx) => {
                // Check if this verse has videos
                const hasVideos = studyData.verses.all[ref]?.length > 0;

                return (
                  <button
                    key={idx}
                    className={`ref-item ${hasVideos ? 'clickable' : ''}`}
                    onClick={() => hasVideos && onVerseSelect(ref)}
                    disabled={!hasVideos}
                  >
                    <ArrowRight size={14} />
                    <span className="ref-text">{ref}</span>
                    {hasVideos && (
                      <span className="video-count">
                        {studyData.verses.all[ref].length} Video{studyData.verses.all[ref].length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="interpretation-note">
        <h5>Warum sind diese verbunden?</h5>
        <p>
          Die Sprecher in den Videos zitieren oft mehrere Textstellen gemeinsam, um theologische
          Zusammenhänge zu zeigen, Prophezeiungen zu erfüllen oder Prinzipien zu veranschaulichen.
          Diese Querverweise stammen aus den tatsächlichen Video-Beiträgen.
        </p>
      </div>
    </div>
  );
}

export default CrossReferences;
