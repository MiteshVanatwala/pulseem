import { useTranslation } from 'react-i18next'
import { Grid, Typography, Divider } from '@material-ui/core';
import Package from '../../PackageBox/Package';
//import PurchaseLogs from '../PurhcaseLogs/Logs';

const PackagesList = ({ data, classes, packageType, smsBulkData = null, newsletterBulkData = null, onSelect = () => null }) => {
    const { t } = useTranslation();
    if (data !== null) {
        const packageLength = data.length;
        let packPerLine = Math.ceil(12 / packageLength);
        packPerLine = packPerLine < 3 ? 3 : packPerLine;
        switch (packageType) {
            case 3: {
                return (
                    <>
                        {/* {purchaseLogs && <PurchaseLogs classes={classes} data={purchaseLogs} />} */}
                        <Grid item xs={12}>
                            <Typography className={classes.dialogTitle} style={{ marginInline: 0 }}>{t('common.smsBulkTitle')}</Typography>
                            <Divider />
                            <Typography className={classes.mt3}>{t('common.smsBulkDescription')}</Typography>
                        </Grid>
                        {
                            smsBulkData.sort((a, b) => a.Quantity - b.Quantity).map((d, index) => {
                                return (
                                    <Package
                                        pack={d}
                                        packSize={packPerLine}
                                        key={`pack_${d.ID}`}
                                        onSelect={onSelect}
                                        packageType={packageType}
                                        classes={classes} />
                                )
                            })
                        }
                    </>);
            }
            case 2: {
                return (
                    <>
                        <Grid item xs={12}>
                            <Typography className={classes.dialogTitle} style={{ marginInline: 0 }}>{t('common.newsletterBulkTitle')}</Typography>
                            <Divider />
                            <Typography className={classes.mt3}>{t('common.newsletterBulkDescription')}</Typography>
                        </Grid>
                        {
                            newsletterBulkData.sort((a, b) => a.Quantity - b.Quantity).map((d) => {
                                return (
                                    <Package pack={d}
                                        packSize={packPerLine}
                                        key={d.ID}
                                        onSelect={onSelect}
                                        packageType={packageType}
                                        classes={classes} />
                                )
                            })
                        }
                    </>);
            }
        }
    }
    return (<></>);
}

export default PackagesList;