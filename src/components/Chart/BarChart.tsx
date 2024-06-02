import { BarChart } from '@mui/x-charts/BarChart';
import { useSelector } from 'react-redux';
import { StateType } from '../../Models/StateTypes';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';

const PulseemBarChart = ({ data, onChartClick, yAxis, title, colors, labels }: any) => {
  const { isRTL, windowSize } = useSelector((state: StateType) => state.core);
  const { t } = useTranslation();

  const chartSetting = {
    xAxis: [
      {
        title,
        colorMap: {
          type: 'ordinal',
          colors
        },
        tickSize: 1,
        tickNumber: 2,
        tickMinStep: 1,
        tickMaxStep: 10,
        barGapRatio: 0.1,
        tickPlacement: 'middle',
      },
    ],
    width: windowSize !== 'sm' && windowSize !== 'xs' ? 450 : 250,
    height: 280,
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
      barLabel="value"
      {...chartSetting}
    />
  </Box>
}

export default PulseemBarChart;