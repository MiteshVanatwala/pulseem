import React from 'react';
import { useTranslation } from 'react-i18next';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { IUserFeedback } from '../../../../Models/Service/Dashboard';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

interface Props {
  data: IUserFeedback | null;
  loading: boolean;
  onSettings: () => void;
}

const stars = (rating: number): string => '★'.repeat(Math.round(rating)) + '☆'.repeat(Math.max(0, 5 - Math.round(rating)));

const UserFeedbackPanel = ({ data, loading, onSettings }: Props) => {
  const { t } = useTranslation();

  const renderBody = () => {
    if (loading && !data) {
      return [0, 1, 2, 3].map((i) => <Skeleton key={i} height={16} style={{ margin: '12px 0' }} />);
    }
    if (!data || !data.enabled || data.totalReviews === 0) {
      return (
        <EmptyState
          icon={<StarBorderIcon fontSize="inherit" />}
          text={t('dashboard_no_feedback', 'No feedback collected yet')}
          linkText={t('dashboard_feedback_settings', 'Enable in widget settings')}
          onLink={onSettings}
        />
      );
    }
    return (
      <>
        <div className="svc-fb-top">
          <div>
            <div className="svc-fb-rating">{data.avgRating.toFixed(1)}</div>
            <div className="svc-fb-stars">{stars(data.avgRating)}</div>
          </div>
          <div>
            <div className="svc-fb-sub">{data.totalReviews} {t('dashboard_reviews', 'reviews')}</div>
            <div className="svc-fb-sentiment">
              <span className="svc-pill svc-pill-green">{t('dashboard_positive', 'Positive')} {data.positive}</span>
              <span className="svc-pill svc-pill-gray">{data.neutral}</span>
              <span className="svc-pill svc-pill-yellow">{t('dashboard_needs_attention', 'Needs Attention')} {data.negative}</span>
            </div>
          </div>
        </div>
        <div className="svc-fb-items">
          {data.recent.map((f) => (
            <div className="svc-fb-item" key={f.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="svc-fb-stars" style={{ fontSize: 13 }}>{stars(f.rating)}</span>
                {f.author && <span className="svc-fb-sub" style={{ marginBottom: 0 }}>{f.author}</span>}
              </div>
              <div className="svc-fb-item-text">{f.text}</div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="svc-card">
      <div className="svc-panel-head">
        <div className="svc-panel-title-wrap">
          <span className="svc-panel-icon" style={{ background: '#fef5e0', color: '#d97706' }}>
            <StarBorderIcon />
          </span>
          <h3 className="svc-panel-title">{t('dashboard_user_feedback', 'User Feedback')}</h3>
        </div>
      </div>
      {renderBody()}
    </div>
  );
};

export default UserFeedbackPanel;
