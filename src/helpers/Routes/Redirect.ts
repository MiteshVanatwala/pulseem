import { useNavigate } from "react-router-dom";
import { RedirectPropTypes } from '../Types/Redirect';

const useRedirect = () => {
    const navigate = useNavigate();

    const Redirect = (RedirectProps: RedirectPropTypes) => {
        let { url = "", openNewTab = false, preventRedirect = false } = RedirectProps;
        //const arrUrl = window.location.pathname.split('/');
        //let parentPath = arrUrl.splice(0, arrUrl.length - 1).join('/');
        const shouldRefrefshed = (window.location.pathname?.toLowerCase() === url.toLowerCase() || window.location.pathname?.toLowerCase() === url.toLowerCase());
        if (openNewTab) {
            window.open(url);
            return false;
        }
        if (url.toLowerCase().indexOf("aspx") > -1 || url.toLowerCase().indexOf('/pulseem/') > -1 || (preventRedirect === false && shouldRefrefshed)) {
            window.location.href = url;
        } else {
            navigate(url);
        }
    };

    return Redirect;
};

export default useRedirect;