import { Link } from 'react-router'
import { PageContainer } from './PageContainer.jsx'

export function Footer() {
  return <footer className="app-footer"><PageContainer className="footer-inner"><div><p className="eyebrow">GIỚI THIỆU</p><h2>Học từ trong ngữ cảnh.</h2><p>Thư viện từ vựng tiếng Anh theo chủ đề, kèm nghĩa tiếng Việt và ví dụ ngắn để bạn học nhanh mà không cần tài khoản.</p></div><div className="footer-signoff"><strong>English Vocabulary</strong><span>Tiến độ được lưu trên thiết bị này.</span><Link to="/levels/general/topics">Xem các chủ đề →</Link></div></PageContainer></footer>
}
