import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Grid, Typography, Box, Tabs, Tab, TextField, Button, IconButton, Chip, CircularProgress } from '@material-ui/core';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import clsx from 'clsx';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import DesktopWindowsIcon from '@material-ui/icons/DesktopWindows';
import TabletMacIcon from '@material-ui/icons/TabletMac';
import SmartphoneIcon from '@material-ui/icons/Smartphone';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ImageOutlinedIcon from '@material-ui/icons/ImageOutlined';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { FaBullhorn } from 'react-icons/fa';
import DefaultScreen from '../DefaultScreen';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { initialWidgetConfig, WidgetConfig } from './types';
import AppearanceTab from './components/tabs/AppearanceTab';
import BehaviorTab from './components/tabs/BehaviorTab';
import IdentificationTab from './components/tabs/IdentificationTab';
import FeedbackTab from './components/tabs/FeedbackTab';
import MarketingTab from './components/tabs/MarketingTab';
import EmbedCodeGenerator from './components/EmbedCodeGenerator';
import { useWidgetAutoSave } from '../../hooks/useWidgetAutoSave';
import { getWidget, setWidgetStatus } from '../../helpers/Api/WidgetAPI';
import { findPlanByFeatureCode } from '../../redux/reducers/TiersSlice';
import { TierFeatures } from '../../helpers/Constants';
import { sitePrefix } from '../../config';

// Pulseem brand accent — matches palette.primary.main in style/theme.js. Applies to
// page chrome only: tabs, device toggles, dialogs. The live preview deliberately
// keeps config.primaryColor, since that is the customer's own widget colour.
const ACCENT = '#FF1744';

type WidgetStatus = 'draft' | 'active' | 'paused';

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTH: Record<PreviewDevice, number | string> = {
  desktop: '100%',
  tablet: 420,
  mobile: 300,
};

const STATUS_BADGE: Record<WidgetStatus, { label: string; bg: string; color: string }> = {
  active: { label: 'Active', bg: '#dcfce7', color: '#166534' },
  paused: { label: 'Paused', bg: '#fef9c3', color: '#854d0e' },
  draft: { label: 'Draft', bg: '#f3f4f6', color: '#6b7280' },
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  [key: string]: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other} style={{ paddingTop: 8 }}>
      {value === index && children}
    </div>
  );
}

interface ChatWidgetConfigContentProps {
  classes?: any;
  initialConfig: WidgetConfig;
  initialWidgetId?: string;
  initialStatus?: WidgetStatus;
  domain?: string;
}

const ChatWidgetConfigContent = ({ classes, initialConfig, initialWidgetId, initialStatus, domain }: ChatWidgetConfigContentProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentPlan, availablePlans } = useSelector((state: any) => state.tiers);
  const [config, setConfig] = useState<WidgetConfig>(initialConfig);
  const [tabIndex, setTabIndex] = useState(0);
  const [isMockOpen, setIsMockOpen] = useState(false);
  const [widgetId, setWidgetId] = useState<string | undefined>(initialWidgetId);
  const [status, setStatus] = useState<WidgetStatus>(initialStatus || 'draft');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [zoom, setZoom] = useState(1);
  const [tierBlockedFeature, setTierBlockedFeature] = useState<string | null>(null);

  // Once a widgetId exists (first save's response, or an existing widget being
  // edited) it's the authoritative target for every further save/status call;
  // `domain` only matters to resolve/create the very first row.
  const saveStatus = useWidgetAutoSave(config, 2000, (result) => {
    setWidgetId(result.widgetId);
    setStatus(result.status as WidgetStatus);
  }, widgetId, domain, (featureCode) => {
    // Revert whichever toggle triggered the block, then prompt to upgrade.
    setConfig(prev => ({
      ...prev,
      enableFeedback: featureCode === 'WIDGET_FEEDBACK' ? false : prev.enableFeedback,
      enableMarketing: featureCode === 'WIDGET_MARKETING' ? false : prev.enableMarketing,
    }));
    setTierBlockedFeature(featureCode);
  });

  const upgradePlanName = tierBlockedFeature
    ? findPlanByFeatureCode(tierBlockedFeature, availablePlans, currentPlan?.Id)
    : null;

  const handleStatusChange = async (nextStatus: 'active' | 'paused') => {
    if (statusUpdating || status === nextStatus) return;
    setStatusUpdating(true);
    try {
      const result = await setWidgetStatus(nextStatus, widgetId, domain);
      setStatus(result.status as WidgetStatus);
    } catch (err) {
      console.error('Failed to update widget status', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const hasIdentForm = config.enableIdentification && config.identificationFields.length > 0;
  const showFeedbackPreview = tabIndex === 3 && config.enableFeedback;
  const showIdentPreview = tabIndex === 2 && hasIdentForm;

  // Auto-open the preview window when editing the Identification or Feedback tabs,
  // so the relevant screen is visible (matches the design mockups).
  useEffect(() => {
    if (showFeedbackPreview || showIdentPreview) {
      setIsMockOpen(true);
    }
  }, [showFeedbackPreview, showIdentPreview]);

  const previewScreen: 'feedback' | 'identification' | 'chatting' = showFeedbackPreview
    ? 'feedback'
    : hasIdentForm
      ? 'identification'
      : 'chatting';

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleConfigChange = (key: keyof WidgetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const tabItems = [
    { label: t('common.widget_appearance', 'Appearance'), icon: <EditOutlinedIcon style={{ fontSize: 18 }} /> },
    { label: t('common.widget_behavior', 'Behavior'), icon: <CompareArrowsIcon style={{ fontSize: 18 }} /> },
    { label: t('common.widget_identification', 'Identification'), icon: <PersonOutlineIcon style={{ fontSize: 18 }} /> },
    { label: t('common.widget_feedback_tab', 'User Feedback'), icon: <CheckBoxOutlinedIcon style={{ fontSize: 18 }} /> },
    { label: t('common.widget_marketing_tab', 'Marketing'), icon: <FaBullhorn size={15} /> },
  ];

  const devices: { key: PreviewDevice; icon: React.ReactNode }[] = [
    { key: 'desktop', icon: <DesktopWindowsIcon style={{ fontSize: 18 }} /> },
    { key: 'tablet', icon: <TabletMacIcon style={{ fontSize: 18 }} /> },
    { key: 'mobile', icon: <SmartphoneIcon style={{ fontSize: 18 }} /> },
  ];

  return (
    <DefaultScreen
      currentPage='widgets'
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4} mt={2}>
        <Box>
          <Button
            className={clsx(classes?.btn, classes?.btnRounded)}
            onClick={() => navigate(`${sitePrefix}Widgets`)}
            startIcon={<ArrowBackIcon />}
            size="small"
            style={{ marginBottom: 8, marginInlineStart: -8 }}
          >
            {t('common.widget_back_to_list', 'Back to widgets')}
          </Button>
          <Box display="flex" alignItems="center">
            <Typography variant="h4" style={{ fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 }}>{t('common.widget_chat_widget', 'Chat Widget')}</Typography>
            {saveStatus === 'saving' && <Typography variant="caption" color="textSecondary" style={{ marginInlineStart: 16 }}>{t('common.widget_saving', 'Saving...')}</Typography>}
            {saveStatus === 'saved' && <Typography variant="caption" style={{ marginInlineStart: 16, color: '#4caf50', fontWeight: 'bold' }}>✓ {t('common.widget_saved', 'Saved')}</Typography>}
          </Box>
          <Typography variant="body1" color="textSecondary">
            {t('common.widget_page_subtitle', 'Configure your embeddable chat widget for your website')}
          </Typography>
        </Box>

        {/* Status badge + activate/pause toggle only appear once a widget record exists (first save) */}
        {widgetId && (
          <Box display="flex" alignItems="center">
            <Box
              px={1.5}
              py={0.5}
              mr={2}
              borderRadius={6}
              style={{ backgroundColor: STATUS_BADGE[status].bg, color: STATUS_BADGE[status].color, fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize' }}
            >
              {STATUS_BADGE[status].label}
            </Box>
            <Box display="flex" alignItems="center" bgcolor="#f3f4f6" p={0.5} borderRadius={8} border="1px solid #e5e7eb">
              <Button
                disableElevation
                disabled={statusUpdating}
                variant={status === 'active' ? "contained" : "text"}
                size="small"
                style={{
                  borderRadius: 6,
                  padding: '4px 16px',
                  backgroundColor: status === 'active' ? '#dcfce7' : 'transparent',
                  color: status === 'active' ? '#166534' : '#6b7280',
                  fontWeight: status === 'active' ? 600 : 400,
                  textTransform: 'none',
                  boxShadow: 'none'
                }}
                onClick={() => handleStatusChange('active')}
              >
                {t('common.widget_activate', 'Activate')}
              </Button>
              <Button
                disableElevation
                disabled={statusUpdating}
                variant={status !== 'active' ? "contained" : "text"}
                size="small"
                style={{
                  borderRadius: 6,
                  padding: '4px 16px',
                  backgroundColor: status !== 'active' ? '#ffffff' : 'transparent',
                  color: status !== 'active' ? '#111827' : '#6b7280',
                  fontWeight: status !== 'active' ? 600 : 400,
                  textTransform: 'none',
                  boxShadow: status !== 'active' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
                onClick={() => handleStatusChange('paused')}
              >
                <span style={{ marginRight: 6 }}>⏸</span> {t('common.widget_pause', 'Pause')}
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          {/* Left Column: Configuration */}
          <Box
            p={3}
            bgcolor="#ffffff"
            borderRadius={16}
            boxShadow="0 4px 20px rgba(0,0,0,0.04)"
            border="1px solid #e5e7eb"
            mb={4}
          >
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="fullWidth"
              TabIndicatorProps={{ style: { backgroundColor: ACCENT, height: 3 } }}
              style={{ borderBottom: '1px solid #e5e7eb', marginBottom: 8 }}
            >
              {tabItems.map((tabItem, i) => (
                <Tab
                  key={i}
                  disableRipple
                  style={{ textTransform: 'none', minWidth: 0, padding: '6px 8px' }}
                  label={
                    <Box display="flex" alignItems="center" justifyContent="center" style={{ color: tabIndex === i ? ACCENT : '#6b7280' }}>
                      <Box display="flex" alignItems="center" mr={1}>{tabItem.icon}</Box>
                      <span style={{ fontWeight: tabIndex === i ? 600 : 500, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{tabItem.label}</span>
                    </Box>
                  }
                />
              ))}
            </Tabs>

            <TabPanel value={tabIndex} index={0}>
              <AppearanceTab config={config} onChange={handleConfigChange} />
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
              <BehaviorTab config={config} onChange={handleConfigChange} />
            </TabPanel>
            <TabPanel value={tabIndex} index={2}>
              <IdentificationTab config={config} onChange={handleConfigChange} />
            </TabPanel>
            <TabPanel value={tabIndex} index={3}>
              <FeedbackTab config={config} onChange={handleConfigChange} />
            </TabPanel>
            <TabPanel value={tabIndex} index={4}>
              <MarketingTab config={config} onChange={handleConfigChange} />
            </TabPanel>
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          {/* Right Column: Live Preview */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center">
              <Typography variant="h6" style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.05rem', marginRight: 6 }}>
                {t('common.widget_interactive_preview', 'Interactive Preview')}
              </Typography>
              <InfoOutlinedIcon style={{ fontSize: 16, color: '#9ca3af' }} />
            </Box>
            <Box display="flex" alignItems="center" border="1px solid #e5e7eb" borderRadius={8} style={{ padding: 2 }}>
              {devices.map((d) => (
                <IconButton
                  key={d.key}
                  size="small"
                  onClick={() => setPreviewDevice(d.key)}
                  style={{
                    color: previewDevice === d.key ? ACCENT : '#9ca3af',
                    border: previewDevice === d.key ? `1px solid ${ACCENT}` : '1px solid transparent',
                    borderRadius: 6,
                    padding: 5,
                    margin: 1,
                  }}
                >
                  {d.icon}
                </IconButton>
              ))}
            </Box>
          </Box>

          <Box
            p={0}
            borderRadius={12}
            minHeight="520px"
            position="relative"
            bgcolor="#f8f9fa"
            overflow="hidden"
            border="1px dashed #d1d5db"
          >
            <Box
              m={3}
              mx="auto"
              bgcolor="#ffffff"
              borderRadius={8}
              border="1px solid #e5e7eb"
              height="460px"
              position="relative"
              overflow="hidden"
              boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.05)"
              style={{
                maxWidth: DEVICE_WIDTH[previewDevice],
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'max-width 0.25s ease, transform 0.2s ease',
              }}
            >
              {/* Browser chrome */}
              <Box display="flex" alignItems="center" bgcolor="#f3f4f6" p={1.5} borderBottom="1px solid #e5e7eb">
                <Box display="flex" mr={2}>
                  <Box width={10} height={10} borderRadius="50%" bgcolor="#fca5a5" mr={0.5} />
                  <Box width={10} height={10} borderRadius="50%" bgcolor="#fde047" mr={0.5} />
                  <Box width={10} height={10} borderRadius="50%" bgcolor="#86efac" />
                </Box>
                <Box bgcolor="#ffffff" borderRadius={4} px={1.5} py={0.5} display="flex" alignItems="center" flex={1} border="1px solid #e5e7eb">
                  <LockOutlinedIcon style={{ fontSize: 12, color: '#9ca3af', marginRight: 6 }} />
                  <Typography variant="caption" style={{ color: '#6b7280' }}>{config.websiteUrl || 'https://www.yourwebsite.com'}</Typography>
                </Box>
                <MoreVertIcon style={{ fontSize: 18, color: '#9ca3af', marginLeft: 8 }} />
              </Box>

              {/* Mock website content */}
              <Box p={2.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                  <Typography style={{ color: '#9ca3af', fontWeight: 600 }}>{t('common.widget_your_website', 'Your Website')}</Typography>
                  <Box display="flex">
                    {[0, 1, 2, 3].map((i) => (
                      <Box key={i} width={26} height={6} bgcolor="#e5e7eb" borderRadius={3} ml={1} />
                    ))}
                  </Box>
                </Box>
                <Box height={78} bgcolor="#f1f3f5" borderRadius={8} mb={2.5} />
                <Box display="flex">
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      flex={1}
                      height={78}
                      bgcolor="#f1f3f5"
                      borderRadius={8}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={{ marginRight: i < 2 ? 12 : 0 }}
                    >
                      <ImageOutlinedIcon style={{ color: '#cbd5e1', fontSize: 28 }} />
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Widget mockup */}
              <Box
                position="absolute"
                bottom={20}
                right={config.position === 'bottom-right' ? 20 : 'auto'}
                left={config.position === 'bottom-left' ? 20 : 'auto'}
                display="flex"
                flexDirection="column"
                alignItems={config.position === 'bottom-right' ? 'flex-end' : 'flex-start'}
                zIndex={100}
              >
                {/* Chat window */}
                {isMockOpen && (
                  <Box
                    width={280}
                    height={340}
                    bgcolor="#fff"
                    borderRadius={12}
                    boxShadow="0 12px 40px rgba(0,0,0,0.15)"
                    mb={2}
                    display="flex"
                    flexDirection="column"
                    overflow="hidden"
                    style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  >
                    <Box p={2} bgcolor={config.primaryColor} color="#fff" display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                        {previewScreen === 'feedback'
                          ? t('common.widget_feedback_header', 'We value your feedback!')
                          : (config.name || t('common.widget_default_name', 'Chat with us'))}
                      </Typography>
                      <Typography style={{ cursor: 'pointer', opacity: 0.8 }} onClick={() => setIsMockOpen(false)}>✕</Typography>
                    </Box>
                    <Box p={2.5} flexGrow={1} overflow="auto" bgcolor="#fcfcfc">
                      {previewScreen === 'feedback' ? (
                        <Box>
                          {config.enableStarRating && (
                            <Box mb={2}>
                              <Typography variant="body2" style={{ color: '#374151', marginBottom: 6 }}>{t('common.widget_rate_experience', 'How would you rate your chat experience?')}</Typography>
                              <Box display="flex">
                                {[0, 1, 2, 3, 4].map((i) => (
                                  <StarBorderIcon key={i} style={{ color: config.primaryColor, fontSize: 28 }} />
                                ))}
                              </Box>
                            </Box>
                          )}
                          {config.enableFreeText && (
                            <Box mb={2}>
                              <Typography variant="body2" style={{ color: '#374151', marginBottom: 6 }}>{t('common.widget_additional_comments', 'Any additional comments?')}</Typography>
                              <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                multiline
                                rows={2}
                                placeholder={t('common.widget_comments_placeholder', 'Type your comments here...')}
                                style={{ backgroundColor: '#fff' }}
                              />
                            </Box>
                          )}
                          {config.enablePredefinedTags && config.predefinedTags.length > 0 && (
                            <Box mb={2}>
                              <Typography variant="body2" style={{ color: '#374151', marginBottom: 6 }}>{t('common.widget_describe_experience', 'What best describes your experience?')}</Typography>
                              <Box display="flex" flexWrap="wrap">
                                {config.predefinedTags.map((tag) => (
                                  <Chip key={tag} label={tag} size="small" style={{ marginRight: 6, marginBottom: 6, backgroundColor: '#f3f4f6', color: '#374151' }} />
                                ))}
                              </Box>
                            </Box>
                          )}
                          <Button variant="contained" style={{ backgroundColor: config.primaryColor, color: '#fff', padding: '8px 0', marginTop: 4, borderRadius: 8, fontWeight: 'bold' }} fullWidth>
                            {t('common.widget_submit_feedback', 'Submit Feedback')}
                          </Button>
                          <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: '#6b7280', marginTop: 10 }}>{t('common.widget_thank_you', 'Thank you! 🙌')}</Typography>
                        </Box>
                      ) : previewScreen === 'identification' ? (
                        <Box>
                          <Typography variant="body2" style={{ color: '#374151', marginBottom: 4 }}>{config.greetingMessage || t('common.widget_default_greeting', 'Hi there! 👋')}</Typography>
                          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 14 }}>{t('common.widget_provide_details', 'Please provide your details to get started.')}</Typography>
                          {config.identificationFields.map((field) => {
                            const displayName = field.label || field.name || t('common.widget_field', 'Field');
                            return (
                              <Box key={field.id} mb={1.5}>
                                <Typography variant="caption" style={{ display: 'block', color: '#374151', fontWeight: 500, marginBottom: 4 }}>
                                  {displayName}{field.required && ' *'}
                                </Typography>
                                <TextField
                                  fullWidth
                                  size="small"
                                  variant="outlined"
                                  placeholder={`${t('common.widget_enter_your', 'Enter your')} ${displayName.toLowerCase()}`}
                                  type={field.type === 'phone' ? 'tel' : field.type === 'email' ? 'email' : 'text'}
                                  multiline={field.type === 'textarea'}
                                  rows={field.type === 'textarea' ? 3 : 1}
                                  style={{ backgroundColor: '#fff' }}
                                />
                              </Box>
                            );
                          })}
                          <Button variant="contained" style={{ backgroundColor: config.primaryColor, color: '#fff', padding: '8px 0', marginTop: 8, borderRadius: 8, fontWeight: 'bold' }} fullWidth>
                            {t('common.widget_start_chat', 'Start Chat')}
                          </Button>
                        </Box>
                      ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                          <Typography color="textSecondary">{t('common.widget_chat_active', 'Chat Interface Active')}</Typography>
                        </Box>
                      )}
                    </Box>
                    {config.showBranding && (
                      <Box p={1} textAlign="center" borderTop="1px solid #f0f0f0" bgcolor="#fff">
                        <Typography variant="caption" style={{ color: '#aaa', fontWeight: 500 }}>Powered by <span style={{ color: '#0056b3' }}>Pulseem</span></Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Greeting tooltip */}
                {!isMockOpen && (
                  <Box
                    bgcolor="#fff"
                    p={1.5}
                    borderRadius={8}
                    boxShadow="0 4px 12px rgba(0,0,0,0.1)"
                    mb={2}
                    maxWidth="200px"
                    position="relative"
                    style={{ animation: 'fadeIn 0.5s ease', border: '1px solid #e5e7eb' }}
                  >
                    <Typography variant="body2" style={{ color: '#374151', lineHeight: 1.4 }}>{config.greetingMessage || t('common.widget_default_greeting', 'Hi there! 👋 Thanks for visiting. How can we help you today?')}</Typography>
                    {config.showBranding && (
                      <Typography variant="caption" style={{ display: 'block', color: '#9ca3af', marginTop: 6 }}>Powered by Pulseem</Typography>
                    )}
                    <Box
                      position="absolute"
                      bottom="-6px"
                      left={config.position === 'bottom-left' ? '20px' : 'auto'}
                      right={config.position === 'bottom-right' ? '20px' : 'auto'}
                      width={12} height={12} bgcolor="#fff"
                      style={{ transform: 'rotate(45deg)', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}
                    />
                  </Box>
                )}

                {/* Chat bubble */}
                <Box position="relative">
                  <Box
                    width={56}
                    height={56}
                    borderRadius="50%"
                    bgcolor={config.primaryColor}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="0 8px 24px rgba(0,0,0,0.2)"
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      transform: isMockOpen ? 'scale(0.9)' : 'scale(1)',
                    }}
                    onClick={() => setIsMockOpen(!isMockOpen)}
                  >
                    {isMockOpen ? (
                      <Typography variant="h5" style={{ color: '#fff', lineHeight: 1 }}>✕</Typography>
                    ) : (
                      <ChatBubbleOutlineIcon style={{ color: '#fff' }} />
                    )}
                  </Box>
                  {!isMockOpen && (
                    <Box
                      position="absolute"
                      top={-2}
                      right={-2}
                      width={20}
                      height={20}
                      borderRadius="50%"
                      bgcolor="#ef4444"
                      color="#fff"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      border="2px solid #fff"
                    >
                      <Typography variant="caption" style={{ fontSize: 11, fontWeight: 700 }}>1</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Zoom controls */}
            <Box position="absolute" bottom={12} right={16} display="flex" alignItems="center" bgcolor="#ffffff" borderRadius={8} border="1px solid #e5e7eb" boxShadow="0 1px 3px rgba(0,0,0,0.08)">
              <IconButton size="small" onClick={() => setZoom(z => Math.max(0.6, +(z - 0.1).toFixed(2)))}>
                <ZoomOutIcon style={{ fontSize: 18, color: '#6b7280' }} />
              </IconButton>
              <IconButton size="small" onClick={() => setZoom(z => Math.min(1.2, +(z + 0.1).toFixed(2)))}>
                <ZoomInIcon style={{ fontSize: 18, color: '#6b7280' }} />
              </IconButton>
            </Box>
          </Box>

          <Box mt={4}>
            <EmbedCodeGenerator widgetId={widgetId} />
          </Box>

          <style>{`
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </Grid>
      </Grid>

      {/* BaseDialog rather than a raw MUI Dialog, so the upgrade prompt matches every
          other popup in the app — same chrome, buttons and exit affordance. */}
      <BaseDialog
        open={!!tierBlockedFeature}
        classes={classes}
        title={t('billing.tier.permission', 'Upgrade required')}
        confirmText={t('billing.upgradePlan', 'Upgrade Plan')}
        cancelText={t('common.cancel', 'Cancel')}
        onClose={() => setTierBlockedFeature(null)}
        onCancel={() => setTierBlockedFeature(null)}
        onConfirm={() => { window.location.href = `${sitePrefix}BillingSettings`; }}
      >
        <Typography variant="body2">
          {upgradePlanName
            ? t('billing.tier.featureNotAvailable', 'This feature ({{feature}}) requires the {{planName}} plan.')
                .replace('{feature}', t((TierFeatures as Record<string, string>)[tierBlockedFeature || ''] || tierBlockedFeature || ''))
                .replace('{planName}', upgradePlanName)
            : t('billing.tier.noFeatureAvailable', 'This feature is not available on your current plan.')}
        </Typography>
      </BaseDialog>
    </DefaultScreen>
  );
};

interface LoadState {
  loading: boolean;
  config: WidgetConfig;
  widgetId?: string;
  status?: WidgetStatus;
}

/**
 * Fetches the existing widget (if any) before mounting the form, so the form's
 * auto-save hook sees the loaded config as its true "initial" value instead of
 * treating the load itself as a user edit that needs saving.
 *
 * Route contract: `/Widgets/:widgetId` edits an existing widget (widgetId is its
 * public WidgetGUID); `/Widgets/new?domain=...` creates a new one for that domain,
 * skipping the load fetch entirely since there is nothing to load yet.
 */
const ChatWidgetConfigPage = ({ classes }: { classes?: any }) => {
  const { widgetId: routeWidgetId } = useParams<{ widgetId?: string }>();
  const [searchParams] = useSearchParams();
  const isNew = routeWidgetId === 'new';
  const domain = isNew ? (searchParams.get('domain') || undefined) : undefined;

  const [loadState, setLoadState] = useState<LoadState>({ loading: !isNew, config: initialWidgetConfig });

  useEffect(() => {
    if (isNew) {
      setLoadState({ loading: false, config: { ...initialWidgetConfig, websiteUrl: domain || '' } });
      return;
    }

    let cancelled = false;

    getWidget(routeWidgetId)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          const { widgetId, status, ...rest } = data;
          setLoadState({ loading: false, config: { ...initialWidgetConfig, ...rest }, widgetId, status: status as WidgetStatus });
        } else {
          setLoadState({ loading: false, config: initialWidgetConfig });
        }
      })
      .catch((err) => {
        console.error('Failed to load widget config', err);
        if (!cancelled) setLoadState({ loading: false, config: initialWidgetConfig });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeWidgetId, isNew]);

  if (loadState.loading) {
    return (
      <DefaultScreen currentPage='widgets' classes={classes} containerClass={clsx(classes.management, classes.mb50)}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DefaultScreen>
    );
  }

  return (
    <ChatWidgetConfigContent
      classes={classes}
      initialConfig={loadState.config}
      initialWidgetId={loadState.widgetId}
      initialStatus={loadState.status}
      domain={domain}
    />
  );
};

export default ChatWidgetConfigPage;
