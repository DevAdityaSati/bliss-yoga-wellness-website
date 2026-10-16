import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Video, ShieldCheck, Maximize2, Minimize2, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';

interface JitsiModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  userName: string;
  programTitle: string;
}

export default function JitsiModal({
  isOpen,
  onClose,
  roomName,
  userName,
  programTitle,
}: JitsiModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoaded(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sanitizeRoom = roomName.replace(/[^a-zA-Z0-9_]/g, '_');
  const encodedUser = encodeURIComponent(userName || 'Practitioner');
  const jitsiUrl = `https://meet.jit.si/${sanitizeRoom}#userInfo.displayName="${encodedUser}"&config.prejoinPageEnabled=false`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`bg-[#121412] border border-[#c5a059]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden w-full transition-all duration-300 ${
            isFullscreen ? 'h-full max-w-none' : 'max-w-5xl h-[85vh]'
          }`}
        >
          {/* Header Bar */}
          <div className="px-6 py-4 bg-[#191c19] border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
                <Video className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold tracking-wider text-[#94a388] uppercase">
                    Live Jitsi Sanctuary
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> LIVE
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#f4f1ea] leading-tight">
                  {programTitle}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={jitsiUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs border border-white/10 transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#c5a059]" /> Open External
              </a>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                title="Leave Meeting"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Iframe Container */}
          <div className="relative flex-grow bg-black w-full h-full overflow-hidden">
            {!isLoaded && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#121412] text-center p-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#c5a059] border-t-transparent animate-spin mb-4" />
                <p className="font-serif text-lg text-[#f4f1ea] font-medium">Connecting to Secure Yoga Room...</p>
                <p className="text-xs text-[#94a388] mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> End-to-end encrypted video stream powered by Jitsi
                </p>
              </div>
            )}

            <iframe
              src={jitsiUrl}
              allow="camera; microphone; display-capture; autoplay; clipboard-write"
              className="w-full h-full border-0"
              onLoad={() => setIsLoaded(true)}
              title="Live Yoga Class Room"
            />
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3 bg-[#191c19] border-t border-white/10 flex items-center justify-between text-xs text-white/60 shrink-0">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" /> Room ID: <code className="text-[#c5a059] font-mono">{sanitizeRoom}</code>
            </span>
            <span className="hidden sm:inline-block text-[11px] text-white/40">
              Ensure camera and microphone permissions are allowed in your browser.
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
