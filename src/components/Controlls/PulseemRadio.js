import {
    Box,
    Radio,
    RadioGroup,
    FormControl,
    FormControlLabel,

} from "@material-ui/core";


const PulseemRadio = ({
    classes,
    name,
    onChange,
    value,
    radioOptions,
    isVerical
}) => {
    return (
        <FormControl component="fieldset" className={classes.fullWidth} key="123">
            <RadioGroup
                style={{ flexDirection: isVerical ? 'row' : 'column', flexWrap: isVerical ? 'nowrap' : 'wrap' }}
                aria-label={name}
                name={name}
                onChange={onChange}
                value={value}
            >
                {radioOptions.map((radio, idx) => {
                    return <Box key={`'c_${idx}`}>
                        <FormControlLabel
                            value={radio.value}
                            control={<Radio color="primary"
                                key={`'radio_${idx}`}
                                className={radio.className}
                                checked={radio.value.toString() === value.toString()}
                            />}
                            label={
                                <span className={classes.radioText}>
                                    {radio.label}
                                </span>
                            }
                        />
                        <Box className={value !== radio.value ? classes.disabled : null}>
                            {radio.child}
                        </Box>
                    </Box>
                })}
            </RadioGroup>
        </FormControl>
    );
}

export default PulseemRadio;