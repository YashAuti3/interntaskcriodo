export default function GameCard({
  card,
  onClick,
  selected,
  disabled,
}) {
  const shown = card.revealed || card.matched;
  const className = [
    "game-card",
    shown ? "flipped" : "",
    card.matched ? "matched" : "",
    selected ? "selected" : "",
    disabled && !shown ? "dimmed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} onClick={!disabled ? onClick : undefined}>
      <div className="card-inner">
        <div className="card-face front">?</div>
        <div className="card-face back">{card.num}</div>
      </div>
    </div>
  );
}
