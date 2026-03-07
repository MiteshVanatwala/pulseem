import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
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
import { saveDisplayCondition, getDisplayConditions, deleteDisplayCondition } from '../../../../redux/reducers/campaignEditorSlice';
import { AddCircleOutline, DeleteOutline, Delete } from '@material-ui/icons';
import { getGeneralStyle } from '../../../../style/classes/ganaralStyle';

const DisplayConditionsDialog = ({ onClose, save, args, classes }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { extraData = {} } = useSelector((state) => state.sms || {});
  const displayConditions = useSelector((state) => state.campaignEditor?.displayConditions || []);

  const currentCondition = args?.currentCondition || null;
  const onRefreshConditions = args?.onRefreshConditions;
  const isEditing = !!currentCondition?.id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [matchType, setMatchType] = useState('all');
  const [rules, setRules] = useState([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!extraData || Object.keys(extraData).length === 0) {
      dispatch(getAccountExtraData());
    }
  }, []);

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

  const parseRulesFromSyntax = (syntaxBefore) => {
    if (!syntaxBefore) return [];
    const rules = [];
    const regex = /recipient\.(\w+)\s*(==|!=|contains)\s*'([^']*)'/g;
    let match;
    let index = 0;
    while ((match = regex.exec(syntaxBefore)) !== null) {
      const field = match[1];
      const operator = match[2] === '==' ? 'eq' : match[2] === '!=' ? 'neq' : 'contains';
      const value = match[3];
      rules.push({
        id: `rule-${index}`,
        field,
        operator,
        value
      });
      index++;
    }
    return rules;
  };

  useEffect(() => {
    if (!initializedRef.current) {
      let conditionToUse = currentCondition;
      
      if (isEditing && currentCondition?.id && !currentCondition?.before) {
        conditionToUse = displayConditions?.find(c => c.id === currentCondition.id || c.ID === currentCondition.id) || currentCondition;
      }
      
      if (isEditing && conditionToUse) {
        setName(conditionToUse.label || conditionToUse.name || '');
        setDescription(conditionToUse.description || '');
        const parsedRules = parseRulesFromSyntax(conditionToUse.before);
        setRules(parsedRules.length > 0 ? parsedRules : [
          {
            id: 'rule-0',
            field: allFields[0]?.key || 'FirstName',
            operator: 'eq',
            value: '',
          },
        ]);
      } else {
        setRules([
          {
            id: 'rule-0',
            field: allFields[0]?.key || 'FirstName',
            operator: 'eq',
            value: '',
          },
        ]);
      }
      initializedRef.current = true;
    }
  }, []);

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

  const handleDelete = async () => {
    if (!isEditing || !currentCondition?.id) return;
    
    try {
      console.log('Delete started for condition:', currentCondition.id);
      const deleteResult = await dispatch(deleteDisplayCondition(currentCondition.id));
      console.log('Delete result:', deleteResult);
      console.log('Calling onRefreshConditions');
      onRefreshConditions?.();
      onClose();
    } catch (error) {
      console.error('Error deleting condition:', error);
    }
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
    const beforeSyntax = `{% if ${previewExpression} %}`;
    const afterSyntax = '{% endif %}';

    const condition = {
      type: 'Recipient fields',
      label: conditionLabel,
      description,
      before: beforeSyntax,
      after: afterSyntax,
    };

    try {
      const saveData = {
        Name: conditionLabel,
        Type: 'Recipient fields',
        Description: description,
        SyntaxBefore: beforeSyntax,
        SyntaxAfter: afterSyntax
      };
      
      if (isEditing) {
        saveData.id = currentCondition.id;
      }
      
      const result = await dispatch(saveDisplayCondition(saveData));
      condition.isNewCondition = !isEditing;
      condition.id = result?.payload?.id || currentCondition?.id;
      
      await dispatch(getDisplayConditions());
      onRefreshConditions?.();
    } catch (error) {
      console.error('Error saving condition:', error);
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
      title={isEditing ? 'Edit Display Condition' : (t('campaigns.displayConditions.title') || 'Display Condition')}
      maxWidth={false}
      fullWidth={false}
      showDefaultButtons={!isEditing}
      renderButtons={isEditing ? () => (
        <Box style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Button
            onClick={handleDelete}
            className={clsx(classes.btn, classes.btnRounded)}
            startIcon={<Delete />}
          >
            {t('campaigns.displayConditions.delete')}
          </Button>
          <Button onClick={onClose} className={clsx(classes.btn, classes.btnRounded)}>
            {t('campaigns.displayConditions.cancel')}
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary" style={{ borderRadius: '20px', paddingLeft: '24px', paddingRight: '24px' }}>
            {t('campaigns.displayConditions.save')}
          </Button>
        </Box>
      ) : undefined}
      PaperProps={{ 
        style: {
          ...styles.displayConditionDialogPaperProps,
          minWidth: '1000px !important',
          width: '1000px !important'
        }
      }}
    >
      <Box style={{...styles.displayConditionMainContainer, padding: '0px'}}>
        <Grid container spacing={0}>
          <Grid item xs={8}>
            <Box style={{...styles.displayConditionConditionNameBox, padding: '10px'}}>
              <Box>
                <Typography variant="body2" style={styles.displayConditionLabelTypography}>
                  {t('campaigns.displayConditions.name')}
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
                  {t('campaigns.displayConditions.description')}
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
                  {t('campaigns.displayConditions.matchType')}
                </Typography>
                <FormControl variant="outlined" size="small" style={styles.displayConditionMatchFormControl}>
                  <Select value={matchType} onChange={(e) => setMatchType(e.target.value)}>
                    <MenuItem value="all">{t('campaigns.displayConditions.matchAllConditions')}</MenuItem>
                    <MenuItem value="any">{t('campaigns.displayConditions.matchAnyConditions')}</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="body2" style={styles.displayConditionMatchLabel}>
                  {t('campaigns.displayConditions.ofTheFollowingConditions')}
                </Typography>
              </Box>

              <Box style={{display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '100%'}}>
                {rules.map((rule) => (
                  <Box key={rule.id} style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 40px', gap: '8px', alignItems: 'center'}}>
                    <FormControl variant="outlined" size="small">
                      <Select value={rule.field} onChange={(e) => handleRuleChange(rule.id, 'field', e.target.value)}>
                        {allFields.map((field) => (
                          <MenuItem key={field.key} value={field.key}>
                            {field.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl variant="outlined" size="small">
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
            </Box>
          </Grid>

          <Grid item xs={4}>
            <Box style={{...styles.displayConditionPreviewBox, padding: '10px', maxHeight: '450px', overflowY: 'auto'}}>
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
