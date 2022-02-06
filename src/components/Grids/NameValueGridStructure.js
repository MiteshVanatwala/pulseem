import { Grid, Typography } from "@material-ui/core"

const NameValueGridStructure = ({ gridArr = [], gridSize = { xs: 12, sm: 6 }, classes = { name: {}, value: {} }, variant = "subtitle2", align = "center", reverse, ...props }) => {

    return (
        <>
            <Grid container direction="row" >
                {
                    gridArr.map((obj, idx) => {
                        return (
                            <Grid item xs={gridSize?.xs} sm={gridSize?.sm} md={gridSize?.md ?? ''} lg={gridSize?.lg ?? ''} key={idx}>
                                {reverse &&
                                    <Typography className={obj.classes?.name ?? classes?.name ?? ''} align={align} variant={variant}>
                                        {obj?.name ?? "-"}
                                    </Typography>
                                }
                                <Typography className={obj.classes?.value ?? classes?.value ?? ''} align={align} variant={variant}>
                                    {obj?.value ?? "-"}
                                </Typography>
                                {!reverse &&
                                    <Typography className={obj.classes?.name ?? classes?.name ?? ''} align={align} variant={variant}>
                                        {obj?.name ?? "-"}
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