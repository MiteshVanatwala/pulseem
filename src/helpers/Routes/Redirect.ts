import { NavigateOptions, useNavigate } from "react-router-dom";
import { RedirectPropTypes } from '../Types/Redirect';

const useRedirect = () => {
    const navigate = useNavigate();
    
    const Redirect = (RedirectProps: RedirectPropTypes) => {
        let { url = "", openNewTab = false } = RedirectProps;
        if (openNewTab) {
            window.open(url);
            return false;
        }
        if (url.toLowerCase().indexOf("aspx") > -1 || url.toLowerCase().indexOf('/pulseem/') > -1) {
            window.location.href = url;
        } else {

            const options = { replace: true, preventScrollReset: false, relative: "route" } as NavigateOptions;
            navigate(url, options);
        }
    };

    return Redirect;
};

export default useRedirect;