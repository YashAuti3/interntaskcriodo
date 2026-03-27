import React from 'react';

/**
 * Bright colorful tile card — just a big number in the center.
 * No suits, no playing-card aesthetic. Pure color + number.
 * Each number gets a unique vivid color from a curated palette.
 */

/* 5 bright solid colors that cycle */
const COLORS = [
  '#EF4444',   // red
  '#3B82F6',   // blue
  '#22C55E',   // green
  '#F97316',   // orange
  '#A855F7',   // purple
];

function getColor(number) {
  return COLORS[(number - 1) % COLORS.length];
}

/* state colors */
const MATCHED_BG  = '#16A34A';
const WRONG_BG    = '#DC2626';
const BACK_BG     = '#2563EB';

export default function Card({ card, isSelected, isWrong, disabled, onClick }) {
  const handleClick = () => {
    if (disabled || card.isMatched) return;
    onClick(card);
  };

  const isFlipped = card.isFlipped || card.isMatched;
  const color     = getColor(card.number);

  const faceBg = card.isMatched ? MATCHED_BG
    : isWrong ? WRONG_BG
    : color;

  return (
    <div
      className={`relative w-full perspective-800 ${
        disabled && !card.isMatched ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{ aspectRatio: '2/3' }}
      onClick={handleClick}
      role="button"
      aria-label={isFlipped ? `Card ${card.number}` : 'Face-down card'}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div
        className={`absolute inset-0 preserve-3d transition-transform duration-500 ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >

        {/* ══ FACE DOWN ══ */}
        <div
          className="absolute inset-0 backface-hidden flex items-center justify-center"
          style={{
            borderRadius: 12,
            background: isWrong ? WRONG_BG : BACK_BG,
            border: '3px solid rgba(255,255,255,0.25)',
          }}
        >
          <span
            className="select-none"
            style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}
          >
            ?
          </span>
        </div>

        {/* ══ FACE UP ══ */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center"
          style={{
            borderRadius: 12,
            background: faceBg,
            border: '3px solid rgba(255,255,255,0.3)',
          }}
        >
          <span
            className="select-none"
            style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1,
            }}
          >
            {card.isMatched ? '✓' : card.number}
          </span>

          {isWrong && (
            <div
              className="absolute inset-0 animate-pulse"
              style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12 }}
            />
          )}
        </div>

      </div>
    </div>
  );
}
