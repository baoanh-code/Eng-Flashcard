export function flashcardReducer(state, action) {
  switch (action.type) {
    case 'reset': return action.session
    case 'flip': return state.complete ? state : { ...state, flipped: !state.flipped }
    case 'previous': return { ...state, index: Math.max(0, state.index - 1), flipped: false }
    case 'next': return state.index >= state.records.length - 1 ? { ...state, complete: true, flipped: false } : { ...state, index: state.index + 1, flipped: false }
    case 'classify': return { ...state, classifications: { ...state.classifications, [action.id]: action.status } }
    case 'remove': {
      const records = state.records.filter((record) => record.id !== action.id)
      if (records.length === state.records.length) return state
      return {
        ...state,
        records,
        index: Math.min(state.index, Math.max(0, records.length - 1)),
        flipped: false,
        complete: records.length === 0,
      }
    }
    default: return state
  }
}
