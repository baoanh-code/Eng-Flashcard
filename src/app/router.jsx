import { Route, Routes } from 'react-router'
import { AppShell } from '../components/layout/AppShell.jsx'
import { HomePage } from '../pages/HomePage.jsx'
import { NotFoundPage } from '../pages/NotFoundPage.jsx'
import { ProgressPage } from '../pages/ProgressPage.jsx'
import { ReviewPage } from '../pages/ReviewPage.jsx'
import { StudyPage } from '../pages/StudyPage.jsx'
import { TopicPage } from '../pages/TopicPage.jsx'
import { TopicsPage } from '../pages/TopicsPage.jsx'
import { VocabularyPage } from '../pages/VocabularyPage.jsx'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="levels/:levelId/topics" element={<TopicsPage />} />
        <Route path="levels/:levelId/topics/:topicId" element={<TopicPage />} />
        <Route path="levels/:levelId/topics/:topicId/study/:mode" element={<StudyPage />} />
        <Route path="levels/:levelId/review" element={<ReviewPage />} />
        <Route path="vocabulary" element={<VocabularyPage />} />
        <Route path="levels/:levelId/progress" element={<ProgressPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
