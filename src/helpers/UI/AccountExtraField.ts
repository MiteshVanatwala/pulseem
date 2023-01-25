export const ReplaceExtraFieldHeader = (obj: any, accountExtraFields: any) => {
    Object.entries(accountExtraFields).forEach((ef) => {
        const key = ef[0];
        const val = ef[1];
        if (val && val !== '') {
            obj[key] = val;
        }
        else {
            delete obj[key];
        }
    });
    return obj;
}