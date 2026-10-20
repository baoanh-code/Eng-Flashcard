import { Search } from 'lucide-react'

export function TopicSearch({ onChange, value }) {
  return <label className="search-field"><span>Tìm chủ đề</span><span className="search-input-wrap"><Search aria-hidden="true" size={18} /><input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Ví dụ: gia đình" /></span></label>
}
