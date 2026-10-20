import { ProgressBar } from '../../components/ui/ProgressBar.jsx'

export function ProgressSummary({ progress }) {
  return <section className="progress-summary" aria-labelledby="overall-progress"><div className="progress-summary__lead"><span className="progress-summary__value">{progress.percentage}%</span><h2 id="overall-progress">hoàn thành thư viện</h2></div><div className="progress-summary__bar"><ProgressBar label="Tiến độ tổng" value={progress.learned} max={progress.total} valueText={`${progress.learned}/${progress.total} từ`} /></div><dl><div><dt>Đã học</dt><dd>{progress.learned}</dd></div><div><dt>Cần ôn</dt><dd>{progress.review}</dd></div><div><dt>Chưa học</dt><dd>{progress.notStudied}</dd></div></dl></section>
}
