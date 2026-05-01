const escapeHtml = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const normalizeConditionText = (value = '') => value.replace(/\s+/g, ' ').trim();

const buildConditionPreviewLine = (text) => {
  const safeText = escapeHtml(normalizeConditionText(text) || 'Condition');
  return `<span data-preview-condition="true" style="display:block; margin: 10px 0; padding: 4px 10px; background-color: #f8f9fa; border: 1px solid #dcdcdc; border-radius: 4px; color: #444; font-size: 13px; font-weight: 600; font-family: sans-serif; line-height: 1.5; width: fit-content;">[ 👁 ${safeText} ]</span>`;
};

const buildConditionPreviewLine_Simple = (text) => {
  const normalized = normalizeConditionText(text);
  const safeText = escapeHtml(normalized);
  const label = normalized ? ` ${safeText} ` : ' ';
  return `<span data-preview-condition="true" style="display:block; margin: 10px 0; padding: 4px 10px; background-color: #f8f9fa; border: 1px solid #dcdcdc; border-radius: 4px; color: #444; font-size: 13px; font-weight: 600; font-family: sans-serif; line-height: 1.5; width: fit-content;">[ 👁${label}]</span>`;
};

export const formatDisplayConditionsForPreview = (rawHtml) => {
  if (!rawHtml || !rawHtml.includes('{%')) {
    return rawHtml;
  }

  const conditionRegex = /{%\s*(if|elif|elseif|else|endif)\b([\s\S]*?)%}/gi;
  let formattedHtml = '';
  let lastIndex = 0;
  let match;

  while ((match = conditionRegex.exec(rawHtml)) !== null) {
    const [fullMatch, rawKeyword, rawExpression = ''] = match;
    const keyword = String(rawKeyword).toLowerCase();

    formattedHtml += rawHtml.slice(lastIndex, match.index);
    lastIndex = match.index + fullMatch.length;

    if (keyword === 'if') {
      formattedHtml += buildConditionPreviewLine(rawExpression.trim());
    } else if (keyword === 'elif' || keyword === 'elseif' || keyword === 'else') {
      const label = keyword === 'else' ? 'Else' : rawExpression.trim();
      formattedHtml += buildConditionPreviewLine_Simple('');
      formattedHtml += buildConditionPreviewLine_Simple(label);
    } else if (keyword === 'endif') {
      formattedHtml += buildConditionPreviewLine_Simple('');
    }
  }

  formattedHtml += rawHtml.slice(lastIndex);
  return formattedHtml;
};
