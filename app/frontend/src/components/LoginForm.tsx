import { useState } from 'react'
import { login } from '../api/atlas'

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true); setError(null)
    try { await login({ email, password }); setPassword(''); onSuccess() } catch (caughtError) { setError(caughtError instanceof Error ? caughtError.message : 'Login failed.') } finally { setSubmitting(false) }
  }

  return <form className="operator-form" onSubmit={(event) => void submit(event)}><h2 className="panel-title">Operator login</h2><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button></form>
}
