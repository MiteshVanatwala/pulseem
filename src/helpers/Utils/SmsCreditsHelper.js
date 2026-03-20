/**
 * Pure frontend replacement for the backend GetCreditsForSms endpoint.
 * Mirrors the C# calculation using smsConfig from Redux state.common.
 *
 * @param {number} count - character count
 * @param {object} smsConfig - { Country, SmsLength, SMSProvider } from state.common
 * @returns {number} number of SMS messages (credits)
 */
export const computeCreditsForSms = (count, smsConfig) => {
  if (!count || count === 0) return 0;

  const countryStr    = (smsConfig?.Country ?? '').toLowerCase();
  const smsLength     = smsConfig?.SmsLength ?? null;
  const provider      = smsConfig?.SMSProvider ?? 8; // default Pelephone(8)

  let firstMsgLength  = 70;
  let secondMsgLength = 67;

  // Only Mexico with CardboardFish(2) or SilverStreet(7) changes lengths
  if (countryStr === 'mx' && (provider === 2 || provider === 7)) {
    firstMsgLength  = 160;
    secondMsgLength = 160;
  }

  // mirrors if (!messageLength.HasValue) messageLength = -1
  const messageLength = smsLength == null ? -1 : smsLength;

  let total = 1;
  if (messageLength === -1) {
    if (count > firstMsgLength) total = Math.ceil(count / secondMsgLength);
  } else {
    if (count > messageLength)  total = Math.ceil(count / messageLength);
  }

  return total;
};