import { useTranslation } from 'react-i18next'
import Package from '../../PackageBox/Package';
import BalanceWizard from '../../BalanceWizard';

const PackagesList = ({ data, classes, packageType, smsBulkData = null, newsletterBulkData = null, whatsappBulkData = null, onSelect = () => null, onManualPrice = () => null }) => {
    const { t } = useTranslation();

    const whatsapp_balanceSteps = [
        { title: 'common.enterTopUpAmount', description: 'common.whatsappBulkDescription' },
        { title: 'common.payment' },
        { title: 'common.summary' },
    ];

    if (data !== null) {
        const packageLength = data.length;
        let packPerLine = Math.ceil(12 / packageLength);
        packPerLine = packPerLine < 3 ? 3 : packPerLine;

        const packageList = {
            2: { data: newsletterBulkData, title: t('common.newsletterBulkTitle'), description: t('common.newsletterBulkDescription') },
            3: { data: smsBulkData, title: t('common.smsBulkTitle'), description: t('common.smsBulkDescription') },
            4: { data: whatsappBulkData, title: t('common.whatsappBulk'), description: t('common.whatsappBulkDescription') },
        };

        return (
            packageList[packageType].data &&
            <>
                {packageType === 4 ? <BalanceWizard
                    classes={classes}
                    steps={whatsapp_balanceSteps}
                /> : (<>{
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
                }</>)}

            </>
        );
    }
    return <></>;
}

export default PackagesList;