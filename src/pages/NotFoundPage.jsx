import { Home, LibraryBig } from 'lucide-react'
import { Link } from 'react-router'
import { usePageMeta } from '../hooks/usePageMeta.js'

export function NotFoundPage() {
  usePageMeta('Không tìm thấy trang')

  return (
    <section className="empty-state" aria-labelledby="not-found-title">
      <LibraryBig aria-hidden="true" size={32} />
      <div>
        <h1 id="not-found-title">Không tìm thấy trang</h1>
        <p>Đường dẫn này không tồn tại. Bạn có thể quay lại trang chủ và chọn một chủ đề khác.</p>
      </div>
      <Link className="ui-button ui-button--primary" to="/">
        <Home aria-hidden="true" size={18} />
        Về trang chủ
      </Link>
    </section>
  )
}
