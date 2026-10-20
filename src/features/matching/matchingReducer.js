export function matchingReducer(state, action) {
  switch (action.type) {
    case 'selectTerm': return state.mismatch ? state : evaluate({ ...state, selectedTermId: action.id })
    case 'selectDefinition': return state.mismatch ? state : evaluate({ ...state, selectedDefinitionId: action.id })
    case 'clearMismatch': return { ...state, mismatch: null, selectedTermId: null, selectedDefinitionId: null }
    case 'nextRound': return { ...state, roundIndex: state.roundIndex + 1, matchedIds: [], selectedTermId: null, selectedDefinitionId: null, mismatch: null, startedAt: action.startedAt }
    default: return state
  }
}

function evaluate(state) {
  if (!state.selectedTermId || !state.selectedDefinitionId) return state
  if (state.selectedTermId === state.selectedDefinitionId) return { ...state, matchedIds: [...state.matchedIds, state.selectedTermId], selectedTermId: null, selectedDefinitionId: null }
  return { ...state, mistakes: state.mistakes + 1, mismatch: { termId: state.selectedTermId, definitionId: state.selectedDefinitionId } }
}
