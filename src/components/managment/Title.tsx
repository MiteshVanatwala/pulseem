import { Typography, Divider, Box } from '@material-ui/core';

export interface TitleObject {
    Classes: any;
    Text: string;
    ContainerStyle: object | null,
    Element: any | null;
}

export const Title = ({ Text, Classes, ContainerStyle = null, Element = null }: TitleObject) => {
    return (
        <>
            <Box style={{...ContainerStyle}}>
                <Typography className={Classes}>
                    {Text}
                </Typography>
                {Element}
            </Box>
            <Divider />
        </>
    )
}

