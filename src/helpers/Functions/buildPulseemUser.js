// Builds the identity payload passed to the pulseemsupport.com chat widget (see
// public/index.html) via window.pulseem.currentUser, so a support agent sees who
// they're talking to without asking. Pulled out of App.js so it can be unit tested
// without rendering the whole app.
//
// Verified against the widget's actual source (fetched from pulseemsupport.com/widget.js):
// it only ever reads currentUser.name, .email and .username. .accountId, .accountType and
// .cellphone are included here anyway so they flow through the same channel and are ready
// the moment the widget is extended to use them, but they are inert on today's widget.
export function buildPulseemUser({
  subUserName,
  subUserObject,
  email,
  companyName,
  isDirectAccount,
}) {
  if (!subUserName && !companyName) return null;

  const resolvedEmail = subUserObject?.Data?.Emails?.[0]?.AuthValue || email;
  const resolvedCellphone = subUserObject?.Data?.Cellphones?.[0]?.AuthValue;
  const username = subUserName || companyName;

  const user = {
    username,
    accountId: companyName,
    // No SubAccountID reaches the frontend (it's JWT-derived server-side only), and no
    // Main/SubAccount/Direct enum exists client-side, so this is a best-effort proxy.
    accountType: subUserName ? 'SubUser' : (isDirectAccount ? 'Direct' : 'Main'),
  };
  if (resolvedEmail) user.email = resolvedEmail;
  if (resolvedCellphone) user.cellphone = resolvedCellphone;

  return user;
}
