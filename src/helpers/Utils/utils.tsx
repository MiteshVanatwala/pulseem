export const ValidateEmail = (email: string) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z\-0-9]{2,}))$/
  );
};

export const ValidateNumber = (phone: string) => {
  const phoneRegex = /^[0-9-]+$/;
  return phoneRegex.test(phone);
};

export const renderHtml = (html: string) => {
  function createMarkup() {
    return { __html: html };
  }

  return <label dangerouslySetInnerHTML={createMarkup()}></label>;
};
