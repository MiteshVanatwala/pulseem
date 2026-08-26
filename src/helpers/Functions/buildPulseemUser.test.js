import { buildPulseemUser } from './buildPulseemUser';

describe('buildPulseemUser', () => {
  it('returns null for an anonymous visitor (no subUserName, no companyName)', () => {
    expect(buildPulseemUser({ subUserName: '', companyName: '' })).toBeNull();
  });

  it('classifies a main-account login as Main', () => {
    const user = buildPulseemUser({
      subUserName: undefined,
      companyName: 'acme',
      isDirectAccount: false,
    });
    expect(user.accountType).toBe('Main');
    expect(user.accountId).toBe('acme');
    expect(user.username).toBe('acme');
  });

  it('classifies a direct account login as Direct', () => {
    const user = buildPulseemUser({
      subUserName: undefined,
      companyName: 'acme',
      isDirectAccount: true,
    });
    expect(user.accountType).toBe('Direct');
  });

  it('classifies a sub-user login as SubUser regardless of isDirectAccount', () => {
    const user = buildPulseemUser({
      subUserName: 'jane',
      companyName: 'acme',
      isDirectAccount: true,
    });
    expect(user.accountType).toBe('SubUser');
    expect(user.username).toBe('jane');
    expect(user.accountId).toBe('acme');
  });

  it('prefers the sub-user email/cellphone over the account-level email', () => {
    const user = buildPulseemUser({
      subUserName: 'jane',
      companyName: 'acme',
      email: 'account@acme.com',
      subUserObject: {
        Data: {
          Emails: [{ AuthValue: 'jane@acme.com' }],
          Cellphones: [{ AuthValue: '123456' }],
        },
      },
    });
    expect(user.email).toBe('jane@acme.com');
    expect(user.cellphone).toBe('123456');
  });

  it('falls back to the account email when the sub-user has none', () => {
    const user = buildPulseemUser({
      subUserName: 'jane',
      companyName: 'acme',
      email: 'account@acme.com',
      subUserObject: { Data: { Emails: [{ AuthValue: '' }], Cellphones: [{ AuthValue: '' }] } },
    });
    expect(user.email).toBe('account@acme.com');
    expect(user.cellphone).toBeUndefined();
  });

  it('omits cellphone entirely when none is on file', () => {
    const user = buildPulseemUser({
      subUserName: undefined,
      companyName: 'acme',
    });
    expect('cellphone' in user).toBe(false);
  });
});
