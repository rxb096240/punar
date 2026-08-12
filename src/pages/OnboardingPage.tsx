import { useState, type FormEvent } from 'react';
import { useHousehold } from '../context/HouseholdContext';

export function OnboardingPage() {
  const { createHousehold, joinHousehold } = useHousehold();
  const [choice, setChoice] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (choice === 'create') {
        if (!name.trim()) throw new Error('Give your household a name.');
        await createHousehold(name.trim());
      } else {
        if (!code.trim()) throw new Error('Enter the invite code.');
        await joinHousehold(code.trim().toLowerCase());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>
          Punar<span className="dot">.</span>
        </h1>
        <p className="sub">set up your household</p>

        <div className="onboard-choice">
          <button
            type="button"
            className={choice === 'create' ? 'active' : ''}
            onClick={() => setChoice('create')}
          >
            <div className="name">Start a new household</div>
            <div className="desc">Create one and invite the rest of your household later</div>
          </button>
          <button
            type="button"
            className={choice === 'join' ? 'active' : ''}
            onClick={() => setChoice('join')}
          >
            <div className="name">Join an existing household</div>
            <div className="desc">Use the invite code someone shared with you</div>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {choice === 'create' ? (
            <>
              <label htmlFor="hname">Household name</label>
              <input
                id="hname"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. The Smiths"
              />
            </>
          ) : (
            <>
              <label htmlFor="hcode">Invite code</label>
              <input
                id="hcode"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 8f2ac931"
              />
            </>
          )}
          <button className="submit" type="submit" disabled={busy}>
            {choice === 'create' ? 'Create household' : 'Join household'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
