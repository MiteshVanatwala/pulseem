import { MdDomain, MdOutlineVerified } from "react-icons/md";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Box, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../../../Models/StateTypes";
import { useEffect, useState } from "react";
import { getAuthorizedEmails } from "../../../../redux/reducers/commonSlice";
import { VerifiedEmail } from "../../../../model/Common/commonProps.types";
import { GetDomainVerification } from "../../../../redux/reducers/DomainVerificationSlice";
import { logout } from "../../../../helpers/Api/PulseemReactAPI";
import { Loader } from "../../../../components/Loader/Loader";
import { AiOutlineStop } from "react-icons/ai";

const DomainsVerificationPopUp = ({ classes, isOpen, onClose, onConfirm }: any) => {
    const { t } = useTranslation();
    const [showLoader, setShowLoader] = useState<boolean>(true);
    const { verifiedEmails } = useSelector((state: StateType) => state.common);
    const [showVerificationResponse, setShowVerificationResponse] = useState<boolean>(false);
    const [domainResponse, setDomainResponse] = useState<any>(null);
    const [selectedDomain, setSelectedDomain] = useState<string>('');
    const dispatch = useDispatch();

    const initVerifiedEmails = async () => {
        await dispatch(getAuthorizedEmails());
        setShowLoader(false)
    }

    useEffect(() => {
        if (!verifiedEmails || verifiedEmails?.length < 1) {
            initVerifiedEmails();
        }
        else{
            setShowLoader(false)
        }
    }, []);

    const verifyDomain = async (email: VerifiedEmail) => {
        setShowLoader(true);
        const domain = email.Number.split('@');
        if (domain && domain?.length > 0) {
            const response = await dispatch(GetDomainVerification(domain[1])) as any;
            handleResponses(response?.payload)
        }
        setShowLoader(false);
    }
    const domainFromEmail = (email: string) => {
        if (email !== '' && email !== '-1') {
            const domain: string = email.replace(/.*@/, "");
            return domain;
        }
        return null;
    }
    const handleResponses = (response: any) => {
        switch (response?.StatusCode) {
            case 201: {
                setDomainResponse(response?.Data);
                setShowVerificationResponse(true);
                break;
            }
            case 401: {
                logout();
                break;
            }
            default:
            case 500: {
                alert('error occured');
                break;
            }
        }
    }

    const filteredDomains = () => {
        return verifiedEmails.filter((obj: VerifiedEmail, index: number) => {
            return (index === verifiedEmails.findIndex((o: any) => domainFromEmail(obj.Number) === domainFromEmail(o.Number)) && !obj.IsRestricted);
        }).map((item: VerifiedEmail, index: number) => {
            return <>
                <Box className={clsx(classes.flex, classes.hAuto, 'emailBox')} style={{ justifyContent: 'space-between', alignItems: 'center', height: 40 }}>
                    <Box style={{ display: 'flex', alignItems: 'center' }}>
                        {item.IsVerified ? <MdOutlineVerified style={{ color: 'green', fontSize: 20 }} /> : <AiOutlineStop style={{ color: 'red', fontSize: 20 }} />}
                        <Typography className='emailText' title={item.Number} style={{ fontSize: 16, paddingInline: 15 }}>{domainFromEmail(item.Number)} </Typography>
                    </Box>
                    {!item.IsVerified && <Typography className={clsx(classes.link, 'emailVerLink')}
                        onClick={() => {
                            setSelectedDomain(domainFromEmail(item.Number) as any);
                            verifyDomain(item);
                        }}
                    >{t('common.domainVerification.verifyDomain')}</Typography>}
                </Box>
                {index < verifiedEmails.length - 1 && <Divider style={{ marginBottom: 6 }} />}
            </>
        });
    }

    const VerificationResult = () => {
        return <BaseDialog
            disableBackdropClick={false}
            classes={classes}
            icon={<MdDomain className={classes.notifyIconWhite} />}
            open={showVerificationResponse}
            showDefaultButtons={false}
            title={t("common.domainVerification.settingPopUp.title")}
            children={<Box className={clsx(classes.fullWidth)}>
                <TableContainer component={Paper as any}>
                    <Table className={classes.table} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">{t('common.domainVerification.verificationResponse.tableHeader.sourceId')}</TableCell>
                                <TableCell align="center">{t('common.domainVerification.verificationResponse.tableHeader.domainName')}</TableCell>
                                <TableCell align="center">{t('common.domainVerification.verificationResponse.tableHeader.dkimApproved')}</TableCell>
                                <TableCell align="center">{t('common.domainVerification.verificationResponse.tableHeader.dmarcApproved')}</TableCell>
                                <TableCell align="center">{t('common.domainVerification.verificationResponse.tableHeader.spfApproved')}</TableCell>
                                <TableCell align="center">{t('common.domainVerification.verificationResponse.tableHeader.lastReadTime')}</TableCell>
                                <TableCell align="center">{t('common.domainVerification.verificationResponse.tableHeader.lastSendTime')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow key={'IsDKIMApproved'}>
                                <TableCell>{domainResponse?.SourceID === 0 ? <MdOutlineVerified style={{ color: 'green', fontSize: 16 }} /> : <AiOutlineStop style={{ color: 'red', fontSize: 20 }} />}</TableCell>
                                <TableCell>{selectedDomain}</TableCell>
                                <TableCell align="center">{domainResponse?.IsDKIMApproved ? <MdOutlineVerified style={{ color: 'green', fontSize: 16 }} /> : <AiOutlineStop style={{ color: 'red', fontSize: 20 }} />}</TableCell>
                                <TableCell align="center">{domainResponse?.IsDMARCApprotved ? <MdOutlineVerified style={{ color: 'green', fontSize: 16 }} /> : <AiOutlineStop style={{ color: 'red', fontSize: 20 }} />}</TableCell>
                                <TableCell align="center">{domainResponse?.IsSPFApproved ? <MdOutlineVerified style={{ color: 'green', fontSize: 16 }} /> : <AiOutlineStop style={{ color: 'red', fontSize: 20 }} />}</TableCell>
                                <TableCell align="center">{domainResponse?.LastReadMailTime === '0001-01-01T00:00:00' ? 'N/A' : domainResponse?.LastReadMailTime}</TableCell>
                                <TableCell align="center">{domainResponse?.LastSendMailTime === '0001-01-01T00:00:00' ? 'N/A' : domainResponse?.LastSendMailTime}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            }
            onConfirm={() => {
                setDomainResponse(null);
                initVerifiedEmails();
                setShowVerificationResponse(false);
            }}
            onClose={() => {
                setDomainResponse(null);
                initVerifiedEmails();
                setShowVerificationResponse(false);
            }}
            onCancel={() => {
                setDomainResponse(null);
                initVerifiedEmails();
                setShowVerificationResponse(false);
            }}
        />
    }

    return <BaseDialog
        disableBackdropClick={false}
        classes={classes}
        icon={<MdDomain className={classes.notifyIconWhite} />}
        open={isOpen}
        showDefaultButtons={false}
        title={t("common.domainVerification.settingPopUp.title")}
        children={<Box className={clsx(classes.fullWidth)}>
            <Box className='selectWrapper'>
                <Box style={{ position: 'relative', height: '70%', display: 'flex', flexDirection: 'column' }} >
                    <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }} className={classes.pb15}>
                        <Typography className={clsx(classes.bold)} variant='h6'>{t('common.domainVerification.settingPopUp.selectDomain')} </Typography>
                    </Box>
                    <Box className={clsx('contactDataBox', classes.sidebar)}>
                        {filteredDomains()}
                    </Box>
                </Box>
            </Box>
            {showVerificationResponse && <VerificationResult />}
            <Loader isOpen={showLoader} />
        </Box>}
        onConfirm={() => {
            onConfirm && onConfirm();
        }}
        onClose={() => {
            onClose && onClose();
        }}
        onCancel={() => {
            onClose && onClose();
        }}
    />
}

export default DomainsVerificationPopUp;