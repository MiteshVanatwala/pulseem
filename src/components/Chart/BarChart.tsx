import { BarChart, barLabelClasses } from '@mui/x-charts/BarChart';
import { useSelector } from 'react-redux';
import { StateType } from '../../Models/StateTypes';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { ColorPalettesStyles } from '../../helpers/UI/ColorPalettes';

const PulseemBarChart = ({ data, onChartClick, yAxis, title, colors, labels, gridSize = 12, selectedPalette }: any) => {
  const { isRTL, windowSize } = useSelector((state: StateType) => state.core);
  const { t } = useTranslation();

  const widthSizes: any = { 12: windowSize === 'xl' ? 1080 : 850, 6: 600, 3: 300, 4: 400 };
  const heightSizes: any = { 12: 320, 6: 320, 3: 320, 4: 320 };

  const chartSetting = {
    xAxis: [
      {
        title,
        colorMap: {
          type: 'ordinal',
          colors
        },
        tickSize: 5,
        tickNumber: 5,
        tickMinStep: 0,
        tickMaxStep: 5,
        barGapRatio: 0.1,
        tickPlacement: 'middle',
        tickLabelPlacement: 'middle',
        tickFontSize: 12,
        labelTickFontSize: 6
      },
    ],
    width: windowSize !== 'sm' && windowSize !== 'xs' ? widthSizes[gridSize] : 250,
    height: heightSizes[gridSize],
  };

  // const onItemClick = (
  //   event: any, // The mouse event.
  //   params: any, // An object that identifies the clicked element.
  // ) => {
  //   onChartClick && onChartClick(params);
  // };

  const valueFormatter = (value: number | null) => RenderHtml(`<p style='direction: ${isRTL ? 'rtl' : 'ltr'}'>${value === 1 ? t('landingPages.survey.userAnswered') : `${value} ${t('landingPages.survey.usersAnswered')}`}</p>`);

  return <Box>
    <BarChart
      grid={{ vertical: true }}
      dataset={data}
      yAxis={yAxis}
      //@ts-ignore
      series={[{ dataKey: 'answer', valueFormatter }]}
      layout="horizontal"
      margin={{ left: gridSize === 1 ? 400 : 250 }}
      barLabel={(item, context) => {
        //@ts-ignore
        return item?.value > 0 ? `${item.value} (${data.filter((e: any) => e.answer === item.value)[0]?.percentage})` : '';
      }}
      sx={{
        [`& .${barLabelClasses.root}`]: {
          ...ColorPalettesStyles[selectedPalette],
          fontWeight: '700 !important',
          fontSize: 12,
          border: '2px solid red  !important'
        }
      }}
      {...chartSetting}
    />
  </Box>
}

export default PulseemBarChart;