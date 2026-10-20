export function StudyOrderControl({ onChange, value }) {
  return <label className="order-control"><span>Thứ tự</span><select value={value} onChange={(event) => onChange(event.target.value)}><option value="original">Theo danh sách</option><option value="random">Ngẫu nhiên</option></select></label>
}
