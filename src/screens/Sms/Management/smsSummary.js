import React from 'react';
import { Dialog } from "../../../components/managment/index";
import { FaMobileAlt } from "react-icons/fa";
import Mobile from "../../../assets/images/mobileiphone.png";

const smsSummary = ({classes , selected  , bool , campaign  , number , totalmsg , stepBool}) => {
    return (
        <div>
            {bool ?    <Dialog
          classes={classes}
          open={false}
          // onClose={handleAlertoff}
          // onConfirm={handleExitYes}
          confirmText="Send"
          cancelText="Cancel"
          showDefaultButtons={true}
          icon={<FaMobileAlt style={{ fontSize: 30, color: "#fff" }} />}
        >
          <div style={{ height: "60px", borderBottom: "1px solid #DEE2E7" }}>
            <span className={classes.groupName}>Campaign Summary '{campaign}'</span>
          </div>
          <div style={{ fontSize: "22px", marginTop: "5px" }}>
            <div className={classes.baseSum}>
              <div className={classes.sumLeft}>
                <div className={classes.sumChild}>
                  <span className={classes.spanSum}>Campaign From :</span>
                  <span className={classes.bodySum}>{number}</span>
                </div>

                <div className={classes.sumChild}>
                  <span className={classes.spanSum}>When :</span>
                  <span className={classes.bodySum}>Send Now</span>
                </div>

                <div className={classes.sumChild}>
                  <span className={classes.spanSum}>For :</span>
                  <span style={{ fontSize: "18px" }}>
                    Total Number of Recipients :{" "}
                    <span className={classes.bodySum}>{selected.length}</span>
                  </span>
                  <span
                    style={{
                      marginTop: "6px",
                      fontSize: "16px",
                      color: "gray",
                      borderBottom: "1px solid gray",
                      width: "50px",
                      cursor: "pointer",
                    }}
                  >
                    Details
                  </span>
                </div>
              </div>
              <div className={classes.sumRight}>
                <div style={{ position: "relative" }}>
                  {" "}
                  <img
                    src={Mobile}
                    style={{
                      width: "350px",
                      height: "370px",
                      marginTop: "10px",
                      borderBottom: "1px solid #efefef",
                    }}
                  />
                  <span className={classes.phoneNumber}>050608001</span>
                  <div className={classes.wrapChat}>
                    <div className={classes.fromMe}>
                      {totalmsg === "" ? "Type text" : totalmsg}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div>
                {" "}
                <ul>
                  <li
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      marginBottom: "2px",
                    }}
                  >
                    Groups (0)
                  </li>
                </ul>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 8px 8px 55px",
                    borderTop: "1px solid grey",
                    fontSize: "16px",
                  }}
                >
                  <span>Name</span>
                  <span>1 Recipients</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 8px 8px 55px",
                    borderTop: "1px solid grey",
                    fontSize: "16px",
                  }}
                >
                  <span>Name</span>
                  <span>1 Recipients</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <ul>
              <li
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  marginBottom: "2px",
                }}
              >
                Recipients Filter (10)
              </li>
            </ul>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "17px",
                  color: "#1771ad",
                  paddingInlineStart: "40px",
                }}
              >
                Duplicate Recipients :{" "}
                <span
                  style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    color: "black",
                  }}
                >
                  10
                </span>
              </span>
              <span
                style={{
                  fontSize: "17px",
                  color: "#1771ad",
                  paddingInlineStart: "40px",
                }}
              >
                Removed :{" "}
                <span
                  style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    color: "black",
                  }}
                >
                </span>
              </span>
              <span
                style={{
                  fontSize: "17px",
                  color: "#1771ad",
                  paddingInlineStart: "40px",
                }}
              >
                Empty numbers :{" "}
                <span
                  style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    color: "black",
                  }}
                >
                  1
                </span>
              </span>
            </div>
          </div>
        </Dialog> : null }

        {stepBool ? <Dialog
          classes={classes}
          open={false}
          // onClose={handleAlertoff}
          // onConfirm={handleExitYes}
          confirmText="Send"
          cancelText="Cancel"
          showDefaultButtons={true}
          icon={<FaMobileAlt style={{ fontSize: 30, color: "#fff" }} />}
        >
          <div style={{ height: "60px", borderBottom: "1px solid #DEE2E7" }}>
            <span className={classes.groupName}>Campaign Summary '{campaign}'</span>
          </div>
          <div style={{ fontSize: "22px", marginTop: "5px" }}>
            <div className={classes.baseSum}>
              <div className={classes.sumLeft}>
                <div className={classes.sumChild}>
                  <span className={classes.spanSum}>Campaign From :</span>
                  <span className={classes.bodySum}>{number}</span>
                </div>

                <div className={classes.sumChild}>
                  <span className={classes.spanSum}>When :</span>
                  <span className={classes.bodySum}>Send Now</span>
                </div>

                <div className={classes.sumChild}>
                  <span className={classes.spanSum}>For :</span>
                  <span style={{ fontSize: "18px" }}>
                    Total Number of Recipients :{" "}
                    <span className={classes.bodySum}>""</span>
                  </span>
                  <span
                    style={{
                      marginTop: "6px",
                      fontSize: "16px",
                      color: "gray",
                      borderBottom: "1px solid gray",
                      width: "50px",
                      cursor: "pointer",
                    }}
                  >
                    Details
                  </span>
                </div>
              </div>
              <div className={classes.sumRight}>
                <div style={{ position: "relative" }}>
                  {" "}
                  <img
                    src={Mobile}
                    style={{
                      width: "350px",
                      height: "370px",
                      marginTop: "10px",
                      borderBottom: "1px solid #efefef",
                    }}
                  />
                  <span className={classes.phoneNumber}>050608001</span>
                  <div className={classes.wrapChat}>
                    <div className={classes.fromMe}>
                      Type text
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div>
                {" "}
                <ul>
                  <li
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      marginBottom: "2px",
                    }}
                  >
                    Groups (0)
                  </li>
                </ul>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 8px 8px 55px",
                    borderTop: "1px solid grey",
                    fontSize: "16px",
                  }}
                >
                  <span>Name</span>
                  <span>1 Recipients</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 8px 8px 55px",
                    borderTop: "1px solid grey",
                    fontSize: "16px",
                  }}
                >
                  <span>Name</span>
                  <span>1 Recipients</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <ul>
              <li
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  marginBottom: "2px",
                }}
              >
                Recipients Filter (10)
              </li>
            </ul>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "17px",
                  color: "#1771ad",
                  paddingInlineStart: "40px",
                }}
              >
                Duplicate Recipients :{" "}
                <span
                  style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    color: "black",
                  }}
                >
                  10
                </span>
              </span>
              <span
                style={{
                  fontSize: "17px",
                  color: "#1771ad",
                  paddingInlineStart: "40px",
                }}
              >
                Removed :{" "}
                <span
                  style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    color: "black",
                  }}
                >
                </span>
              </span>
              <span
                style={{
                  fontSize: "17px",
                  color: "#1771ad",
                  paddingInlineStart: "40px",
                }}
              >
                Empty numbers :{" "}
                <span
                  style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    color: "black",
                  }}
                >
                  1
                </span>
              </span>
            </div>
          </div>
        </Dialog> : null }
          
        </div>
    )
}

export default smsSummary;
