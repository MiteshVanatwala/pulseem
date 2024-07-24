import clsx from 'clsx'
import DefaultScreen from '../../DefaultScreen';
import { Box, FormControl, Select, Typography } from '@material-ui/core';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { Loader } from '../../../components/Loader/Loader';
import { useEffect, useState } from 'react';
import WizardActions from '../../../components/Wizard/WizardActions';
import { useTranslation } from 'react-i18next';
import { getAuthorizedEmails } from '../../../redux/reducers/commonSlice';
import { useDispatch, useSelector } from 'react-redux';
import { StateType } from '../../../Models/StateTypes';
import { IoIosArrowDown } from 'react-icons/io';
import { PulseemFeatures } from '../../../model/PulseemFields/Fields';

const AmpRegistration = ({ classes }: any) => {
    const [showLoader, setShowLoader] = useState<boolean>(true);
    const [selectedEmail, setSelectedEmail] = useState<string>('');
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { verifiedEmails, accountSettings, accountFeatures } = useSelector((state: StateType) => state.common);

    const init = async () => {
        await dispatch(getAuthorizedEmails());
        setShowLoader(false);
    }
    useEffect(() => {
        init();
    }, []);

    return (
        <DefaultScreen
            currentPage="newsletter"
            subPage={"newsletterInfo"}
            classes={classes}
            customPadding={true}
            containerClass={clsx(classes.mb50, classes.editorCont)}
        >
            <Box className={"containerBody"}>
                select email to verify amp
                <Box className='selectWrapper'>
                    <FormControl
                        className={clsx(classes.selectInputFormControl, classes.w100)}
                    >
                        <Select
                            native
                            variant="standard"
                            name="FromEmail"
                            value={selectedEmail}
                            className={clsx(classes.pbt5, classes.fromEmailSelect)}
                            onChange={(event: any) => {
                                setSelectedEmail(event?.target?.value);
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
                            <option
                                key='-1'
                                value='-1'
                                disabled
                            >
                                {t("common.select")}
                            </option>
                            {verifiedEmails?.filter((email) => { return email.IsVerified === true }).map((item: any, index: number) => {
                                return <option
                                    key={index}
                                    value={item.Number}
                                    name={item.Number}
                                >
                                    {t(item.Number)}
                                </option>
                            })}
                            {accountFeatures?.indexOf(PulseemFeatures.HIDE_SHARED_DOMAIN) === -1 && accountSettings?.SubAccountSettings?.SharedEmailDomain && <option
                                key={verifiedEmails.length + 1}
                                value={accountSettings?.SubAccountSettings?.SharedEmailDomain}
                                name={accountSettings?.SubAccountSettings?.SharedEmailDomain}
                            >
                                {/* <ListItemIcon style={{ minWidth: 25 }}>
                                                <MdOutlineVerified style={{ color: 'green', fontSize: 20 }} title={t('common.domainVerification.verifiedDomain')} />
                                            </ListItemIcon> */}
                                {t(accountSettings?.SubAccountSettings?.SharedEmailDomain)}
                            </option>}
                        </Select>
                    </FormControl>
                </Box>

                <Box className={classes.flex} style={{ justifyContent: 'end', marginTop: 15 }}>
                    <WizardActions
                        classes={classes}
                        onBack={{
                            callback: () => console.log('back')
                        }}
                        onDelete={() => { console.log('back') }}
                        additionalButtons={() => { console.log('back') }}
                        additionalButtonsOnStart={() => { console.log('back') }}
                    />
                </Box>
                <BaseDialog
                    classes={classes}
                    open={false}
                    title={t("campaigns.GridButtonColumnResource2.ConfirmTitle")}
                    showDivider={true}
                    onClose={() => { console.log('open') }}
                    onCancel={() => { console.log('open') }}
                    onConfirm={() => { console.log('open') }}
                    cancelText="common.Cancel"
                    confirmText="common.Ok"
                >
                    <Box>
                        <Typography variant="subtitle1">
                            {t("campaigns.GridButtonColumnResource2.ConfirmText")}
                        </Typography>
                    </Box>
                </BaseDialog>
                <Loader isOpen={showLoader} />
            </Box>
        </DefaultScreen>
    )
}

export default AmpRegistration;