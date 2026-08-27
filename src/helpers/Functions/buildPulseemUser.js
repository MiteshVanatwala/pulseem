// Builds the identity payload passed to the pulseemsupport.com chat widget (see
// public/index.html) via window.pulseem.currentUser, so a support agent sees who
// they're talking to without asking. Pulled out of App.js so it can be unit tested
// without rendering the whole app. Callers pass flat primitives (not the raw
// subUserObject/account state) so this stays a simple, auditable whitelist.
//
// Verified against the widget's actual source (fetched from pulseemsupport.com/widget.js):
// it only ever reads currentUser.name, .email and .username. accountId/accountType (or any
// other account-identifying field) must NEVER be added here, even if inert on today's widget.
export const PULSEEM_USER_KEYS = ['username', 'email', 'cellphone'];

export function buildPulseemUser({
  subUserName,
  subUserEmail,
  subUserCellphone,
  email,
  companyName,
  defaultCellNumber,
}) {
  try {
    if (!subUserName && !companyName) return null;

    const resolvedEmail = subUserEmail || email;
    const resolvedCellphone = subUserCellphone || defaultCellNumber;
    const username = subUserName || companyName;

    const user = { username };
    if (resolvedEmail) user.email = resolvedEmail;
    if (resolvedCellphone) user.cellphone = resolvedCellphone;

    if (process.env.NODE_ENV !== 'production') {
      const unexpectedKeys = Object.keys(user).filter(key => !PULSEEM_USER_KEYS.includes(key));
      if (unexpectedKeys.length > 0) {
        console.error('buildPulseemUser produced unexpected key(s):', unexpectedKeys);
      }
    }

    return user;
  } catch {
    return null;
  }
}
