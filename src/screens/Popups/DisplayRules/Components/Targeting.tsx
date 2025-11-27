import React from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
  Card,
  CardContent,
  Typography,
  Box,
  makeStyles,
  Checkbox,
} from "@material-ui/core";
import { MdComputer, MdPhoneIphone } from "react-icons/md";
import PulseemSwitch from "../../../../components/Controlls/PulseemSwitch";

export type DeviceType = "desktop" | "mobile";

export type DeviceTargetingData = {
  desktop: boolean;
  mobile: boolean;
};

interface TargetingProps {
  classes: any;
  lookupData: any; // Add this prop
  show: boolean;
  onToggle: () => void;
  data: DeviceTargetingData;
  onChange: (devices: DeviceTargetingData) => void;
}

const useStyles = makeStyles((theme) => ({
  contentWrapper: {
    padding: '0rem 2rem 3rem 2rem',
    [theme.breakpoints.down('sm')]: {
      padding: '0rem 1rem 2rem 1rem',
    },
  },
  infoBox: {
    marginBottom: theme.spacing(2),
  },
  infoText: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  infoIcon: {
    fontSize: "18px",
  },
  devicesContainer: {
    display: "flex",
    gap: theme.spacing(3),
    flexWrap: "wrap",
    justifyContent: "flex-start",
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(2),
      justifyContent: "center",
    },
  },
  deviceCard: {
    position: "relative",
    borderRadius: "12px",
    padding: "20px",
    cursor: "pointer",
    minWidth: "120px",
    textAlign: "center",
    transition: "all 0.2s ease",
    [theme.breakpoints.down('md')]: {
      padding: "20px",
    },
    [theme.breakpoints.down('sm')]: {
      padding: "16px",
      minWidth: "150px",
      flex: "1 1 calc(50% - 8px)",
      maxWidth: "120px",
    },
    [theme.breakpoints.down('xs')]: {
      minWidth: "130px",
    },
  },
  deviceCardInactive: {
    border: "1px solid #e0e0e0",
    backgroundColor: "#fafafa",
  },
  deviceCardActive: {
    border: "1px solid #FF0076",
    backgroundColor: "#f8f8f8",
  },
  checkboxWrapper: {
    position: "absolute",
    top: "8px",
    right: "8px",
    padding: 0,
    [theme.breakpoints.down('sm')]: {
      top: "4px",
      right: "4px",
    },
  },
  checkbox: {
    padding: "2px",
    color: "#e0e0e0",
    "&.Mui-checked": {
      color: "#FF0076",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "20px",
      [theme.breakpoints.down('sm')]: {
        fontSize: "14px",
      },
    },
  },
  iconWrapper: {
    borderRadius: "50%",
    width: "52px",
    height: "52px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
    [theme.breakpoints.down('md')]: {
      width: "48px",
      height: "48px",
    },
    [theme.breakpoints.down('sm')]: {
      width: "40px",
      height: "40px",
      marginBottom: "12px",
    },
  },
  iconWrapperInactive: {
    backgroundColor: "#f0f0f0",
  },
  iconWrapperActive: {
    backgroundColor: "#e7e7e7",
  },
  deviceLabel: {
    fontWeight: 600,
    [theme.breakpoints.down('sm')]: {
      fontSize: "1rem",
    },
  },
}));

const Targeting: React.FC<TargetingProps> = ({
  classes,
  lookupData,
  show,
  onToggle,
  data,
  onChange,
}) => {
  const { t } = useTranslation();
  const localClasses = useStyles();

  const handleDeviceToggle = (deviceId: number) => {
    // Map deviceId to desktop/mobile
    const deviceType: DeviceType = deviceId === 1 ? 'desktop' : 'mobile';
    
    const newData = {
      ...data,
      [deviceType]: !data[deviceType],
    };
    
    // Prevent deselecting both devices
    if (!newData.desktop && !newData.mobile) {
      return;
    }
    
    onChange(newData);
  };

  const getIconSize = () => {
    if (window.innerWidth < 600) return 24;
    if (window.innerWidth < 960) return 28;
    return 32;
  };

  const getDeviceIcon = (deviceName: string) => {
    if (deviceName === "Desktop") {
      return MdComputer;
    }
    return MdPhoneIphone;
  };

  const isDeviceActive = (deviceId: number) => {
    return deviceId === 1 ? data.desktop : data.mobile;
  };

  return (
    <Box className={classes.pageTargetingResponsiveContainer}>
      <Card raised className={classes.pageTargetingCard}>
        <CardContent className={classes.pageTargetingCardContent}>
          <Box
            className={clsx(
              classes?.topHeaderPopupTrigger,
              classes?.p10,
              classes.pageTargetingResponsiveHeader,
              classes.spaceBetween,
            )}
            alignItems="center"
            mb={show && 4}
          >
            <div>
              <Typography
                variant="body1"
                className={clsx(
                  classes?.managementTitle,
                  classes?.sectionTitlePageTargetting
                )}
                gutterBottom
              >
                {t("PopupTriggers.deviceTargeting.title")}
              </Typography>
              <Typography
                variant="body1"
                className={classes?.subtitlePopupTrigger}
              >
                {t("PopupTriggers.deviceTargeting.subtitle")}
              </Typography>
            </div>
            <PulseemSwitch
              switchType="ios"
              id="device-targeting-toggle"
              checked={show}
              onChange={onToggle}
              classes={classes}
            />
          </Box>
          {show && (
            <Box className={localClasses.contentWrapper}>
              <Box className={localClasses.infoBox}>
                <Typography
                  variant="body2"
                  className={clsx(classes?.grayTextCell, localClasses.infoText)}
                >
                  <span className={localClasses.infoIcon}>ⓘ</span>
                  {t("PopupTriggers.deviceTargeting.info")}
                </Typography>
              </Box>
              <Box className={localClasses.devicesContainer}>
                {lookupData?.DeviceTargets?.map((device: any) => {
                  const isActive = isDeviceActive(device.Id);
                  const IconComponent = getDeviceIcon(device.Name);
                  
                  return (
                    <Box
                      key={device.Id}
                      onClick={() => handleDeviceToggle(device.Id)}
                      className={clsx(
                        localClasses.deviceCard,
                        isActive
                          ? localClasses.deviceCardActive
                          : localClasses.deviceCardInactive
                      )}
                    >
                      <Checkbox
                        checked={isActive}
                        className={localClasses.checkbox}
                        disableRipple
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleDeviceToggle(device.Id)}
                        classes={{
                          root: localClasses.checkboxWrapper,
                        }}
                      />
                      <Box
                        className={clsx(
                          localClasses.iconWrapper,
                          isActive
                            ? localClasses.iconWrapperActive
                            : localClasses.iconWrapperInactive
                        )}
                      >
                        <IconComponent
                          size={getIconSize()}
                          color={isActive ? "#ff3343" : "#9e9e9e"}
                        />
                      </Box>
                      <Typography
                        variant="body1"
                        className={clsx(
                          localClasses.deviceLabel,
                        )}
                      >
                        {device.Name}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Targeting;