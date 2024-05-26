import { useTranslation } from "react-i18next";
import { Box, Grid } from "@material-ui/core";
import { BsCheck } from "react-icons/bs";
import { MdClear } from "react-icons/md";
import { StateType } from '../../../../Models/StateTypes';
import { useSelector } from "react-redux";

const PasswordHint = ({ classes, Password }: any) => {
  const { isRTL } = useSelector((state: StateType) => state.core);
  const { t } = useTranslation();

  const elemStyle = { fontSize: 16, marginTop: 5, paddingRight: 5 };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        direction: isRTL ? "rtl" : "ltr",
        fontSize: 16,
        background: classes.bgBlack
      }}
    >
      <span className={classes.mb1}>
        <b> {t("settings.changePassword.passwordHint.title")}</b>
      </span>
      <Grid container>
        <Grid item xs={6}>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <Box>
              {Password.PasswordLength >= 8 ? (
                <BsCheck style={elemStyle} />
              ) : (
                <MdClear style={elemStyle} />
              )}
            </Box>
            <Box>{t("settings.changePassword.passwordHint.length")}</Box>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <Box>
              {Password.UpperChar ? (
                <BsCheck style={elemStyle} />
              ) : (
                <MdClear style={elemStyle} />
              )}
            </Box>
            <Box>{t("settings.changePassword.passwordHint.upperChar")}</Box>
          </Box>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={6}>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <Box>
              {Password.SpecialChar ? (
                <BsCheck style={elemStyle} />
              ) : (
                <MdClear style={elemStyle} />
              )}
            </Box>
            <Box>{t("settings.changePassword.passwordHint.specialChar")}</Box>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <Box>
              {Password.LowerChar ? (
                <BsCheck style={elemStyle} />
              ) : (
                <MdClear style={elemStyle} />
              )}
            </Box>
            <Box>{t("settings.changePassword.passwordHint.lowerChar")}</Box>
          </Box>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={6}>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <Box>
              {Password.NumberChar ? (
                <BsCheck style={elemStyle} />
              ) : (
                <MdClear style={elemStyle} />
              )}
            </Box>
            <Box>{t("settings.changePassword.passwordHint.number")}</Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PasswordHint;