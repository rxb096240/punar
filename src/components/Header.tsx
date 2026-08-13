import { supabase } from '../lib/supabase';
import { useHousehold } from '../context/HouseholdContext';
import { HouseholdSwitcher } from './HouseholdSwitcher';

export function Header() {
  const { household, households, selectHousehold, renameHousehold, createHousehold } = useHousehold();

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
          {household ? (
            <>
              <HouseholdSwitcher
                household={household}
                households={households}
                onSelect={selectHousehold}
                onRename={renameHousehold}
                onCreate={createHousehold}
              />
              <p className="invite-note">
                <button type="button" onClick={copyInvite} title="Copy invite code">
                  invite: {household.invite_code}
                </button>
              </p>
            </>
          ) : (
            <p className="sub">everything recurring, one glance</p>
          )}
        </div>
        <button className="signout" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>
    </header>
  );
}
