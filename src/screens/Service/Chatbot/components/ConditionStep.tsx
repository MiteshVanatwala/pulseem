import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConditionOperator, IConditionStep } from '../../../../Models/Service/Chatbot';

interface ConditionStepProps {
  step: IConditionStep;
  onChange: (step: IConditionStep) => void;
}

// Renders only the condition's operator — each branch below (in FlowBuilder) owns its
// own keyword input, since a single condition step can fan out to more than one branch.
const ConditionStep = ({ step, onChange }: ConditionStepProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <span className="svc-cb-step-kind svc-cb-kind-condition">{t('chatbot_condition', 'Condition')}</span>
      <div className="svc-cb-field-row">
        <div className="svc-cb-field">
          <label>{t('chatbot_condition_type', 'Message')}</label>
          <select
            className="svc-cb-select"
            value={step.operator}
            onChange={(e) => onChange({ ...step, operator: e.target.value as ConditionOperator })}
          >
            <option value="contains">{t('chatbot_contains', 'Contains')}</option>
            <option value="equals">{t('chatbot_equals', 'Equals')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ConditionStep;
