import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { useSelector } from 'react-redux';
import { StateType } from '../../Models/StateTypes';
import { Box } from '@material-ui/core';
import { ColorPalettesStyles } from '../../helpers/UI/ColorPalettes';

const PulseemPie = ({ data, onChartClick, colorPalette, gridSize = 12, selectedPalette }: any) => {
  const { isRTL, windowSize } = useSelector((state: StateType) => state.core);

  const widthSizes: any = { 12: (windowSize === 'xs' || windowSize === 'sm') ? 650 : 950, 6: 600, 3: 300, 4: 300 };
  const heightSizes: any = { 12: 320, 6: 320, 3: 320, 4: 320 };
  const gapSize: any = {
    12: isRTL ? -30 : 10,
    6: isRTL ? 10 : 10,
    3: isRTL ? 10 : 10,
    4: isRTL ? 10 : 10
  };

  const styles: any = {
    rtl: {
      margin: {
        top: 20,
        left: 400,
        right: 0,
        bottom: 20
      },
      labelStyle: {
        fontSize: 14,
        color: 'black',
        direction: 'rtl'
      },
      position: {
        horizontal: 'right',// | 'middle' | 'right',
        vertical: 'middle' // | 'middle' | 'top'
      },
      padding: { bottom: 0, left: 0, right: 150, top: 0 }
    },
    ltr: {
      margin: {
        top: 20,
        left: 400,
        right: 0,
        bottom: 20
      },
      labelStyle: {
        fontSize: 14,
        color: 'black',
        direction: 'ltr'
      },
      position: {
        horizontal: 'left',// | 'middle' | 'right',
        vertical: 'middle' // | 'middle' | 'top'
      },
      padding: { bottom: 0, left: 150, right: 0, top: 0 }
    },

  }

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
          ...ColorPalettesStyles[selectedPalette],
          fontWeight: '700',
          fontSize: 12
        }
      }}
      width={windowSize !== 'sm' && windowSize !== 'xs' ? widthSizes[gridSize] : 250}
      height={heightSizes[gridSize]}
      margin={{
        top: styles[isRTL ? 'rtl' : 'ltr'].margin.top,
        left: styles[isRTL ? 'rtl' : 'ltr'].margin.left,
        right: styles[isRTL ? 'rtl' : 'ltr'].margin.right,
        bottom: styles[isRTL ? 'rtl' : 'ltr'].margin.bottom
      }}
      onItemClick={onItemClick}
      slotProps={{
        legend: {
          // onItemClick: (e: any) => { console.log(e) },
          padding: styles[isRTL ? 'rtl' : 'ltr'].padding,
          position: styles[isRTL ? 'rtl' : 'ltr'].position,
          direction: 'column',
          markGap: gapSize[gridSize],
          itemMarkWidth: 15,
          itemMarkHeight: 15,
          itemGap: 5,
          labelStyle: styles[isRTL ? 'rtl' : 'ltr'].labelStyle
        },
      }}
    />
  </Box>
}

export default PulseemPie;