import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { useSelector } from 'react-redux';
import { StateType } from '../../Models/StateTypes';
import { Box } from '@material-ui/core';

const PulseemPie = ({ data, onChartClick, colorPalette, gridSize }: any) => {
  const { isRTL, windowSize } = useSelector((state: StateType) => state.core);

  const widthSizes: any = { 12: 850, 6: 600, 3: 300, 4: 300 };
  const heightSizes: any = { 12: 280, 6: 280, 3: 280, 4: 280 };
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
          // outerRadius: 125,
          paddingAngle: 0.2,
          // cornerRadius: 5,
          highlightScope: { faded: 'global', highlighted: 'item' },
          faded: { innerRadius: 0.2, additionalRadius: -10, color: 'gray' },
        },
      ]}
      sx={{
        [`& .${pieArcLabelClasses.root}`]: {
          fill: 'white',
          fontWeight: 'bold',
        },
      }}
      width={windowSize !== 'sm' && windowSize !== 'xs' ? widthSizes[gridSize] : 250}
      height={heightSizes[gridSize]}
      margin={{
        top: 50,
        left: 50,
        right: 50
      }}
      onItemClick={onItemClick}
      slotProps={{
        legend: {
          direction: gridSize < 6 ? 'row' : 'column',
          position: { vertical: gridSize < 6 ? 'top' : 'middle', horizontal: gridSize < 6 ? 'middle' : isRTL ? 'right' : 'left' },
          markGap: gapSize[gridSize],
          itemMarkWidth: 15,
          itemMarkHeight: 15,
          itemGap: 10,
          padding: 0,
          labelStyle: {
            textAlign: 'center',
          }
        },
      }}
    />
  </Box>
}

export default PulseemPie;