import { Button } from '../../components/ui/Button.jsx'

export function StudyOrderControl({ onChange, onReshuffle, value }) {
  return (
    <div className="study-order-controls">
      <label className="order-control">
        <span>Thứ tự</span>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="original">Theo danh sách</option>
          <option value="random">Ngẫu nhiên</option>
        </select>
      </label>
      {value === 'random' ? <Button className="reshuffle-button" variant="ghost" onClick={onReshuffle}>Xáo lại</Button> : null}
    </div>
  )
}
