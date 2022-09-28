import { useNavigate } from "react-router-dom";
import { RedirectPropTypes, generalPropTypes } from '../Types/Redirect';

const useRedirect = () => {
    const navigate = useNavigate();

    const Redirect = (RedirectProps: RedirectPropTypes) => {
        let { url = "", openNewTab = false } = RedirectProps;
        if (openNewTab) {
            window.open(url);
            return false;
        }
        if (window.location.href.indexOf("aspx") > -1) {
            window.location.href = url;
        } else {
            navigate(url);
        }
    };

    
    const generalProps: generalPropTypes = {
        redirect: Redirect
    };

    return generalProps;
};

export default useRedirect;