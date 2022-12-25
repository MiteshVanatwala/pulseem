import { Box } from '@material-ui/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom';

import Gif from "../../../../assets/images/managment/check-circle.gif";

const SendSuccessDialog = ({
    onConfirm = () => null
}) => {

    const navigate = useNavigate();

    const { t } = useTranslation()
    return {
        showDivider: false,
        disableBackdropClick: true,
        content: (
            <Box>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <img src={Gif} style={{ width: "150px", height: "150px" }} alt="Success" />
                    <span style={{ marginTop: "10px", fontSize: "22px", fontWeight: "700" }}>{t("sms.sent")}</span>
                    <p style={{ marginTop: "10px", fontSize: "18px", fontWeight: "600" }}>
                        {t("sms.campaignIsOnItsWay")}
                    </p>
                    <span style={{ padding: "12px", backgroundColor: "green", marginTop: "10px", cursor: "pointer", color: "#ffffff", borderRadius: "10px" }} onClick={() => { onConfirm() }}>{t("common.confirm")}</span>
                </div>
            </Box>
        ),
        renderButtons: false,
        showDefaultButtons: false,
        exit: true
    }
}

export default SendSuccessDialog