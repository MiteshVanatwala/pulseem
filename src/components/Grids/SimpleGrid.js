import { Grid, makeStyles } from "@material-ui/core"
import clsx from "clsx";

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
    spacing = 1,
    className = '',
    ...props
}) => {

    const localClasses = useStyles();

    return (
        <>
            <Grid container direction={direction} spacing={spacing}>
                {
                    gridArr.map((obj, idx) => {
                        return (
                            <Grid className={clsx(className, localClasses.contentBox)}
                                key={idx}
                                item
                                xs={obj.gridSize?.xs ?? 12}
                                sm={obj.gridSize?.sm ?? 6}
                            >
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