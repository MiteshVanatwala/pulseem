import React, { FC, ReactNode } from "react";
import {
  Card,
  CardContent,
  Typography,
  Switch,
  Box,
  Avatar,
  Divider,
} from "@material-ui/core";

interface TriggerCardProps {
  title: string;
  description: string;
  footer: string;
  icon: ReactNode;
  enabled: boolean;
  onToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
  classes: any;
}

const TriggerCard: FC<TriggerCardProps> = ({
  title,
  description,
  footer,
  icon,
  enabled,
  onToggle,
  children,
  classes,
}) => {
  return (
    <Card className={`${classes.cardPopupTrigger} ${enabled ? classes.activeCardPopupTrigger : ""}`}>
      <Box className={classes.cardHeaderPopupTrigger}>
        <Box className={classes.cardTitleContainerPopupTrigger}>
          <Avatar className={classes.avatarPopupTrigger}>{icon}</Avatar>
          <Box display="flex" flexDirection="column">
            <Typography variant="body1" className={classes.managementTitle}>
              {title}
            </Typography>
            <Typography variant="body1" className={classes.cardDescriptionPopupTrigger}>{description}</Typography>
          </Box>
        </Box>
        <Switch checked={enabled} onChange={onToggle} color="primary" />
      </Box>
      <Divider variant="middle" />
      <CardContent className={classes.cardContentPopupTrigger}>
        {children}
        <Box>
          <Typography variant="body1" className={classes.cardFooterPopupTrigger}>{footer}</Typography></Box>
      </CardContent>
    </Card>
  );
};

export default TriggerCard;
