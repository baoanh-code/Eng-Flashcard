import {
  createDefaultProgress,
  sanitizeProgress,
  STUDY_MODES,
  STUDY_ORDERS,
} from '../../services/progressStorage.js'

function without(items, id) {
  return items.filter((item) => item !== id)
}

function withUnique(items, id) {
  return items.includes(id) ? items : [...items, id]
}

export function progressReducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return sanitizeProgress(action.progress)
    case 'markLearned':
      return {
        ...state,
        learnedIds: withUnique(state.learnedIds, action.id),
        reviewIds: without(state.reviewIds, action.id),
      }
    case 'markReview':
      return {
        ...state,
        learnedIds: without(state.learnedIds, action.id),
        reviewIds: withUnique(state.reviewIds, action.id),
      }
    case 'clearStatus':
      return {
        ...state,
        learnedIds: without(state.learnedIds, action.id),
        reviewIds: without(state.reviewIds, action.id),
      }
    case 'updateLastSession':
      if (!STUDY_MODES.includes(action.mode)) return state
      return {
        ...state,
        lastSession: {
          levelId: action.levelId,
          topicId: action.topicId,
          mode: action.mode,
          updatedAt: action.updatedAt ?? new Date().toISOString(),
        },
      }
    case 'setStudyOrder':
      return STUDY_MODES.includes(action.mode) && STUDY_ORDERS.includes(action.studyOrder)
        ? {
          ...state,
          settings: {
            ...state.settings,
            studyOrderByMode: {
              ...state.settings.studyOrderByMode,
              [action.mode]: action.studyOrder,
            },
          },
        }
        : state
    case 'resetTopic': {
      const ids = new Set(action.ids)
      return {
        ...state,
        learnedIds: state.learnedIds.filter((id) => !ids.has(id)),
        reviewIds: state.reviewIds.filter((id) => !ids.has(id)),
        lastSession: state.lastSession?.levelId === action.levelId && state.lastSession?.topicId === action.topicId
          ? null
          : state.lastSession,
      }
    }
    case 'resetAll':
      return createDefaultProgress()
    default:
      return state
  }
}
