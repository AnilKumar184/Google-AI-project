/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, RefreshCw, Terminal } from 'lucide-react';

// --- Music Player Data ---
const TRACKS = [
  {
    id: 1,
    title: "ERR_0x001_CORRUPTED",
    artist: "UNKNOWN_ENTITY",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "MEM_LEAK_DETECTED",
    artist: "SYS.ADMIN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "BUFFER_OVERFLOW",
    artist: "NULL_POINTER",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

// --- Snake Game Constants ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 70;

type Point = { x: number; y: number };

export default function App() {
  // --- Music Player State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Snake Game State ---
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);

  // --- Music Player Logic ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(e => console.error("Audio play error:", e));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTrackEnd = () => {
    playNext();
  };

  // --- Snake Game Logic ---
  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setIsGamePaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOver) {
        if (e.key === 'Enter') resetGame();
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          setIsGamePaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver]);

  useEffect(() => {
    if (gameOver || isGamePaused) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [direction, food, gameOver, isGamePaused, generateFood]);


  return (
    <div className="min-h-screen bg-black text-white font-terminal flex flex-col items-center justify-center p-4 overflow-hidden relative selection:bg-magenta-glitch selection:text-black">
      {/* Static Noise Overlay */}
      <div className="absolute inset-0 z-50 bg-static pointer-events-none"></div>

      {/* Scanlines */}
      <div className="absolute inset-0 z-40 pointer-events-none opacity-20" style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}></div>

      <div className="z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-tear">
        
        {/* Left Column: Title & Music Player */}
        <div className="flex flex-col gap-8 lg:col-span-1">
          <div className="text-center lg:text-left border-l-4 border-cyan-glitch pl-4 py-2 bg-gray-900/50">
            <h1 className="text-4xl font-pixel text-magenta-glitch glitch-text mb-4" data-text="SYS.ERR">SYS.ERR</h1>
            <h1 className="text-2xl font-pixel text-cyan-glitch glitch-text" data-text="// SNAKE.EXE">// SNAKE.EXE</h1>
          </div>

          {/* Music Player */}
          <div className="bg-black border-2 border-magenta-glitch p-6 flex flex-col gap-4 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-glitch animate-pulse"></div>
            <h2 className="text-2xl font-pixel text-cyan-glitch uppercase tracking-widest border-b border-gray-800 pb-4 glitch-text" data-text="AUDIO.STREAM">AUDIO.STREAM</h2>
            
            <div className="flex flex-col gap-1 my-4">
              <div className="text-2xl font-bold text-white truncate text-glitch-split">{TRACKS[currentTrackIndex].title}</div>
              <div className="text-lg text-magenta-glitch truncate">[{TRACKS[currentTrackIndex].artist}]</div>
            </div>

            <div className="flex items-center justify-between mt-2 mb-2">
              <button onClick={playPrev} className="p-2 text-cyan-glitch hover:text-magenta-glitch hover:scale-110 transition-all">
                <SkipBack size={32} />
              </button>
              <button onClick={togglePlay} className="p-4 bg-black border-2 border-cyan-glitch text-magenta-glitch hover:bg-cyan-glitch hover:text-black transition-all">
                {isPlaying ? <Pause size={40} /> : <Play size={40} className="ml-1" />}
              </button>
              <button onClick={playNext} className="p-2 text-cyan-glitch hover:text-magenta-glitch hover:scale-110 transition-all">
                <SkipForward size={32} />
              </button>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => setIsMuted(!isMuted)} className="text-magenta-glitch hover:text-cyan-glitch">
                {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-full h-2 bg-gray-800 appearance-none cursor-pointer accent-[#ff00ff]"
              />
            </div>

            <audio 
              ref={audioRef} 
              src={TRACKS[currentTrackIndex].url} 
              onEnded={handleTrackEnd}
              className="hidden"
            />
          </div>
          
          {/* Instructions */}
          <div className="bg-black border border-cyan-glitch p-6 text-xl text-gray-300">
            <h3 className="text-magenta-glitch font-pixel text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
              <Terminal size={16} /> INPUT.PARAMS
            </h3>
            <ul className="space-y-2">
              <li><span className="text-cyan-glitch bg-gray-900 px-2 py-1">W A S D</span> / <span className="text-cyan-glitch bg-gray-900 px-2 py-1">ARROWS</span> : NAVIGATE</li>
              <li><span className="text-cyan-glitch bg-gray-900 px-2 py-1">SPACE</span> : HALT_PROCESS</li>
              <li><span className="text-cyan-glitch bg-gray-900 px-2 py-1">ENTER</span> : REBOOT</li>
            </ul>
          </div>
        </div>

        {/* Center/Right Column: Snake Game */}
        <div className="lg:col-span-2 flex flex-col items-center">
          
          <div className="w-full flex justify-between items-end mb-4 px-2 border-b-2 border-magenta-glitch pb-2">
            <div className="text-2xl font-pixel uppercase tracking-widest text-cyan-glitch">
              DATA.COLLECTED: <span className="text-white text-glitch-split">{score}</span>
            </div>
          </div>

          <div className="relative bg-black border-4 border-cyan-glitch p-1 w-full max-w-[600px] aspect-square">
            <div 
              className="grid w-full h-full bg-gray-950" 
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const snakeIdx = snake.findIndex(segment => segment.x === x && segment.y === y);
                const isSnakeHead = snakeIdx === 0;
                const isSnakeBody = snakeIdx > 0;
                const isFood = food.x === x && food.y === y;

                let bodyStyle = {};
                if (isSnakeBody) {
                  const intensity = Math.max(0.2, 1 - (snakeIdx / snake.length));
                  bodyStyle = {
                    backgroundColor: `rgba(255, 0, 255, ${intensity})`,
                    border: '1px solid rgba(0, 255, 255, 0.3)'
                  };
                }

                return (
                  <div 
                    key={i} 
                    className={`w-full h-full
                      ${isSnakeHead ? 'bg-cyan-glitch border-2 border-magenta-glitch z-10' : ''}
                      ${isFood ? 'bg-white animate-pulse' : ''}
                      ${!isSnakeHead && !isSnakeBody && !isFood ? 'border border-gray-900/50' : ''}
                    `}
                    style={isSnakeBody ? bodyStyle : undefined}
                  />
                );
              })}
            </div>

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 border-4 border-magenta-glitch animate-tear">
                <h2 className="text-4xl md:text-6xl font-pixel text-magenta-glitch mb-6 glitch-text text-center" data-text="SYSTEM.FAILURE">SYSTEM.FAILURE</h2>
                <p className="text-2xl text-cyan-glitch mb-8 font-terminal">FINAL_DATA: <span className="text-white">{score}</span></p>
                <button 
                  onClick={resetGame}
                  className="flex items-center gap-3 px-8 py-4 bg-black border-2 border-cyan-glitch text-cyan-glitch font-pixel text-sm uppercase tracking-widest hover:bg-cyan-glitch hover:text-black transition-all"
                >
                  <RefreshCw size={24} />
                  REBOOT.SEQUENCE
                </button>
              </div>
            )}

            {/* Paused Overlay */}
            {isGamePaused && !gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 border-2 border-cyan-glitch">
                <h2 className="text-4xl font-pixel text-cyan-glitch tracking-widest glitch-text" data-text="PROCESS.HALTED">PROCESS.HALTED</h2>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
