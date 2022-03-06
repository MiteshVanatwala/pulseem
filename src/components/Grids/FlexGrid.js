import { Box, Grid, makeStyles, Typography } from "@material-ui/core"
const useStyles = makeStyles({
    flexBox: {
        display: 'flex',
        flexDirection: (props) => props.direction || 'row',
        justifyContent: 'space-around',
        width: '100%',
        "@media screen and (max-width: 1160px)": {
            flexWrap: 'wrap'
        }
    },
    iconBox: {
        flexGrow: 1,
        maxWidth: 'min-content',
        cursor: 'pointer'
    }
});

const FlexGrid = ({ gridArr = [],
    classes = { text: {} },
    textVariant = "body1",
    alignText = "center",
    direction,
    reverse,
    ...props
}) => {
    const localClasses = useStyles({ direction: direction, textVariant: textVariant })
    return (
        <>
            <Box className={localClasses.flexBox}>
                {
                    gridArr.map((obj, idx) => {
                        return (
                            <Box className={localClasses.iconBox} key={idx}>
                                {reverse &&
                                    <Typography variant={textVariant} align={alignText} className={classes.text}>{obj.label}</Typography>
                                }
                                {obj.component}
                                {!reverse &&
                                    <Typography variant={textVariant} align={alignText} className={classes.text}>{obj.label}</Typography>
                                }
                            </Box>

                        )
                    })
                }
            </Box>

        </>
    )
}

export default FlexGrid;