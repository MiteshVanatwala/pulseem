import React from 'react';
import { useTranslation } from 'react-i18next';
import SpeedIcon from '@material-ui/icons/Speed';
import { IPerformanceInsights } from '../../../../Models/Service/Dashboard';
import Skeleton from './Skeleton';

interface Props {
  data: IPerformanceInsights | null;
  loading: boolean;
}

const PerformanceInsightsPanel = ({ data, loading }: Props) => {
  const { t } = useTranslation();

  const widgetPill = () => {
    if (!data) return null;
    const map = {
      active: { cls: 'svc-pill-green', label: t('common.dashboard_widget_active', 'Active') },
      paused: { cls: 'svc-pill-yellow', label: t('common.dashboard_widget_paused', 'Paused') },
      not_configured: { cls: 'svc-pill-gray', label: t('common.dashboard_widget_not_configured', 'Not configured') },
    }[data.widgetStatus];
    return <span className={`svc-pill ${map.cls}`}>{map.label}</span>;
  };

  return (
    <div className="svc-card">
      <div className="svc-panel-head">
        <div className="svc-panel-title-wrap">
          <span className="svc-panel-icon" style={{ background: '#e7f7ee', color: '#12894f' }}>
            <SpeedIcon />
          </span>
          <h3 className="svc-panel-title">{t('common.dashboard_performance', 'Performance Insights')}</h3>
        </div>
      </div>

      {loading && !data ? (
        [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={16} style={{ margin: '12px 0' }} />)
      ) : data ? (
        <>
          <div className="svc-kv">
            <span className="svc-kv-label">{t('common.dashboard_avg_response', 'Avg Response')}</span>
            {/* null = nothing answered yet. Showing "0 min" here would claim instant
                replies, so show a dash until the number is real. */}
            <span className="svc-kv-value">
              {data.avgResponseMinutes == null
                ? '—'
                : `${data.avgResponseMinutes} ${t('common.dashboard_minutes', 'min')}`}
            </span>
          </div>
          <div className="svc-kv">
            <span className="svc-kv-label">{t('common.dashboard_resolution_rate', 'Resolution Rate')}</span>
            <span className="svc-kv-value">{data.resolutionRate}%</span>
          </div>
          <div className="svc-kv">
            <span className="svc-kv-label">{t('common.dashboard_widget_status', 'Widget Status')}</span>
            <span className="svc-kv-value">{widgetPill()}</span>
          </div>
          <div className="svc-kv">
            <span className="svc-kv-label">{t('common.dashboard_active_hours', 'Active Hours')}</span>
            <span className="svc-kv-value">
              {data.activeHours === 'custom' ? t('common.dashboard_hours_custom', 'Custom') : '24/7'}
            </span>
          </div>
          <div className="svc-kv">
            <span className="svc-kv-label">{t('common.dashboard_ai_status', 'AI Assistant')}</span>
            <span className="svc-kv-value">
              <span className={`svc-pill ${data.aiStatus === 'enabled' ? 'svc-pill-green' : 'svc-pill-gray'}`}>
                {data.aiStatus === 'enabled' ? t('common.dashboard_enabled', 'Enabled') : t('common.dashboard_disabled', 'Disabled')}
              </span>
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default PerformanceInsightsPanel;
