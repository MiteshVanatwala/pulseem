import { Button, Grid, Typography } from '@material-ui/core';
import clsx from 'clsx';

const ButtonWithTitle = ({ classes, title, buttonText, redirect, innerStyle, buttonClass }) => {
    return <Grid container className={clsx(classes.fullSize)}>
        <Grid item lg={12} className={clsx(classes.justifyCenterOfCenter, classes.flexColumn, classes.spaceEvenly)} style={innerStyle}>
            <Typography className={clsx(classes.dInline, classes.ml5, classes.mr5, classes.tabTitle, classes.bold)}>
                {title}
            </Typography>
            <Button
                variant='contained'
                size='medium'
                className={clsx(
                    classes.actionButton,
                    buttonClass ? buttonClass : classes.actionButtonLightGreen,
                    classes.backButton,
                )}
                color="primary"
                style={{ margin: '8px' }}
                onClick={() => window.location = redirect}
            >
                {buttonText}
            </Button>
        </Grid>
    </Grid >
}

export default ButtonWithTitle;