import React from 'react';
import { Box, Typography } from '@material-ui/core';

// Placeholder for a chart component
const ChartComponent: React.FC<{ data: any, title: string }> = ({ data, title }) => (
    <Box>
        <Typography variant="h6">{title}</Typography>
        <Box height={200} display="flex" alignItems="center" justifyContent="center" bgcolor="#f0f0f0" borderRadius="8px" mt={1}>
            <Typography>Chart: {JSON.stringify(data)}</Typography>
        </Box>
    </Box>
);


interface InsightRendererProps {
  message: {
      type: 'text' | 'chart' | 'mixed';
      content?: string;
      chartData?: any;
      chartTitle?: string;
  }
}

const InsightRenderer: React.FC<InsightRendererProps> = ({ message }) => {
  switch (message.type) {
    case 'text':
      return <Typography variant="body1">{message.content}</Typography>;

    case 'chart':
      return <ChartComponent data={message.chartData} title={message.chartTitle || 'Chart'} />;

    case 'mixed':
        return (
            <Box>
                {message.content && <Typography variant="body1" style={{ marginBottom: '16px' }}>{message.content}</Typography>}
                {message.chartData && <ChartComponent data={message.chartData} title={message.chartTitle || 'Chart'} />}
            </Box>
        );

    default:
      return null;
  }
};

export default InsightRenderer;
