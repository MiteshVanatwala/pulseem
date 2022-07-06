export const ValidateEmail = (email) => {
    return email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z\-0-9]{2,}))$/)
}

export const ValidateNumber = (number) => {
    const phoneRegex = /^[0-9-]+$/
    return phoneRegex.test(number)
}

export const renderHtml = (html) => {
    function createMarkup() {
        return { __html: html };
    }
    return (
        <label dangerouslySetInnerHTML={createMarkup()}></label>
    );
}

export const getQueryParams = async () => {
    var searchParams = new URLSearchParams(window.location.search);
    let queryParams = {}
    await new Promise((resolve, reject) => resolve(searchParams.forEach(function (value, key) {
        queryParams = { ...queryParams, [key]: value }
    })));
    return queryParams
}

export const voidFunction = () => null