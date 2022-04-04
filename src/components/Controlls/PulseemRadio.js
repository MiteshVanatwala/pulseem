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
    onChange = () => null,
    value,
    radioOptions
}) => {
    return (
        <FormControl component="fieldset" className={classes.fullWidth}>
            <RadioGroup
                aria-label={name}
                name={name}
                onChange={onChange}
                value={value}
            >
                {radioOptions.map((radio, idx) => {
                    return <><FormControlLabel
                        key={idx}
                        value={radio.value}
                        control={<Radio color="primary"
                            className={radio.classes}
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
                    </>
                })}
            </RadioGroup>
        </FormControl>
    );
}

export default PulseemRadio;