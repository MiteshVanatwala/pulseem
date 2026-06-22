/**
 * Reusable validation helpers for Bee editor form fields.
 * Used by the Popup editor today; designed to be imported by the Landing Page editor as well.
 */

// Field keys produced by MigratePulseemData.js / initClientForm — PascalCase.
const CONTACT_FIELD_KEYS = ['Email', 'Cellphone'] as const;

/**
 * Returns the set of active (non-removed) form field keys found in a Bee JSON string.
 * Excludes `optIn` and `submit` which are never contact-capture fields.
 */
export const getActiveFieldKeysFromJson = (jsonData: string | null | undefined): Set<string> => {
  if (!jsonData) return new Set();
  try {
    const parsed = JSON.parse(jsonData);
    const keys = new Set<string>();
    parsed?.page?.rows?.forEach((row: any) => {
      row?.columns?.forEach((col: any) => {
        col?.modules?.forEach((mod: any) => {
          const fields = mod?.descriptor?.form?.structure?.fields;
          if (fields) {
            Object.entries(fields).forEach(([key, value]: [string, any]) => {
              if (key !== 'optIn' && key !== 'submit' && value?.removeFromLayout === false) {
                keys.add(key);
              }
            });
          }
        });
      });
    });
    return keys;
  } catch {
    return new Set();
  }
};

/**
 * Returns true if the Bee JSON contains at least one form module.
 * Used to distinguish form-bearing popups/pages from formless banners.
 */
export const hasFormModule = (jsonData: string | null | undefined): boolean => {
  if (!jsonData) return false;
  try {
    const parsed = JSON.parse(jsonData);
    return (
      parsed?.page?.rows?.some((row: any) =>
        row?.columns?.some((col: any) =>
          col?.modules?.some(
            (mod: any) => mod?.descriptor?.form?.structure?.fields != null
          )
        )
      ) ?? false
    );
  } catch {
    return false;
  }
};

/**
 * Checks whether a contact field (Email or Cellphone) is present and
 * active across the supplied set of Bee JSON strings (one per step/page).
 *
 * Only steps that actually contain a form module are considered — steps without
 * a form do not participate in the requirement.
 *
 * Returns:
 *   hasForm        — true if at least one JSON has a form module
 *   hasContactField — true if at least one form-bearing step has Email/Cellphone/Telephone active
 *
 * Callers should block save when `hasForm && !hasContactField`.
 */
export const checkFormContactRequirement = (
  jsonStrings: (string | null | undefined)[]
): { hasForm: boolean; hasContactField: boolean } => {
  const formJsons = jsonStrings.filter(json => hasFormModule(json));

  if (formJsons.length === 0) {
    return { hasForm: false, hasContactField: true };
  }

  const activeFields = new Set<string>(
    formJsons.flatMap(json => Array.from(getActiveFieldKeysFromJson(json)))
  );

  const hasContactField = CONTACT_FIELD_KEYS.some(key => activeFields.has(key));

  return { hasForm: true, hasContactField };
};
