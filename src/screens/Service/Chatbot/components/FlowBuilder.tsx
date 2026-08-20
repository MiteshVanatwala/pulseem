import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, Select } from '@material-ui/core';
import { IoIosArrowDown } from 'react-icons/io';
import {
  MdAdd,
  MdClose,
  MdCallSplit,
  MdChatBubbleOutline,
  MdOutlineArticle,
  MdOutlineChat,
  MdOutlineWebhook,
} from 'react-icons/md';
import {
  ChatbotActionType,
  ConditionOperator,
  IActionStep,
  IConditionBranch,
  IConditionStep,
  IFlowStep,
  IWhatsAppTemplate,
} from '../../../../Models/Service/Chatbot';
import ActionStep from './ActionStep';

interface FlowBuilderProps {
  steps: IFlowStep[];
  onChange: (steps: IFlowStep[]) => void;
  templates: IWhatsAppTemplate[];
  classes: any;
  depth?: number;
}

const OPERATOR_LABEL: Record<ConditionOperator, string> = {
  contains: 'Contains',
  equals: 'Equals',
};

const DEFAULT_ACTION_TYPE: ChatbotActionType = 'send_widget';

// Each action type gets its own accent color so a glance at the flow shows what
// kind of action is at each step, without needing to open it.
const ACTION_ACCENT: Record<ChatbotActionType, string> = {
  send_widget: 'svc-cb-accent-widget',
  send_wa_template: 'svc-cb-accent-template',
  send_wa_chat: 'svc-cb-accent-chat',
  send_webhook: 'svc-cb-accent-webhook',
};

const ACTION_ICON: Record<ChatbotActionType, React.ComponentType<{ size?: number }>> = {
  send_widget: MdChatBubbleOutline,
  send_wa_template: MdOutlineArticle,
  send_wa_chat: MdOutlineChat,
  send_webhook: MdOutlineWebhook,
};

const newId = () => `step_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const newActionStep = (actionType: ChatbotActionType = DEFAULT_ACTION_TYPE): IActionStep => ({
  id: newId(),
  type: 'action',
  actionType,
  payload:
    actionType === 'send_webhook' ? { url: '' } : actionType === 'send_wa_template' ? { templateId: '', variables: {} } : { text: '' },
});

const newConditionStep = (): IConditionStep => ({
  id: newId(),
  type: 'condition',
  operator: 'contains',
  branches: [{ id: newId(), keyword: '', steps: [] }],
  elseBranch: [],
});

// One-click pill buttons instead of a big icon-card chooser — adding a step
// doesn't need a two-step "open menu, then pick" interaction.
const AddStepLinks = ({ onAdd }: { onAdd: (step: IFlowStep) => void }) => {
  const { t } = useTranslation();
  return (
    <div className="svc-cb-add-row">
      <button type="button" className="svc-cb-add-pill svc-cb-add-pill-condition" onClick={() => onAdd(newConditionStep())}>
        <MdAdd size={16} /> {t('chatbot_add_condition', 'Add condition')}
      </button>
      <button type="button" className="svc-cb-add-pill svc-cb-add-pill-action" onClick={() => onAdd(newActionStep())}>
        <MdAdd size={16} /> {t('chatbot_add_action', 'Add action')}
      </button>
    </div>
  );
};

interface ConditionBlockProps {
  step: IConditionStep;
  templates: IWhatsAppTemplate[];
  classes: any;
  depth: number;
  onChange: (step: IConditionStep) => void;
  onRemove: () => void;
}

// A condition step fans out into one or more keyword "match" branches (multi-branch)
// plus one always-present "else" branch — each branch owns its own nested step list,
// so a branch can chain into further conditions or actions.
const ConditionBlock = ({ step, templates, classes, depth, onChange, onRemove }: ConditionBlockProps) => {
  const { t } = useTranslation();

  const updateBranch = (branchId: string, patch: Partial<IConditionBranch>) =>
    onChange({ ...step, branches: step.branches.map((b) => (b.id === branchId ? { ...b, ...patch } : b)) });

  const addBranch = () => onChange({ ...step, branches: [...step.branches, { id: newId(), keyword: '', steps: [] }] });

  const removeBranch = (branchId: string) => onChange({ ...step, branches: step.branches.filter((b) => b.id !== branchId) });

  return (
    <div>
      <div className="svc-cb-step-row">
        <div className="svc-cb-condition-head">
          <span className="svc-cb-type-icon svc-cb-type-icon-condition">
            <MdCallSplit size={15} />
          </span>
          <span className="svc-cb-rule-if">{t('chatbot_if_message', 'If message')}</span>
          <FormControl variant="standard" className={classes.selectInputFormControl}>
            <Select
              native
              variant="standard"
              value={step.operator}
              className={classes.pbt5}
              onChange={(event: any) => onChange({ ...step, operator: event.target.value })}
              IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
            >
              {(Object.entries(OPERATOR_LABEL) as [ConditionOperator, string][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {t(`chatbot_${value}`, label)}
                </option>
              ))}
            </Select>
          </FormControl>
        </div>
        <button
          type="button"
          className="svc-cb-step-remove"
          title={t('chatbot_remove_condition', 'Remove condition') as string}
          onClick={onRemove}
        >
          <MdClose size={16} />
        </button>
      </div>

      {step.branches.map((branch, branchIndex) => (
        <div className={depth === 0 ? 'svc-cb-branch svc-cb-branch-top' : 'svc-cb-branch'} key={branch.id}>
          <div className="svc-cb-branch-head">
            <span className="svc-cb-branch-label">
              {branchIndex === 0 ? t('chatbot_if', 'If') : t('chatbot_else_if', 'Else if')}
            </span>
            <input
              className="svc-cb-text-input svc-cb-rule-keyword"
              value={branch.keyword}
              placeholder={t('chatbot_keyword_placeholder', 'e.g. price') as string}
              onChange={(e) => updateBranch(branch.id, { keyword: e.target.value })}
            />
            {step.branches.length > 1 && (
              <button
                type="button"
                className="svc-cb-step-remove svc-cb-step-remove-sm"
                title={t('chatbot_remove_branch', 'Remove branch') as string}
                onClick={() => removeBranch(branch.id)}
              >
                <MdClose size={14} />
              </button>
            )}
          </div>
          <FlowBuilder
            steps={branch.steps}
            templates={templates}
            classes={classes}
            depth={depth + 1}
            onChange={(branchSteps) => updateBranch(branch.id, { steps: branchSteps })}
          />
        </div>
      ))}

      <button type="button" className="svc-cb-add-pill svc-cb-add-pill-branch svc-cb-add-branch-link" onClick={addBranch}>
        <MdAdd size={14} /> {t('chatbot_add_branch', 'Add another match')}
      </button>

      <div className={depth === 0 ? 'svc-cb-branch svc-cb-branch-else svc-cb-branch-top' : 'svc-cb-branch svc-cb-branch-else'}>
        <div className="svc-cb-branch-head">
          <span className="svc-cb-branch-label svc-cb-branch-label-else">{t('chatbot_else', 'Else')}</span>
        </div>
        <FlowBuilder
          steps={step.elseBranch}
          templates={templates}
          classes={classes}
          depth={depth + 1}
          onChange={(elseSteps) => onChange({ ...step, elseBranch: elseSteps })}
        />
      </div>
    </div>
  );
};

// Renders one sequence of steps (top-level flow, a branch's steps, or an else branch).
// Top-level steps get a bordered card for visual separation; nested steps stay plain
// since the branch's indent guide already groups them.
const FlowBuilder = ({ steps, onChange, templates, classes, depth = 0 }: FlowBuilderProps) => {
  const { t } = useTranslation();

  const updateAt = (idx: number, updated: IFlowStep) => {
    const next = [...steps];
    next[idx] = updated;
    onChange(next);
  };

  const removeAt = (idx: number) => onChange(steps.filter((_, i) => i !== idx));

  return (
    <div className={depth === 0 ? 'svc-cb-flow-list' : 'svc-cb-flow-list svc-cb-flow-list-nested'}>
      {steps.map((step, idx) => {
        const ActionIcon = step.type === 'action' ? ACTION_ICON[step.actionType] : null;
        return (
        <div className={depth === 0 ? 'svc-cb-step-card' : ''} key={step.id}>
          {depth === 0 && <span className="svc-cb-step-number">{idx + 1}</span>}
          {step.type === 'condition' ? (
            <ConditionBlock
              step={step}
              templates={templates}
              classes={classes}
              depth={depth}
              onChange={(s) => updateAt(idx, s)}
              onRemove={() => removeAt(idx)}
            />
          ) : (
            <div className={`svc-cb-step-row svc-cb-action-row ${ACTION_ACCENT[step.actionType]}`}>
              <div className="svc-cb-action-row-main">
                {ActionIcon && (
                  <span className={`svc-cb-type-icon ${ACTION_ACCENT[step.actionType]}-icon`}>
                    <ActionIcon size={15} />
                  </span>
                )}
                <ActionStep step={step} templates={templates} classes={classes} onChange={(s) => updateAt(idx, s)} />
              </div>
              <button
                type="button"
                className="svc-cb-step-remove"
                title={t('chatbot_remove_step', 'Remove step') as string}
                onClick={() => removeAt(idx)}
              >
                <MdClose size={16} />
              </button>
            </div>
          )}
        </div>
        );
      })}
      <AddStepLinks onAdd={(step) => onChange([...steps, step])} />
    </div>
  );
};

export default FlowBuilder;
