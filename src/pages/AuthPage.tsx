import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { Wordmark } from '../components/Wordmark';
import { LoginTeaser } from '../components/LoginTeaser';

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          // Without this, the confirmation email falls back to the shared
          // Supabase project's Site URL — which may point at a different
          // app sharing this project (e.g. pickframe) rather than punar.
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setInfo('Check your inbox to confirm your email, then sign in.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <LoginTeaser />
      <div className="auth-card">
        <Wordmark />
        <p className="sub">the shared tracker for bills, chores, and to-dos</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button className="submit" type="submit" disabled={busy}>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
        {info && <p className="switch">{info}</p>}

        <p className="switch">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
