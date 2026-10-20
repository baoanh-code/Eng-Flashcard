import { normalizeAnswer } from '../../utils/normalizeAnswer.js'

export function writingReducer(state, action) {
  switch (action.type) {
    case 'answer': {
      const correct = normalizeAnswer(action.answer) === normalizeAnswer(action.term)
      return { ...state, answer: action.answer, answered: true, correct: state.correct + Number(correct), incorrect: state.incorrect + Number(!correct), wasCorrect: correct }
    }
    case 'next': return state.index >= state.records.length - 1 ? { ...state, complete: true } : { ...state, index: state.index + 1, answer: '', answered: false, wasCorrect: false }
    default: return state
  }
}
