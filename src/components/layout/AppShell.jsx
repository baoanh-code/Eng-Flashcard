import { Outlet } from 'react-router'
import { useProgress } from '../../features/progress/useProgress.js'
import { Header } from './Header.jsx'
import { Footer } from './Footer.jsx'
import { PageContainer } from './PageContainer.jsx'
import { RouteAnnouncer } from './RouteAnnouncer.jsx'
import { SkipLink } from './SkipLink.jsx'

export function AppShell() {
  const { persistenceStatus } = useProgress()
  return (
    <>
      <SkipLink />
      <Header />
      <RouteAnnouncer />
      <main className="app-main" id="main-content">
        <PageContainer>
          {['unavailable', 'write-error'].includes(persistenceStatus) ? <div className="storage-warning" role="status">Không thể lưu tiến độ lâu dài. Bạn vẫn có thể học trong phiên này.</div> : null}
          <Outlet />
        </PageContainer>
      </main>
      <Footer />
    </>
  )
}
