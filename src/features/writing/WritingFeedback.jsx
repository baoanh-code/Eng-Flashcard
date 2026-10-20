export function WritingFeedback({ answer, correct, term }) {
  return <div className={`feedback ${correct ? 'correct' : 'incorrect'}`} role="status"><strong>{correct ? 'Chính xác!' : 'Chưa đúng.'}</strong>{correct ? null : <><span>Bạn nhập: {answer}</span><span>Đáp án đúng: {term}</span></>}</div>
}
