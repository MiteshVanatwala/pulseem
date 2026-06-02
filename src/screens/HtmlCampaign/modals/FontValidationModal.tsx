import React, { useState } from 'react';
import {
    Checkbox,
    FormControlLabel,
    Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';

interface FontValidationModalProps {
    /** Controls modal visibility */
    open: boolean;
    /** The font name being applied (used for display and suppression) */
    fontName: string;
    /** Whether the editor is in RTL mode */
    isRTL: boolean;
    /**
     * Called when user clicks "Use Anyway".
     * @param doNotShowAgain - true if user checked "Do not show again"
     */
    onUseAnyway: (doNotShowAgain: boolean) => void;
    /** Called when user clicks "Choose Different Font" */
    onChooseDifferent: () => void;
    /** Standard classes object passed from parent */
    classes?: any;
}

/**
 * FontValidationModal
 *
 * Displayed inside the Beefree email editor when a user manually selects
 * a non-web-safe font. Warns about potential rendering issues in Gmail,
 * Outlook, and various devices.
 *
 * Acceptance criteria:
 * - "Use Anyway" applies the font (optionally suppresses future warnings)
 * - "Choose Different Font" reverts the selection without saving any preference
 * - Checkbox is unchecked by default
 * - Fully localized in EN / HE / PL
 */
const FontValidationModal: React.FC<FontValidationModalProps> = ({
    open,
    fontName,
    isRTL,
    classes,
    onUseAnyway,
    onChooseDifferent,
}) => {
    const { t } = useTranslation();
    const [doNotShowAgain, setDoNotShowAgain] = useState(false);

    // Reset checkbox state whenever modal re-opens for a different font
    React.useEffect(() => {
        if (open) {
            setDoNotShowAgain(false);
        }
    }, [open, fontName]);

    const handleUseAnyway = () => {
        onUseAnyway(doNotShowAgain);
    };

    const handleChooseDifferent = () => {
        // Per spec: checkbox state is ignored, no preference saved
        onChooseDifferent();
    };

    return (
        <BaseDialog
            open={open}
            classes={classes}
            disableBackdropClick={false}
            title={t('campaigns.fontValidation.title')}
            cancelText="campaigns.fontValidation.cancel"
            confirmText="campaigns.fontValidation.useAnyway"
            onClose={handleChooseDifferent}
            onCancel={handleChooseDifferent}
            onConfirm={handleUseAnyway}
            style={{ zIndex: 1400 }} // Ensure it displays above editor layers if needed
        >
            <div style={{ padding: '0 8px', maxWidth: 400, margin: '0 auto' }}>
                <Typography
                    variant="body1"
                    style={{
                        marginBottom: 16,
                        textAlign: isRTL ? 'right' : 'left',
                        direction: isRTL ? 'rtl' : 'ltr',
                        lineHeight: 1.6,
                    }}
                >
                    {t('campaigns.fontValidation.body')}
                </Typography>

                {/* Font name indicator */}
                {fontName && (
                    <Typography
                        variant="body2"
                        style={{
                            color: '#666',
                            marginBottom: 12,
                            textAlign: isRTL ? 'right' : 'left',
                            direction: isRTL ? 'rtl' : 'ltr',
                        }}
                    >
                        <strong
                            style={{
                                fontFamily: `'${fontName}', sans-serif`,
                                marginInlineEnd: 4,
                            }}
                        >
                            {fontName}
                        </strong>
                    </Typography>
                )}

                {/* "Do not show again" checkbox */}
                <FormControlLabel
                    style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                    control={
                        <Checkbox
                            checked={doNotShowAgain}
                            onChange={(e) => setDoNotShowAgain(e.target.checked)}
                            color="primary"
                            id="font-validation-suppress-checkbox"
                        />
                    }
                    label={
                        <Typography
                            variant="body2"
                            style={{ textAlign: isRTL ? 'right' : 'left' }}
                        >
                            {t('campaigns.fontValidation.doNotShow')}
                        </Typography>
                    }
                />
            </div>
        </BaseDialog>
    );
};

export default FontValidationModal;
