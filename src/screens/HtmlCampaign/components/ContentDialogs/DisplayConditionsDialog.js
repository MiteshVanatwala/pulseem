import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Button,
  FormControlLabel,
  Checkbox,
  useTheme,
} from '@material-ui/core';
import clsx from 'clsx';
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';
import { getAccountExtraData } from '../../../../redux/reducers/smsSlice';
import { saveDisplayCondition, getDisplayConditions } from '../../../../redux/reducers/campaignEditorSlice';
import { AddCircleOutline, DeleteOutline } from '@material-ui/icons';
import { getGeneralStyle } from '../../../../style/classes/ganaralStyle';

const DisplayConditionsDialog = ({ onClose, save, args, classes }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { extraData = {} } = useSelector((state) => state.sms || {});

  const currentCondition = args?.currentCondition || null;

  const [name, setName] = useState(currentCondition?.label || '');
  const [description, setDescription] = useState(currentCondition?.description || '');
  const [matchType, setMatchType] = useState('all');
  const [rules, setRules] = useState([]);
  const [saveForFuture, setSaveForFuture] = useState(false);

  useEffect(() => {
    if (!extraData || Object.keys(extraData).length === 0) {
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
      ExtraField1: extraData.ExtraField1 || t('common.ExtraField1'),
      ExtraField2: extraData.ExtraField2 || t('common.ExtraField2'),
      ExtraField3: extraData.ExtraField3 || t('common.ExtraField3'),
      ExtraField4: extraData.ExtraField4 || t('common.ExtraField4'),
      ExtraField5: extraData.ExtraField5 || t('common.ExtraField5'),
      ExtraField6: extraData.ExtraField6 || t('common.ExtraField6'),
      ExtraField7: extraData.ExtraField7 || t('common.ExtraField7'),
      ExtraField8: extraData.ExtraField8 || t('common.ExtraField8'),
      ExtraField9: extraData.ExtraField9 || t('common.ExtraField9'),
      ExtraField10: extraData.ExtraField10 || t('common.ExtraField10'),
      ExtraField11: extraData.ExtraField11 || t('common.ExtraField11'),
      ExtraField12: extraData.ExtraField12 || t('common.ExtraField12'),
      ExtraField13: extraData.ExtraField13 || t('common.ExtraField13'),
      ExtraDate1: extraData.ExtraDate1 || t('common.ExtraDate1'),
      ExtraDate2: extraData.ExtraDate2 || t('common.ExtraDate2'),
      ExtraDate3: extraData.ExtraDate3 || t('common.ExtraDate3'),
      ExtraDate4: extraData.ExtraDate4 || t('common.ExtraDate4'),
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
      { value: 'eq', label: t('campaigns.displayConditions.operator.equals') || '=' },
      { value: 'neq', label: t('campaigns.displayConditions.operator.notEquals') || '≠' },
      { value: 'contains', label: t('campaigns.displayConditions.operator.contains') || t('common.contains') },
      { value: 'empty', label: t('campaigns.displayConditions.operator.empty') || t('common.empty') },
      { value: 'not_empty', label: t('campaigns.displayConditions.operator.notEmpty') || t('common.notEmpty') },
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

    if (!parts.length) return '';

    const joiner = matchType === 'all' ? ' and ' : ' or ';
    return parts.join(joiner);
  };

  const previewExpression = buildExpression();

  const handleRuleChange = (id, key, value) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, [key]: value } : r
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

  const handleSave = async (event) => {
    event?.preventDefault();
    
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

    const conditionLabel = name && name.trim() !== '' ? name.trim() : defaultLabelParts.filter(Boolean).join(' ');

    const condition = {
      type: 'Recipient fields',
      label: conditionLabel,
      description,
      before: `{% if ${previewExpression} %}`,
      after: '{% endif %}',
    };

    if (saveForFuture) {
      try {
        const saveData = {
          Name: conditionLabel,
          Type: 'Recipient fields',
          Description: description,
          SyntaxBefore: condition.before,
          SyntaxAfter: condition.after
        };
        
        await dispatch(saveDisplayCondition(saveData));
        await dispatch(getDisplayConditions());
        
        // Mark that a new condition was created and trigger refresh
        condition.isNewCondition = true;
        window.dispatchEvent(new CustomEvent('refreshDisplayConditions'));
      } catch (error) {
        console.error('Error saving condition:', error);
      }
    }

    save(condition);
    onClose();
  };

  const styles = getGeneralStyle('lg', false, theme);

  return (
    <BaseDialog
      classes={classes}
      open={true}
      onClose={onClose}
      onCancel={onClose}
      onConfirm={handleSave}
      title={t('campaigns.displayConditions.title') || 'Display Condition'}
      maxWidth={false}
      fullWidth={false}
      PaperProps={{ 
        style: {
          ...styles.displayConditionDialogPaperProps,
          minWidth: '900px !important',
          width: '900px !important'
        }
      }}
    >
      <Box style={styles.displayConditionMainContainer}>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <Box style={styles.displayConditionConditionNameBox}>
              <Box>
                <Typography variant="body2" style={styles.displayConditionLabelTypography}>
                  Condition name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="People"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="body2" style={styles.displayConditionLabelTypography}>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  placeholder="People in Boston, US"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                />
              </Box>

              <Box style={styles.displayConditionMatchBox}>
                <Typography variant="body2" style={styles.displayConditionMatchLabel}>
                  Match
                </Typography>
                <FormControl variant="outlined" size="small" style={styles.displayConditionMatchFormControl}>
                  <Select value={matchType} onChange={(e) => setMatchType(e.target.value)}>
                    <MenuItem value="all">all</MenuItem>
                    <MenuItem value="any">any</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="body2" style={styles.displayConditionMatchLabel}>
                  of the following conditions:
                </Typography>
                <Button
                  startIcon={<AddCircleOutline />}
                  onClick={handleAddRule}
                  size="small"
                  style={styles.displayConditionAddButton}
                >
                  Add
                </Button>
              </Box>

              <Box style={styles.displayConditionRulesContainer}>
                {rules.map((rule) => (
                  <Box key={rule.id} style={styles.displayConditionRuleRow}>
                    <FormControl variant="outlined" size="small" style={styles.displayConditionFieldFormControl}>
                      <Select value={rule.field} onChange={(e) => handleRuleChange(rule.id, 'field', e.target.value)}>
                        {allFields.map((field) => (
                          <MenuItem key={field.key} value={field.key} style={styles.displayConditionMenuItem}>
                            {field.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl variant="outlined" size="small" style={styles.displayConditionOperatorFormControl}>
                      <Select value={rule.operator} onChange={(e) => handleRuleChange(rule.id, 'operator', e.target.value)}>
                        {operatorOptions.map((op) => (
                          <MenuItem key={op.value} value={op.value}>
                            {op.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {rule.operator !== 'empty' && rule.operator !== 'not_empty' && (
                      <TextField
                        variant="outlined"
                        size="small"
                        style={styles.displayConditionValueTextField}
                        value={rule.value}
                        onChange={(e) => handleRuleChange(rule.id, 'value', e.target.value)}
                      />
                    )}

                    <IconButton
                      size="small"
                      onClick={() => handleRemoveRule(rule.id)}
                      disabled={rules.length === 1}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={saveForFuture}
                    onChange={(e) => setSaveForFuture(e.target.checked)}
                    color="primary"
                  />
                }
                label="Save this condition for future use"
              />
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box style={styles.displayConditionPreviewBox}>
              <Typography variant="body2" style={styles.displayConditionPreviewTitle}>
                PREVIEW
              </Typography>

              <Box style={styles.displayConditionPreviewContent}>
                <Box style={styles.displayConditionPreviewItemBox}>
                  <Typography variant="caption" style={styles.displayConditionPreviewCaption}>
                    Name:
                  </Typography>
                  <Typography variant="body2" style={styles.displayConditionPreviewBody}>
                    {name || 'People'}
                  </Typography>
                </Box>

                <Box style={styles.displayConditionPreviewItemBox}>
                  <Typography variant="caption" style={styles.displayConditionPreviewCaption}>
                    Description:
                  </Typography>
                  <Typography variant="body2" style={styles.displayConditionPreviewBody}>
                    {description || 'People in Boston, US'}
                  </Typography>
                </Box>

                <Box style={styles.displayConditionPreviewItemBox}>
                  <Typography variant="caption" style={styles.displayConditionPreviewCaption}>
                    Before:
                  </Typography>
                  <Box style={styles.displayConditionCodeBox}>
                    {previewExpression ? `{% if ${previewExpression} %}` : '{%if %}'}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" style={styles.displayConditionPreviewCaption}>
                    After:
                  </Typography>
                  <Box style={styles.displayConditionCodeBox}>
                    {`{% endif %}`}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </BaseDialog>
  );
};

export default DisplayConditionsDialog;
