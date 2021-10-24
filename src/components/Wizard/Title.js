import { Box, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    customWidth: {
        maxWidth: 200,
        backgroundColor: "black",
        fontSize: "14px",
        textAlign: 'center'
    },
    noMaxWidth: {
        maxWidth: "none",
    },
}));

const Title = ({ classes, title, tooltip = null, stepNumber, subTitle }) => {
    const styles = useStyles();
    return (<Box>
        <Box className={classes.infoDiv} style={{ height: 'auto' }}>
            <Typography className={classes.managementTitle}>
                {title}
            </Typography>
            {tooltip && <Tooltip
                disableFocusListener
                title={tooltip}
                classes={{ tooltip: styles.customWidth }}
                sx={{ justifyContent: 'center' }}
            >
                <Typography className={classes.bodyInfo} style={{ marginTop: "6px" }}>i</Typography>
            </Tooltip>}
        </Box>
        <Box className={classes.headDiv}>
            <Typography className={classes.headNo}>{stepNumber}</Typography>
            <Typography className={classes.contentHead}>
                {subTitle}
            </Typography>
        </Box>
    </Box>)
}

export default Title;