import { useSelector } from "react-redux";
// import { useClasses } from "../../style/classes/index";

type generalPropTypes = {
  // classes: any;
  isRTL: any;
};

const useCore = () => {
  const { isRTL, windowSize } = useSelector(
    (state: { core: any }) => state?.core
  );
  // const classes = useClasses(windowSize, isRTL)();

  const generalProps: generalPropTypes = {
    // classes: classes,
    isRTL: isRTL
  };

  return generalProps;
};

export default useCore;
