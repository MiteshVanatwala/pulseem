import { useTranslation } from "react-i18next";
import { eSubUserPermissions } from "../../Models/SubUser/SubUsers";

// Define the props interface
interface PermissionListProps {
  list: eSubUserPermissions[];
}

const PermissionList: React.FC<PermissionListProps> = ({ list }) => {
  const { t } = useTranslation();

  const renderSubUserType = (permissionList: any[]) => {
    const hasReadOnly = permissionList.indexOf(eSubUserPermissions.HideRecipients) > -1 ||
      permissionList.indexOf(4) > -1 ||
      permissionList.indexOf('4') > -1;

    const hasWhatsApp = permissionList.indexOf(eSubUserPermissions.AllowWhatsAppToAgent) > -1;

    const hasSend = permissionList.indexOf(eSubUserPermissions.AllowSend) > -1;
    const hasExport = permissionList.indexOf(eSubUserPermissions.AllowExport) > -1;
    const hasDelete = permissionList.indexOf(eSubUserPermissions.AllowDelete) > -1;

    const isAdmin = hasSend && hasExport && hasDelete;
    const hasLimitedAccess = hasSend || hasExport || hasDelete;

    // Filter out WhatsApp permission for main permission display
    const mainPermissions = permissionList.filter(p =>
      parseInt(p) !== eSubUserPermissions.AllowWhatsAppToAgent
    );
    console.log('mainPermissions', mainPermissions);

    // Get text for main permissions
    const mainTexts = mainPermissions.map(getPermissionText).filter(text => text !== '');
    console.log('mainTexts', mainTexts);

    let permissionText = <></> as any;

    // ReadOnly
    if (hasReadOnly) {
      if (hasWhatsApp) {
        permissionText = <><b>{t('SubUsers.readOnly')}</b>, <b>{t('SubUsers.whatsappAgent')}</b></>;
      } else {
        permissionText = <b>{t('SubUsers.readOnly')}</b>;
      }
    }
    // Only WhatsApp Agent (no other permissions)
    else if (hasWhatsApp && !hasLimitedAccess) {
      permissionText = <b>{t('SubUsers.whatsappAgent')}</b>;
    }
    // Admin
    else if (isAdmin) {
      if (hasWhatsApp) {
        permissionText = <><b>{t('SubUsers.admin')}: </b> {mainTexts.join(', ')}, <b>{t('SubUsers.whatsappAgent')}</b></>;
      } else {
        permissionText = <><b>{t('SubUsers.admin')}: </b> {mainTexts.join(', ')}</>;
      }
    }
    // Limited Access
    else if (hasLimitedAccess) {
      if (hasWhatsApp) {
        permissionText = <><b>{t('SubUsers.limitedAccess')}: </b> {mainTexts.join(', ')}, <b>{t('SubUsers.whatsappAgent')}</b></>;
      } else {
        permissionText = <><b>{t('SubUsers.limitedAccess')}: </b> {mainTexts.join(', ')}</>;
      }
    }
    // No permissions
    else {
      permissionText = <></>;
    }

    return permissionText;
  }

  // Function to convert enum value to text
  const getPermissionText = (permissionId: any) => {
    switch (parseInt(permissionId)) {
      case eSubUserPermissions.AllowSend:
        return t('SubUsers.allowSending'); // 'Allow Send';
      case eSubUserPermissions.AllowExport:
        return t('SubUsers.allowExport');
      case eSubUserPermissions.AllowDelete:
        return t('SubUsers.allowDeleting');
      case eSubUserPermissions.HideRecipients:
        return t('SubUsers.readOnly');
      case eSubUserPermissions.AllowWhatsAppToAgent:
        return t('SubUsers.whatsappAgent');
      default:
        return '';
    }
  };

  return (
    <>{renderSubUserType(list)}</>
  );
};

export default PermissionList;