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
import { KeyboardDatePicker } from '@material-ui/pickers';
import moment from 'moment';
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
  const { isRTL } = useSelector((state) => state.core);
  const displayConditions = useSelector((state) => state.campaignEditor?.displayConditions || []);

  const currentCondition = args?.currentCondition || null;
  const onRefreshConditions = args?.onRefreshConditions;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [matchType, setMatchType] = useState('all');
  const [rules, setRules] = useState([]);
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const initializedRef = useRef(false);
  const ruleIdCounter = useRef(0);

  const nextRuleId = () => `rule-${++ruleIdCounter.current}`;

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
      { key: 'BirthDate', label: t('common.birth_date') },
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

  const getConditionId = useCallback((condition) => {
    if (!condition) return null;
    return condition.id ?? condition.ID ?? null;
  }, []);

  const findMatchingCondition = useCallback((conditionsList, condition) => {
    if (!condition || !Array.isArray(conditionsList)) return null;

    // 1st priority: match by unique id
    const conditionId = getConditionId(condition);
    if (conditionId !== null && conditionId !== undefined) {
      const matchedById = conditionsList.find((item) => getConditionId(item) === conditionId);
      if (matchedById) return matchedById;
    }

    // 2nd priority: match by unique before syntax only (after is always "{% endif %}" — not unique)
    const conditionBefore = condition.before || condition.SyntaxBefore || '';
    if (conditionBefore) {
      const matchedByBefore = conditionsList.find((item) => (item.before || item.SyntaxBefore || '') === conditionBefore);
      if (matchedByBefore) return matchedByBefore;
    }

    return null;
  }, [getConditionId]);

  const resolvedCurrentCondition = useMemo(() => {
    if (!currentCondition) return null;

    const matchedCondition = findMatchingCondition(displayConditions, currentCondition);
    return matchedCondition || currentCondition;
  }, [currentCondition, displayConditions, findMatchingCondition]);

  const currentConditionId = getConditionId(resolvedCurrentCondition);
  const isEditing = !!resolvedCurrentCondition;

  const parseRulesFromSyntax = (syntaxBefore) => {
    if (!syntaxBefore) return [];
    const rules = [];
    const regex = /(?:recipient\.)?(\w+)\s*(>=|<=|>|<|==|!=|contains)\s*'([^']*)'/g;
    let match;
    let index = 0;
    while ((match = regex.exec(syntaxBefore)) !== null) {
      const field = match[1];
      const rawOp = match[2];
      const value = match[3];
      let operator;
      if (rawOp === 'contains') operator = 'contains';
      else if (rawOp === '==' && value === '') operator = 'empty';
      else if (rawOp === '!=' && value === '') operator = 'not_empty';
      else if (rawOp === '==') operator = 'eq';
      else if (rawOp === '!=') operator = 'neq';
      else if (rawOp === '>') operator = 'gt';
      else if (rawOp === '<') operator = 'lt';
      else if (rawOp === '>=') operator = 'gte';
      else if (rawOp === '<=') operator = 'lte';
      else operator = 'eq';
      rules.push({
        id: nextRuleId(),
        field,
        operator,
        value: operator === 'empty' || operator === 'not_empty' ? '' : value
      });
      index++;
    }
    return rules;
  };

  useEffect(() => {
    if (initializedRef.current) return;

    // Wait until allFields is populated
    if (!allFields || allFields.length === 0) return;

    // In edit mode, wait until resolvedCurrentCondition is ready
    if (currentCondition && !resolvedCurrentCondition) return;

    const defaultRule = {
      id: nextRuleId(),
      field: allFields[0]?.key || 'FirstName',
      operator: 'eq',
      value: '',
    };

    if (isEditing && resolvedCurrentCondition) {
      const conditionToUse = resolvedCurrentCondition;
      const syntaxBefore = conditionToUse.before || conditionToUse.SyntaxBefore || '';
      const parsedRules = parseRulesFromSyntax(syntaxBefore);
      const resolvedLabel = conditionToUse.label || '';
      const resolvedName = conditionToUse.name || conditionToUse.Name || (resolvedLabel ? resolvedLabel.split('\n')[0] : '');
      const resolvedDescription = conditionToUse.description || conditionToUse.Description || '';

      setName(resolvedName);
      setDescription(resolvedDescription);
      setMatchType(/\sor\s/i.test(syntaxBefore) ? 'any' : 'all');
      setRules(parsedRules.length > 0 ? parsedRules : [defaultRule]);
    } else {
      setRules([defaultRule]);
    }

    initializedRef.current = true;
  }, [allFields, isEditing, resolvedCurrentCondition, currentCondition]);

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

  const dateOperatorOptions = useMemo(
    () => [
      { value: 'eq', label: t('campaigns.displayConditions.operator.equals') },
      // { value: 'neq', label: t('campaigns.displayConditions.operator.notEquals') },
      { value: 'gt', label: t('campaigns.displayConditions.operator.greaterThan') },
      { value: 'lt', label: t('campaigns.displayConditions.operator.lessThan') },
      { value: 'gte', label: t('campaigns.displayConditions.operator.greaterThanOrEqual') },
      { value: 'lte', label: t('campaigns.displayConditions.operator.lessThanOrEqual') },
    ],
    [t]
  );

  const getOperatorOptions = (field) => isDateField(field) ? dateOperatorOptions : operatorOptions;

  const getFieldLabel = useCallback(
    (key) => {
      const found = allFields.find((f) => f.key === key);
      return found ? found.label : key;
    },
    [allFields]
  );

  const DATE_FIELDS = ['ExtraDate1', 'ExtraDate2', 'ExtraDate3', 'ExtraDate4'];
  const isDateField = (field) => DATE_FIELDS.includes(field);

  const escapeValue = (val) => (val || '').replace(/'/g, "\\'");

  const buildRuleExpression = (rule) => {
    if (!rule.field) return '';
    const fieldExpr = rule.field;
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
      case 'gt':
        if (!safeValue) return '';
        return `${fieldExpr} > '${safeValue}'`;
      case 'lt':
        if (!safeValue) return '';
        return `${fieldExpr} < '${safeValue}'`;
      case 'gte':
        if (!safeValue) return '';
        return `${fieldExpr} >= '${safeValue}'`;
      case 'lte':
        if (!safeValue) return '';
        return `${fieldExpr} <= '${safeValue}'`;
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
    if (key === 'value') {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${id}-value`];
        return newErrors;
      });
    }
  };

  const handleNameChange = (event) => {
    const value = event.target.value;
    setName(value);
    setErrors((prev) => {
      if (!prev.name) return prev;

      const newErrors = { ...prev };
      delete newErrors.name;
      return newErrors;
    });
  };

  const handleDescriptionChange = (event) => {
    const value = event.target.value;
    setDescription(value);
    setErrors((prev) => {
      if (!prev.description) return prev;

      const newErrors = { ...prev };
      delete newErrors.description;
      return newErrors;
    });
  };

  const handleAddRule = () => {
    const defaultField = allFields[0]?.key || '';
    setRules((prev) => [
      ...prev,
      {
        id: nextRuleId(),
        field: defaultField,
        operator: 'eq',
        value: '',
      },
    ]);
  };

  const handleRemoveRule = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDeleteConfirmed = async () => {
    if (!isEditing || !currentConditionId) return;
    setShowDeleteConfirm(false);
    try {
      await dispatch(deleteDisplayCondition(currentConditionId)).unwrap();
      await onRefreshConditions?.(currentConditionId);
      save({ deleted: true, id: currentConditionId });
    } catch (error) {
      console.error('Error deleting condition:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name || name.trim() === '') {
      newErrors.name = t('common.requiredField');
    }

    if (!description || description.trim() === '') {
      newErrors.description = t('common.requiredField');
    }

    rules.forEach((rule) => {
      if (rule.operator !== 'empty' && rule.operator !== 'not_empty') {
        if (!rule.value || rule.value.trim() === '') {
          newErrors[`${rule.id}-value`] = t('campaigns.displayConditions.valueRequired');
        } else if (isDateField(rule.field)) {
          const parsedDate = moment(rule.value, 'DD/MM/YYYY', true);
          if (!parsedDate.isValid()) {
            newErrors[`${rule.id}-value`] = t('campaigns.displayConditions.invalidDate') || 'Invalid date';
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (event) => {
    event?.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!previewExpression) {
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
          ? t('campaigns.displayConditions.allSelectedConditions')
          : t('campaigns.displayConditions.anySelectedConditions')
      );
    }

    const conditionLabel = name && name.trim() !== '' ? name.trim() : defaultLabelParts.filter(Boolean).join(' ');

    const readableSummary = rules.map((rule) => {
      const fieldLabel = getFieldLabel(rule.field);
      const opLabel = operatorOptions.find((o) => o.value === rule.operator)?.label || rule.operator;
      if (rule.operator === 'empty' || rule.operator === 'not_empty') {
        return `${fieldLabel} ${opLabel}`;
      }
      return `${fieldLabel} ${opLabel} ‪"${rule.value}"‬`;
    }).join(matchType === 'all'
      ? ` ${t('campaigns.displayConditions.operator.and') || 'AND'} `
      : ` ${t('campaigns.displayConditions.operator.or') || 'OR'} `
    );

    const displayLabel = `${conditionLabel}\n${readableSummary}`;
    const beforeSyntax = `{% if ${previewExpression} %}`;
    const afterSyntax = '{% endif %}';

    const condition = {
      type: 'Recipient fields',
      label: displayLabel,
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
        saveData.id = currentConditionId;
      }

      condition.isNewCondition = !isEditing;
      const result = await dispatch(saveDisplayCondition(saveData));
      condition.id = result?.payload?.id || currentConditionId;

      save(condition);
      onRefreshConditions?.();
      return;
    } catch (error) {
      console.error('Error saving condition:', error);
    }
  };

  const styles = getGeneralStyle('lg', isRTL, theme);

  const fontSize15Style = { fontSize: 15 };

  return (
    <>
    <BaseDialog
      contentStyle={clsx(classes.maxWidth70VW)}
      childrenStyle={classes.displayConditionCustomStyle}
      classes={classes}
      open={true}
      onClose={onClose}
      onCancel={onClose}
      onConfirm={handleSave}
      title={isEditing ? t('campaigns.displayConditions.editDisplayCondition') : t('campaigns.displayConditions.title')}
      confirmText={'campaigns.displayConditions.save'}
      fullWidth={false}
      showDefaultButtons={!isEditing}
      renderButtons={isEditing ? () => (
        <Box style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
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
          ...styles.displayConditionPaperProps
        }
      }}
    >
      <Box style={{ ...styles.displayConditionMainContainer, ...styles.displayConditionMainBox }}>
        <Grid container spacing={0} style={styles.displayConditionGridContainer}>
          <Grid item xs={12} style={styles.displayConditionLeftGrid}>
            <Box style={{ ...styles.displayConditionConditionNameBox }}>
              <Box>
                <Typography variant="body2" style={{ ...styles.displayConditionLabelTypography, ...fontSize15Style }}>
                  {t('campaigns.displayConditions.name')}
                </Typography>
                <TextField
                  fullWidth
                  placeholder={t('campaigns.displayConditions.namePlaceholder')}
                  value={name}
                  onChange={handleNameChange}
                  error={!!errors.name}
                  helperText={errors.name || ''}
                  variant="outlined"
                  size="small"
                  inputProps={{ style: { overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 15 } }}
                />
              </Box>

              <Box>
                <Typography variant="body2" style={{ ...styles.displayConditionLabelTypography, ...fontSize15Style }}>
                  {t('campaigns.displayConditions.description')}
                </Typography>
                <TextField
                  fullWidth
                  placeholder={t('campaigns.displayConditions.descriptionPlaceholder')}
                  value={description}
                  onChange={handleDescriptionChange}
                  error={!!errors.description}
                  helperText={errors.description || ''}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                  inputProps={{ style: { overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 15 } }}
                />
              </Box>

              <Box style={styles.displayConditionMatchTypeBox}>
                <Typography variant="body2" style={{ ...styles.displayConditionLabelTypography, ...fontSize15Style }}>
                  {t('campaigns.displayConditions.matchType')}
                </Typography>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
                  <FormControl variant="outlined" size="small" style={styles.displayConditionMatchFormControl}>
                    <Select value={matchType} onChange={(e) => setMatchType(e.target.value)}>
                      <MenuItem value="all" style={fontSize15Style}>{t('campaigns.displayConditions.matchAllConditions')}</MenuItem>
                      <MenuItem value="any" style={fontSize15Style}>{t('campaigns.displayConditions.matchAnyConditions')}</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    startIcon={<AddCircleOutline />}
                    onClick={handleAddRule}
                    style={{ textTransform: 'none', marginLeft: isRTL ? '0px' : 'auto', marginRight: isRTL ? 'auto' : '0px', ...fontSize15Style }}
                  >
                    {t('campaigns.displayConditions.addCondition') || 'Add Condition'}
                  </Button>
                </Box>
              </Box>

              <Box style={styles.displayConditionRulesBox}>
                <Typography variant="body2" style={{ ...styles.displayConditionLabelTypography, ...fontSize15Style }}>
                  {t('campaigns.displayConditions.conditionList')}
                </Typography>
                {rules.map((rule, index) => (
                  <Box key={rule.id} style={styles.displayConditionRuleRow}>
                    <FormControl variant="outlined" size="small">
                      <Select
                        value={rule.field}
                        onChange={(e) => handleRuleChange(rule.id, 'field', e.target.value)}
                        MenuProps={{ PaperProps: { style: { minWidth: 200 } } }}
                        SelectDisplayProps={{ title: getFieldLabel(rule.field) }}
                      >
                        {allFields.map((field) => (
                          <MenuItem key={field.key} value={field.key} style={{ width: '100%', fontSize: 15 }}>
                            {field.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl variant="outlined" size="small">
                      <Select value={rule.operator} onChange={(e) => handleRuleChange(rule.id, 'operator', e.target.value)}>
                        {getOperatorOptions(rule.field).map((op) => (
                          <MenuItem key={op.value} value={op.value} style={fontSize15Style}>
                            {op.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {rule.operator !== 'empty' && rule.operator !== 'not_empty' && (
                      <Box style={{ ...styles.displayConditionTextFieldBox, padding: 0 }}>
                        {isDateField(rule.field) ? (
                          <KeyboardDatePicker
                            variant="inline"
                            inputVariant="outlined"
                            size="small"
                            format="DD/MM/YYYY"
                            value={rule.value ? moment(rule.value, 'DD/MM/YYYY') : null}
                            onChange={(date) => handleRuleChange(rule.id, 'value', date ? moment(date).format('DD/MM/YYYY') : '')}
                            error={!!errors[`${rule.id}-value`]}
                            style={{
                              ...styles.displayConditionTextFieldStyle,
                              padding: 0
                            }}
                            inputProps={{ style: { fontSize: 15 }, readOnly: true }}
                            InputAdornmentProps={{
                              position: 'end',
                              style: { marginLeft: 'auto', paddingLeft: 0, paddingRight: 0 }
                            }}
                            KeyboardButtonProps={{ edge: 'end' }}
                            autoOk
                            disableToolbar
                            invalidDateMessage=''
                          />
                        ) : (
                          <TextField
                            variant="outlined"
                            size="small"
                            value={rule.value}
                            onChange={(e) => handleRuleChange(rule.id, 'value', e.target.value)}
                            error={!!errors[`${rule.id}-value`]}
                            style={styles.displayConditionTextFieldStyle}
                            inputProps={{ style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 15 } }}
                          />
                        )}
                        {errors[`${rule.id}-value`] && (
                          <Typography variant="caption" style={{ color: 'red', fontSize: 15, marginTop: 4 }}>
                            {errors[`${rule.id}-value`]}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {index > 0 && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveRule(rule.id)}
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <DeleteOutline />
                      </IconButton>
                    )}
                    {index === 0 && <Box style={{ width: '50px' }} />}
                  </Box>
                ))}
              </Box>

            </Box>
          </Grid>

          <Grid item xs={false} style={{ display: 'none' }}>
            <Box style={{ ...styles.displayConditionPreviewBox, padding: '10px', ...styles.displayConditionPreviewBoxStyle }}>
              <Typography variant="body2" style={{ ...styles.displayConditionPreviewTitle, ...fontSize15Style }}>
                {t('campaigns.displayConditions.previewTitle')}
              </Typography>

              <Box style={styles.displayConditionPreviewContent}>
                <Box style={styles.displayConditionPreviewItemBox}>
                  <Typography variant="caption" style={{ ...styles.displayConditionPreviewCaption, ...fontSize15Style }}>
                    {t('campaigns.displayConditions.previewName')}
                  </Typography>
                  <Typography variant="body2" style={{ ...styles.displayConditionPreviewBody, ...fontSize15Style }}>
                    {name || 'People'}
                  </Typography>
                </Box>

                <Box style={styles.displayConditionPreviewItemBox}>
                  <Typography variant="caption" style={{ ...styles.displayConditionPreviewCaption, ...fontSize15Style }}>
                    {t('campaigns.displayConditions.previewDescription')}
                  </Typography>
                  <Typography variant="body2" style={{ ...styles.displayConditionPreviewBody, ...fontSize15Style }}>
                    {description || 'People in Boston, US'}
                  </Typography>
                </Box>

                <Box style={styles.displayConditionPreviewItemBox}>
                  <Typography variant="caption" style={{ ...styles.displayConditionPreviewCaption, ...fontSize15Style }}>
                    Before:
                  </Typography>
                  <Box style={{ ...styles.displayConditionCodeBox, ...fontSize15Style }}>
                    {previewExpression ? `{% if ${previewExpression} %}` : '{%if %}'}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" style={{ ...styles.displayConditionPreviewCaption, ...fontSize15Style }}>
                    After:
                  </Typography>
                  <Box style={{ ...styles.displayConditionCodeBox, ...fontSize15Style }}>
                    {`{% endif %}`}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      {showDeleteConfirm && (
        <BaseDialog
          classes={classes}
          open={true}
          onClose={() => setShowDeleteConfirm(false)}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteConfirmed}
          title={t('common.confirm')}
          confirmText={'campaigns.displayConditions.deleteConfirmation.confirm'}
          cancelText={'campaigns.displayConditions.deleteConfirmation.cancel'}
        >
          <Box style={{ padding: '8px 0', maxWidth: 420 }}>
            <Typography variant="body2" style={{ marginBottom: 12 }}>
              {t('campaigns.displayConditions.deleteConfirmation.title')}
            </Typography>
            <Typography variant="body2" style={{ marginBottom: 12 }}>
              {t('campaigns.displayConditions.deleteConfirmation.line1')}
            </Typography>
            <Typography variant="body2">
              {t('campaigns.displayConditions.deleteConfirmation.line2')}
            </Typography>
          </Box>
        </BaseDialog>
      )}
    </BaseDialog>
  </>
  );
};

export default DisplayConditionsDialog;

