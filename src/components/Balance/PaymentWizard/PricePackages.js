import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { Button, Grid, Box, Typography } from '@material-ui/core';
import { Loader } from '../../Loader/Loader';
import { getPaymentURL, getAccountCards } from '../../../redux/reducers/paymentSlice';
import { BiCreditCard } from 'react-icons/bi';
import { Dialog } from '../../managment/index';
import PurchaseSummary from './Dialogs/PurchaseSummary';
import PackagesList from './Dialogs/PackagesList';
import TranzilaIframe from './Dialogs/TranzilaIframe';
import Pay from './Dialogs/Pay';
import { MdNotificationsActive } from 'react-icons/md';
import { FaExclamationCircle } from 'react-icons/fa';
import { getPackagesDetails } from '../../../redux/reducers/dashboardSlice';
import {
    CheckAnimation
} from '../../../assets/images/settings/index'

const PricePackages = ({ classes,
    onComplete = () => null,
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
    const [notificationsBulkData, setNotificationsBulkData] = useState(null);
    const [showLoader, setLoader] = useState(true);
    const [packageId, setPackageId] = useState(null);
    const [step, setStep] = useState(1);
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
        setStep(step + 1);

        const packageName = `${pack.CampaignType === 3 ? t('common.smsBulk') : t('common.newsletterBulk')} ${pack.Quantity}`;

        setChargeDetails({ ...chargeDetails, Price: pack.Price, PackageName: packageName, PackageType: pack.CampaignType, Quantity: pack.Quantity });
    }

    const onConfirm = () => {
        setStep(step + 1);
    }

    const purchaseWizard = () => {
        switch (step) {
            case 1:
            default:
                return <PackagesList data={data}
                    classes={classes}
                    onSelect={selectPackage}
                    packageType={packageType}
                    smsBulkData={smsBulkData}
                    newsletterBulkData={newsletterBulkData}
                />
            case 2: {
                var dialogElement = document.getElementsByClassName("MuiDialog-paper")[0];
                dialogElement.style = "max-width: 750px";
                return <TranzilaIframe
                    data={data}
                    classes={classes}
                    isRTL={isRTL}
                    packageId={packageId}
                    onConfirm={onConfirm}
                    paymentUrl={paymentUrl}
                    t={t}
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

export default PricePackages;