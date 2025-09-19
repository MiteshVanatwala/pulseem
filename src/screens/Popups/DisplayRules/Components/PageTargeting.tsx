import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Button,
  SelectChangeEvent,
} from '@mui/material';
import { MdDelete, MdAdd } from 'react-icons/md';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';
import { useSelector } from 'react-redux';

export enum RuleType {
  CONTAINS = "CONTAINS",
  NOT_CONTAINS = "NOT_CONTAINS",
}

type TargetingRule = {
  id: string;
  type: RuleType;
  value: string;
};

const PageTargeting = ({ classes }: any) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state: any) => state.core);
  const ruleTypes: Record<RuleType, string> = {
    [RuleType.CONTAINS]: t("PopupTriggers.pageTargeting.ruleTypes.contains"),
    [RuleType.NOT_CONTAINS]: t("PopupTriggers.pageTargeting.ruleTypes.notContains"),
  };

  const [rules, setRules] = useState<TargetingRule[]>([
    { id: "1", type: RuleType.CONTAINS, value: "product" },
    { id: "2", type: RuleType.NOT_CONTAINS, value: "checkout" },
  ]);

  const handleAddRule = () => {
    const newRule: TargetingRule = {
      id: uuidv4(),
      type: RuleType.CONTAINS,
      value: "",
    };
    setRules([...rules, newRule]);
  };

  const handleUpdateRule = (id: string, field: keyof TargetingRule, value: string) => {
    setRules(
      rules.map((rule) =>
        rule.id === id
          ? { ...rule, [field]: field === "type" ? (value as RuleType) : value }
          : rule
      )
    );
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  return (
    <Box sx={{ margin: "auto", mt: 4 }}>
      <Card raised sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box className={clsx(classes.topHeaderPopupTrigger, classes.p10)} mb={4}>
            <Typography variant="h5" gutterBottom className={classes.bold} fontWeight="bold">
              {t("PopupTriggers.pageTargeting.title")}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }} className={classes.subtitlePopupTrigger}>
              {t("PopupTriggers.pageTargeting.subtitle")}
            </Typography>
          </Box>

          <Box
            sx={{
              border: "2px dashed",
              borderColor: "grey.300",
              borderRadius: 2,
              p: 3,
              mx: 4,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {rules.map((rule) => (
                <Box
                  key={rule.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                  }}
                >
                  <Select
                    value={rule.type}
                    onChange={(e: SelectChangeEvent<string>) =>
                      handleUpdateRule(rule.id, "type", e.target.value as RuleType)
                    }
                    sx={{ flex: 1, minWidth: 200, bgcolor: "common.white" }}
                  >
                    {Object.entries(ruleTypes).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>

                  <TextField
                    value={rule.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleUpdateRule(rule.id, "value", e.target.value)
                    }
                    variant="outlined"
                    sx={{ flex: 2, bgcolor: "common.white" }}
                  />

                  <IconButton
                    aria-label={t("delete")}
                    onClick={() => handleDeleteRule(rule.id)}
                    sx={{
                      border: "1px solid #FF3343",
                      borderRadius: "12px",
                      background:
                        "linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)",
                      color: "#fff",
                      boxShadow: "0px 3px 6px rgba(0,0,0,0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "#fff",
                        color: "#FF3343",
                        "& svg": {
                          fill: "#FF3343",
                        },
                      },
                    }}
                  >
                    <MdDelete />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Button
              variant="contained"
              startIcon={<MdAdd />}
              onClick={handleAddRule}
              sx={{
                mt: 2,
                ml: 1.75,
                mr: isRTL ? 1.25 : 'auto',
                border: "1px solid #FF3343",
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                background:
                  "linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)",
                color: "#fff",
                boxShadow: "0px 3px 6px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "#fff",
                  color: "#FF3343",
                  borderColor: "#FF3343",
                  "& svg": {
                    fill: "#FF3343",
                  },
                },
              }}
            >
              {t("PopupTriggers.pageTargeting.addRule")}
            </Button>
          </Box>

          <Box sx={{ mt: 2, mx: 4 }}>
            <Typography variant="body1" color="textSecondary" display="block">
              {t("PopupTriggers.pageTargeting.examples.line1")}
            </Typography>
            <Typography variant="body1" color="textSecondary" display="block">
              {t("PopupTriggers.pageTargeting.examples.line2")}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PageTargeting;
