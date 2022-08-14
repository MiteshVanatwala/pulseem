import { Box, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from 'clsx';

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

const Title = ({ classes, title, tooltip = null, stepNumber, subTitle, topZero = false }) => {
    const styles = useStyles();
    return (<Box>
        <Box className={classes.infoDiv} style={{ height: 'auto' }}>
            <Typography className={clsx(classes.managementTitle, topZero ? classes.noPadding : null, topZero ? classes.noMargin : null)}>
                {title}
            </Typography>
            {tooltip && <Tooltip
                style={{ marginTop: topZero ? 5 : 20, marginRight: 10, marginLeft: 10 }}
                disableFocusListener
                title={tooltip}
                classes={{ tooltip: styles.customWidth }}
                sx={{ justifyContent: 'center' }}
            >
                <Typography className={classes.bodyInfo}>i</Typography>
            </Tooltip>
            }
        </Box>
        <Box className={classes.headDiv}>
            {stepNumber && <Typography className={classes.headNo}>{stepNumber}</Typography>}
            <Typography className={classes.contentHead}>
                {subTitle}
            </Typography>
        </Box>
    </Box>)
}

export default Title;