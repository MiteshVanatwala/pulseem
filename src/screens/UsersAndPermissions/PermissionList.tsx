import { useTranslation } from "react-i18next";
import { eSubUserPermissions } from "../../Models/SubUser/SubUsers";

// Define the props interface
interface PermissionListProps {
  list: eSubUserPermissions[];
}

const PermissionList: React.FC<PermissionListProps> = ({ list }) => {
  const { t } = useTranslation();

  const renderSubUserType = (permissionList: any[]) => {
    // Map the array to text
    const texts = list.map(getPermissionText);
    let permissionText = <></> as any;

    if (permissionList.indexOf(5) > -1 || permissionList.indexOf('5') > -1) {
      permissionText = <b>{t('SubUsers.readOnly')}</b>
    }
    else {
      if (permissionList?.length > 3) {
        permissionText = <><b>{t('SubUsers.admin')}: </b> {texts.join(', ')}</>
      }
      else {
        permissionText = <><b>{t('SubUsers.limitedAccess')}: </b> {texts.join(', ')}</>
      }
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
      case eSubUserPermissions.AllowSubUsers:
        return t('SubUsers.userCreation');
      case eSubUserPermissions.HideRecipietns:
        return t('SubUsers.readOnly');
      default:
        return '';
    }
  };

  return (
    <>{renderSubUserType(list)}</>
  );
};

export default PermissionList;