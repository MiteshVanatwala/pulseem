import clsx from 'clsx';
import { Typography, Box } from '@material-ui/core'
import { useSelector } from 'react-redux';
import useCore from '../../helpers/hooks/Core';

// data = [{ title: "", value: "" }, ...]
const SummaryRow = ({
    data = [],
    showBorder = true,
    borderRadius = true
}) => {
    const { windowSize } = useSelector(state => state.core);
    const { classes } = useCore();
    if (data && data.length > 0) {
        return <Box style={{
            display: 'flex',
            flexDirection: windowSize !== 'xs' ? 'row' : 'column',
            border: showBorder ? '1px solid #ccc' : null,
            borderRadius: borderRadius ? 5 : null
        }}>
            {data.map((d, idx) => {
                const isLastCol = (idx === (data.length - 1));
                return <Box key={idx} className={clsx(classes.justifyCenterOfCenter)} style={{ height: '100%', borderInlineEnd: !isLastCol ? '1px solid #ccc' : null }}>
                    <Box className={clsx(classes.flexColCenter, classes.p5)} style={{ minWidth: 150 }}>
                        <Typography className={clsx(classes.colorBlue, classes.f20, classes.bold)} style={d.style}>{d.value}</Typography>
                        <Typography className={classes.f14}>{d.title}</Typography>
                    </Box>
                </Box>
            })}
        </Box>
    }
    return <></>
}

export default SummaryRow;