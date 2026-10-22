export function quizReducer(state, action) {
  switch (action.type) {
    case 'reset': return action.session
    case 'answer': {
      if (state.selectedId) return state
      const correct = action.id === action.correctId
      return { ...state, selectedId: action.id, correct: state.correct + Number(correct), incorrect: state.incorrect + Number(!correct) }
    }
    case 'next': return state.index >= state.records.length - 1 ? { ...state, complete: true } : { ...state, index: state.index + 1, selectedId: null }
    default: return state
  }
}
