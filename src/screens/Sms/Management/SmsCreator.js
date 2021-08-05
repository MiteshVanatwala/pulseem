import React, { useState, useEffect, useRef } from "react";
import { Tooltip } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import Switch from "@material-ui/core/Switch";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Picker from "emoji-picker-react";
import Mobile from "../../../assets/images/mobileiphone.png";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import { withStyles } from "@material-ui/core/styles";
import {
  TablePagination,
  ManagmentIcon,
  DateField,
  Dialog,
  PopMassage,
  SearchField,
  RestorDialogContent,
} from "../../../components/managment/index";
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
const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    "&$checked": {
      transform: "translateX(16px)",
      color: theme.palette.common.white,
      "& + $track": {
        backgroundColor: "#52d869",
        opacity: 1,
        border: "none",
      },
    },
    "&$focusVisible $thumb": {
      color: "#52d869",
      border: "6px solid #fff",
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(["background-color", "border"]),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

const SmsCreator = ({ classes }) => {
  const styles = useStyles();

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { language, windowSize, isRTL, rowsPerPage } = useSelector(
    (state) => state.core
  );
  const [alignment, setAlignment] = useState("left");
  const [chosenEmoji, setChosenEmoji] = useState(null);
  const [flagemoji, setflagemoji] = useState(false);
  const [checked, setChecked] = React.useState(false);
  const [dialogClick, setdialogClick] = useState(false);
  const [dialogClickLanding, setdialogClickLanding] = useState(false);
  const [editmenuClick, seteditmenuClick] = useState(false);
  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject);
    setflagemoji(false);
  };

  const handleAlignment = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  const toggleChecked = () => {
    setChecked((prev) => !prev);
  };

  const renderSwitch = () => {
    return (
      <div className={classes.infoDiv}>
        <span className={classes.headInfo}>Create New SMS Campaign</span>
        <Tooltip
          disableFocusListener
          title="Create the content you want to send to your recipients and then choose how, when and to whom to send"
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
        <span className={classes.headNo}>1</span>
        <span className={classes.contentHead}>Create Content</span>
      </div>
    );
  };

  const renderFields = () => {
    return (
      <div className={classes.fieldDiv}>
        <div className={classes.buttonForm}>
          <span className={classes.buttonHead}>Campaign Name</span>
          <input
            type="text"
            placeholder="Campaign Name"
            className={clsx(classes.buttonField, classes.error)}
          />
          <span className={classes.buttonContent}>
            Used to identify the campaign in the system. Your recipients will
            not see this name
          </span>
        </div>
        <div className={classes.buttonForm}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {" "}
            <span className={classes.buttonHead}>Campaign From</span>
            <span style={{ fontSize: "15px", color: "rgb(170, 170, 170)" }}>
              Restore
            </span>
          </div>

          <input
            type="text"
            placeholder="0508085670"
            className={clsx(classes.buttonField, classes.success)}
            disabled
          />
          <span className={clsx(classes.buttonContent, classes.alertMsg)}>
            If you change this number, your customers will not be able to reply
            to the campaign
          </span>
        </div>
        <div className={classes.buttonForm}>
          <span className={clsx(classes.buttonHead)}>Removal Reply</span>
          <input
            type="text"
            placeholder="282"
            disabled
            className={classes.buttonField}
          />
        </div>
      </div>
    );
  };

  const renderMsg = () => {
    return (
      <div style={{ marginTop: "50px", height: "400px", display: "flex" }}>
        <div>
          <span className={classes.msgHead}> Your Message</span>
          <div style={{ width: "640px" }}>
            <textarea
              placeholder="Type text"
              maxlength="1000"
              outlined=""
              id="yourMessage"
              className={classes.msgArea}
            ></textarea>
            <div className={classes.smallInfoDiv}>
              <span style={{ marginInlineEnd: "18px" }}>0 Link</span>
              <span style={{ marginInlineEnd: "18px" }}>0 Message</span>
              <span>0/1000 Char</span>
            </div>
            <div className={classes.funcDiv}>
              <ToggleButtonGroup
                value={alignment}
                exclusive
                onChange={handleAlignment}
                aria-label="text alignment"
              >
                <ToggleButton value="left" aria-label="left aligned">
                  <FormatAlignLeftIcon />
                </ToggleButton>

                <ToggleButton value="right" aria-label="right aligned">
                  <FormatAlignRightIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              <div
                style={{
                  position: "relative",
                  borderRight: "1px solid black",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {flagemoji ? <Picker onEmojiClick={onEmojiClick} /> : null}

                <InsertEmoticonIcon
                  style={{ marginInlineEnd: "8px" }}
                  onClick={() => {
                    setflagemoji(!flagemoji);
                  }}
                />
              </div>
              <div className={classes.baseButtons}>
                <span className={classes.infoButtons}>
                  <span style={{ marginInlineEnd: "5px" }}>+</span>Removal
                  message
                </span>
                <span className={classes.info2Buttons}>
                  <span style={{ marginInlineEnd: "5px" }}>+</span>Removal link
                </span>
              </div>
              <div className={classes.selectMsg}>
                <select className={classes.selectVal}>
                  <option>Personliazation</option>
                  <option>First Name</option>
                  <option>Last Name</option>
                  <option>Email</option>
                </select>
              </div>
              <div className={classes.addDiv}>
                <span className={classes.addButtons} onClick={() => {seteditmenuClick(!editmenuClick)}}>
                  <span
                    style={{
                      marginInlineEnd: "3px",
                      border: "1px solid #1c82b2",
                      borderRadius: "50%",
                      padding: "5px",
                      width: "12px",
                      height: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#1c82b2",
                    }}
                  >
                    +
                  </span>
                  Add
                </span>
               {editmenuClick ?<div className={classes.dropDiv}>
                  <span className={classes.dropCon} onClick={() => {setdialogClickLanding(true)}}>Landing Page Link</span>
                  <span className={classes.dropCon}>Campaign Link</span>
                  <span className={classes.dropCon}>Waze Navigation</span>
                </div> : null } 
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginInlineStart: "35px", display: "flex" }}>
          <FormGroup>
            <FormControlLabel
              control={
                <IOSSwitch
                  checked={checked}
                  onChange={toggleChecked}
                  name="checkedB"
                />
              }
            />
          </FormGroup>
          <div
            style={{ display: "flex", flexDirection: "column", width: "180px" }}
          >
            <span>Keep track of your links</span>
            <span>
              Turning this switch on will convert your links to a special
              35-character link, saving space in your message
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderPhone = () => {
    return (
      <div>
        <div style={{ position: "relative" }}>
          {" "}
          <img
            src={Mobile}
            style={{
              width: "350px",
              height: "400px",
              marginTop: "50px",
              borderBottom: "1px solid black",
            }}
          />
          <span className={classes.phoneNumber}>050608001</span>
          <div className={classes.chat}></div>
        </div>

        <div
          style={{
            marginInlineStart: "35px",
            display: "flex",
            marginTop: "20px",
          }}
        >
          <FormGroup>
            <FormControlLabel
              control={
                <IOSSwitch
                  checked={checked}
                  onChange={toggleChecked}
                  name="checkedB"
                />
              }
            />
          </FormGroup>
          <div
            style={{ display: "flex", flexDirection: "column", width: "250px" }}
          >
            <span>Test Send</span>
            <span>Right after you click "send"</span>
          </div>
        </div>
        <div style={{ marginTop: "10px", marginInlineStart: "35px" }}>
          <RadioGroup
            row
            aria-label="position"
            name="position"
            defaultValue="top"
          >
            <div className={{ display: "flex", flexDirection: "column" }}>
              <div>
                {" "}
                <FormControlLabel
                  value="top"
                  control={<Radio color="primary" />}
                />
                <span>Send to one Contact</span>
              </div>

              <div className={classes.rightForm}>
                <input
                  type="text"
                  placeholder="Enter Phone Number"
                  className={classes.rightInput}
                />
                <span className={classes.rightSend}>Send</span>
              </div>

              <div>
                {" "}
                <FormControlLabel
                  value="top"
                  control={<Radio color="primary" />}
                />
                <span>Send to one Test Groups</span>
              </div>
              <div className={classes.rightForm}>
                <input
                  type="text"
                  placeholder="Choose test groups from the list"
                  className={classes.rightInput2}
                  onClick={() => {
                    setdialogClick(true);
                  }}
                />
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className={classes.buttonDiv}>
          <span className={classes.rightInput3}>Delete</span>
          <span className={classes.rightInput4}>Exit </span>
          <span className={classes.rightInput5}>Save</span>
          <span className={classes.rightInput6}>Continue</span>
        </div>
      </div>
    );
  };

  const handleClose = () => {
    setdialogClick(false);
  };
  const handleCloseLanding = () => {
    setdialogClickLanding(false);
  };

  return (
    <DefaultScreen currentPage="reports" classes={classes}>
      <div style={{ display: "grid", gridTemplateColumns: "67% auto" }}>
        <div>
          {renderSwitch()}
          {renderHead()}
          {renderFields()}
          {renderMsg()}
        </div>
        <div>{renderPhone()}</div>
      </div>
      {dialogClick ? (
        <Dialog
          classes={classes}
          open={dialogClick}
          onClose={handleClose}
          showDefaultButtons={false}
          icon={"\uE164"}
        >
          <div style={{ height: "60px", borderBottom: "1px solid black" }}>
            <span className={classes.groupName}>
              Select group for test sending
            </span>
          </div>
          <div className={classes.modalDiv}>
            <input
              type="text"
              placeholder="Search"
              className={classes.modalSearch}
            ></input>
            <span className={classes.confirmButton}>Confirm</span>
          </div>
        </Dialog>
      ) : null}
      {dialogClickLanding ? (
        <Dialog
          classes={classes}
          open={dialogClickLanding}
          onClose={handleCloseLanding}
          showDefaultButtons={false}
          icon={"\uE164"}
        >
          <div style={{ height: "60px", borderBottom: "1px solid black" }}>
            <span className={classes.groupName}>Select Landing Page</span>
          </div>
          <div className={classes.modalDiv}>
            <input
              type="text"
              placeholder="Search"
              className={classes.modalSearch}
            ></input>
          </div>
          <div className={classes.listDiv}>
             <div className={classes.searchCon}>
                 <span style={{marginInlineEnd:'8px'}}>icn</span>
                 <span>Data to be displayed</span>
             </div>
             <div className={classes.searchCon}>
                 <span style={{marginInlineEnd:'8px'}}>icn</span>
                 <span>Data to be displayed</span>
             </div>
             <div className={classes.searchCon}>
                 <span style={{marginInlineEnd:'8px'}}>icn</span>
                 <span>Data to be displayed</span>
             </div>
          </div>
        </Dialog>
      ) : null}
    </DefaultScreen>
  );
};

export default SmsCreator;
