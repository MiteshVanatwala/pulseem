import { Typography, Divider, Box } from "@material-ui/core";
import { ListIcon } from "../../assets/images/managment";
import clsx from "clsx";

interface TitleObject {
  classes: any;
  Text?: string;
  ContainerStyle?: object;
  Element?: any;
  isIcon?: boolean;
}

export const Title = ({
  Text,
  classes,
  ContainerStyle,
  Element = null,
  isIcon = true,
}: TitleObject) => {
  return (
    <Box
      style={ContainerStyle}
      className={clsx(
        classes.flex,
        classes.alignItemsCenter,
        classes.mgmtTitleContainer
      )}
    >
      {isIcon && <ListIcon className={classes.mr15} />}
      {Text && (
        <Typography className={clsx(classes.managementTitle, "mgmtTitle")}>
          {Text}
        </Typography>
      )}
      {Element && (
        <Box className={clsx(classes.managementTitle, "mgmtTitle")}>
          {Element}
        </Box>
      )}
    </Box>
  );
};
