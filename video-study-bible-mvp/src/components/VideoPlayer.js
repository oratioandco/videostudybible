import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import './VideoPlayer.css';

function VideoPlayer({ video, timestamp, endTime, onTimestampChange }) {
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  // Seek to timestamp and start playing when a new clip is selected
  useEffect(() => {
    if (playerRef.current && timestamp > 0) {
      playerRef.current.seekTo(timestamp / 1000, 'seconds');
      setPlaying(true);
    }
  }, [timestamp]);

  const handleProgress = useCallback((state) => {
    const ms = state.playedSeconds * 1000;
    onTimestampChange(ms);
    // Auto-pause at clip end
    if (endTime && ms >= endTime) {
      setPlaying(false);
    }
  }, [endTime, onTimestampChange]);

  const videoUrl = `/bibelthek_videos/videos/${video.video_file}`;

  return (
    <div className="video-player-container">
      <div className="video-header">
        <h3>{video.display_title || video.title}</h3>
        {timestamp > 0 && (
          <span className="current-timestamp">
            @ {formatTimestamp(timestamp)}
            {endTime ? ` – ${formatTimestamp(endTime)}` : ''}
          </span>
        )}
      </div>

      <div className="player-wrapper">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          controls
          playing={playing}
          width="100%"
          height="100%"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onProgress={handleProgress}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload'
              }
            }
          }}
        />
      </div>

      <div className="video-meta">
        <p className="video-id">Video ID: {video.video_id}</p>
      </div>
    </div>
  );
}

function formatTimestamp(ms) {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hrs > 0) {
    return `${hrs}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${remainingMins}:${secs.toString().padStart(2, '0')}`;
}

export default VideoPlayer;
