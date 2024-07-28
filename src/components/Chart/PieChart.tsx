import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { useSelector } from 'react-redux';
import { StateType } from '../../Models/StateTypes';
import { Box } from '@material-ui/core';

const PulseemPie = ({ data, onChartClick, colorPalette }: any) => {
  const { isRTL, windowSize } = useSelector((state: StateType) => state.core);

  const onItemClick = (
    event: any, // The mouse event.
    params: any, // An object that identifies the clicked element.
  ) => {
    onChartClick && onChartClick(params);
  };

  return <Box>
    <PieChart
      colors={colorPalette}
      series={[
        {
          arcLabel: (item) => `${item.percentage}`,
          arcLabelMinAngle: 20,
          data: data,
          innerRadius: 5,
          outerRadius: 125,
          paddingAngle: 0.2,
          cornerRadius: 2,
          highlightScope: { faded: 'global', highlighted: 'item' },
          faded: { innerRadius: 15, additionalRadius: -10, color: 'gray' },
        },
      ]}
      sx={{
        [`& .${pieArcLabelClasses.root}`]: {
          fill: 'white',
          fontWeight: 'bold',
        },
      }}
      width={windowSize !== 'sm' && windowSize !== 'xs' ? 450 : 250}
      height={280}
      onItemClick={onItemClick}
      slotProps={{
        legend: {
          direction: 'column',
          position: { vertical: 'middle', horizontal: 'right' },
          markGap: isRTL ? 55 : 10,
          labelStyle: {
            marginBlockEnd: 20,
            marginBlockStart: 20,
            // width: 0,
            textAlign: isRTL ? 'right' : 'left',
            direction: isRTL ? 'rtl' : 'ltr',
            paddingBlockStart: 50,
          }
        },
      }}
    />
  </Box>
}

export default PulseemPie;