import { Grid, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { RenderHtml } from '../helpers/Utils/HtmlUtils';
import DefaultScreen from './DefaultScreen';

const PageNotFound = ({ classes }) => {
    const { t } = useTranslation();
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
                </Grid>
            </Grid>
        </DefaultScreen>
    )
}

export default PageNotFound;