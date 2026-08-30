import React from 'react';
import { Typography, Tooltip, IconButton } from '@material-ui/core'
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { BsInfoCircleFill } from 'react-icons/bs';
import { useSelector } from 'react-redux';

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    maxWidth: 440,
    backgroundColor: '#000',
    // MUI v4 ships the tooltip label at pxToRem(10) (Tooltip.js:128) — 10px, and 9.5px effective
    // under index.css:11-15 (`body { zoom: 0.95 }` between 1024 and 1440px). That is below anything
    // readable for a notice whose whole job is to explain why an action the user just tried to press
    // is disabled. 13px keeps the tooltip a secondary surface while staying legible at that zoom.
    // lineHeight is set as a unitless number on purpose: MUI's default is `1.4em`, which is resolved
    // against the 10px it was written for and does NOT re-resolve against the size above it.
    fontSize: theme.typography.pxToRem(13),
    lineHeight: 1.45,
    padding: '6px 10px'
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

const CustomTooltip = ({ children, classes, text, title, placement = 'top', arrow = true, interactive = false, isSimpleTooltip = true, icon, style, textAlign = null, titleStyle = null, forceDirection = null, enterTouchDelay = null, leaveTouchDelay = null }) => {
  const { isRTL } = useSelector(state => state.core)
  return (isSimpleTooltip ?
    <BootstrapTooltip
      style={{ color: '#000', ...style }}
      title={text}
      placement={placement}
      {...(enterTouchDelay !== undefined && { enterTouchDelay })}
      {...(leaveTouchDelay !== undefined && { leaveTouchDelay })}
    >
      <IconButton aria-label={text}>
        {icon ? icon : <BsInfoCircleFill />}
      </IconButton>
    </BootstrapTooltip>

    : <HtmlTooltip
      interactive={interactive}
      arrow={arrow}
      placement={placement}
      {...(enterTouchDelay !== undefined && { enterTouchDelay })}
      {...(leaveTouchDelay !== undefined && { leaveTouchDelay })}
      style={{ ...style, maxWidth: '100%', textOverflow: 'ellipsis', overflow: 'hidden' }}
      title={
        <React.Fragment>
          {/* dir as an ATTRIBUTE, not just the `direction` style it used to carry alone. This span is
              display:inline by default, and CSS only honours `direction` on an inline box when
              `unicode-bidi` is embed/isolate/override — at the default `normal` the declaration is
              INERT (verified: computed direction rtl, unicode-bidi normal, and the run still laid out
              on the LTR base direction of the portal, which is what threw the Hebrew sentence's
              closing `».` to the wrong end). The HTML UA stylesheet gives any element with [dir] a
              `unicode-bidi: isolate`, so the attribute is what actually makes the run RTL. display
              block + a LOGICAL text-align then aligns the wrapped lines to the reading side; `start`
              rather than right/left so it follows dir and is never flipped. titleStyle still spreads
              last, so every existing caller can override any of this. */}
          <span dir={forceDirection ? forceDirection : isRTL ? 'rtl' : 'ltr'}
                style={{ direction: forceDirection ? forceDirection : isRTL ? 'rtl' : 'ltr', display: 'block', textAlign: textAlign || 'start', ...titleStyle }}>{title}</span>
        </React.Fragment>
      }
    >
      {children ? children : <Typography noWrap={false} className={classes.nameEllipsis}>{text}</Typography>}

    </HtmlTooltip>)
}

export default CustomTooltip;