import React from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Checkbox,
} from "@material-ui/core";
import { MdComputer, MdPhoneIphone } from "react-icons/md";

export type DeviceType = "desktop" | "mobile";

export type DeviceTargetingData = {
  desktop: boolean;
  mobile: boolean;
};

interface TargetingProps {
  classes: any;
  lookupData: any;
  data: DeviceTargetingData;
  onChange: (devices: DeviceTargetingData) => void;
}

const Targeting: React.FC<TargetingProps> = ({
  classes,
  lookupData,
  data,
  onChange,
}) => {
  const { t } = useTranslation();

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
            )}
            alignItems="center"
            mb={4}
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
          </Box>
          <Box className={classes.contentWrapper}>
            <Box className={classes.infoBox}>
              <Typography
                variant="body2"
                className={clsx(classes?.grayTextCell, classes.infoText)}
              >
                <span className={classes.infoIcon}>ⓘ</span>
                {t("PopupTriggers.deviceTargeting.info")}
              </Typography>
            </Box>
            <Box className={classes.devicesContainer}>
              {lookupData?.DeviceTargets?.map((device: any) => {
                const isActive = isDeviceActive(device.Id);
                const IconComponent = getDeviceIcon(device.Name);
                
                return (
                  <Box
                    key={device.Id}
                    onClick={() => handleDeviceToggle(device.Id)}
                    className={clsx(
                      classes.deviceCard,
                      isActive
                        ? classes.deviceCardActive
                        : classes.deviceCardInactive
                    )}
                  >
                    <Checkbox
                      checked={isActive}
                      className={classes.checkboxTargeting}
                      disableRipple
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleDeviceToggle(device.Id)}
                      classes={{
                        root: classes.checkboxWrapper,
                      }}
                    />
                    <Box
                      className={clsx(
                        classes.iconWrapperTargeting,
                        isActive
                          ? classes.iconWrapperActive
                          : classes.iconWrapperInactive
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
                        classes.deviceLabel,
                      )}
                    >
                      {device.Name}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Targeting;