import Mobile from "../../assets/images/mobileiphone.png";
import { Box } from "@material-ui/core";
import clsx from "clsx";
import { checkLanguage } from "../../screens/Whatsapp/Common";
import { useSelector } from "react-redux";

const MobilePreivew = ({ classes, fromNumber, text, keyItem }) => {
    const { isRTL } = useSelector(state => state.core);

    const textString = text && text.split(/\r\n|\n\r|\n|\r/) || [];
    let direction = checkLanguage(textString.join(' '), isRTL);
    direction = direction === 'Both' ? (isRTL ? 'rtl' : 'ltr') : (direction === 'English' ? 'ltr' : 'rtl');

    return (
        <Box className={classes.phoneDiv}>
            <img src={Mobile} className={classes.phoneImg} alt="Phone Simulation" />
            <span className={classes.phoneNumber} dir={/^[0-9]/.test(fromNumber) ? 'rtl' : 'ltr'}>{fromNumber}</span>
            <div className={clsx(classes.wrapChat)}>
                <div className={classes.chatBox}>
                    <div className={classes.fromMe}>
                        {text && text !== '' ? text.split('\n').map((str, idx) => {
                            const finalStr = str === '' ? <br /> : str;
                            return (<p key={`${keyItem}_${idx}`} style={{ margin: "0", padding: "0", direction: direction }}>{finalStr}</p>)
                        }) : null}
                    </div>
                </div>
            </div>
        </Box>
    )
}

export default MobilePreivew;
