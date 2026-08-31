// Builds the identity payload passed to the pulseemsupport.com chat widget (see
// public/index.html) via window.pulseem.currentUser, so a support agent sees who
// Verified against the widget's actual source (fetched from pulseemsupport.com/widget.js):
export const PULSEEM_USER_KEYS = ['username', 'name', 'email', 'phone'];

export function buildPulseemUser({ loginUserName, companyName, email, cellPhone }) {
  try {
    if (!loginUserName) return null;

    const user = { username: loginUserName };
    if (companyName) user.name = companyName;
    if (email) user.email = email;
    if (cellPhone) user.phone = cellPhone;

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
