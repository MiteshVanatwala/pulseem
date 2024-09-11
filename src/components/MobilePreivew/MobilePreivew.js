import Mobile from "../../assets/images/mobileiphone.png";
import { Box } from "@material-ui/core";
import clsx from "clsx";

const MobilePreivew = ({ classes, fromNumber, text, keyItem }) => {
    return (
        <Box className={classes.phoneDiv}>
            <img src={Mobile} className={classes.phoneImg} alt="Phone Simulation" />
            <span className={classes.phoneNumber}>{fromNumber}</span>
            <div className={clsx(classes.wrapChat)}>
                <div className={classes.chatBox}>
                    <div className={classes.fromMe}>
                        {text && text !== '' ? text.split('\n').map((str, idx) => {
                            const finalStr = str === '' ? <br /> : str;
                            return (<p key={`${keyItem}_${idx}`} style={{ margin: "0", padding: "0" }}>{finalStr}</p>)
                        }) : null}
                    </div>
                </div>
            </div>
        </Box>
    )
}

export default MobilePreivew;
