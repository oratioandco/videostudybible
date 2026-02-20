import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, MessageCircle, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './AIInsights.css';

const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;

/**
 * Build RAG context from the entire Genesis 1 corpus.
 * Uses synthesized verse_commentaries for all verses + raw mentions filtered by speaker.
 */
function buildContext(studyData, speakerFilter) {
  const lines = [];
  const g1 = studyData?.verses?.genesis1 || {};
  const commentaries = studyData?.verse_commentaries || {};

  // Synthesized commentaries for every verse in the chapter
  Object.entries(commentaries).forEach(([verseRef, c]) => {
    Object.entries(c.categories || {}).forEach(([cat, items]) => {
      items.forEach(item => {
        if (speakerFilter && !item.source?.toLowerCase().includes(speakerFilter.toLowerCase())) return;
        lines.push(`[${verseRef}][${cat.toUpperCase()}] (${item.source}): ${item.text}`);
      });
    });
  });

  // Raw teaching moments — filtered by speaker if set
  Object.entries(g1).forEach(([verseRef, videos]) => {
    videos.forEach(video => {
      const speaker = video.speaker || video.organization || '';
      if (speakerFilter && !speaker.toLowerCase().includes(speakerFilter.toLowerCase())) return;
      const title = video.display_title || (video.title || '')
        .replace(/\.mp4$/i, '').replace(/_\d{5,}$/, '').replace(/_/g, ' ');
      (video.mentions || []).forEach(m => {
        if (m.context && m.context.length > 60 && m.type === 'ai_parsed') {
          const cat = m.category ? `[${m.category.toUpperCase()}]` : '';
          lines.push(`[${verseRef}]${cat} (${title}${speaker ? ', ' + speaker : ''}, ${m.timestamp}): ${m.context}`);
        }
      });
    });
  });

  return lines.join('\n');
}

function getExampleQuestions(speakerFilter, verse) {
  if (speakerFilter) return [
    `Was betont ${speakerFilter} besonders in Genesis 1?`,
    `Wie erklärt ${speakerFilter} die Bedeutung von ${verse}?`,
    `Welche praktischen Anwendungen nennt ${speakerFilter} für das tägliche Leben?`,
    `Wie verbindet ${speakerFilter} Genesis 1 mit Jesus Christus?`,
  ];
  return [
    `Was ist die wichtigste theologische Aussage über ${verse}?`,
    'Welche unterschiedlichen Perspektiven haben die Sprecher auf die Schöpfung?',
    'Wie erklären die Sprecher Genesis 1 im Bezug auf Christus?',
    'Welche praktischen Einsichten aus Genesis 1 nennen die Sprecher?',
  ];
}

function AIInsights({ verse, studyData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [speakerFilter, setSpeakerFilter] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Reset chat when verse or speaker changes
  useEffect(() => {
    setMessages([]);
    setError('');
  }, [verse, speakerFilter]);

  // Collect unique speakers with avatars from the whole dataset
  const speakers = useMemo(() => {
    const g1 = studyData?.verses?.genesis1 || {};
    const map = {};
    Object.values(g1).forEach(videos =>
      videos.forEach(v => {
        if (v.speaker && !map[v.speaker]) {
          map[v.speaker] = v.speaker_avatar || null;
        }
      })
    );
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [studyData]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');
    setError('');

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const context = buildContext(studyData, speakerFilter);
      if (!context) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Keine Lehrinhalte verfügbar. Wähle einen Vers mit blauem Symbol.',
        }]);
        setLoading(false);
        return;
      }

      const speakerLine = speakerFilter
        ? `Fokus auf die Lehren von: ${speakerFilter}.\n`
        : '';

      const systemPrompt =
        `Du bist ein Bibel-Studienassistent für die Video-Studienbibel.\n` +
        `Du beantwortest Fragen auf Basis von Video-Lehrinhalten zu Genesis 1.\n` +
        `Aktuell betrachteter Vers: ${verse}.\n` +
        speakerLine +
        `Verwende KEIN eigenes theologisches Wissen. Wenn die Antwort nicht im Lehrinhalt steht, sage das klar.\n` +
        `Nenne bei Aussagen immer Sprecher und Vers als Quelle (in Klammern).\n` +
        `Antworte auf Deutsch.\n\n` +
        `LEHRINHALT (Genesis 1, alle Verse):\n${context}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 1024,
          system: systemPrompt,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API-Fehler ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content[0].text }]);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const contextAvailable = !!buildContext(studyData, speakerFilter);
  const exampleQuestions = getExampleQuestions(speakerFilter, verse);

  // ── Main chat UI ────────────────────────────────────────────────────────
  return (
    <div className="ai-chat">
      <div className="chat-header">
        <MessageCircle size={15} />
        <h3>Frag die Videos — Genesis 1</h3>
        <div className="chat-actions">
          {messages.length > 0 && (
            <button className="icon-btn" onClick={() => setMessages([])} title="Gespräch löschen">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Speaker filter chips */}
      {speakers.length > 0 && (
        <div className="speaker-chips">
          <button
            className={`speaker-chip ${speakerFilter === '' ? 'active' : ''}`}
            onClick={() => setSpeakerFilter('')}
          >
            Alle
          </button>
          {speakers.map(([name, avatar]) => {
            const active = speakerFilter === name;
            return (
              <button
                key={name}
                className={`speaker-chip ${active ? 'active' : ''}`}
                onClick={() => setSpeakerFilter(active ? '' : name)}
              >
                {avatar ? (
                  <img src={avatar} alt={name}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="speaker-chip-avatar-placeholder" />
                )}
                {name}
              </button>
            );
          })}
        </div>
      )}

      {!contextAvailable ? (
        <p className="no-context">
          Keine Lehrinhalte verfügbar.
          {speakerFilter ? ` Für ${speakerFilter} sind noch keine Inhalte indexiert.` : ' Wähle einen Vers mit blauem Symbol.'}
        </p>
      ) : (
        <div className="chat-body">
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-intro">
                <p className="intro-text">
                  {speakerFilter
                    ? <>Stelle Fragen zu dem, was <strong>{speakerFilter}</strong> über Genesis 1 lehrt.</>
                    : <>Stelle Fragen zu Genesis 1 — aktueller Fokus: <strong>{verse}</strong>. Die Antworten basieren ausschließlich auf den Video-Inhalten.</>
                  }
                </p>
                <div className="example-questions">
                  {exampleQuestions.map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)}>{q}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className="message-bubble">
                  {msg.role === 'assistant'
                    ? <ReactMarkdown>{msg.content}</ReactMarkdown>
                    : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message assistant">
                <div className="message-bubble loading-dots">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {error && <div className="chat-error">{error}</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-row">
            <input
              type="text"
              placeholder={speakerFilter ? `Frage zu ${speakerFilter}…` : 'Frage zu Genesis 1 stellen…'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              <Send size={15} />
            </button>
          </div>

          <p className="rag-note">
            Antworten basieren ausschließlich auf den Video-Lehrinhalten.
          </p>
        </div>
      )}
    </div>
  );
}

export default AIInsights;
