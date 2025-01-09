import { eSubUserPermissions } from "../../Models/SubUser/SubUsers";

// Define the props interface
interface PermissionListProps {
  list: eSubUserPermissions[];
}

const PermissionList: React.FC<PermissionListProps> = ({ list }) => {

  // Function to convert enum value to text
  const getPermissionText = (permissionId: number) => {
    switch (permissionId) {
      case eSubUserPermissions.AllowSend:
        return 'Allow Send';
      case eSubUserPermissions.AllowExport:
        return 'Allow Export';
      case eSubUserPermissions.AllowDelete:
        return 'Allow Delete';
      case eSubUserPermissions.AllowSubUsers:
        return 'Allow Sub Users';
      case eSubUserPermissions.HideRecipietns:
        return 'Hide Recipients';
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