import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChatbotActionType,
  IActionStep,
  IConditionBranch,
  IConditionStep,
  IFlowStep,
  IWhatsAppTemplate,
} from '../../../../Models/Service/Chatbot';
import ConditionStep from './ConditionStep';
import ActionStep from './ActionStep';

interface FlowBuilderProps {
  steps: IFlowStep[];
  onChange: (steps: IFlowStep[]) => void;
  templates: IWhatsAppTemplate[];
}

const newId = () => `step_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const newConditionStep = (): IConditionStep => ({
  id: newId(),
  type: 'condition',
  operator: 'contains',
  branches: [{ id: newId(), keyword: '', steps: [] }],
  elseBranch: [],
});

const newActionStep = (actionType: ChatbotActionType): IActionStep => ({
  id: newId(),
  type: 'action',
  actionType,
  payload: actionType === 'send_webhook' ? { url: '' } : actionType === 'send_wa_template' ? { templateId: '', variables: {} } : { text: '' },
});

const ACTION_CHOICES: { type: ChatbotActionType; label: string }[] = [
  { type: 'send_widget', label: 'Widget response' },
  { type: 'send_wa_template', label: 'WhatsApp template' },
  { type: 'send_wa_chat', label: 'WhatsApp chat' },
  { type: 'send_webhook', label: 'Webhook' },
];

const AddStepControl = ({ onAdd, label }: { onAdd: (step: IFlowStep) => void; label?: string }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" className="svc-cb-add-step" onClick={() => setOpen(true)}>
        + {label ?? t('chatbot_add_step', 'Add step')}
      </button>
    );
  }

  return (
    <div className="svc-cb-add-kind-menu">
      <button
        type="button"
        className="svc-cb-btn svc-cb-btn-ghost"
        onClick={() => {
          onAdd(newConditionStep());
          setOpen(false);
        }}
      >
        {t('chatbot_condition', 'Condition')}
      </button>
      {ACTION_CHOICES.map((choice) => (
        <button
          key={choice.type}
          type="button"
          className="svc-cb-btn svc-cb-btn-ghost"
          onClick={() => {
            onAdd(newActionStep(choice.type));
            setOpen(false);
          }}
        >
          {t(`chatbot_${choice.type}`, choice.label)}
        </button>
      ))}
    </div>
  );
};

const OPERATOR_VERB: Record<IConditionStep['operator'], string> = {
  contains: 'Message contains',
  equals: 'Message equals',
};

const FlowBuilder = ({ steps, onChange, templates }: FlowBuilderProps) => {
  const { t } = useTranslation();

  const updateAt = (idx: number, updated: IFlowStep) => {
    const next = [...steps];
    next[idx] = updated;
    onChange(next);
  };

  const removeAt = (idx: number) => onChange(steps.filter((_, i) => i !== idx));

  const addStep = (step: IFlowStep) => onChange([...steps, step]);

  const updateBranch = (idx: number, branchId: string, patch: Partial<IConditionBranch>) => {
    const step = steps[idx] as IConditionStep;
    updateAt(idx, {
      ...step,
      branches: step.branches.map((b) => (b.id === branchId ? { ...b, ...patch } : b)),
    });
  };

  const addBranch = (idx: number) => {
    const step = steps[idx] as IConditionStep;
    updateAt(idx, { ...step, branches: [...step.branches, { id: newId(), keyword: '', steps: [] }] });
  };

  const removeBranch = (idx: number, branchId: string) => {
    const step = steps[idx] as IConditionStep;
    updateAt(idx, { ...step, branches: step.branches.filter((b) => b.id !== branchId) });
  };

  const updateElseBranch = (idx: number, elseSteps: IFlowStep[]) => {
    const step = steps[idx] as IConditionStep;
    updateAt(idx, { ...step, elseBranch: elseSteps });
  };

  return (
    <div className="svc-cb-flow">
      {steps.map((step, idx) => (
        <div className="svc-cb-step" key={step.id}>
          <div className="svc-cb-step-card">
            <div className="svc-cb-step-head">
              <div style={{ flex: 1 }}>
                {step.type === 'condition' ? (
                  <ConditionStep step={step} onChange={(s) => updateAt(idx, s)} />
                ) : (
                  <ActionStep step={step} templates={templates} onChange={(s) => updateAt(idx, s)} />
                )}
              </div>
              <button
                type="button"
                className="svc-cb-step-remove"
                title={t('chatbot_remove_step', 'Remove step') as string}
                onClick={() => removeAt(idx)}
              >
                ✕
              </button>
            </div>

            {step.type === 'condition' && (
              <div className="svc-cb-branches">
                {step.branches.map((branch) => (
                  <div className="svc-cb-branch" key={branch.id}>
                    <div className="svc-cb-branch-head">
                      <div className="svc-cb-branch-label match">✓ {t(`chatbot_op_${step.operator}`, OPERATOR_VERB[step.operator])}</div>
                      {step.branches.length > 1 && (
                        <button
                          type="button"
                          className="svc-cb-step-remove"
                          title={t('chatbot_remove_branch', 'Remove branch') as string}
                          onClick={() => removeBranch(idx, branch.id)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      className="svc-cb-text-input"
                      style={{ marginBottom: 10 }}
                      value={branch.keyword}
                      placeholder={t('chatbot_keyword_placeholder', 'e.g. price') as string}
                      onChange={(e) => updateBranch(idx, branch.id, { keyword: e.target.value })}
                    />
                    <FlowBuilder
                      steps={branch.steps}
                      templates={templates}
                      onChange={(branchSteps) => updateBranch(idx, branch.id, { steps: branchSteps })}
                    />
                  </div>
                ))}

                <button type="button" className="svc-cb-add-step" onClick={() => addBranch(idx)}>
                  + {t('chatbot_add_branch', 'Add branch')}
                </button>

                <div className="svc-cb-branch">
                  <div className="svc-cb-branch-label nomatch">✕ {t('chatbot_else', 'Else (no branch matches)')}</div>
                  <FlowBuilder
                    steps={step.elseBranch}
                    templates={templates}
                    onChange={(elseSteps) => updateElseBranch(idx, elseSteps)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      <AddStepControl onAdd={addStep} />
    </div>
  );
};

export default FlowBuilder;
