import { map, sortBy } from "lodash";
import { CountryCode } from "../../model/Common/commonProps.types";
import { PhoneNumberRegEx } from "../Constants";

export const IsValidEmail = (value: string) => {
  if (value === "" || value === undefined) {
    return false;
  }
  return value?.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z\-0-9]{2,}))$/
  );
};

export const IsValidPhone = (value: string) => {
  if (value === "" || value === undefined) {
    return false;
  }
  const phoneRegex = /^[0-9-]+$/;
  return phoneRegex.test(value);
};

export const IsNumberField = (event: any) => {
  var NumberRegEx = /^[0-9]*$/;
  if (!event?.key?.match(NumberRegEx) || event?.key === "e" || event?.key === ".") {
    event?.preventDefault();
    event?.stopPropagation();
    return false;
  }
};

export const IsValidPhoneNumber = (number: string) => {
  var NumberRegEx = /^(\+\d{1,3}[- ]?)?\d{0,12}$/;
  return NumberRegEx.test(number);
};

export const IsValidPhoneNumberKeyPress = (phoneNumber: string) => {
  return PhoneNumberRegEx.test(phoneNumber);
};

export const IsValidNonGlobalPhoneNumber = (phoneNumber: string) => {
  if (phoneNumber === "" || phoneNumber === undefined || (phoneNumber.charAt(0) === '0' ? phoneNumber.length < 10 : phoneNumber.length < 11) || phoneNumber.length > 16) {
    return false;
  }
  return PhoneNumberRegEx.test(phoneNumber) && (phoneNumber.substring(0,2) === '05' || phoneNumber.substring(0,4) === '9725');
};

export const IsValidURL = (value: string) => {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
    "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator

  return !!pattern.test(value);
};

export const VerifyGetUrl = (value: string) => {
  return new Promise((resolve, reject) => {
    try {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function () {
        if (
          xmlhttp.readyState === XMLHttpRequest.DONE &&
          xmlhttp.status === 200
        ) {
          resolve(true);
        }
      };
      xmlhttp.open("HEAD", value, true);
      xmlhttp.send();
    } catch (error) {
      // Log({
      //     MethodName: 'VerifyGetUrl',
      //     ComponentName: 'Validation.ts',
      //     Text: error as string
      // })
      reject(false);
    }
  });
};

export const IsValidPhoneNumberWithCountryCode = (phoneNumber: string, countryCodeList: CountryCode[] = []) => {
  
  if (phoneNumber === "" || phoneNumber === undefined || (phoneNumber.charAt(0) === '0' ? phoneNumber.length < 10 : phoneNumber.length < 11) || !phoneNumber.match(PhoneNumberRegEx)) {
    return false;
  }
  const countryCode = sortBy(countryCodeList, 'SmsCountryPhoneCode').reverse();
  let isMatched = false;
  map(countryCode, (code: CountryCode) => {
    if (phoneNumber.replace('+', '').substring(0, code.SmsCountryPhoneCode.toString().length) === code.SmsCountryPhoneCode.toString()) {
      isMatched = true;
      return true;
    }
  })
  return isMatched;
};