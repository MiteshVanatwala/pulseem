import { Typography, Divider, Box } from "@material-ui/core";
import { ListIcon } from "../../assets/images/managment";
import clsx from "clsx";

interface TitleObject {
  classes: any;
  Text: string;
  ContainerStyle: object;
  Element: any;
}

export const Title = ({
  Text,
  classes,
  ContainerStyle,
  Element = null,
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
      <ListIcon className={classes.mr15} />
      <Typography className={classes.managementTitle}>{Text}</Typography>
      {Element}
    </Box>
  );
};
