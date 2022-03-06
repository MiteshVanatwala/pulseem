import PropTypes from 'prop-types';
import clsx from "clsx";
import {
  Typography,
  TableRow,
  TableCell,
  Grid,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";



import { useTranslation } from "react-i18next";
import moment from "moment";
import "moment/locale/he";

import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import NameValueGridStructure from "../../../components/Grids/NameValueGridStructure";
import IconWrapper from "../../../components/icons/IconWrapper";
import FlexGrid from "../../../components/Grids/FlexGrid";


const RenderWebRow = ({
  row,
  classes,
  setDialog,
  handleSelected,
  dateFormat,
  rowStyle,
  cellStyle,
  selectedGroups = [],
  DialogType = {},
  noBorderCellStyle,
  colorTextStyle,
  setSelectedGroups
}) => {
  //TODO: Translation left, confirm keys
  const { t } = useTranslation();
  const {
    ActiveCell,
    ActiveEmails,
    GroupID,
    InvalidCell,
    InvalidEmails,
    RemovedCell,
    RemovedEmails,
    TotalRecipients,
    IsConnectedToWebForm,
    AutomationID,
    IsAutoResponder
  } = row;

  const renderNameCell = (row, fullwidth) => {
    let date = null;
    const { GroupName } = row;
    let text = "";
    if (!row.UpdateDate) {
      date = moment(row.CreationDate, dateFormat);
      text = t("common.CreatedOn");
    } else {
      date = moment(row.UpdateDate, dateFormat);
      text = t("common.UpdatedOn");
    }

    return (
      <>
        <CustomTooltip
          isSimpleTooltip={false}
          interactive={true}
          classes={{
            tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
            arrow: classes.fBlack,
          }}
          arrow={true}
          style={{ fontSize: 18, fontWeight: "bold" }}
          placement={"top"}
          title={<Typography noWrap={false}>{GroupName}</Typography>}
          text={GroupName}
        >
          {fullwidth ? (
            <Typography
              className={classes.nameEllipsis}
              style={{ maxWidth: "100%" }}
            >
              {GroupName}
            </Typography>
          ) : (
            <Typography className={classes.nameEllipsis}>
              {GroupName}
            </Typography>
          )}
        </CustomTooltip>
        <Typography className={classes.grayTextCell}>
          {`${text} ${date.format("DD/MM/YYYY")} ${date.format("LT")}`}
        </Typography>
      </>
    );
  };

  return (
    <TableRow key={Math.round(Math.random() * 999999999)} classes={rowStyle}>
      <TableCell classes={cellStyle} align="center" className={classes.flex2}>
        <Grid container direction="row">
          <Grid item sm={2}>
            <FormControlLabel
              label=""
              className={classes.ml0}
              control={
                <Checkbox
                  checked={selectedGroups?.indexOf(GroupID) !== -1}
                  // indeterminate={}
                  onClick={() => {
                    handleSelected(GroupID);
                  }}
                />
              }
            />
          </Grid>
          <Grid item sm={10}>
            {renderNameCell(row)}
          </Grid>
        </Grid>
      </TableCell>
      <TableCell classes={cellStyle} align="center" className={classes.flex2}>
        <NameValueGridStructure
          gridArr={[
            {
              name: t("campaigns.recipients"),
              value: TotalRecipients,
              classes: {
                name: colorTextStyle.blue,
                value: colorTextStyle.blue,
              },
            },
            {
              name: t("recipient.Active"),
              value: ActiveEmails,
              classes: {
                name: colorTextStyle.green,
                value: colorTextStyle.green,
              },
            },
            {
              name: t("recipient.Removed"),
              value: RemovedEmails,
              classes: {
                name: colorTextStyle.red,
                value: colorTextStyle.red,
              },
            },
            {
              name: t("recipient.Bounced"),
              value: InvalidEmails,
              classes: {
                name: colorTextStyle.red,
                value: colorTextStyle.red,
              },
            },
          ]}
          gridSize={{ xs: 12, sm: 12, md: 6, lg: 3 }}
          variant="body1"
          align="center"
        />
      </TableCell>
      <TableCell classes={cellStyle} align="center" className={classes.flex2}>
        <NameValueGridStructure
          gridArr={[
            {
              name: t("campaigns.recipients"),
              value: TotalRecipients,
              classes: {
                name: colorTextStyle.blue,
                value: colorTextStyle.blue,
              },
            },
            {
              name: t("recipient.Active"),
              value: ActiveCell,
              classes: {
                name: colorTextStyle.green,
                value: colorTextStyle.green,
              },
            },
            {
              name: t("recipient.Removed"),
              value: RemovedCell,
              classes: {
                name: colorTextStyle.red,
                value: colorTextStyle.red,
              },
            },
            {
              name: t("recipient.Bounced"),
              value: InvalidCell,
              classes: {
                name: colorTextStyle.red,
                value: colorTextStyle.red,
              },
            },
          ]}
          gridSize={{ xs: 12, sm: 12, md: 6, lg: 3 }}
          variant="body1"
          align="center"
        />
      </TableCell>
      <TableCell
        classes={noBorderCellStyle}
        align="center"
        className={classes.flex4}
      >
        <FlexGrid
          gridArr={[
            {
              label: t("recipient.preview"),
              component: (
                <IconWrapper iconName="preview" className={classes.mxAuto} />
              ),
              classes: { text: classes.wrapText },
            },
            {
              label: t("recipient.addRecipient"),
              component: (
                <IconWrapper
                  iconName="addRecipient"
                  className={classes.mxAuto}
                  onClick={() => {
                    setSelectedGroups(GroupID)
                    setDialog(DialogType.ADD_RECIPIENT)
                  }}
                />
              ),
              classes: { text: classes.wrapText },
            },
            {
              label: t("recipient.addRecipients"),
              component: (
                <IconWrapper
                  iconName="addRecipients"
                  className={classes.mxAuto}
                />
              ),
              classes: { text: classes.wrapText },
            },
            {
              label: t("recipient.reset"),
              component: (
                <IconWrapper iconName="reset" className={classes.mxAuto} />
              ),
              classes: { text: classes.wrapText },
            },
            {
              label: t("recipient.settings"),
              component: (
                <IconWrapper iconName="settings" className={classes.mxAuto} />
              ),
              classes: { text: classes.wrapText },
            },
            //TODO: Disable if !== null
            {
              label: t("recipient.automation"),
              component: (
                <IconWrapper iconName="automation" className={!AutomationID ? clsx(classes.mxAuto, classes.managmentIconDisable) : classes.mxAuto}
                  onClick={() => {
                    if (AutomationID)
                      window.open(`/Pulseem/CreateAutomations.aspx?AutomationID=${AutomationID}&fromreact=true`, '_blank');
                  }}
                />
              ),
              classes: { text: classes.wrapText },
            },
            //TODO: Disable if (IsConnectedToWebForm === true || IsConnectedToWebForm === true)
            {
              label: t("recipient.delete"),
              component: (
                <IconWrapper
                  iconName="delete"
                  className={IsConnectedToWebForm || IsAutoResponder ? clsx(classes.mxAuto, classes.managmentIconDisable) : classes.mxAuto}
                  onClick={() => {
                    if (!(IsConnectedToWebForm || IsAutoResponder)) {
                      setSelectedGroups(GroupID)
                      setDialog(DialogType.DELETE_GROUP)
                    }
                  }}
                />
              ),
              classes: { text: classes.wrapText },
            },
          ]}
          variant="body1"
          align="center"
        />
      </TableCell>
    </TableRow>
  );
};


RenderWebRow.propTypes = {
  row: PropTypes.object,
  classes: PropTypes.object,
  setDialog: PropTypes.object,
  handleSelected: PropTypes.func,
  dateFormat: PropTypes.string,
  rowStyle: PropTypes.object,
  cellStyle: PropTypes.object,
  selectedGroups: PropTypes.array,
  DialogType: PropTypes.object,
  noBorderCellStyle: PropTypes.object,
  colorTextStyle: PropTypes.object
}


export default RenderWebRow;
