import { useEffect, useRef, useState, type ComponentProps, type CSSProperties } from 'react';
import { cx } from '../classes';
import { IconButton } from './IconButton';
import { Progress } from './Progress';
import { Slider } from './Slider';

/** Props for {@link AudioPlayer}. Native audio attributes and event handlers go to the hidden audio element. */
export interface AudioPlayerProps extends Omit<ComponentProps<'audio'>, 'children' | 'controls' | 'className' | 'style' | 'src'> {
  /** Audio URL, including a blob URL for a local recording. */
  src: string;
  /** Optional normalized input level from 0 to 1, shown as a meter for recording interfaces. */
  level?: number;
  /** Accessible and visible label for the input level meter. */
  levelLabel?: string;
  /** Accessible label for the play button. */
  playLabel?: string;
  /** Accessible label for the pause button. */
  pauseLabel?: string;
  /** Accessible label for the seek slider. */
  seekLabel?: string;
  /** Class applied to the visible player container. */
  className?: string;
  /** Styles applied to the visible player container. */
  style?: CSSProperties;
}

function formatTime(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const minutes = Math.floor(total / 60);
  const value = `${String(minutes % 60).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  return minutes >= 60 ? `${Math.floor(minutes / 60)}:${value}` : `${minutes}:${String(total % 60).padStart(2, '0')}`;
}

function PlayIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5a1 1 0 0 1 1.5-.86l11 7.5a1 1 0 0 1 0 1.72l-11 7.5A1 1 0 0 1 7 19.5z" /></svg>;
}

function PauseIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zm8 0h4v16h-4z" /></svg>;
}

/** An audio player with token-styled playback and seek controls, elapsed time, and an optional input level meter. */
export function AudioPlayer({
  src,
  level,
  levelLabel = 'Input level',
  playLabel = 'Play audio',
  pauseLabel = 'Pause audio',
  seekLabel = 'Seek audio',
  className,
  style,
  preload = 'metadata',
  ref,
  ...audioProps
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const sync = () => {
      setPlaying(!audio.paused);
      setDuration(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0);
      setCurrentTime(audio.currentTime);
    };
    for (const event of ['play', 'pause', 'timeupdate', 'loadedmetadata', 'durationchange', 'emptied', 'ended']) audio.addEventListener(event, sync);
    sync();
    return () => {
      for (const event of ['play', 'pause', 'timeupdate', 'loadedmetadata', 'durationchange', 'emptied', 'ended']) audio.removeEventListener(event, sync);
    };
  }, [src]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
    }
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio || duration <= 0) return;
    audio.currentTime = value;
    setCurrentTime(value);
  }

  return <div className={cx('yarcl-audio-player', className)} style={style}>
    <audio
      {...audioProps}
      src={src}
      preload={preload}
      ref={(node) => {
        audioRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref && 'current' in ref) (ref as React.MutableRefObject<HTMLAudioElement | null>).current = node;
      }}
      className="yarcl-audio-player-native"
    />
    <div className="yarcl-audio-player-controls">
      <IconButton aria-label={playing ? pauseLabel : playLabel} onClick={togglePlayback} disabled={!src}>
        {playing ? <PauseIcon /> : <PlayIcon />}
      </IconButton>
      <Slider
        aria-label={seekLabel}
        min={0}
        max={duration || 1}
        step={0.1}
        value={Math.min(currentTime, duration || 1)}
        onValueChange={seek}
        formatValue={formatTime}
        disabled={duration <= 0}
      />
      <span className="yarcl-audio-player-time" aria-live="off">{formatTime(currentTime)} / {formatTime(duration)}</span>
    </div>
    {level !== undefined && <Progress value={Math.min(1, Math.max(0, Number.isFinite(level) ? level : 0)) * 100} label={levelLabel} />}
  </div>;
}
