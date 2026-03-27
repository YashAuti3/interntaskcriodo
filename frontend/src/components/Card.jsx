import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

// Full-saturated card face colours — keep them vivid for contrast against dark bg
const CARD_COLORS = {
  1: 'from-red-700 to-red-500 shadow-red-600/50',
  2: 'from-sky-700 to-sky-500 shadow-sky-600/50',
  3: 'from-emerald-700 to-emerald-500 shadow-emerald-600/50',
  4: 'from-amber-500 to-yellow-400 shadow-amber-500/50',
  5: 'from-violet-700 to-violet-500 shadow-violet-600/50',
};

const NUMBER_COLORS = {
  1: 'text-red-700',
  2: 'text-sky-700',
  3: 'text-emerald-700',
  4: 'text-amber-600',
  5: 'text-violet-700',
};

export default function Card({ card, isFlipped, isMatched, onClick }) {
  const { isDark } = useTheme();
  const isLight = card.colorIndex === 4; // amber card has lighter face
  const labelColor = isLight ? 'text-black/80' : 'text-white';

  return (
    <motion.div
      layout
      className="w-full aspect-[2/3] cursor-pointer perspective-1000 select-none relative"
      onClick={() => (!isFlipped && !isMatched) && onClick()}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 280, damping: 22 }}
      >
        {/* ── Card Back ── */}
        <div className={`absolute inset-0 backface-hidden rounded-sm border-2 flex flex-col items-center justify-center shadow-lg overflow-hidden ${isDark ? 'border-green-900/80 bg-[#0a0f0a]' : 'border-green-800/30 bg-[#f0faf3]'}`}>

          {/* Grid texture — thicker lines (2px, higher opacity) */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: isDark
                ? 'linear-gradient(0deg, transparent 46%, rgba(0,220,80,0.28) 47%, rgba(0,220,80,0.28) 53%, transparent 54%), linear-gradient(90deg, transparent 46%, rgba(0,220,80,0.28) 47%, rgba(0,220,80,0.28) 53%, transparent 54%)'
                : 'linear-gradient(0deg, transparent 46%, rgba(16,120,60,0.18) 47%, rgba(16,120,60,0.18) 53%, transparent 54%), linear-gradient(90deg, transparent 46%, rgba(16,120,60,0.18) 47%, rgba(16,120,60,0.18) 53%, transparent 54%)',
              backgroundSize: '18px 18px',
            }}
          />

          {/* Playing-card diamond — SVG so proportions are exact */}
          <svg
            viewBox="0 0 60 80"
            className="relative z-10 w-8 h-12 sm:w-12 sm:h-16 drop-shadow-lg"
            style={{ filter: isDark ? 'drop-shadow(0 0 8px rgba(22,201,92,0.65))' : 'drop-shadow(0 2px 4px rgba(16,120,60,0.30))' }}
          >
            {/* Outer diamond */}
            <polygon
              points="30,2 58,40 30,78 2,40"
              fill="none"
              stroke={isDark ? 'rgba(22,201,92,0.85)' : 'rgba(16,120,60,0.65)'}
              strokeWidth="3"
            />
            {/* Inner diamond (inset) */}
            <polygon
              points="30,10 50,40 30,70 10,40"
              fill="none"
              stroke={isDark ? 'rgba(22,201,92,0.40)' : 'rgba(16,120,60,0.30)'}
              strokeWidth="1.5"
            />
            {/* Centre fill */}
            <polygon
              points="30,2 58,40 30,78 2,40"
              fill={isDark ? 'rgba(22,201,92,0.07)' : 'rgba(16,120,60,0.06)'}
            />
          </svg>
        </div>

        {/* ── Card Front ── */}
        <div
          className={`absolute inset-0 backface-hidden rounded-sm bg-gradient-to-br ${CARD_COLORS[card.colorIndex]}
                      flex items-center justify-center overflow-hidden border border-black/30
                      shadow-[inset_0_0_0_4px_rgba(255,255,255,0.9),_0_4px_18px_rgba(0,0,0,0.6)]`}
          style={{ transform: 'rotateY(180deg)' }}
        >
          {isMatched && (
            <div className="absolute inset-0 bg-black/55 z-20 flex items-center justify-center rounded-sm backdrop-blur-[2px]">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-green-500 flex items-center justify-center shadow-[0_0_18px_rgba(34,197,94,0.9)] border-2 border-white">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}

          {/* Corner labels */}
          <div className={`absolute top-1 left-1.5 sm:top-1.5 sm:left-2 ${labelColor} font-black text-[10px] sm:text-base leading-none z-10`}>
            {card.value}
          </div>
          <div className={`absolute bottom-1 right-1.5 sm:bottom-1.5 sm:right-2 ${labelColor} font-black text-[10px] sm:text-base leading-none z-10 rotate-180`}>
            {card.value}
          </div>

          {/* Centre oval */}
          <div className="w-[65%] h-[75%] sm:w-[58%] sm:h-[72%] bg-white rounded-[50%] transform -rotate-[20deg] flex items-center justify-center border border-black/10 relative z-10 shadow-sm">
            <span className={`text-2xl sm:text-5xl font-black ${NUMBER_COLORS[card.colorIndex]} transform rotate-[20deg] select-none tracking-tighter`}>
              {card.value}
            </span>
          </div>

          {/* Shine overlay */}
          <div className="absolute top-0 right-0 w-full h-[140%] bg-white/10 rotate-[30deg] translate-x-1/2 -translate-y-1/4 pointer-events-none" />
        </div>
      </motion.div>
    </motion.div>
  );
}
