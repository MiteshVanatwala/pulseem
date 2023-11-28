import { Box, Grid, makeStyles, Typography } from "@material-ui/core"
// import clsx from "clsx";

const useStyles = makeStyles({
    dataBox: {
        "@media screen and (max-width: 1160px)": {
            '& p': {
                fontSize: '1em'
            }
        }
    }
});

const NameValueGridStructure = ({ gridArr = [],
    gridSize = { xs: 12, sm: 6 },
    classes = { name: {}, value: {}, href: {} },
    variant = "subtitle2",
    align = "center",
    direction = "row",
    reverse,
    rootClass,
    ...props
}) => {

    const localClasses = useStyles();

    return (
        <>
            <Grid container direction={direction} className={rootClass}>
                {
                    gridArr.map((obj, idx) => {
                        return (
                            <Grid className={localClasses.dataBox} item xs={gridSize?.xs} sm={gridSize?.sm} md={gridSize?.md ?? ''} lg={gridSize?.lg ?? ''} key={idx}>
                                {reverse &&
                                    <Typography className={obj.classes?.name ?? classes?.name ?? ''} align={align} variant={variant}>
                                        {obj?.name}
                                    </Typography>
                                }
                                <Typography
                                    className={obj.classes?.value ?? classes?.value ?? ''}
                                    component='a'
                                    href={obj.classes.href ?? ''}
                                    target="_blank"
                                    align={align}
                                    variant={variant}
                                    style={{ cursor: obj.onClick ? 'pointer' : null }}
                                    onClick={obj.onClick ?? (() => null)}
                                >
                                    {obj?.value}&nbsp;
                                </Typography>
                                {
                                    obj.component ?
                                        <Box style={{ display: 'flex', justifyContent: 'center' }}>
                                            {obj.component}
                                        </Box> : ''
                                }
                                {!reverse &&
                                    <Typography
                                        className={obj.classes?.name ?? classes?.name ?? ''}
                                        component='a'
                                        href={obj.classes.href ?? ''}
                                        align={align}
                                        variant={variant}
                                        style={{ cursor: obj.onClick ? 'pointer' : null }}
                                        onClick={obj.onClick ?? (() => null)}>
                                        {obj?.name}
                                    </Typography>
                                }
                            </Grid>)
                    })
                }
            </Grid>

        </>
    )
}

export default NameValueGridStructure;