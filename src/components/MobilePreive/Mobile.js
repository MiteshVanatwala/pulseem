import Mobile from "../../assets/images/mobileiphone.png";
import { Box } from "@material-ui/core";
import clsx from "clsx";
import useCore from "../../helpers/hooks/Core";

const MobilePreivew = ({ campaignNumber, text, keyItem }) => {
    const { classes } = useCore();
    return (
        <Box className={classes.phoneDiv}>
            <img src={Mobile} className={classes.phoneImg} alt="Phone Simulation" />
            <span className={classes.phoneNumber}>{campaignNumber}</span>
            <div className={clsx(classes.wrapChat, classes.sidebar)}>
                <div className={classes.chatBox}>
                    <div className={classes.fromMe}>
                        {text && text !== '' ? text.split('\n').map((str, idx) => {
                            return (<p key={`${keyItem}_${idx}`} style={{ margin: "0", padding: "0" }}>{str}</p>)
                        }) : null}
                    </div>
                </div>
            </div>
        </Box>
    )
}

export default MobilePreivew;