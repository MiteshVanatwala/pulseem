import React from 'react';
import { Fab, Tooltip, CircularProgress } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleChat } from '../../redux/reducers/aiChatSlice';
import { makeStyles } from '@material-ui/core/styles';
import PulseemMascotImage from "../../assets/images/pulseem_mascot.png";
import AIImage from "../../assets/images/AI-icon.png";
import { useTranslation } from 'react-i18next';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import { StateType } from '../../Models/StateTypes';

const useStyles = makeStyles((theme) => ({
  fab: {
    position: 'fixed',
    bottom: '100px',
    right: '20px',
    width: '60px',
    height: '60px',
    // backgroundColor: '#FF1744',
    border: 'solid',
    borderWidth: '0px',
    borderColor: '#FF1744',
    backgroundColor: 'transparent',
    color: 'white',
    zIndex: 1300, // Above the chat widget
    '&:hover': {
      borderColor: '#FF4569',
      backgroundColor: 'transparent',
    },
    animation: '$pulse 2s infinite',
  },
  smallIcon: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    '& img': {
      position: 'absolute',
      top: '-3px',
      right: '-3px',
      width: '20px',
      height: '20px',
    }
  },
  polyIcon: {
    transform: ({ isRTL }: { isRTL: boolean }) => isRTL ? 'scaleX(-1)' : 'none',
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(255, 23, 68, 0.4)',
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(255, 23, 68, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(255, 23, 68, 0)',
    },
  },
}));

const AIFloatingButton: React.FC = () => {
  const isRTL = useSelector((state: StateType) => state.core.isRTL);
  const classes = useStyles({ isRTL });
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { accountFeatures } = useSelector((state: StateType) => state.common);
  const { aiIconStatus } = useSelector((state: any) => state.aiChat);

  const handleToggleChat = () => {
    dispatch(toggleChat());
  };

  if (accountFeatures?.indexOf(PulseemFeatures.PolyAIAgent) === -1) return <></>;

  return (
    <Tooltip
      arrow
      title={t("common.polyAgentIconTitle")}
      placement={"top"}
      open
    >
      <Fab className={classes.fab} onClick={handleToggleChat}>
        <div className={classes.smallIcon}>
          {aiIconStatus === 0 ? (
            <img src={AIImage} />
          ) : aiIconStatus === 1 ? (
            <CircularProgress size={15} />
          ) : (
            <Check fontSize="small" color="primary" style={{ color: 'green' }} />
          )}
        </div>
        <img width={60} src={PulseemMascotImage} className={classes.polyIcon} />
      </Fab>
    </Tooltip>
  );
};

export default AIFloatingButton;
