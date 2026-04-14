export const getIsBeeperAccount = (accountSettings: any): boolean =>
  accountSettings?.Account?.ReferrerID === 6 || accountSettings?.Account?.ReferrerID === '6';

export const WhiteLabelObject = {
  0: { // Default
    Phone: '03-5240290',
    Email: 'support@pulseem.com',
    BillingTitle: 'common.contactSupportForBilling',
    WelcomeMesasge: 'dashboard.welcomeNewDesignDesc',
    Contact: 'common.contactSupportForBilling',
    ContactOnError: 'campaigns.newsLetterEditor.errors.contactUs',
    GmailVerification: 'common.gmailVerificationDescription',
    NotEnoughCredits: 'sms.notEnoughCreditLeftDesc',
    NotApprovedDesc: 'sms.englishLetterNotApprovedDescription',
    buyVerifiedDomain: 'common.domainVerification.popup.sections.buyVerifiedDomain.text'
  },
  4: { // Simply Club
    Phone: '03-9192513',
    Email: 'Support@simplyclub.co.il',
    BillingTitle: 'SimplyClub.contactSupportForBilling',
    WelcomeMesasge: 'SimplyClub.welcomeNewDesignDesc',
    Contact: 'SimplyClub.contactSupportForBilling',
    ContactOnError: 'SimplyClub.contactUs',
    GmailVerification: 'SimplyClub.gmailVerificationDescription',
    NotEnoughCredits: 'SimplyClub.notEnoughCreditLeftDesc',
    NotApprovedDesc: 'SimplyClub.englishLetterNotApprovedDescription',
    buyVerifiedDomain: 'SimplyClub.buyVerifiedDomain.text'
  },
  6: { // Beeper
    Phone: '',
    Email: 'support@beeper.ltd',
    BillingTitle: 'Beeper.contactSupportForBilling',
    WelcomeMesasge: 'Beeper.welcomeNewDesignDesc',
    Contact: 'Beeper.contactSupportForBilling',
    ContactOnError: 'Beeper.contactUs',
    GmailVerification: 'Beeper.gmailVerificationDescription',
    NotEnoughCredits: 'Beeper.notEnoughCreditLeftDesc',
    NotApprovedDesc: 'Beeper.englishLetterNotApprovedDescription',
    buyVerifiedDomain: 'Beeper.buyVerifiedDomain.text'
  }
}