export function MatchCard({ children, incorrect, matched, onClick, selected }) {
  return <button aria-pressed={selected} className={`match-card ${selected ? 'selected' : ''} ${incorrect ? 'incorrect' : ''}`} disabled={matched} onClick={onClick} type="button"><span>{children}</span>{incorrect ? <small>Không khớp</small> : selected ? <small>Đã chọn</small> : null}</button>
}
