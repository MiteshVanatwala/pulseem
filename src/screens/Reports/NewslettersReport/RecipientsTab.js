import React, { useState } from "react";
import {
  Button,
  Grid,
  Box,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableCell,
  TableRow,
  IconButton,
  TableBody,
  InputAdornment,
  Input,
  Checkbox,
  MenuItem,
} from "@material-ui/core";

import { setRowsPerPage } from "../../../redux/reducers/coreSlice";
import { useSelector, useDispatch } from "react-redux";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import {
  TablePagination,
  ManagmentIcon,
} from "../../../components/managment/index";
import {
  SearchIcon,
  EditIcon,
  GroupsIcon,
} from "../../../assets/images/managment/index";
import clsx from "clsx";
import { IoIosArrowDown } from "react-icons/io";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    width: "180px",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
    padding: "5px",
  },
}));

const RecipientsTab = ({ classes }) => {
  const cellStyle = {
    head: classes.tableCellHead,
    body: classes.tableCellBody,
    root: classes.tableCellRoot,
  };
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
  const cellBodyStyle = { root: clsx(classes.tableCellRoot) };

  const styles = useStyles();

  const { windowSize, rowsPerPage, isRTL } = useSelector(
    (state) => state.core
  );

  const [selectintial, setselectintial] = useState("1");
  const rowsOptions = [6, 12, 18];
  const [page, setPage] = useState(1);
  const [isSearching, setSearching] = useState(false);
  const [SearchResults, setSearchResults] = useState(null);
  const [searchValue, setsearchValue] = useState("");
  const dispatch = useDispatch();
  const [SearchNewResults, setSearchNewResults] = useState(null);
  const [tableData, settableData] = useState([
    {
      email: "mohit.gupta@gmail.com",
      openingDate: "12.06.2020",
      name: "gabirel",
      openingTime: "20:00",
      openess: "1",
      clicks: "2",
      removals: "No",
      sms: "0522698875",
    },
    {
      email: "ido.shahar@gmail.com",
      openingDate: "12.06.2020",
      name: "gabirel",
      openingTime: "20:00",
      openess: "0",
      clicks: "2",
      removals: "No",
      sms: "0522698875",
    },
    {
      email: "gabriel.artiolo@gmail.com",
      name: "gabirel",
      openingDate: "12.06.2020",
      openingTime: "20:00",
      openess: "1",
      clicks: "0",
      removals: "No",
      sms: "0522698875",
    },
    {
      email: "evi.artiolo@gmail.com",
      name: "gabirel",
      openingDate: "12.06.2020",
      openingTime: "20:00",
      openess: "0",
      clicks: "0",
      removals: "No",
      sms: "0522698875",
    },
    {
      email: "ivi.artiolo@gmail.com",
      name: "gabirel",
      openingDate: "12.06.2020",
      openingTime: "20:00",
      openess: "1",
      clicks: "0",
      removals: "No",
      sms: "0522698875",
    },
    {
      email: "gabriel.artiolo@gmail.com",
      name: "gabirel",
      openingDate: "12.06.2020",
      openingTime: "20:00",
      openess: "1",
      clicks: "0",
      removals: "No",
      sms: "0522698875",
    },
    {
      email: "gabriel.artiolo@gmail.com",
      name: "gabirel",
      openingDate: "12.06.2020",
      openingTime: "20:00",
      openess: "1",
      clicks: "2",
      removals: "No",
      sms: "0522698875",
    },
  ]);

  const renderRecipients = () => {
    return (
      <div style={{ width: "200px" }}>
        <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
          <Select
            variant="standard"
            onChange={(e) => {
              handleChange(e);
            }}
            className={styles.selectEmpty}
            inputProps={{ "aria-label": "Without label" }}
            value={selectintial}
            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
            MenuProps={{
                PaperProps: {
                    style: {
                    maxHeight: 200,
                    direction: isRTL ? 'rtl' : 'ltr'
                    },
                },
            }}
          >
            <MenuItem value={1}>All Receipts in Campaign</MenuItem>
            <MenuItem value={2}>Openess</MenuItem>
            <MenuItem value={3}>Wrong</MenuItem>
            <MenuItem value={4}>Unique Clicks</MenuItem>
            <MenuItem value={5}>Removals</MenuItem>
          </Select>
        </FormControl>
      </div>
    );
  };
  const renderGroup = () => {
    const handleSearch = (e) => {
      setsearchValue(e.target.value);
      let sortData = {};
      if (selectintial !== "1") {
        sortData = SearchResults;
        sortData = sortData.filter((val) => {
          if (e.target.value === "") {
            return val;
          } else {
            if (
              val.email.toLowerCase().includes(e.target.value.toLowerCase())
            ) {
              return val;
            }
          }
        });
        setSearchNewResults(sortData);
        setSearching(true);
        setPage(1);
      } else {
        sortData = tableData;
        sortData = sortData.filter((val) => {
          if (e.target.value === "") {
            return val;
          } else {
            if (
              val.email.toLowerCase().includes(e.target.value.toLowerCase())
            ) {
              return val;
            }
          }
        });
        setSearchResults(sortData);
        setSearching(true);
        setPage(1);
      }
    };
    return (
      <Input
        classes={{
          underline: classes.phoneSearchBar,
        }}
        placeholder="Look for an email"
        endAdornment={
          <InputAdornment>
            <IconButton className={classes.phoneSearchBarIcon}>
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
        value={searchValue}
        onChange={(e) => {
          handleSearch(e);
        }}
      ></Input>
    );
  };
  const renderOperations = () => {
    return (
      <Grid container spacing={2} className={classes.linePadding}>
        {windowSize !== "xs" && (
          <Grid item>
            <Button
              variant="contained"
              size="small"
              className={clsx(
                classes.actionButton,
                classes.actionButtonLightGreen
              )}
            >
              Create a Group
            </Button>

            <Button
              variant="contained"
              size="small"
              className={clsx(
                classes.actionButton,
                classes.actionButtonLightBlue
              )}
            >
              Remove Calculator
            </Button>

            <Button
              variant="contained"
              size="small"
              className={clsx(
                classes.actionButton,
                classes.actionButtonLightBlue
              )}
            >
              Become Wrong
            </Button>
            <Button
              variant="contained"
              size="small"
              className={clsx(classes.actionButton, classes.actionButtonGreen)}
            >
              Export File
            </Button>
          </Grid>
        )}

        <Grid item className={classes.groupsLableContainer}>
          <Typography className={classes.groupsLable}>
            27,311 recipients
          </Typography>
        </Grid>
      </Grid>
    );
  };
  const renderTable = () => {
    return (
      <TableContainer className={classes.tableStyle}>
        <Table className={classes.tableContainer}>
          {windowSize !== "xs" && renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    );
  };
  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell
            classes={cellStyle}
            className={classes.flex3}
            align="center"
          >
            Email
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex2}
            align="center"
          >
            Name
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex3}
            align="center"
          >
            Opening Time
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex2}
            align="center"
          >
            Openess
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex2}
            align="center"
          >
            Clicks
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex2}
            align="center"
          >
            Removals
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex2}
            align="center"
          >
            Mobile
          </TableCell>

          <TableCell
            classes={{ root: classes.tableCellRoot }}
            className={classes.flex12}
          ></TableCell>
        </TableRow>
      </TableHead>
    );
  };
  const renderTableBody = () => {
    let rowData = SearchNewResults || SearchResults || tableData;
    let rpp = parseInt(rowsPerPage);
    rowData = rowData.slice((page - 1) * rpp, (page - 1) * rpp + rpp);
    return (
      <TableBody>
        {rowData.map(windowSize === "xs" ? renderPhoneRow : renderRow)}
      </TableBody>
    );
  };
  const renderRow = (row) => {
    return (
      <>
        <TableRow
          className={classes.maxHeight87}
          style={{ height: "100px" }}
          classes={rowStyle}
        >
          <TableCell
            classes={cellBodyStyle}
            align="center"
            className={classes.flex3}
            style={{ justifyContent: "center" }}
          >
            {renderEmailCell(row.email)}
          </TableCell>
          <TableCell
            classes={cellBodyStyle}
            align="center"
            className={classes.flex2}
          >
            <Box
              style={{
                display: "flex",
                justifyContent: "center",
                height: "100%",
                alignItems: "center",
              }}
            >
              <Typography className={clsx(classes.middleTxt)}>
                {row.name}
              </Typography>
            </Box>
          </TableCell>
          <TableCell
            classes={cellBodyStyle}
            align="center"
            className={classes.flex3}
            style={{ justifyContent: "center" }}
          >
            <Box style={{ display: "flex", flexDirection: "column" }}>
              <Typography className={clsx(classes.middleTxt)}>
                {row.openingDate}
              </Typography>
              <Typography className={clsx(classes.middleWrapText)}>
                {row.openingTime}
              </Typography>
            </Box>
          </TableCell>
          <TableCell
            classes={cellBodyStyle}
            align="center"
            className={classes.flex2}
          >
            <Box
              style={{
                display: "flex",
                justifyContent: "center",
                height: "100%",
                alignItems: "center",
              }}
            >
              <Typography className={clsx(classes.middleTxt)}>
                {row.openess}
              </Typography>
            </Box>
          </TableCell>
          <TableCell
            classes={cellBodyStyle}
            align="center"
            className={classes.flex2}
          >
            <Box
              style={{
                display: "flex",
                justifyContent: "center",
                height: "100%",
                alignItems: "center",
              }}
            >
              <Typography className={clsx(classes.middleTxt)}>
                {row.clicks}
              </Typography>
            </Box>
          </TableCell>
          <TableCell
            classes={cellBodyStyle}
            align="center"
            className={classes.flex2}
          >
            <Box
              style={{
                display: "flex",
                justifyContent: "center",
                height: "100%",
                alignItems: "center",
              }}
            >
              <Typography className={clsx(classes.middleTxt)}>
                {row.removals}
              </Typography>
            </Box>
          </TableCell>
          <TableCell
            classes={cellBodyStyle}
            align="center"
            className={classes.flex2}
          >
            <Box
              style={{
                display: "flex",
                justifyContent: "center",
                height: "100%",
                alignItems: "center",
              }}
            >
              <Typography className={clsx(classes.middleTxt)}>
                {row.sms}
              </Typography>
            </Box>
          </TableCell>

          <TableCell
            component="th"
            scope="row"
            classes={{
              root: clsx(classes.tableCellRoot, classes.paddingRightLeft10),
            }}
            className={classes.flex12}
          >
            {renderCellIcons()}
          </TableCell>
        </TableRow>
      </>
    );
  };
  const renderCellIcons = () => {
    return (
      <Box
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          alignSelf: "center",
          justifyContent: "center",
        }}
      >
        <ManagmentIcon
          classes={classes}
          iconClass={classes.w25}
          textClass={classes.lineHeight1point2}
          icon={EditIcon}
          lable="Edited"
        // href={`/CampaignStatistics/${CampaignID}`}
        />
        <ManagmentIcon
          classes={classes}
          iconClass={classes.w25}
          textClass={classes.lineHeight1point2}
          icon={GroupsIcon}
          lable="Delete from Group"
        // href={`/CampaignStatistics/${CampaignID}`}
        />
        <ManagmentIcon
          classes={classes}
          iconClass={classes.w25}
          textClass={classes.lineHeight1point2}
          icon={GroupsIcon}
          lable="Remove email"
        // href={`/CampaignStatistics/${CampaignID}`}
        />
        <ManagmentIcon
          classes={classes}
          iconClass={classes.w25}
          textClass={classes.lineHeight1point2}
          icon={GroupsIcon}
          lable="Remove phone"
        // href={`/CampaignStatistics/${CampaignID}`}
        />
      </Box>
    );
  };
  const renderPhoneRow = (row) => {
    return (
      <TableRow key={row.ID} component="div" classes={rowStyle}>
        <TableCell
          classes={{
            root: clsx(
              classes.tableCellRoot,
              classes.flex1,
              classes.tabelCellPadding
            ),
          }}
        >
          <div>
            <span style={{ fontWeight: "700", fontSize: "16px" }}>
              {row.email}
            </span>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <span>{row.openingDate},</span>
            <span>{row.openingTime}</span>
          </div>
          {/* <div style={{marginBottom:"20px"}}>
              <span style={{fontWeight:"600"}}>{row.sms}</span>
          </div> */}
          <div>{renderCellIcons()}</div>
        </TableCell>
      </TableRow>
    );
  };
  const renderEmailCell = (data, idx) => {
    if (windowSize === "xs") {
      return (
        <>
          <Typography noWrap className={classes.nameEllipsis}>
            {data}
          </Typography>
        </>
      );
    }
    return (
      <Grid container wrap="nowrap" spacing={1} alignItems="center">
        <Grid item className={clsx(windowSize !== "xs" && classes.w20)}>
          <Checkbox color="primary" />
        </Grid>
        <Grid item className={clsx(windowSize !== "xs" && classes.w80)}>
          <Typography noWrap className={classes.nameEllipsis}>
            {data}
          </Typography>
        </Grid>
      </Grid>
    );
  };
  const renderTablePagination = () => {
    const handleRowsPerPageChange = (val) => {
      dispatch(setRowsPerPage(val));
    };
    const handlePageChange = (val) => {
      setPage(val);
    };

    return (
      <TablePagination
        classes={classes}
        rows={isSearching ? SearchResults.length : tableData.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={handlePageChange}
      />
    );
  };

  const handleChange = (e) => {
    setselectintial(e.target.value);
    let sortData = tableData;
    if (e.target.value === "2") {
      setSearchNewResults(null);

      sortData = sortData.filter((val) => {
        if (val.openess !== "0") {
          return val;
        }
      });
    } else if (e.target.value === "4") {
      setSearchNewResults(null);
      sortData = sortData.filter((val) => {
        if (val.clicks !== "0") {
          return val;
        }
      });
    } else if (e.target.value === "5") {
      setSearchNewResults(null);
      sortData = sortData.filter((val) => {
        if (val.removals !== "No") {
          return val;
        }
      });
    } else {
      setSearchNewResults(null);
      sortData = tableData;
    }
    setSearchResults(sortData);
    setSearching(true);
    setPage(1);
  };

  return (
    <>
      {renderRecipients()}
      {renderGroup()}
      {renderOperations()}
      {renderTable()}
      {renderTablePagination()}
    </>
  );
};

export default RecipientsTab;
