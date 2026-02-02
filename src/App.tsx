import { useState, useRef, useEffect, useCallback } from 'react';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [ringIntensity, setRingIntensity] = useState(50);
  const [ringColor, setRingColor] = useState('#F5DEB3');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera.');
        } else {
          setError('Unable to access camera: ' + err.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const glowIntensity = ringIntensity / 100;
  const glowSpread = 20 + (ringIntensity * 0.8);
  const glowBlur = 40 + (ringIntensity * 1.2);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: isStreaming
            ? `radial-gradient(circle at center, ${ringColor}${Math.round(glowIntensity * 15).toString(16).padStart(2, '0')} 0%, transparent 70%)`
            : 'none',
          opacity: isStreaming ? 1 : 0
        }}
      />

      {/* Title */}
      <div className="mb-6 md:mb-10 text-center z-10">
        <h1
          className="text-4xl md:text-5xl font-light tracking-[0.3em] text-amber-100 mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          TRUE MIRROR
        </h1>
        <p
          className="text-xs md:text-sm tracking-[0.5em] uppercase text-amber-200/40"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          See yourself as others do
        </p>
      </div>

      {/* Mirror container with ring light */}
      <div className="relative z-10">
        {/* Outer decorative ring */}
        <div
          className="absolute -inset-3 md:-inset-4 rounded-full pointer-events-none transition-all duration-500"
          style={{
            background: isStreaming
              ? `conic-gradient(from 0deg, ${ringColor}88, ${ringColor}22, ${ringColor}88, ${ringColor}22, ${ringColor}88)`
              : 'conic-gradient(from 0deg, #3d3d3d, #1a1a1a, #3d3d3d, #1a1a1a, #3d3d3d)',
            opacity: isStreaming ? glowIntensity : 0.3
          }}
        />

        {/* Main ring light glow */}
        <div
          className="absolute -inset-2 md:-inset-3 rounded-full pointer-events-none transition-all duration-300"
          style={{
            boxShadow: isStreaming
              ? `0 0 ${glowBlur}px ${glowSpread}px ${ringColor}${Math.round(glowIntensity * 80).toString(16).padStart(2, '0')}, inset 0 0 ${glowBlur/2}px ${glowSpread/2}px ${ringColor}${Math.round(glowIntensity * 40).toString(16).padStart(2, '0')}`
              : 'none',
            background: 'transparent',
            border: isStreaming ? `2px solid ${ringColor}${Math.round(glowIntensity * 99).toString(16).padStart(2, '0')}` : '2px solid #2a2a2a'
          }}
        />

        {/* Inner frame */}
        <div className="relative rounded-full overflow-hidden border-4 border-neutral-900 shadow-2xl">
          {/* Video element - NOT mirrored (shows true view) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] lg:w-[480px] lg:h-[480px] object-cover bg-neutral-950"
            style={{
              transform: 'scaleX(1)', // NOT flipped - shows true mirror view
            }}
          />

          {/* Overlay when not streaming */}
          {!isStreaming && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/90 backdrop-blur-sm">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-2 border-amber-200/30 border-t-amber-200 rounded-full animate-spin" />
                  <p className="text-amber-200/60 text-sm tracking-widest" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Initializing...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center px-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-red-400/30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-red-400/80 text-sm mb-4 max-w-[200px]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {error}
                  </p>
                  <button
                    onClick={startCamera}
                    className="text-amber-200/60 text-xs tracking-[0.3em] uppercase hover:text-amber-200 transition-colors"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <button
                  onClick={startCamera}
                  className="group flex flex-col items-center gap-4 transition-all hover:scale-105"
                >
                  <div className="w-20 h-20 rounded-full border border-amber-200/30 flex items-center justify-center group-hover:border-amber-200/60 group-hover:bg-amber-200/5 transition-all duration-300">
                    <svg className="w-8 h-8 text-amber-200/50 group-hover:text-amber-200/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span
                    className="text-amber-200/40 text-xs tracking-[0.4em] uppercase group-hover:text-amber-200/70 transition-colors"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    Tap to Start
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Subtle vignette overlay */}
          {isStreaming && (
            <div
              className="absolute inset-0 pointer-events-none rounded-full"
              style={{
                background: 'radial-gradient(circle, transparent 60%, rgba(0,0,0,0.4) 100%)'
              }}
            />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className={`mt-8 md:mt-12 w-full max-w-md px-4 z-10 transition-all duration-500 ${isStreaming ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {/* Ring light intensity */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label
              className="text-amber-200/60 text-xs tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Ring Light
            </label>
            <span
              className="text-amber-200/40 text-xs tabular-nums"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {ringIntensity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={ringIntensity}
            onChange={(e) => setRingIntensity(Number(e.target.value))}
            className="w-full h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer slider-gold"
          />
        </div>

        {/* Color presets */}
        <div className="mb-8">
          <label
            className="text-amber-200/60 text-xs tracking-[0.3em] uppercase block mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Light Temperature
          </label>
          <div className="flex justify-center gap-3">
            {[
              { color: '#FFFAF0', name: 'Daylight' },
              { color: '#F5DEB3', name: 'Warm' },
              { color: '#FFD700', name: 'Golden' },
              { color: '#FFA07A', name: 'Sunset' },
              { color: '#E6E6FA', name: 'Cool' },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => setRingColor(preset.color)}
                className={`w-10 h-10 rounded-full transition-all duration-300 ${
                  ringColor === preset.color
                    ? 'scale-110 ring-2 ring-offset-2 ring-offset-black'
                    : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: preset.color,
                  boxShadow: ringColor === preset.color ? `0 0 20px ${preset.color}66` : 'none'
                }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Stop button */}
        <button
          onClick={stopCamera}
          className="w-full py-3 border border-neutral-700 text-amber-200/50 text-xs tracking-[0.4em] uppercase hover:border-amber-200/30 hover:text-amber-200/80 hover:bg-amber-200/5 transition-all duration-300 rounded"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Stop Mirror
        </button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center z-10">
        <p
          className="text-neutral-600 text-[10px] tracking-[0.2em]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Requested by <span className="text-neutral-500">@aiob_me</span> · Built by <span className="text-neutral-500">@clonkbot</span>
        </p>
      </footer>

      {/* Custom slider styles */}
      <style>{`
        .slider-gold::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F5DEB3 0%, #D4AF37 100%);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(245, 222, 179, 0.5);
          transition: all 0.2s ease;
        }
        .slider-gold::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(245, 222, 179, 0.7);
        }
        .slider-gold::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F5DEB3 0%, #D4AF37 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(245, 222, 179, 0.5);
        }
      `}</style>
    </div>
  );
}

export default App;
