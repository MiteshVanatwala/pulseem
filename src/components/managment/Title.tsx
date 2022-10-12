import { Typography, Divider, Box } from '@material-ui/core';

interface TitleObject {
    Classes: any;
    Text: string;
    ContainerStyle: object,
    Element: any;
}

export const Title = ({ Text, Classes, ContainerStyle, Element = null }: TitleObject) => {
    return (
        <>
            <Box style={ContainerStyle}>
                <Typography className={Classes}>
                    {Text}
                </Typography>
                {Element}
            </Box>
            <Divider />
        </>
    )
}

