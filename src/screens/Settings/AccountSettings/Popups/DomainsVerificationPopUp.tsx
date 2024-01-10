import { MdDomain, MdOutlineVerified } from "react-icons/md";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Box, FormControl, ListItemIcon, MenuItem, Select, Typography } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../../../Models/StateTypes";
import { IoIosArrowDown } from "react-icons/io";
import { useEffect, useState } from "react";
import { getAuthorizedEmails } from "../../../../redux/reducers/commonSlice";

const DomainsVerificationPopUp = ({ classes, isOpen }: any) => {
    const { t } = useTranslation();
    const { verifiedEmails, accountSettings } = useSelector((state: StateType) => state.common);
    const restrictedDomains = sessionStorage.getItem("RestrictedEmailDomains");
    const [selectedEmail, setSelectedEmail] = useState<string>('-1');
    const dispatch = useDispatch();

    useEffect(() => {
        const initVerifiedEmails = async () => {
            await dispatch(getAuthorizedEmails());
        }

        if (!verifiedEmails || verifiedEmails?.length < 1) {
            initVerifiedEmails();
        }
    }, []);

    return <BaseDialog
        disableBackdropClick={false}
        classes={classes}
        icon={<MdDomain className={classes.notifyIconWhite} />}
        open={isOpen}
        showDefaultButtons={false}
        title={t("common.domainVerification.settingPopUp.title")}
        children={<Box className={clsx(classes.fullWidth)}>
            <Box className='selectWrapper'>
                <Typography title={t("common.domainVerification.settingPopUp.selectDomain")} className={classes.alignDir}>{t("common.domainVerification.settingPopUp.selectDomain")}</Typography>
                <FormControl
                    className={clsx(classes.selectInputFormControl, classes.w100)}
                >
                    <Select
                        variant="standard"
                        name="selectDomain"
                        value={selectedEmail}
                        className={classes.pbt5}
                        onChange={(event: any, val: any) => {
                            setSelectedEmail(event.target.value);
                        }}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300,
                                },
                            },
                        }}
                    >
                        <MenuItem
                            key='-1'
                            value='-1'
                            disabled
                        >
                            {t("common.select")}
                        </MenuItem>
                        {verifiedEmails.map((item: any, index: number) => {
                            if (restrictedDomains && restrictedDomains.toLowerCase().indexOf(item.Number.split('@')[1]?.toLowerCase()) > -1) {
                                return false;
                            }
                            return <MenuItem
                                key={index}
                                value={item.Number}
                                // @ts-ignore
                                name={item.Number}
                            >
                                {t(item.Number)}
                            </MenuItem>
                        })}
                        {accountSettings?.SubAccountSettings?.SharedEmailDomain && <MenuItem
                            key={verifiedEmails.length + 1}
                            value={accountSettings?.SubAccountSettings?.SharedEmailDomain}
                            //@ts-ignore
                            name={accountSettings?.SubAccountSettings?.SharedEmailDomain}
                        >
                            <ListItemIcon style={{ minWidth: 25 }}>
                                <MdOutlineVerified style={{ color: 'green', fontSize: 20 }} />
                            </ListItemIcon>
                            {t(accountSettings?.SubAccountSettings?.SharedEmailDomain)}
                        </MenuItem>}
                    </Select>
                </FormControl>
            </Box>
        </Box>}
    // onConfirm={() => {
    // }}
    // onClose={() => {
    // }}
    // onCancel={() => {
    // }}
    />
}

export default DomainsVerificationPopUp;