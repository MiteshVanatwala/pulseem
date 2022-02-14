import { Box, Grid, makeStyles, Typography } from "@material-ui/core"
const useStyles = makeStyles((theme) => ({
    flexBox: {
        display: 'flex',
        flexDirection: theme.direction || 'row',
        justifyContent: 'center'
    },
    text: {
        wordBreak: 'break-word'
    }
}));

const FlexGrid = ({ gridArr = [],
    classes = { name: {}, value: {}, href: {} },
    variant = "subtitle2",
    align = "center",
    reverse,
    ...props
}) => {
    const localClasses = useStyles()
    return (
        <>
            <Box className={localClasses.flexBox}>
                {
                    gridArr.map((obj, idx) => {
                        return (
                            <>

                                <Box style={{ flexGrow: 1 }}>
                                    {reverse &&
                                        <Typography variant="body1" className={localClasses.text}>{obj.label}</Typography>
                                    }
                                    {obj.component}
                                    {!reverse &&
                                        <Typography variant="body1" className={localClasses.text}>{obj.label}</Typography>
                                    }
                                </Box>

                            </>
                        )
                    })
                }
            </Box>

        </>
    )
}

export default FlexGrid;