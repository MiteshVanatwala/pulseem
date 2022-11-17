import { Button, Dialog } from '@material-ui/core';
import React from 'react'
import { useTranslation } from 'react-i18next';
import { AiOutlineExclamationCircle } from 'react-icons/ai';
import clsx from 'clsx'

const SpecialModal = ({
    classes,
    isOpen,
    onClose,
    spectialDateFieldID,
    daysBeforeAfter,
    sendTime,
}) => {
    const { t } = useTranslation()
    return (<>
        <Dialog
            classes={classes}
            open={isOpen}
            onClose={onClose}
            showDefaultButtons={false}
            icon={
                <AiOutlineExclamationCircle style={{ fontSize: 30, color: "#fff" }} />
            }
        >
            <div className={classes.baseDialogSetup}>
                <span className={classes.groupName}>
                    {t("mainReport.fieldInvalid")}:
                </span>
            </div>
            <div>
                <ul className={classes.fieldsRequire}>
                    {spectialDateFieldID == "0" ? <li>{t("sms.selectSpecialField")}</li> : null}
                    {daysBeforeAfter == "" ? <li>{t("sms.typeDays")}</li> : null}
                    {sendTime == null ? <li>{t("sms.selectSendingTime")}</li> : null}

                </ul>
            </div>
            <div
                style={{
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Button
                    variant="contained"
                    size="small"
                    onClick={
                        onClose
                    }
                    className={clsx(classes.dialogButton, classes.dialogConfirmButton)}
                >
                    {t("mainReport.confirmSms")}
                </Button>
            </div>
        </Dialog></>)
}

export default SpecialModal