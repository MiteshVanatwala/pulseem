import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import { IWhatsappCreator } from "../../../Models/Whatsapp/whatsappCreator";
import { Title } from "../../../components/managment/Title";

const WhatsappCreator = ({ classes }: IWhatsappCreator) => {
  const { t } = useTranslation();
  return (
    <DefaultScreen subPage={"create"} currentPage="whatsapp" classes={classes} customPadding={true} containerClass="">
      <Title Text={t("whatsapp.header")} Classes={classes.whatsappTemplateTitle} ContainerStyle={{}} Element={null} />
    </DefaultScreen>
  );
};

export default WhatsappCreator;