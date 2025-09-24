import React from 'react';
import { Box, Typography, Paper } from '@material-ui/core';

interface StatCardProps {
    title: string;
    value: string;
    change?: string;
    classes: Record<string, string>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, classes }) => {
    return (
        <Paper className={classes.statCard} variant="outlined">
            <Box p={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" component="p" style={{ fontWeight: 600 }}>
                    {value}
                </Typography>
                {change && (
                    <Typography variant="caption" color="textSecondary">
                        {change}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default StatCard;