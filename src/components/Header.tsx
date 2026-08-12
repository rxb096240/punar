import { supabase } from '../lib/supabase';
import { useHousehold } from '../context/HouseholdContext';

export function Header() {
  const { household } = useHousehold();

  function copyInvite() {
    if (household) navigator.clipboard.writeText(household.invite_code).catch(() => {});
  }

  return (
    <header className="app-header">
      <div className="header-row">
        <div>
          <h1>
            Punar<span className="dot">.</span>
          </h1>
          <p className="sub">
            {household ? household.name : 'everything recurring, one glance'}
            {household && (
              <>
                {' · '}
                <button
                  type="button"
                  onClick={copyInvite}
                  style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', padding: 0 }}
                  title="Copy invite code"
                >
                  invite: {household.invite_code}
                </button>
              </>
            )}
          </p>
        </div>
        <button className="signout" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>
    </header>
  );
}
