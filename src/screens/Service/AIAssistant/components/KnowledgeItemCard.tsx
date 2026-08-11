import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Card, CardContent, Typography, Chip, IconButton, Box, Tooltip, Switch } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import LinkIcon from '@material-ui/icons/Link';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import { IKnowledgeItem, KnowledgeItemType } from '../../../../Models/Service/AIAssistant';

const useStyles = makeStyles({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  title: {
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  contentPreview: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    minHeight: '2.6em',
    marginBlock: 8,
    color: '#6b7280',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBlockEnd: 8,
  },
  tagsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    marginBlockEnd: 8,
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
});

const TYPE_ICON: Record<KnowledgeItemType, React.ReactNode> = {
  text: <DescriptionOutlinedIcon fontSize="small" />,
  faq: <HelpOutlineIcon fontSize="small" />,
  url: <LinkIcon fontSize="small" />,
};

interface KnowledgeItemCardProps {
  item: IKnowledgeItem;
  onEdit: (item: IKnowledgeItem) => void;
  onDelete: (item: IKnowledgeItem) => void;
  onToggleActive: (item: IKnowledgeItem) => void;
}

const KnowledgeItemCard = ({ item, onEdit, onDelete, onToggleActive }: KnowledgeItemCardProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { isRTL } = useSelector((state: any) => state.core);

  return (
    <Card dir={isRTL ? 'rtl' : 'ltr'} variant="outlined" className={classes.card}>
      <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className={classes.headerRow}>
          <div className={classes.titleRow}>
            {TYPE_ICON[item.type]}
            <Typography variant="subtitle1" className={classes.title} title={item.title}>
              {item.title}
            </Typography>
          </div>
          <Switch
            size="small"
            checked={item.isActive}
            onChange={() => onToggleActive(item)}
            inputProps={{ 'aria-label': item.isActive ? t('AIAssistant.knowledgeItemCard.deactivate') : t('AIAssistant.knowledgeItemCard.activate') }}
          />
        </div>

        <div className={classes.badgeRow}>
          <Chip
            size="small"
            label={item.isActive ? t('AIAssistant.knowledgeItemCard.active') : t('AIAssistant.knowledgeItemCard.inactive')}
            style={{
              backgroundColor: item.isActive ? '#dcfce7' : '#f3f4f6',
              color: item.isActive ? '#166534' : '#6b7280',
            }}
          />
          <Chip size="small" variant="outlined" label={t(`AIAssistant.knowledgeItemForm.typeOptions.${item.type}`)} />
        </div>

        <Typography variant="body2" className={classes.contentPreview}>
          {item.content}
        </Typography>

        {item.tags.length > 0 && (
          <div className={classes.tagsRow}>
            {item.tags.map((tag) => (
              <Chip key={tag} size="small" label={tag} variant="outlined" />
            ))}
          </div>
        )}

        <div className={classes.footerRow}>
          <Typography variant="caption" color="textSecondary">
            {t('AIAssistant.knowledgeItemCard.wordCountFormat', { count: item.wordCount })}
          </Typography>
          <Box display="flex" alignItems="center">
            <Tooltip title={t('AIAssistant.knowledgeItemCard.edit') as string}>
              <IconButton size="small" onClick={() => onEdit(item)} aria-label={t('AIAssistant.knowledgeItemCard.edit') as string}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('AIAssistant.knowledgeItemCard.delete') as string}>
              <IconButton size="small" onClick={() => onDelete(item)} aria-label={t('AIAssistant.knowledgeItemCard.delete') as string}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </div>
      </CardContent>
    </Card>
  );
};

export default KnowledgeItemCard;
