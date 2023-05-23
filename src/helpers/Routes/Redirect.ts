import { useNavigate } from "react-router-dom";
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
            // This was a twick for something. if anything goes wrong, return this line and check here why 
            //const options = { replace: true, preventScrollReset: false, relative: "route" } as NavigateOptions;
            if (window.location.pathname === url) window.location.href = url
            else navigate(url);
        }
    };

    return Redirect;
};

export default useRedirect;