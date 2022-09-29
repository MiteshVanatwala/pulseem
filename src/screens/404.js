import { Grid, Paper, Typography, Button, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { RenderHtml } from '../helpers/Utils/HtmlUtils';
import useRedirect from '../helpers/Routes/Redirect';
import DefaultScreen from './DefaultScreen';

const PageNotFound = ({ classes }) => {
    const { t } = useTranslation();
    const Redirect = useRedirect();
    return (
        <DefaultScreen
            currentPage='pageNotFound'
            classes={classes}
            containerClass={classes.management}>
            <Grid container className={clsx(classes.flex, classes.flexAlignCetner, classes.flexCenter)} style={{ minHeight: 'calc(100vh - 60px)' }}>
                <Grid item>
                    <Typography>
                        {RenderHtml(t('common.pageNotFound'))}
                    </Typography>
                    {/* <Button onClick={() => { Redirect({ url: '/react' }) }}>
                        Go back home
                    </Button> */}
                </Grid>
            </Grid>
        </DefaultScreen>
    )
}

export default PageNotFound;