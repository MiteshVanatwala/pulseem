import { Typography, Box } from "@material-ui/core";
import clsx from "clsx";

interface TitleObject {
  classes: any;
  Text: string;
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
      <Typography className={clsx(classes.managementTitle, "mgmtTitle")}>
        {Text}
      </Typography>
      {Element}
    </Box>
  );
};
