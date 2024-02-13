import { TextField, Typography } from '@material-ui/core';
import { Stack } from '@mui/material'

const LabeledTextField = ({
    containerProps = {},
    labelProps = {},
    textFieldProps = {}
}) => {
    const { label, ...restLabelProps } = labelProps;
    return (
        <Stack
            {...containerProps}
        >
            <Typography {...restLabelProps}>
                {label}
            </Typography>
            <TextField variant="outlined" {...textFieldProps} />
        </Stack>
    )
}

export default LabeledTextField