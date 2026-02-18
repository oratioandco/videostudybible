# Video Study Bible MVP - Genesis 1

A comprehensive React application that combines Bible text with video teachings, creating an interactive study Bible experience.

## ✨ Features

### Core Features
- 📖 **Bible Text Viewer** - Genesis 1 with verse-by-verse navigation
- 🎥 **Video Player** - Watch Bibel TV videos with precise timestamp navigation
- 💬 **Commentary System** - Extract teaching content from video transcripts
- 🔗 **Cross-References** - Discover related verses mentioned in videos
- 🏷️ **Topic Explorer** - Browse theological themes and topics
- 🔍 **Smart Search** - Find verses, videos, and topics instantly
- 🤖 **AI Insights** - (Phase 2) AI-powered implicit verse detection and summaries

### Study Bible Features
1. **Custom EPG (Electronic Program Guide)**
   - Precise timestamps for every verse mention
   - Multiple videos per verse
   - Jump directly to relevant moments

2. **Video-Based Commentary**
   - Extracted from transcript segments
   - Organized by verse reference
   - Clickable timestamps to watch context

3. **Cross-Reference Graph**
   - Automatically built from video content
   - Shows theological connections
   - Based on actual teaching patterns

4. **Topic-Based Navigation**
   - Creation, light, water, humanity, marriage, etc.
   - Find all videos discussing a topic
   - See timestamp clusters

5. **Teacher Directory**
   - Browse by video series
   - Multiple perspectives on same verses

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ (for data extraction)
- Anthropic API key (optional, for AI enhancement)

### Step 1: Extract Study Bible Data

```bash
# Run basic extraction (regex-based, no API key needed)
python3 extract_study_bible_data.py --mode=basic

# OR run AI-enhanced extraction (requires API key)
export ANTHROPIC_API_KEY='your-key-here'
python3 ai_extraction.py
```

This creates `study_bible_data/` with:
- `study_bible_database.json` - Master database
- `*_study_data.json` - Individual video data
- `*_enhanced.json` - AI-enhanced data (if using AI)

### Step 2: Set Up React App

```bash
cd video-study-bible-mvp

# Install dependencies
npm install

# Create symlinks to data
ln -s ../study_bible_data public/study_bible_data
ln -s ../bibelthek_videos public/bibelthek_videos
```

### Step 3: Run the App

```bash
npm start
```

Open http://localhost:3000

## 📁 Project Structure

```
video-study-bible-mvp/
├── public/
│   ├── index.html
│   ├── study_bible_data/      # Symlink to extracted data
│   └── bibelthek_videos/      # Symlink to video files
├── src/
│   ├── components/
│   │   ├── BibleViewer.js     # Bible text + verse selector
│   │   ├── VideoPlayer.js     # Video playback with timestamps
│   │   ├── Commentary.js      # Video-based commentary
│   │   ├── CrossReferences.js # Related verses
│   │   ├── TopicExplorer.js   # Theological themes
│   │   └── SearchBar.js       # Smart search
│   ├── App.js                 # Main application
│   ├── App.css                # Global styles
│   └── index.js               # Entry point
└── package.json
```

## 🔧 Configuration

### Bibel TV API Integration

Update `src/App.js` line 35-45 with correct API authentication:

```javascript
const response = await fetch(
  `https://bibelthek-backend.bibeltv.de/search.json?query=${query}`,
  {
    headers: {
      // Update based on API requirements
      'X-API-KEY': '9063d9c81d111797641719a3b86651eb',
      // OR
      'Authorization': 'Bearer ...'
    }
  }
);
```

### Data Extraction Options

**Basic Mode** (Regex-based)
```bash
python3 extract_study_bible_data.py --mode=basic
```
- Fast (~1 minute for 57 videos)
- No API costs
- Finds explicit verse references
- Good enough for MVP

**Enhanced Mode** (AI-powered)
```bash
export ANTHROPIC_API_KEY='your-key'
python3 ai_extraction.py
```
- Slower (~5-10 minutes)
- Costs ~$0.50-$1.00 for Genesis 1 videos
- Finds implicit verse references (quotes without citations)
- Better commentary summaries
- Theological theme detection

## 📊 Data Output Format

### Master Database (`study_bible_database.json`)

```json
{
  "metadata": {
    "total_videos": 57,
    "genesis1_videos": 16,
    "focus_chapter": "Genesis 1"
  },
  "verses": {
    "genesis1": {
      "Genesis 1:1": [
        {
          "video_id": "318915",
          "title": "Die 7 Schöpfungstage (1/7)",
          "mentions": [
            {
              "timestamp": "00:07:55",
              "timestamp_ms": 475000,
              "context": "Am Anfang schuf Gott Himmel und Erde..."
            }
          ]
        }
      ]
    }
  },
  "cross_references": {
    "Genesis 1:1": ["Psalm 33:9", "John 1:1", "Hebrews 11:3"]
  },
  "topics": {
    "creation": [...],
    "light": [...],
    "water": [...]
  }
}
```

### Video Study Data (`*_study_data.json`)

```json
{
  "video_id": "318915",
  "title": "Die 7 Schöpfungstage (1/7)",
  "verse_mentions": {
    "Genesis 1:1": [{...}],
    "Psalm 104:3": [{...}]
  },
  "commentary": {
    "Genesis 1:1": [
      {
        "timestamp": "00:07:55",
        "text": "Am Anfang schuf Gott Himmel und Erde. Zeit und Raum..."
      }
    ]
  },
  "topics": {
    "creation": [{...}],
    "time": [{...}]
  },
  "terms": {
    "tohu_wabohu": [{...}],
    "rakia": [{...}]
  },
  "questions": [...]
}
```

### AI-Enhanced Data (`*_enhanced.json`)

Additional fields:
```json
{
  "ai_summary": "This video explains the seven days of creation...",
  "ai_commentary": {
    "Genesis 1:1": {
      "summary": "The speaker emphasizes...",
      "key_points": ["Time was created", "Space was created"],
      "applications": ["Trust God's word"],
      "cross_references_mentioned": ["Psalm 33:9", "2 Corinthians 4:6"]
    }
  },
  "ai_themes": ["trinity", "creation_ex_nihilo", "light_theology"],
  "ai_implicit_refs_count": 12
}
```

## 🎯 Current Status

### ✅ Working
- Basic data extraction (regex)
- React app structure
- Bible verse viewer
- Video player integration
- Commentary display
- Cross-references
- Topic explorer
- Search functionality

### 🚧 In Progress
- Bibel TV API integration (auth method TBD)
- AI enhancement scripts
- Full Genesis 1 text (currently has fallback)

### 📅 Future Enhancements
- Other Bible chapters
- Multiple translations
- User notes and highlights
- Playlist creation
- Export functionality
- Mobile responsive improvements

## 🤖 AI Enhancement Details

### What AI Adds

1. **Implicit Verse Detection**
   ```
   Speaker: "Am Anfang schuf Gott Himmel und Erde"
   AI detects → Genesis 1:1 (even without citation)
   ```

2. **Better Commentary Extraction**
   - Understands context better
   - Groups related segments
   - Generates concise summaries

3. **Theological Theme Detection**
   - Recognizes discussions about trinity
   - Identifies creation theology themes
   - Connects to broader biblical narrative

4. **Cross-Reference Intelligence**
   - Explains WHY verses are connected
   - Identifies fulfillment patterns
   - Notes theological parallels

### AI Cost Estimation

For Genesis 1 videos (16 videos):
- Basic extraction: FREE
- AI enhancement: ~$0.50-$1.00
  - ~3-5 API calls per video
  - Using Claude Sonnet 3.5 (~$3/million tokens)
  - Total: ~500K tokens

## 📝 Development Notes

### Adding New Bible Chapters

1. Update `VERSE_PATTERNS` in `extract_study_bible_data.py`
2. Run extraction on new transcripts
3. Update `BibleViewer.js` verse range
4. Fetch Bible text from API

### Customizing UI

- Colors: Edit CSS variables in component files
- Layout: Adjust grid in `App.css`
- Features: Add new tabs in `App.js`

### Performance Optimization

- Data is loaded once on app start
- Videos are lazy-loaded
- Search results are limited to 10

## 🐛 Troubleshooting

**Data not loading**
- Check symlinks: `ls -la public/`
- Verify JSON files exist in `study_bible_data/`

**Videos not playing**
- Check video file paths
- Ensure videos are in `bibelthek_videos/videos/`
- Check browser console for errors

**Search not working**
- Verify `study_bible_database.json` loaded
- Check browser console

**API errors (401 Unauthorized)**
- Verify API key in `App.js`
- Check API auth method with Bibel TV

## 📚 Resources

- [React Documentation](https://react.dev)
- [Anthropic API Docs](https://docs.anthropic.com)
- [Bibel TV](https://www.bibeltv.de)

## 🤝 Contributing

This is an MVP. Suggestions for improvements:
1. Better UI/UX
2. Mobile optimization
3. More Bible chapters
4. Export features
5. User accounts
6. Community notes

## 📄 License

This project is for personal and educational use. Video content belongs to Bibel TV and respective creators.

---

**Built with ❤️ for Bible study**
