import React from 'react';
import clsx from 'clsx';
import { Typography, Tooltip, IconButton } from '@material-ui/core'
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { BsInfoCircleFill } from 'react-icons/bs';
import { useSelector } from 'react-redux';

const HtmlTooltip = withStyles(({ style }) => ({
  tooltip: {
    maxWidth: 220,
    backgroundColor: '#000',
    ...style
  },
  arrow: {
    color: '#000'
  }
}))(Tooltip);

const useStylesBootstrap = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: props => props.style.fontSize
  },
}));
function BootstrapTooltip(props) {
  const classes = useStylesBootstrap(props);

  return <Tooltip arrow classes={classes} {...props} disableFocusListener />;
}

const CustomTooltip = ({ children, classes, text, title, placement = 'top', arrow = true, interactive = false, isSimpleTooltip = true, icon, style, textAlign = null }) => {
  const { isRTL } = useSelector(state => state.core)
  return (isSimpleTooltip ?
    <BootstrapTooltip
      style={{ color: '#000', ...style }}
      title={text}
      placement={"top"}>
      <IconButton aria-label={text}>
        {icon ? icon : <BsInfoCircleFill />}
      </IconButton>
    </BootstrapTooltip>

    : <HtmlTooltip
      interactive={interactive}
      arrow={arrow}
      placement={placement}
      style={{ ...style }}
      title={
        <React.Fragment>
          <span style={{ direction: isRTL ? 'rtl' : 'ltr', textAlign: textAlign }}>{title}</span>
        </React.Fragment>
      }
    >
      {children ? children : <Typography noWrap={false} className={classes.nameEllipsis}>{text}</Typography>}

    </HtmlTooltip>)
}

export default CustomTooltip;