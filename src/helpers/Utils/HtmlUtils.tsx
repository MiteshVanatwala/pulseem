import { makeStyles } from "@material-ui/core";

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

export const useStylesBootstrapPasswordHint = makeStyles((theme) => ({
    arrow: {
      color: '#000 !important',
    },
    tooltip: {
      backgroundColor: '#000 !important',
      fontSize: '16px !important',
      width: '350px !important',
      maxWidth: "none !important",
    },
}));