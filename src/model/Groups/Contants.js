export const DEFAULT_RECIPIENT_DATA = {
    ClientID: null,
    FirstName: '',
    LastName: '',
    Email: '',
    Cellphone: '',
    Status: null,
    SmsStatus: null,
    Telephone: '',
    Address: '',
    City: '',
    State: '',
    Country: '',
    Zip: '',
    Company: '',
    BirthDate: null,
    ReminderDate: null,
    LastSendDate: '',
    CreationDate: '',
    FailedSendingCounter: null,
    IsWebService: false,
    LastEmailOpened: '',
    LastEmailClicked: '',
    BestEmailOpenTime: null,
}

export const ADD_RECIPIENT_TABS = ['common.PersonalDetails', 'common.Location', 'recipient.dates', 'common.extraFields', 'recipient.addRecipientToGroups']

export const ADD_RECIPIENT_REQUIRED_ERRORS = {
    FirstName: 'recipient.errors.firstName',
    LastName: 'recipient.errors.lastName',
    Email: 'recipient.errors.email',
    Cellphone: 'recipient.errors.cellPhone',
    CellphoneLength: 'recipient.errors.cellphoneLength',
    Groups: 'recipient.errors.groupLength'
}
