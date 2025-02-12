import { useTranslation } from "react-i18next";

export const ClientSearchExtraFields = ({ classes }: any) => {
  const { t } = useTranslation();

  return <> {t("common.extraFields")}</>
}

export default ClientSearchExtraFields;