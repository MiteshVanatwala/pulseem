import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, MenuItem } from '@material-ui/core';
import { IoIosArrowDown, IoIosCheckmark } from 'react-icons/io';
import { MdCallSplit } from 'react-icons/md';
import { ConditionOperator, IConditionStep } from '../../../../Models/Service/Chatbot';

interface ConditionStepProps {
  step: IConditionStep;
  onChange: (step: IConditionStep) => void;
}

const OPERATOR_LABEL: Record<ConditionOperator, string> = {
  contains: 'Contains',
  equals: 'Equals',
};

// Renders only the condition's operator — each branch below (in FlowBuilder) owns its
// own keyword input, since a single condition step can fan out to more than one branch.
const ConditionStep = ({ step, onChange }: ConditionStepProps) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <div>
      <span className="svc-cb-step-kind svc-cb-kind-condition">
        <MdCallSplit size={12} />
        {t('chatbot_condition', 'Condition')}
      </span>
      <div className="svc-cb-field-row">
        <div className="svc-cb-field">
          <label>{t('chatbot_condition_type', 'Message')}</label>
          <button type="button" className="svc-cb-dropdown-btn" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <span>{t(`chatbot_${step.operator}`, OPERATOR_LABEL[step.operator])}</span>
            <IoIosArrowDown size={15} className="svc-cb-select-arrow" />
          </button>
          <Menu
            anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{ className: 'svc-cb-dropdown-menu' }}
          >
            {(Object.entries(OPERATOR_LABEL) as [ConditionOperator, string][]).map(([value, label]) => (
              <MenuItem
                key={value}
                selected={value === step.operator}
                onClick={() => {
                  onChange({ ...step, operator: value });
                  setAnchorEl(null);
                }}
              >
                <span>{t(`chatbot_${value}`, label)}</span>
                {value === step.operator && <IoIosCheckmark size={20} className="svc-cb-dropdown-check" />}
              </MenuItem>
            ))}
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default ConditionStep;
