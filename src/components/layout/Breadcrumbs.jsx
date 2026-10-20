import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

export function Breadcrumbs({ items }) {
  return <nav aria-label="Đường dẫn" className="breadcrumbs"><ol>{items.map((item, index) => <li key={item.to ?? item.label}>{index ? <ChevronRight aria-hidden="true" size={15} /> : null}{item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>
}
