import { Box } from "@material-ui/core";
import { Loader } from "../../../components/Loader/Loader";

const OpenInvoices = ({ classes, showLoader }: any) => {
  return <Box style={{ position: 'relative', width: '100%' }}>
    <Loader
      // isOpen={showLoader} 
      isOpen={false}
      showBackdrop={false} />
    NO DATA
  </Box>
}

export default OpenInvoices;