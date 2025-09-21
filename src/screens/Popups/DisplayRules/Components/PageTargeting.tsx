import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd } from 'react-icons/md';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';
import { DeleteIcon } from '../../../../assets/images/managment';
import {
  Button, IconButton, Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  TextField,
} from '@material-ui/core';

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
    <Box className={classes.pageTargetingResponsiveContainer}>
      <Card raised className={classes.pageTargetingCard}>
        <CardContent className={classes.pageTargetingCardContent}>
          <Box
            className={clsx(
              classes?.topHeaderPopupTrigger,
              classes?.p10,
              classes.pageTargetingResponsiveHeader
            )}
            mb={4}
          >
            <Typography
              variant="body1"
              className={clsx(
                classes?.managementTitle,
                classes?.sectionTitlePageTargetting
              )}
              gutterBottom
            >
              {t("PopupTriggers.pageTargeting.title")}
            </Typography>
            <Typography
              variant="body1"
              className={classes?.subtitlePopupTrigger}
            >
              {t("PopupTriggers.pageTargeting.subtitle")}
            </Typography>
          </Box>
          <Box className={classes.pageTargetingResponsiveDashedBox}>
            <Box className={classes.pageTargetingResponsiveGap}>
              {rules.map((rule) => (
                <Box key={rule.id} className={classes.pageTargetingResponsiveRuleItem}>
                  <Box className={classes.pageTargetingResponsiveFormControls}>
                    <Select
                      value={rule.type}
                      onChange={(e: React.ChangeEvent<{ name?: string; value: unknown }>) =>
                        handleUpdateRule(rule.id, "type", e.target.value as RuleType)
                      }
                      className={classes.pageTargetingSelectField}
                    >
                      {Object.entries(ruleTypes).map(([key, value]) => (
                        <MenuItem
                          key={key}
                          value={key}
                          className={classes.pageTargetingMenuItem}
                        >
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
                      className={classes.pageTargetingTextField}
                    />
                  </Box>
                  <IconButton
                    aria-label={t("delete")}
                    onClick={() => handleDeleteRule(rule.id)}
                    className={clsx(classes.pageTargetingDeleteButton, classes.sendIcon)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <Button
              variant="contained"
              startIcon={<MdAdd />}
              onClick={handleAddRule}
              className={clsx(classes.btn, classes.btnRounded, classes.addRuleButton, classes.mobileFullWidth)}
            >
              {t("PopupTriggers.pageTargeting.addRule")}
            </Button>
          </Box>

          <Box className={classes.pageTargetingResponsiveExamples}>
            <Typography
              variant="body1"
              className={classes?.grayTextCell}
              display="block"
            >
              {t("PopupTriggers.pageTargeting.examples.line1")}
            </Typography>
            <Typography
              variant="body1"
              className={classes?.grayTextCell}
              display="block"
            >
              {t("PopupTriggers.pageTargeting.examples.line2")}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PageTargeting;