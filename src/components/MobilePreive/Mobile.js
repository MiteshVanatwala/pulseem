import React from "react";
import { useTranslation } from "react-i18next";
import Mobile from "../../assets/images/mobileiphone.png";
import { Box } from "@material-ui/core";
import clsx from "clsx";

const MobilePreivew = ({ classes, campaignNumber, text, key }) => {
    const { t } = useTranslation();

    return (
        <Box className={classes.phoneDiv}>
            <img src={Mobile} className={classes.phoneImg} />
            <span className={classes.phoneNumber}>{campaignNumber}</span>
            <div className={clsx(classes.wrapChat, classes.sidebar)}>
                <div className={classes.chatBoxHe}>
                    <div className={classes.fromMe}>
                        {text !== '' ? text.split('\n').map((str) => {
                            return (<p key={key} style={{ margin: "0", padding: "0" }}>{str}</p>)
                        }) : null}
                    </div>
                </div>

            </div>
        </Box>
    )
}

export default MobilePreivew;