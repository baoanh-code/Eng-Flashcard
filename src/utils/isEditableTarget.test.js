import { describe, expect, it } from 'vitest'
import { isEditableTarget } from './isEditableTarget.js'

function keyboardEvent(target, overrides = {}) {
  return { altKey: false, ctrlKey: false, defaultPrevented: false, metaKey: false, shiftKey: false, target, ...overrides }
}

describe('isEditableTarget', () => {
  it('suppresses global study shortcuts inside native and ARIA controls', () => {
    const button = document.createElement('button')
    const icon = document.createElement('span')
    button.append(icon)
    const link = document.createElement('a')
    link.href = '/topics'
    const customButton = document.createElement('div')
    customButton.setAttribute('role', 'button')

    expect(isEditableTarget(keyboardEvent(icon))).toBe(true)
    expect(isEditableTarget(keyboardEvent(link))).toBe(true)
    expect(isEditableTarget(keyboardEvent(customButton))).toBe(true)
  })

  it('allows unmodified shortcuts from non-interactive content', () => {
    expect(isEditableTarget(keyboardEvent(document.body))).toBe(false)
  })
})
