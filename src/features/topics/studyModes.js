import { Keyboard, Layers3, ListChecks, Puzzle } from 'lucide-react'

export const studyModes = [
  { id: 'flashcards', label: 'Học thẻ', englishLabel: 'Flashcards', description: 'Xem từ và ví dụ', icon: Layers3 },
  { id: 'multiple-choice', label: 'Trắc nghiệm', englishLabel: 'Multiple Choice', description: 'Chọn nghĩa phù hợp', icon: ListChecks },
  { id: 'writing', label: 'Viết lại', englishLabel: 'Writing', description: 'Gõ lại mục từ', icon: Keyboard },
  { id: 'matching', label: 'Ghép cặp', englishLabel: 'Matching', description: 'Nối từ với nghĩa', icon: Puzzle },
]
