import { Typography, Divider, Box } from "@material-ui/core";
import clsx from "clsx";

interface TitleObject {
    Classes: any;
    Text: string;
    ContainerStyle?: any;
    Element?: any;
    ShowDivider?: boolean;
}

export const Title = ({
    Text,
    Classes,
    ContainerStyle = null,
    Element = null,
    ShowDivider
}: TitleObject) => {
    return (
        <>
            <Box
                style={ContainerStyle}
                className={clsx(
                    Classes?.flex,
                    Classes?.alignItemsCenter,
                    Classes?.mgmtTitleContainer
                )}
            >
                <Typography className={clsx(Classes?.managementTitle, "mgmtTitle")}>
                    {Text}
                </Typography>
                {Element}
            </Box>
            {ShowDivider && <Divider />}
        </>
    );
};