import { Typography, Box } from "@material-ui/core";
import { ListIcon } from "../../assets/images/managment";
import clsx from "clsx";
import useCore from "../../helpers/hooks/Core";

interface TitleObject {
  Text?: string;
  ContainerStyle?: object;
  Element?: any;
  isIcon?: boolean;
}

export const Title = ({
  Text,
  ContainerStyle,
  Element = null,
  isIcon = true,
}: TitleObject) => {
  const { classes } = useCore();
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
