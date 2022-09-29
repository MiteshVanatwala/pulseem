import { Typography, Divider } from '@material-ui/core';

interface TitleObject {
    Classes: any;
    Text: string;
}

export const Title = ({ Text, Classes }: TitleObject) => {
    return (
        <>
            <Typography className={Classes}>
                {Text}
            </Typography>
            <Divider />
        </>
    )
}

