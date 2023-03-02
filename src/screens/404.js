import { Grid, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { RenderHtml } from '../helpers/Utils/HtmlUtils';
import DefaultScreen from './DefaultScreen';
import useCore from '../helpers/hooks/Core';

const PageNotFound = () => {
    const { t } = useTranslation();
    const { classes } = useCore();
    return (
        <DefaultScreen
            currentPage='pageNotFound'
            containerClass={classes.management}>
            <Grid container className={clsx(classes.flex, classes.flexAlignCetner, classes.flexCenter)} style={{ minHeight: 'calc(100vh - 60px)' }}>
                <Grid item>
                    <Typography>
                        {RenderHtml(t('common.pageNotFound'))}
                    </Typography>
                </Grid>
            </Grid>
        </DefaultScreen>
    )
}

export default PageNotFound;