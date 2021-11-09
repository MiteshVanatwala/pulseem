import React from 'react';
import clsx from 'clsx';
import { Typography, Tooltip } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles';

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    maxWidth: 220
  },
}))(Tooltip);

const CustomTooltip = ({ classes, text, title, placement = 'top', arrow = true, interactive = false }) => {
  return (<HtmlTooltip
    interactive={interactive}
    arrow={arrow}
    placement={placement}
    classes={{
      tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
      arrow: classes.fBlack
    }}
    title={
      <React.Fragment>
        {title}
      </React.Fragment>
    }
  >
    <Typography noWrap={false} className={classes.nameEllipsis}>{text}</Typography>
  </HtmlTooltip>)
}

export default CustomTooltip;