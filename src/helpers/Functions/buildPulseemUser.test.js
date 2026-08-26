import { buildPulseemUser } from './buildPulseemUser';

describe('buildPulseemUser', () => {
  it('returns null for an anonymous visitor (no subUserName, no companyName)', () => {
    expect(buildPulseemUser({ subUserName: '', companyName: '' })).toBeNull();
  });

  it('uses companyName as username for a main-account login', () => {
    const user = buildPulseemUser({
      subUserName: undefined,
      companyName: 'acme',
    });
    expect(user.username).toBe('acme');
  });

  it('uses subUserName as username for a sub-user login', () => {
    const user = buildPulseemUser({
      subUserName: 'jane',
      companyName: 'acme',
    });
    expect(user.username).toBe('jane');
  });

  it('never includes accountId or accountType', () => {
    const user = buildPulseemUser({
      subUserName: 'jane',
      companyName: 'acme',
      email: 'jane@acme.com',
    });
    expect('accountId' in user).toBe(false);
    expect('accountType' in user).toBe(false);
  });

  it('prefers the sub-user email/cellphone over the account-level email', () => {
    const user = buildPulseemUser({
      subUserName: 'jane',
      companyName: 'acme',
      email: 'account@acme.com',
      subUserEmail: 'jane@acme.com',
      subUserCellphone: '123456',
    });
    expect(user.email).toBe('jane@acme.com');
    expect(user.cellphone).toBe('123456');
  });

  it('falls back to the account email when the sub-user has none', () => {
    const user = buildPulseemUser({
      subUserName: 'jane',
      companyName: 'acme',
      email: 'account@acme.com',
      subUserEmail: '',
      subUserCellphone: '',
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
