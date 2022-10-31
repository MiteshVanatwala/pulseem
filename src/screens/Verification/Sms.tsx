import { POPUP_OBJECT_TYPE, verificationErrorType } from "../../helpers/Types/Verification";
const useSmsVerification = ({
    onClose = () => { }
}) => {
    const steps: POPUP_OBJECT_TYPE[] = [];

    const VerificationDialog: { [key: string]: POPUP_OBJECT_TYPE[] } = {
        'steps': steps
    }

    return VerificationDialog;
}

export default useSmsVerification;