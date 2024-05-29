import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { useSelector } from 'react-redux';
import { StateType } from '../../Models/StateTypes';
import { Box } from '@material-ui/core';

const PulseemPie = ({ data, onChartClick, colorPalette }: any) => {
  const { isRTL } = useSelector((state: StateType) => state.core);

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
          arcLabel: (item) => `${item.value}`,
          arcLabelMinAngle: 45,
          data: data,
          innerRadius: 15,
          outerRadius: 75,
          paddingAngle: 5,
          cornerRadius: 5,
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
      width={500}
      height={300}
      onItemClick={onItemClick}
      // margin={{ top: 50, bottom: 10, left: 10, right: 100 }}
      slotProps={{
        legend: {
          direction: 'column',
          position: { vertical: 'middle', horizontal: 'right' },
          // itemGap: 15,
          markGap: isRTL ? 55 : 10,
          labelStyle: {
            marginBlockEnd: 20,
            marginBlockStart: 20,
            width: 0,
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