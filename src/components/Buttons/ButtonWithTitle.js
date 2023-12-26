import { Button, Grid, Typography } from '@material-ui/core';
import clsx from 'clsx';
import useRedirect from '../../helpers/Routes/Redirect';

const ButtonWithTitle = ({ classes, title, buttonText, redirect, innerStyle, buttonClass }) => {
    const Redirect = useRedirect();
    return <Grid container className={clsx(classes.fullSize)}>
        <Grid item lg={12} className={clsx(classes.justifyCenterOfCenter, classes.flexColumn, classes.spaceEvenly)} style={innerStyle}>
            <Typography className={clsx(classes.dInline, classes.ml5, classes.mr5, classes.tabTitle, classes.bold, classes.mb15)}>
                {title}
            </Typography>
            <Button
                className={clsx(
                    buttonClass ? buttonClass : '',
                    classes.backButton,
                    classes.btn,
                    classes.btnRounded
                )}
                color="primary"
                style={{ margin: '8px' }}
                onClick={() => Redirect({ url: redirect })}
            >
                {buttonText}
            </Button>
        </Grid>
    </Grid >
}

export default ButtonWithTitle;