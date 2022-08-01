import { Box, Grid, makeStyles, Typography } from "@material-ui/core"
const useStyles = makeStyles({
    flexBox: {
        display: 'flex',
        flexDirection: (props) => props.direction || 'row',
        justifyContent: 'space-around',
        width: '100%',
        "@media screen and (max-width: 1320px)": {
            flexWrap: 'wrap',
            justifyContent: 'right',
            marginInline: 5
        }
    },
    iconBox: {
        flexGrow: 1,
        maxWidth: 'max-content',
        marginInline: 2,
        "@media screen and (max-width: 1320px)": {
            marginInline: 5,
            marginBottom: 3,
            minWidth: 55,
            // '& img': {
            //     width: '80%'
            // },
            '& p': {
                fontSize: '1em'
            }
        }
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
            <Box className={localClasses.flexBox} style={props.customStyle}>
                {
                    gridArr.map((obj, idx) => {
                        return (
                            <Box className={localClasses.iconBox} key={idx} onClick={() => obj.onClick?.()} style={{ cursor: obj.isDisabled ? 'not-allowed' : 'pointer' }}>
                                {reverse &&
                                    <Typography variant={textVariant} align={alignText} className={obj.classes.text}>{obj.label}</Typography>
                                }
                                {obj.component}
                                {!reverse &&
                                    <Typography variant={textVariant} align={alignText} className={obj.classes.text}>{obj.label}</Typography>
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