export const RenderHtml = (html: any) => {
    function createMarkup() {
        return { __html: html };
    }
    return (
        <label dangerouslySetInnerHTML={createMarkup()}></label>
    );
}

export const ConvertObjectToQueryString = (object: any) => {
    let queryString = '?';
    Object.keys(object).forEach((o, idx) => {
        queryString += `${idx > 0 ? '&' : ''}${o}=${Object.values(object)[idx]}`
    });
    return queryString;
}