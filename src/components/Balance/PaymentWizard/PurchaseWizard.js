import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Grid, } from '@material-ui/core';
import { Loader } from '../../Loader/Loader';
import { getPaymentURL, getAccountCards } from '../../../redux/reducers/paymentSlice';
import PackagesList from './Dialogs/PackagesList';
import TranzilaIframe from './Dialogs/TranzilaIframe';
import PaymentResult from './Dialogs/PaymentResult';

const PurchaseWizard = ({ classes,
    packageType
}) => {
    const { isRTL } = useSelector(state => state.core);
    const { accountAvailablePackages } = useSelector(state => state.dashboard);
    const { paymentUrl } = useSelector(state => state.payment);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [data, setData] = useState(null);
    const [newsletterBulkData, setNewsletterBulkData] = useState(null);
    const [smsBulkData, setSmsBulkData] = useState(null);
    // const [notificationsBulkData, setNotificationsBulkData] = useState(null);
    const [showLoader, setLoader] = useState(true);
    const [packageId, setPackageId] = useState(null);
    const [step, setStep] = useState(1);
    const [paymentResult, setPaymentResult] = useState(null);
    const [chargeDetails, setChargeDetails] = useState({
        CreditNumber: "",
        CVV: "",
        ExpirtaionDate: "",
        Price: "",
        Credits: 1,
        PackageType: 3,
        PackageName: ""
    });

    useEffect(() => {
        const initPackages = async () => {
            setSmsBulkData(accountAvailablePackages.filter((pack) => { return pack.CampaignType === 3 }));
            setNewsletterBulkData(accountAvailablePackages.filter((pack) => { return pack.CampaignType === 2 }));
            setData(accountAvailablePackages.filter((pack) => { return pack.CampaignType === packageType }));
            setLoader(false);
        }

        const initData = async () => {
            dispatch(getAccountCards());
            initPackages();
        }

        initData();

    }, []);

    useEffect(() => {
        if (packageId) {
            dispatch(getPaymentURL({ PackageId: packageId, Culture: isRTL ? 'il' : 'us' }));
        }

    }, [packageId])

    const selectPackage = (packageId) => {
        const pack = data.find((p) => { return p.ID === packageId });
        setPackageId(packageId);
        setStep(2);

        const packageName = `${pack.CampaignType === 3 ? t('common.smsBulk') : t('common.newsletterBulk')} ${pack.Quantity}`;

        setChargeDetails({ ...chargeDetails, Price: pack.Price, PackageName: packageName, PackageType: pack.CampaignType, Quantity: pack.Quantity });
    }

    const onPaymentResult = (results) => {
        setPaymentResult(results);
        onStepNext();
    }
    const onStepNext = () => {
        setStep(step + 1);
    }
    const onStepBack = () => {
        setStep(step - 1);
    }

    const purchaseWizard = () => {
        var dialogElement = null;
        switch (step) {
            case 1:
            default:
                dialogElement = document.getElementsByClassName("MuiDialog-paper")[0];
                if (dialogElement) {
                    dialogElement.style = "max-width: 1050px";
                }
                return <PackagesList data={data}
                    classes={classes}
                    onSelect={selectPackage}
                    packageType={packageType}
                    smsBulkData={smsBulkData}
                    newsletterBulkData={newsletterBulkData}
                />
            case 2: {
                dialogElement = document.getElementsByClassName("MuiDialog-paper")[0];
                dialogElement.style = "max-width: 750px";
                return <TranzilaIframe
                    data={data}
                    classes={classes}
                    isRTL={isRTL}
                    packageId={packageId}
                    onComplete={onPaymentResult}
                    paymentUrl={paymentUrl}
                    onStepBack={onStepBack}
                />
            }
            case 3: {
                return <PaymentResult
                    t={t}
                    isRTL={isRTL}
                    classes={classes}
                    paymentObject={paymentResult}
                    onStepBack={onStepBack}
                />
            }
        }
    }

    return (
        <Grid container spacing={1} style={{ pointerEvents: showLoader ? 'none' : 'auto' }}>
            {purchaseWizard()}
            <Loader isOpen={showLoader} showBackdrop={false} />
        </Grid>
    );
}

export default PurchaseWizard;