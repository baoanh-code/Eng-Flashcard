import { useState } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { TextField } from '../../components/ui/TextField.jsx'

export function WritingAnswerForm({ disabled, onSubmit }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  function submit(event) { event.preventDefault(); if (!value.trim()) { setError('Hãy nhập một từ trước khi kiểm tra.'); return } setError(''); onSubmit(value) }
  return <form className="writing-form" onSubmit={submit}><TextField autoCapitalize="none" autoComplete="off" disabled={disabled} error={error} label="Từ tiếng Anh" onChange={(event) => setValue(event.target.value)} spellCheck="false" value={value} /><Button disabled={disabled} type="submit">Kiểm tra</Button></form>
}
