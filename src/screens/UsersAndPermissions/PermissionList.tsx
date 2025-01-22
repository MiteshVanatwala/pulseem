import { useTranslation } from "react-i18next";
import { eSubUserPermissions } from "../../Models/SubUser/SubUsers";

// Define the props interface
interface PermissionListProps {
  list: eSubUserPermissions[];
}

const PermissionList: React.FC<PermissionListProps> = ({ list }) => {
  const { t } = useTranslation();

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
        return t('SubUsers.limitedAccess');
      default:
        return '';
    }
  };

  // Map the array to text
  const permissionTexts = list.map(getPermissionText);

  return (
    <>{permissionTexts.join(', ')}</>
  );
};

export default PermissionList;