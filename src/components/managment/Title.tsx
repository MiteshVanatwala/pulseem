import { Typography, Box } from "@material-ui/core";
import { ListIcon } from "../../assets/images/managment";
import clsx from "clsx";

interface TitleObject {
  classes: any;
  Text?: string;
  ContainerStyle?: object;
  Element?: any;
  isIcon?: boolean;
  subTitle?: any;
}

export const Title = ({
  Text,
  classes,
  ContainerStyle,
  Element = null,
  isIcon = true,
  subTitle
}: TitleObject) => {
  return (
    <Box
      className={clsx(
        classes.flex,
        classes.alignItemsCenter,
        classes.mgmtTitleContainer
      )}
      style={ContainerStyle}
    >
      <Box className={Element ? '' : clsx(classes.flex, classes.alignItemsCenter)}>
        {isIcon && <ListIcon className={clsx(classes.marginInlineEnd15, classes.marginInlineStart5)} />}
        {Text && (
          <Typography className={clsx(classes.managementTitle, "mgmtTitle")}>
            {Text}
          </Typography>
        )}
      </Box>
      {Element && (
        <Box className={clsx(classes.managementTitle, "mgmtTitle")}>
          {Element}
        </Box>
      )}
      {subTitle && subTitle !== '' && <div className={classes.alignItemsCenter}>
        {subTitle}
      </div>}
    </Box>
  );
};
