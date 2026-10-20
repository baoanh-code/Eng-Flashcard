import { NavLink } from 'react-router'
import { studyModes } from '../topics/studyModes.js'

export function ModeSwitcher({ levelId, topicId }) {
  return <nav aria-label="Chế độ học" className="mode-switcher">{studyModes.map((mode) => { const Icon = mode.icon; return <NavLink key={mode.id} to={`/levels/${levelId}/topics/${topicId}/study/${mode.id}`}><span className="mode-switcher__icon"><Icon aria-hidden="true" size={20} strokeWidth={1.7} /></span><span><strong>{mode.label}</strong><small>{mode.description}</small></span></NavLink> })}</nav>
}
