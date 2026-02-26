import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Button,
  Chip,
  TextField,
  Divider,
  Tooltip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import Gif from "../../../assets/images/managment/check-circle.gif";
import {
  getSmsSenders,
  submitSmsSender,
  getSMSRequestOTP,
  getSMSConfirmOTP,
} from "../../../redux/reducers/smsSlice";

// ---------------------------------------------------------------------------
// Sender status constants (12-15 are the new approval-flow statuses)
// ---------------------------------------------------------------------------
const SENDER_STATUS = {
  PENDING: 12,
  REJECTED: 13,
  MAX_LIMIT: 14,
  INVALID: 15,
};

const isAlphabetical = (s) => /^[a-zA-Z\u0590-\u05FF]/.test(s);
const requiresManualApproval = (s) =>
  isAlphabetical(s) || !s.startsWith("05");
const isSenderApproved = (status) =>
  !Object.values(SENDER_STATUS).includes(status);
const isSenderPending = (status) => status === SENDER_STATUS.PENDING;
const isSenderRejected = (status) => status === SENDER_STATUS.REJECTED;

// Exported so SmsCreator / SmsSend can reuse the same helpers
export { SENDER_STATUS, isSenderApproved, isSenderPending, isSenderRejected };

// ---------------------------------------------------------------------------
// StatusBadge — small MUI Chip reflecting the sender's approval status
// ---------------------------------------------------------------------------
const StatusBadge = ({ status, t }) => {
  if (isSenderApproved(status)) {
    return (
      <Chip
        label={t("sms.senderApproved")}
        size="small"
        sx={{ bgcolor: "#e6f4ea", color: "#1e7e34", fontSize: 12, height: 22 }}
      />
    );
  }
  if (isSenderPending(status)) {
    return (
      <Chip
        label={t("sms.senderPending")}
        size="small"
        sx={{ bgcolor: "#fff8e1", color: "#e65100", fontSize: 12, height: 22 }}
      />
    );
  }
  if (isSenderRejected(status)) {
    return (
      <Chip
        label={t("sms.senderRejected")}
        size="small"
        sx={{ bgcolor: "#fdecea", color: "#c62828", fontSize: 12, height: 22 }}
      />
    );
  }
  return null;
};

// ---------------------------------------------------------------------------
// SenderRow — one item inside a section list
// ---------------------------------------------------------------------------
const SenderRow = ({ sender, mode, onSelect, t }) => {
  const approved = isSenderApproved(sender.Status);
  const pending = isSenderPending(sender.Status);
  const rejected = isSenderRejected(sender.Status);

  const tooltipTitle = pending
    ? t("sms.senderAwaitingApproval")
    : rejected
    ? sender.RejectionReason || t("sms.senderRejected")
    : "";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1,
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Tooltip title={tooltipTitle} disableHoverListener={approved}>
        <Typography
          sx={{
            color: rejected ? "#c62828" : pending ? "#888" : "inherit",
            cursor: approved ? "default" : "help",
            fontSize: 14,
          }}
        >
          {sender.SenderName}
        </Typography>
      </Tooltip>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <StatusBadge status={sender.Status} t={t} />
        {mode === "select" && (
          <Button
            size="small"
            variant="outlined"
            disabled={!approved}
            onClick={() => onSelect(sender)}
            sx={{ minWidth: 70, fontSize: 12 }}
          >
            {t("sms.selectSender")}
          </Button>
        )}
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// AddSenderRow — input + submit for adding a new sender under each section
// ---------------------------------------------------------------------------
const AddSenderRow = ({ isNumberSection, onSubmit, loading, t }) => {
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    const v = e.target.value;
    // Numbers section: allow digits and common number chars only
    // Names section: allow letters (latin + hebrew) only
    if (isNumberSection) {
      if (/^[0-9+\-]*$/.test(v) || v === "") setValue(v);
    } else {
      if (/^[a-zA-Z\u0590-\u05FF\s]*$/.test(v) || v === "") setValue(v);
    }
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
      <TextField
        size="small"
        placeholder={
          isNumberSection
            ? t("sms.addNewNumber")
            : t("sms.addNewSenderName")
        }
        value={value}
        onChange={handleChange}
        sx={{ flex: 1 }}
        inputProps={{ maxLength: isNumberSection ? 16 : 11 }}
      />
      <Button
        variant="contained"
        size="small"
        onClick={handleSubmit}
        disabled={loading || !value.trim()}
        sx={{ whiteSpace: "nowrap" }}
      >
        {loading ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          t("sms.submitForApproval")
        )}
      </Button>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// VerifySenderModal — main export
// Props:
//   classes       — makeStyles classes from parent (required by BaseDialog)
//   isOpen        — boolean
//   onClose       — () => void
//   onSenderSelected — (senderName: string) => void   (called after user picks)
//   mode          — 'view' | 'select'  (select shows "Select" button per row)
// ---------------------------------------------------------------------------
const VerifySenderModal = ({
  classes,
  isOpen,
  onClose,
  onSenderSelected,
  mode = "view",
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Sender list state
  const [senders, setSenders] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // OTP sub-flow state
  // dialogView: 'main' | 'otpVerification' | 'otpCode' | 'otpSuccess'
  const [dialogView, setDialogView] = useState("main");
  const [otpTarget, setOtpTarget] = useState(null); // senderName being verified
  const [otpValue, setOtpValue] = useState("");
  const [otpValidation, setOtpValidation] = useState(false);
  const [otpMsg, setOtpMsg] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // Fetch on open
  useEffect(() => {
    if (isOpen) {
      setDialogView("main");
      setSubmitSuccess(false);
      setSubmitError("");
      fetchSenders();
    }
  }, [isOpen]);

  const fetchSenders = async () => {
    setFetchLoading(true);
    const result = await dispatch(getSmsSenders());
    if (result.payload && Array.isArray(result.payload)) {
      setSenders(result.payload);
    }
    setFetchLoading(false);
  };

  // Split into numbers vs alphabetical names
  const numberSenders = senders.filter((s) => /^\d/.test(s.SenderName));
  const nameSenders = senders.filter((s) => !/^\d/.test(s.SenderName));

  // -------------------------------------------------------------------------
  // Sender selection
  // -------------------------------------------------------------------------
  const handleSelectSender = (sender) => {
    if (!isSenderApproved(sender.Status)) return;

    // 05-number → OTP flow
    if (sender.SenderName.startsWith("05")) {
      setOtpTarget(sender.SenderName);
      setOtpValue("");
      setOtpValidation(false);
      setOtpMsg("");
      setDialogView("otpVerification");
    } else {
      // Direct selection — no OTP needed
      onSenderSelected(sender.SenderName);
      handleClose();
    }
  };

  // -------------------------------------------------------------------------
  // Add new sender (submit for manual approval)
  // -------------------------------------------------------------------------
  const handleSubmitNewSender = async (senderName) => {
    setSubmitLoading(true);
    setSubmitError("");
    setSubmitSuccess(false);

    const result = await dispatch(submitSmsSender({ SenderName: senderName }));
    setSubmitLoading(false);

    if (result.payload !== undefined && !result.error) {
      setSubmitSuccess(true);
      // Optimistically add a pending entry to the local list
      setSenders((prev) => [
        ...prev,
        {
          ID: Date.now(),
          SenderName: senderName,
          Status: SENDER_STATUS.PENDING,
          RequestDate: new Date().toISOString(),
          RejectionReason: null,
        },
      ]);
    } else {
      setSubmitError(t("sms.error"));
    }
  };

  // -------------------------------------------------------------------------
  // OTP sub-flow handlers (same logic as OTP.js)
  // -------------------------------------------------------------------------
  const handleRequestOTP = async () => {
    setOtpLoading(true);
    setDialogView(null); // brief blank while loading
    await dispatch(getSMSRequestOTP({ Cellphone: otpTarget }));
    setOtpLoading(false);
    setDialogView("otpCode");
  };

  const handleConfirmOTP = async () => {
    if (!otpValue) {
      setOtpValidation(true);
      setOtpMsg(t("common.requiredField"));
      return;
    }
    setOtpLoading(true);
    const result = await dispatch(
      getSMSConfirmOTP({ Cellphone: otpTarget, Code: otpValue })
    );
    setOtpLoading(false);
    handleOtpResult(result.payload?.Status);
  };

  const handleOtpResult = (status) => {
    switch (status) {
      case 2:
        setDialogView("otpSuccess");
        break;
      case 3:
        setOtpValidation(true);
        setOtpMsg(t("sms.otpNotAuthirized"));
        break;
      case 4:
        setOtpValidation(true);
        setOtpMsg(t("sms.otpFailed"));
        break;
      case 5:
        setOtpValidation(true);
        setOtpMsg(t("sms.otpNotMatch"));
        break;
      case 6:
        setOtpValidation(true);
        setOtpMsg(t("sms.phoneNotProvided"));
        break;
      case 7:
        setOtpValidation(true);
        setOtpMsg(t("common.requiredField"));
        break;
      default:
        break;
    }
  };

  const handleOtpSuccess = () => {
    if (mode === "select" && otpTarget) {
      onSenderSelected(otpTarget);
    }
    handleClose();
  };

  // -------------------------------------------------------------------------
  // Close / reset
  // -------------------------------------------------------------------------
  const handleClose = () => {
    setDialogView("main");
    setOtpTarget(null);
    setOtpValue("");
    setOtpValidation(false);
    setOtpMsg("");
    setSubmitSuccess(false);
    setSubmitError("");
    onClose();
  };

  // -------------------------------------------------------------------------
  // Render helpers per dialogView
  // -------------------------------------------------------------------------
  const renderMainContent = () => (
    <Box sx={{ minWidth: 360 }}>
      {fetchLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {submitSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSubmitSuccess(false)}
        >
          {t("sms.submitSenderSuccess")}
        </Alert>
      )}
      {submitError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setSubmitError("")}
        >
          {submitError}
        </Alert>
      )}

      {/* ── Section 1: Numbers ── */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        {t("sms.numbersInAccount")}
      </Typography>
      {!fetchLoading && numberSenders.length === 0 && (
        <Typography sx={{ color: "#888", fontSize: 13, mb: 1 }}>
          {t("sms.noSendersFound")}
        </Typography>
      )}
      {numberSenders.map((s) => (
        <SenderRow
          key={s.ID}
          sender={s}
          mode={mode}
          onSelect={handleSelectSender}
          t={t}
        />
      ))}
      <AddSenderRow
        isNumberSection
        onSubmit={handleSubmitNewSender}
        loading={submitLoading}
        t={t}
      />

      <Divider sx={{ my: 2.5 }} />

      {/* ── Section 2: Names ── */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        {t("sms.senderNamesInAccount")}
      </Typography>
      {!fetchLoading && nameSenders.length === 0 && (
        <Typography sx={{ color: "#888", fontSize: 13, mb: 1 }}>
          {t("sms.noSendersFound")}
        </Typography>
      )}
      {nameSenders.map((s) => (
        <SenderRow
          key={s.ID}
          sender={s}
          mode={mode}
          onSelect={handleSelectSender}
          t={t}
        />
      ))}
      <AddSenderRow
        isNumberSection={false}
        onSubmit={handleSubmitNewSender}
        loading={submitLoading}
        t={t}
      />
    </Box>
  );

  const renderOtpVerificationContent = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        minWidth: 320,
      }}
    >
      <Typography sx={{ fontSize: 14, textAlign: "center" }}>
        {t("sms.OtpRegulations")}
      </Typography>
      <Typography sx={{ fontSize: 14, textAlign: "center" }}>
        {t("sms.regulationSecondLine")}{" "}
        <strong>{t("sms.oneTime")}</strong>{" "}
        {t("sms.regulationThirdLine")}
      </Typography>
      <TextField
        size="small"
        value={otpTarget || ""}
        disabled
        sx={{ width: 220 }}
      />
      <Button
        variant="contained"
        size="small"
        onClick={handleRequestOTP}
        disabled={otpLoading}
        sx={{ whiteSpace: "nowrap" }}
      >
        {otpLoading ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          t("sms.sendVerificationCode")
        )}
      </Button>
      <Typography sx={{ fontSize: 13, color: "#888" }}>
        {t("sms.otpContactUs")}
      </Typography>
      <Typography sx={{ fontSize: 13 }}>{t("sms.helplineSMS")}</Typography>
    </Box>
  );

  const renderOtpCodeContent = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        minWidth: 320,
      }}
    >
      <Typography sx={{ fontSize: 14, textAlign: "center" }}>
        {t("sms.OtpSentSuccessLine1")} <strong>{otpTarget}</strong>
      </Typography>
      <Typography sx={{ fontSize: 14, textAlign: "center" }}>
        {t("sms.OtpSentSuccessLine2")}
      </Typography>
      <TextField
        size="small"
        placeholder={t("sms.typeOtpPlaceholder")}
        value={otpValue}
        onChange={(e) => {
          setOtpValue(e.target.value);
          setOtpValidation(false);
          setOtpMsg(t("common.requiredField"));
        }}
        error={otpValidation}
        helperText={otpValidation ? otpMsg : ""}
        inputProps={{ maxLength: 5 }}
        sx={{ width: 220 }}
      />
      <Button
        variant="contained"
        size="small"
        onClick={handleConfirmOTP}
        disabled={otpLoading}
        sx={{ width: 220 }}
      >
        {otpLoading ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          t("sms.confirmOtp")
        )}
      </Button>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Typography sx={{ fontSize: 13 }}>
          {t("sms.didntReceivedOtp")}
        </Typography>
        <Typography
          sx={{
            fontSize: 13,
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={handleRequestOTP}
        >
          {t("sms.resend")}
        </Typography>
      </Box>
    </Box>
  );

  const renderOtpSuccessContent = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        minWidth: 280,
        pb: 1,
      }}
    >
      <img src={Gif} style={{ width: 150, height: 150 }} alt="" />
      <Typography sx={{ fontSize: 18, fontWeight: 600, textAlign: "center" }}>
        {t("sms.otpNumberValidatedDescription")}
      </Typography>
      <Button variant="contained" size="large" onClick={handleOtpSuccess}>
        {t("common.Ok")}
      </Button>
    </Box>
  );

  // -------------------------------------------------------------------------
  // Dialog config per view
  // -------------------------------------------------------------------------
  const dialogConfig = {
    main: {
      title: t("sms.verifySenderTitle"),
      content: renderMainContent(),
    },
    otpVerification: {
      title: t("sms.verificationOtp"),
      content: renderOtpVerificationContent(),
    },
    otpCode: {
      title: t("sms.weHaveSentOtp"),
      content: renderOtpCodeContent(),
    },
    otpSuccess: {
      title: t("sms.otpNumberValidatedTitle"),
      content: renderOtpSuccessContent(),
    },
  };

  const current = dialogConfig[dialogView] || dialogConfig.main;

  return (
    <BaseDialog
      classes={classes}
      open={isOpen}
      onClose={handleClose}
      onCancel={handleClose}
      title={current.title}
      showDivider
      showDefaultButtons={false}
      icon={false}
      maxHeight="70vh"
    >
      {current.content}
    </BaseDialog>
  );
};

export default VerifySenderModal;
