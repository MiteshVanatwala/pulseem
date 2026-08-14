import React from 'react';
import { useTranslation } from 'react-i18next';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import { IMarketingInsights } from '../../../../Models/Service/Dashboard';
import Skeleton from './Skeleton';

interface Props {
  data: IMarketingInsights | null;
  loading: boolean;
}

const MarketingInsightsPanel = ({ data, loading }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="svc-card">
      <div className="svc-panel-head">
        <div className="svc-panel-title-wrap">
          <span className="svc-panel-icon" style={{ background: '#f1ecfe', color: '#7c3aed' }}>
            <TrendingUpIcon />
          </span>
          <h3 className="svc-panel-title">{t('dashboard_marketing_insights', 'Marketing Insights')}</h3>
        </div>
      </div>

      {loading && !data ? (
        [0, 1, 2, 3].map((i) => <Skeleton key={i} height={16} style={{ margin: '12px 0' }} />)
      ) : data ? (
        <>
          <div className="svc-kv">
            <span className="svc-kv-label">{t('dashboard_total_contacts', 'Total Contacts')}</span>
            <span className="svc-kv-value">{data.totalContacts}</span>
          </div>
          <div className="svc-kv">
            <span className="svc-kv-label">{t('dashboard_this_week', 'This Week')}</span>
            <span className="svc-kv-value">{data.thisWeek}</span>
          </div>
          <div className="svc-kv">
            <span className="svc-kv-label">{t('dashboard_this_month', 'This Month')}</span>
            <span className="svc-kv-value">{data.thisMonth}</span>
          </div>
          <div className="svc-kv">
            <span className="svc-kv-label">{t('dashboard_conversion_rate', 'Conversion Rate')}</span>
            <span className="svc-kv-value">{data.conversionRate}%</span>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default MarketingInsightsPanel;
