import { Box, Grid, Typography } from "@material-ui/core"

const NameValueGridStructure = ({ gridArr = [],
    gridSize = { xs: 12, sm: 6 },
    classes = { name: {}, value: {}, href: {} },
    variant = "subtitle2",
    align = "center",
    direction = "row",
    reverse,
    ...props
}) => {

    return (
        <>
            <Grid container direction={direction} >
                {
                    gridArr.map((obj, idx) => {
                        return (
                            <Grid item xs={gridSize?.xs} sm={gridSize?.sm} md={gridSize?.md ?? ''} lg={gridSize?.lg ?? ''} key={idx}>
                                {reverse &&
                                    <Typography className={obj.classes?.name ?? classes?.name ?? ''} align={align} variant={variant}>
                                        {obj?.name}
                                    </Typography>
                                }
                                <Typography component={classes.href && classes.value > 0 ? 'a' : 'p'}
                                    className={obj.classes?.value ?? classes?.value ?? ''}
                                    href={classes.href ?? ''}
                                    target="_blank"
                                    align={align}
                                    variant={variant}>
                                    {obj?.value}
                                </Typography>
                                {
                                    obj.component ?
                                        <Box style={{ display: 'flex', justifyContent: 'center' }}>
                                            {obj.component}
                                        </Box> : ''
                                }
                                {!reverse &&
                                    <Typography className={obj.classes?.name ?? classes?.name ?? ''} align={align} variant={variant}>
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