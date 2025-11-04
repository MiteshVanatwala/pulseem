import React from "react";
import { useTranslation } from "react-i18next";
import { MdAdd } from "react-icons/md";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";
import { DeleteIcon } from "../../../../assets/images/managment";
import {
  Button,
  IconButton,
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  TextField,
} from "@material-ui/core";
import PulseemSwitch from "../../../../components/Controlls/PulseemSwitch";

export type TargetingRule = {
  id: string;
  type: string;
  value: string;
};

const PageTargeting = ({ classes, lookupData, show, onToggle, rules, onRulesChange }: any) => {
  const { t } = useTranslation();

  const handleAddRule = () => {
    const defaultCondition = lookupData?.ConditionTypes?.find(
      (c: any) => c.Name === "Contains"
    );
    const defaultTypeName = defaultCondition ? defaultCondition.Name : "Contains";

    const newRule: TargetingRule = {
      id: uuidv4(),
      type: defaultTypeName,
      value: "",
    };
    onRulesChange([...rules, newRule]);
  };

  const handleUpdateRule = (
    id: string,
    field: keyof TargetingRule,
    value: string
  ) => {
    onRulesChange(
      rules.map((rule: any) =>
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    );
  };

  const handleDeleteRule = (id: string) => {
    onRulesChange(rules.filter((rule: TargetingRule) => rule.id !== id));
  };

  return (
    <Box className={classes.pageTargetingResponsiveContainer}>
      <Card raised className={classes.pageTargetingCard}>
        <CardContent className={classes.pageTargetingCardContent}>
          <Box
            className={clsx(
              classes?.topHeaderPopupTrigger,
              classes?.p10,
              classes.pageTargetingResponsiveHeader,
              classes.spaceBetween,
            )}
            alignItems="center"
            mb={show && 4}
          >
            <div>
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
            </div>
            <PulseemSwitch
              switchType="ios"
              id="popupTriggers-toggle"
              checked={show}
              onChange={onToggle}
              classes={classes}
            />
          </Box>
          {show && (
            <>
              <Box className={classes.pageTargetingResponsiveDashedBox}>
                <Box className={classes.pageTargetingResponsiveGap}>
                  {rules.map((rule: any) => (
                    <Box key={rule.id} className={classes.pageTargetingResponsiveRuleItem}>
                      <Box className={classes.pageTargetingResponsiveFormControls}>
                        <Select
                          value={rule.type}
                          onChange={(
                            e: React.ChangeEvent<{ name?: string; value: unknown }>
                          ) =>
                            handleUpdateRule(
                              rule.id,
                              "type",
                              e.target.value as string
                            )
                          }
                          className={classes.pageTargetingSelectField}
                        >
                          {lookupData?.ConditionTypes?.map((conditionType: any) => (
                            <MenuItem
                              key={conditionType.Id}
                              value={conditionType.Name}
                              className={classes.pageTargetingMenuItem}
                            >
                              {conditionType.Name === 'Contains' ? t("common.contains") : conditionType.Name === 'Not contains' ? t("common.notContains") : t("common.equal") }
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
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PageTargeting;