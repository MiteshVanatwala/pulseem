import React from 'react';
import { useTranslation } from 'react-i18next'
import { Grid, Typography, Divider } from '@material-ui/core';
import Package from '../../PackageBox/Package';

const PackagesList = ({ data, classes, packageType, smsBulkData = null, newsletterBulkData = null, onSelect = () => null }) => {
    const { t } = useTranslation();
    if (data !== null) {
        const packageLength = data.length;
        let packPerLine = Math.ceil(12 / packageLength);
        packPerLine = packPerLine < 3 ? 3 : packPerLine;

        const packageList = {
            2: { data: newsletterBulkData, title: t('common.newsletterBulkTitle'), description: t('common.newsletterBulkDescription') },
            3: { data: smsBulkData, title: t('common.smsBulkTitle'), description: t('common.smsBulkDescription') }
        };

        return (
            packageList[packageType].data &&
            <>
                <Grid item xs={12}>
                    <Typography>{packageList[packageType].description}</Typography>
                    <Divider />
                </Grid>
                {
                    packageList[packageType].data.sort((a, b) => a.Quantity - b.Quantity).map((d, index) => {
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
            </>
        );
    }
    return <></>;
}

export default PackagesList;