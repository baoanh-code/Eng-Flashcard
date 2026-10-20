import { MatchCard } from './MatchCard.jsx'

export function MatchingBoard({ onDefinition, onTerm, round, state }) {
  const matched = new Set(state.matchedIds)
  return <div className="matching-board"><div role="group" aria-labelledby="terms-heading"><h2 id="terms-heading">Từ tiếng Anh</h2>{round.terms.map((record) => <MatchCard key={record.id} matched={matched.has(record.id)} selected={state.selectedTermId === record.id} incorrect={state.mismatch?.termId === record.id} onClick={() => onTerm(record.id)}>{record.term}</MatchCard>)}</div><div role="group" aria-labelledby="definitions-heading"><h2 id="definitions-heading">Nghĩa tiếng Việt</h2>{round.definitions.map((record) => <MatchCard key={record.id} matched={matched.has(record.id)} selected={state.selectedDefinitionId === record.id} incorrect={state.mismatch?.definitionId === record.id} onClick={() => onDefinition(record.id)}>{record.definition}</MatchCard>)}</div></div>
}
