import { Box, Grid, makeStyles, Typography } from "@material-ui/core"

const useStyles = makeStyles({
    contentBox: {
        "@media screen and (max-width: 768px)": {
            '& p': {
                fontSize: '.9rem'
            }
        }
    }
});

const SimpleGrid = ({ gridArr = [],
    classes,
    direction = "row",
    ...props
}) => {

    const localClasses = useStyles();

    return (
        <>
            <Grid container direction={direction} spacing={2}>
                {
                    gridArr.map((obj, idx) => {
                        return (
                            <Grid className={localClasses.contentBox} item xs={obj.gridSize?.xs ?? 12} sm={obj.gridSize?.sm ?? 6}>
                                {obj.content}
                            </Grid>
                        )
                    })
                }
            </Grid>

        </>
    )
}

export default SimpleGrid;