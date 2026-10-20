import { CatalogProvider } from '../data/catalog/CatalogProvider.jsx'
import { ProgressProvider } from '../features/progress/ProgressProvider.jsx'

export function AppProviders({ children }) {
  return (
    <CatalogProvider>
      <ProgressProvider>{children}</ProgressProvider>
    </CatalogProvider>
  )
}
