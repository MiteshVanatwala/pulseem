import React, { useState, useEffect, useRef } from "react";
import { Tooltip } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import PropTypes from "prop-types";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import TextField from "@material-ui/core/TextField";
import clsx from "clsx";
const useStyles = makeStyles((theme) => ({
  customWidth: {
    maxWidth: 200,
    backgroundColor: "black",
    fontSize: "14px",
  },
  noMaxWidth: {
    maxWidth: "none",
  },
}));
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

const useStyle = makeStyles((theme) => ({
  root: {
    backgroundColor: "#ffffff",
  },
}));

const SmsCreatorStep = ({ classes }) => {
  const styles = useStyles();
  const tabi = useStyle();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { language, windowSize, isRTL, rowsPerPage } = useSelector(
    (state) => state.core
  );
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const renderSwitch = () => {
    return (
      <div className={classes.infoDiv}>
        <span className={classes.headInfo}>Create New SMS Campaign</span>
        <Tooltip
          disableFocusListener
          title="Create New SMS Campaign"
          classes={{ tooltip: styles.customWidth }}
        >
          <span className={classes.bodyInfo}>i</span>
        </Tooltip>
      </div>
    );
  };
  const renderHead = () => {
    return (
      <div className={classes.headDiv}>
        <span className={classes.headNo}>2</span>
        <span className={classes.contentHead}>Send Settings</span>
      </div>
    );
  };
  const renderContent = () => {
    return (
      <div className={classes.infoDiv}>
        <span className={classes.conInfo}>To whom to send?</span>
        <Tooltip
          disableFocusListener
          title="First choose who receives your campaign, then choose when."
          classes={{ tooltip: styles.customWidth }}
        >
          <span className={classes.bodyInfo}>i</span>
        </Tooltip>
      </div>
    );
  };
  const renderBody = () => {
    return (
      <div style={{ width: "700px" }}>
        <div className={classes.tabDiv}>
          <div className={clsx(classes.tab1)}>
            <span>Groups</span>
          </div>
          <div className={clsx(classes.tab1, classes.activeTab)}>
            <span style={{ marginInlineEnd: "7px" }}>Manual Upload</span>
            <Tooltip
              disableFocusListener
              title="Add recipient information. New! You can now add up to 600,000 recipients"
              classes={{ tooltip: styles.customWidth }}
            >
              <span className={classes.bodyInfo}>i</span>
            </Tooltip>
          </div>
          <div className={classes.areaManual}>
            <textarea
              placeholder="Drag &amp; drop an XLS/CSV file or copy and paste the details directly into this box. You may also enter manually, by adding a comma between values: FirstName, LastName, Cellphone. You are able to enter hundreds of thousands of recipients to this box"
              spellcheck="false"
              autocomplete="off"
              className={classes.areaCon}
            />
          </div>
        </div>
        <div
          style={{
            marginTop: "7px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <span>Total Records : 0</span>
        </div>
      </div>
    );
  };

  const renderRight = () => {
    return (
      <div style={{ marginTop: "35%" }}>
        <p className={classes.conInfo}>When would you like to send?</p>
        <div style={{ borderBottom: "2px solid #818181" }}>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="gender"
              name="gender1"
              value={value}
              onChange={handleChange}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "40px",
                }}
              >
                <FormControlLabel
                  value="top"
                  control={<Radio color="primary" />}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "18px",
                      marginBottom: "5px",
                    }}
                  >
                    Send Now
                  </span>
                  <span
                    style={{
                      fontWeight: "600",
                      fontSize: "15px",
                      color: "#818181",
                    }}
                  >
                    Right after you click "send" in the Summary screen
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "40px",
                }}
              >
                <FormControlLabel
                  value="top"
                  control={<Radio color="primary" />}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "18px",
                      marginBottom: "5px",
                    }}
                  >
                    Date and Time
                  </span>
                  <form className={classes.container} noValidate>
                    <TextField
                      style={{
                        border: "1px solid #818181",
                        backgroundColor: "white",
                        padding: "4px",
                        borderRadius: "6px",
                      }}
                      id="datetime-local"
                      type="datetime-local"
                      defaultValue="2017-05-24T10:30"
                      className={classes.textField}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </form>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "40px",
                }}
              >
                <FormControlLabel
                  value="top"
                  control={<Radio color="primary" />}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "18px",
                      marginBottom: "10px",
                    }}
                  >
                    Special Date
                  </span>
                  <select
                    placeholder="Select"
                    style={{
                      border: "1px solid #818181",
                      backgroundColor: "white",
                      padding: "10px",
                      borderRadius: "4px",
                      width: "260px",
                      outline: "none",
                      marginBottom: "10px",
                    }}
                  >
                    <option>Birthday</option>
                    <option>Creation Day</option>
                  </select>
                  <div className={classes.toggleDiv}>
                      <input type="text" className={classes.inputDays}/>

                      <span style={{marginInlineEnd:"8px",marginBottom:"8px"}}>Days</span>

                      <div style={{display:"flex"}}>
                      <span className={classes.before}>Before</span>
                      <span className={classes.after}>After</span>
                      </div>
                     
                  </div>
                  <div style={{ width: "380px" }}>
                    <form className={classes.container} noValidate>
                      <TextField
                        style={{
                          border: "1px solid #818181",
                          backgroundColor: "white",
                          padding: "4px",
                          borderRadius: "6px",
                          marginBottom: "1px",
                          width: "252px",
                        }}
                        id="time"
                        type="time"
                        placeholder="Hour"
                        className={classes.textField}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          step: 300, // 5 min
                        }}
                      />
                    </form>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </FormControl>
        </div>
        <div className={classes.pulseDiv}>
          <span className={classes.pulse}>Pulse Sending</span>
          <Tooltip
            disableFocusListener
            title="Choose a group and when to send to organize your Pulse Sending."
            classes={{ tooltip: styles.customWidth }}
          >
            <span className={classes.bodyInfo}>i</span>
          </Tooltip>
        </div>

        <div className={classes.buttonDiv}>
          <span className={classes.rightInput3}>Delete</span>
          <span className={classes.rightInput4}>Exit </span>
          <span className={classes.rightInput5}>Save</span>
          <span className={classes.rightInput6}>Summary</span>
        </div>
      </div>
    );
  };
  return (
    <DefaultScreen currentPage="reports" classes={classes}>
      <div style={{ display: "grid", gridTemplateColumns: "65% auto" }}>
        <div>
          {renderSwitch()}
          {renderHead()}
          {renderContent()}
          {renderBody()}
          <div className={classes.backBtn}>
            <span style={{ marginInlineEnd: "4px" }}>{"<"}</span>
            <span>Back</span>
          </div>
        </div>
        <div>{renderRight()}</div>
      </div>
    </DefaultScreen>
  );
};

export default SmsCreatorStep;
