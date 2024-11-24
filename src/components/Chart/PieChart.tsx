import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { useSelector } from 'react-redux';
import { StateType } from '../../Models/StateTypes';
import { Box } from '@material-ui/core';

const PulseemPie = ({ data, onChartClick, colorPalette, gridSize = 12 }: any) => {
  const { isRTL, windowSize } = useSelector((state: StateType) => state.core);

  const widthSizes: any = { 12: windowSize === 'xl' ? 950 : 650, 6: 600, 3: 300, 4: 300 };
  const heightSizes: any = { 12: 320, 6: 320, 3: 320, 4: 320 };
  const gapSize: any = {
    12: isRTL ? 10 : 10,
    6: isRTL ? 10 : 10,
    3: isRTL ? 10 : 10,
    4: isRTL ? 10 : 10
  };

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
          arcLabel: (item: any) => `${item.percentage}`,
          arcLabelMinAngle: 20,
          data: data,
          innerRadius: 5,
          outerRadius: 125,
          paddingAngle: 0.5,
          color: 'black',
          // cornerRadius: 5,
          highlightScope: { faded: 'global', highlighted: 'item' },
          faded: { innerRadius: 0.2, additionalRadius: 5, color: 'black' },
        },
      ]}
      sx={{
        [`& .${pieArcLabelClasses.root}`]: {
          fill: 'white',
          fontWeight: '400',
          fontSize: 12
        },
      }}
      width={windowSize !== 'sm' && windowSize !== 'xs' ? widthSizes[gridSize] : 250}
      height={heightSizes[gridSize]}
      margin={{
        top: 20,
        left: 50,
        right: 50,
        bottom: 20
      }}
      onItemClick={onItemClick}
      slotProps={{
        legend: {
          direction: 'column',
          position: { vertical: 'middle', horizontal: 'left' },
          markGap: gapSize[gridSize],
          itemMarkWidth: 15,
          itemMarkHeight: 15,
          itemGap: 5,
          padding: 0,
          labelStyle: {
            fontSize: 14,
            color: 'black',
            direction: 'ltr'
          }
        },
      }}
    />
  </Box>
}

export default PulseemPie;