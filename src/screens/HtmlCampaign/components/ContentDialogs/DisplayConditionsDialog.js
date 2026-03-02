import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Button,
} from '@material-ui/core';
import clsx from 'clsx';
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';
import { getAccountExtraData } from '../../../../redux/reducers/smsSlice';
import { AddCircleOutline, DeleteOutline } from '@material-ui/icons';

const DisplayConditionsDialog = ({ onClose, save, args, classes }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { extraData = {} } = useSelector((state) => state.sms || {});

  const currentCondition = args?.currentCondition || null;

  const [name, setName] = useState(currentCondition?.label || '');
  const [description, setDescription] = useState(currentCondition?.description || '');
  const [matchType, setMatchType] = useState('all'); // 'all' | 'any'
  const [rules, setRules] = useState([]);

  useEffect(() => {
    if (!extraData || Object.keys(extraData).length === 0) {
      // @ts-ignore
      dispatch(getAccountExtraData());
    }
  }, [dispatch, extraData]);

  const baseFields = useMemo(
    () => [
      { key: 'FirstName', label: t('common.first_name') },
      { key: 'LastName', label: t('common.last_name') },
      { key: 'Email', label: t('common.email') },
      { key: 'Cellphone', label: t('common.cellphone') },
      { key: 'City', label: t('common.city') },
      { key: 'Country', label: t('common.country') },
      { key: 'Company', label: t('common.company') },
      { key: 'State', label: t('common.state') },
    ],
    [t]
  );

  const mergedExtraFields = useMemo(() => {
    return {
      ExtraField1:
        extraData.ExtraField1 && extraData.ExtraField1 !== ''
          ? extraData.ExtraField1
          : t('common.ExtraField1'),
      ExtraField2:
        extraData.ExtraField2 && extraData.ExtraField2 !== ''
          ? extraData.ExtraField2
          : t('common.ExtraField2'),
      ExtraField3:
        extraData.ExtraField3 && extraData.ExtraField3 !== ''
          ? extraData.ExtraField3
          : t('common.ExtraField3'),
      ExtraField4:
        extraData.ExtraField4 && extraData.ExtraField4 !== ''
          ? extraData.ExtraField4
          : t('common.ExtraField4'),
      ExtraField5:
        extraData.ExtraField5 && extraData.ExtraField5 !== ''
          ? extraData.ExtraField5
          : t('common.ExtraField5'),
      ExtraField6:
        extraData.ExtraField6 && extraData.ExtraField6 !== ''
          ? extraData.ExtraField6
          : t('common.ExtraField6'),
      ExtraField7:
        extraData.ExtraField7 && extraData.ExtraField7 !== ''
          ? extraData.ExtraField7
          : t('common.ExtraField7'),
      ExtraField8:
        extraData.ExtraField8 && extraData.ExtraField8 !== ''
          ? extraData.ExtraField8
          : t('common.ExtraField8'),
      ExtraField9:
        extraData.ExtraField9 && extraData.ExtraField9 !== ''
          ? extraData.ExtraField9
          : t('common.ExtraField9'),
      ExtraField10:
        extraData.ExtraField10 && extraData.ExtraField10 !== ''
          ? extraData.ExtraField10
          : t('common.ExtraField10'),
      ExtraField11:
        extraData.ExtraField11 && extraData.ExtraField11 !== ''
          ? extraData.ExtraField11
          : t('common.ExtraField11'),
      ExtraField12:
        extraData.ExtraField12 && extraData.ExtraField12 !== ''
          ? extraData.ExtraField12
          : t('common.ExtraField12'),
      ExtraField13:
        extraData.ExtraField13 && extraData.ExtraField13 !== ''
          ? extraData.ExtraField13
          : t('common.ExtraField13'),
      ExtraDate1:
        extraData.ExtraDate1 && extraData.ExtraDate1 !== ''
          ? extraData.ExtraDate1
          : t('common.ExtraDate1'),
      ExtraDate2:
        extraData.ExtraDate2 && extraData.ExtraDate2 !== ''
          ? extraData.ExtraDate2
          : t('common.ExtraDate2'),
      ExtraDate3:
        extraData.ExtraDate3 && extraData.ExtraDate3 !== ''
          ? extraData.ExtraDate3
          : t('common.ExtraDate3'),
      ExtraDate4:
        extraData.ExtraDate4 && extraData.ExtraDate4 !== ''
          ? extraData.ExtraDate4
          : t('common.ExtraDate4'),
    };
  }, [extraData, t]);

  const extraFieldsList = useMemo(
    () =>
      Object.keys(mergedExtraFields).map((key) => ({
        key,
        label: mergedExtraFields[key],
      })),
    [mergedExtraFields]
  );

  const allFields = useMemo(() => [...baseFields, ...extraFieldsList], [baseFields, extraFieldsList]);

  useEffect(() => {
    if (!rules.length && allFields.length > 0) {
      setRules([
        {
          id: 'rule-0',
          field: allFields[0].key,
          operator: 'eq',
          value: '',
        },
      ]);
    }
  }, [allFields, rules.length]);

  const operatorOptions = useMemo(
    () => [
      {
        value: 'eq',
        label: t('campaigns.displayConditions.operator.equals') || '=',
      },
      {
        value: 'neq',
        label: t('campaigns.displayConditions.operator.notEquals') || '≠',
      },
      {
        value: 'contains',
        label: t('campaigns.displayConditions.operator.contains') || t('common.contains'),
      },
      {
        value: 'empty',
        label: t('campaigns.displayConditions.operator.empty') || t('common.empty'),
      },
      {
        value: 'not_empty',
        label: t('campaigns.displayConditions.operator.notEmpty') || t('common.notEmpty'),
      },
    ],
    [t]
  );

  const getFieldLabel = useCallback(
    (key) => {
      const found = allFields.find((f) => f.key === key);
      return found ? found.label : key;
    },
    [allFields]
  );

  const escapeValue = (val) => (val || '').replace(/'/g, "\\'");

  const buildRuleExpression = (rule) => {
    if (!rule.field) return '';
    const fieldExpr = `recipient.${rule.field}`;
    const safeValue = escapeValue(rule.value);

    switch (rule.operator) {
      case 'eq':
        if (!safeValue) return '';
        return `${fieldExpr} == '${safeValue}'`;
      case 'neq':
        if (!safeValue) return '';
        return `${fieldExpr} != '${safeValue}'`;
      case 'contains':
        if (!safeValue) return '';
        return `${fieldExpr} contains '${safeValue}'`;
      case 'empty':
        return `${fieldExpr} == ''`;
      case 'not_empty':
        return `${fieldExpr} != ''`;
      default:
        return '';
    }
  };

  const buildExpression = () => {
    const parts = rules
      .map((r) => buildRuleExpression(r))
      .filter((p) => p && p.trim().length > 0);

    if (!parts.length) {
      return '';
    }

    const joiner = matchType === 'all' ? ' and ' : ' or ';
    return parts.join(joiner);
  };

  const previewExpression = buildExpression();

  const handleRuleChange = (id, key, value) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              [key]: value,
            }
          : r
      )
    );
  };

  const handleAddRule = () => {
    const defaultField = allFields[0]?.key || '';
    setRules((prev) => [
      ...prev,
      {
        id: `rule-${prev.length}`,
        field: defaultField,
        operator: 'eq',
        value: '',
      },
    ]);
  };

  const handleRemoveRule = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = () => {
    if (!previewExpression) {
      onClose();
      return;
    }

    const defaultLabelParts = [];
    if (rules.length === 1) {
      const rule = rules[0];
      defaultLabelParts.push(getFieldLabel(rule.field));
      const opLabel = operatorOptions.find((o) => o.value === rule.operator)?.label;
      if (opLabel) defaultLabelParts.push(opLabel);
      if (rule.operator !== 'empty' && rule.operator !== 'not_empty') {
        defaultLabelParts.push(rule.value);
      }
    } else {
      defaultLabelParts.push(
        matchType === 'all'
          ? 'All selected conditions'
          : 'Any of the selected conditions'
      );
    }

    const conditionLabel =
      name && name.trim() !== '' ? name.trim() : defaultLabelParts.filter(Boolean).join(' ');

    const condition = {
      type: 'Recipient fields',
      label: conditionLabel,
      description,
      before: `{% if ${previewExpression} %}`,
      after: '{% endif %}',
    };

    save(condition);
  };

  return (
    <BaseDialog
      classes={classes}
      key={456}
      disableBackdropClick={true}
      open={true}
      title={t('campaigns.displayConditions.title') || 'Display condition'}
      cancelText="common.cancel"
      confirmText="common.save"
      showDefaultButtons={true}
      onConfirm={handleSave}
      onClose={onClose}
    >
      <Box className={clsx(classes.mt15, classes.mb15)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label={t('campaigns.displayConditions.name') || t('common.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={clsx(classes.textField)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              size="small"
              label={t('campaigns.displayConditions.description') || t('common.description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={clsx(classes.textField)}
            />
          </Grid>
          <Grid item xs={12}>
            <Box className={clsx(classes.mt15, classes.mb10, classes.dFlex, classes.alignCenter)}>
              <Typography style={{ marginInlineEnd: 8 }}>
                Contacts match
              </Typography>
              <FormControl variant="outlined" size="small" style={{ minWidth: 120, marginInlineEnd: 8 }}>
                <Select
                  value={matchType}
                  onChange={(e) => setMatchType(e.target.value)}
                >
                  <MenuItem value="all">all</MenuItem>
                  <MenuItem value="any">any</MenuItem>
                </Select>
              </FormControl>
              <Typography style={{ marginInlineEnd: 8 }}>
                of the following conditions:
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddCircleOutline />}
                onClick={handleAddRule}
              >
                Add
              </Button>
            </Box>
          </Grid>
          {rules.map((rule) => (
            <Grid item xs={12} key={rule.id}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} md={4}>
                  <FormControl
                    variant="outlined"
                    size="small"
                    className={clsx(classes.textField, classes.w100)}
                  >
                    <InputLabel>
                      {t('campaigns.displayConditions.field') || t('common.field')}
                    </InputLabel>
                    <Select
                      value={rule.field}
                      onChange={(e) => handleRuleChange(rule.id, 'field', e.target.value)}
                      label={t('campaigns.displayConditions.field') || t('common.field')}
                    >
                      {allFields.map((f) => (
                        <MenuItem key={f.key} value={f.key}>
                          {f.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl
                    variant="outlined"
                    size="small"
                    className={clsx(classes.textField, classes.w100)}
                  >
                    <InputLabel>
                      {t('campaigns.displayConditions.operator.label') || t('common.operator')}
                    </InputLabel>
                    <Select
                      value={rule.operator}
                      onChange={(e) =>
                        handleRuleChange(rule.id, 'operator', e.target.value)
                      }
                      label={t('campaigns.displayConditions.operator.label') || t('common.operator')}
                    >
                      {operatorOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={rule.operator === 'empty' || rule.operator === 'not_empty'}
                    label={t('campaigns.displayConditions.value') || t('common.value')}
                    value={rule.value}
                    onChange={(e) =>
                      handleRuleChange(rule.id, 'value', e.target.value)
                    }
                    className={clsx(classes.textField)}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <IconButton
                    onClick={() => handleRemoveRule(rule.id)}
                    aria-label="remove condition"
                  >
                    <DeleteOutline />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Box className={clsx(classes.mt15)}>
              <Typography className={clsx(classes.f18, classes.mb5)}>
                {t('campaigns.displayConditions.preview') || t('common.preview')}
              </Typography>
              <Box className={clsx(classes.p10)} style={{ backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                <Typography variant="body2" style={{ wordBreak: 'break-all' }}>
                  {previewExpression
                    ? `{% if ${previewExpression} %} ... {% endif %}`
                    : t('campaigns.displayConditions.previewEmpty') ||
                      t('common.Notice')}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </BaseDialog>
  );
};

export default DisplayConditionsDialog;

