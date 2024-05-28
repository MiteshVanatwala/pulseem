import { Box } from "@material-ui/core";
import DefaultScreen from "../../DefaultScreen";
import { Title } from "../../../components/managment/Title";
import { Loader } from "../../../components/Loader/Loader";
import clsx from 'clsx';
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getSurveyDetailsByWebformId } from "../../../redux/reducers/SurveyReportsSlice";
import { useDispatch, useSelector } from "react-redux";
import { PulseemResponse } from "../../../Models/APIResponse";
import { logout } from "../../../helpers/Api/PulseemReactAPI";
import { useParams } from "react-router-dom";
import { LandingPageModel } from "../../../Models/LandingPage/LandingPage";
import PulseemPie from "../../../components/Chart/PieChart";
import { Typography } from "@mui/material";
import { StateType } from "../../../Models/StateTypes";

const SurveyDetails = ({ classes }: any) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { isRTL } = useSelector((state: StateType) => state.core);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  // @ts-ignore
  const [webForm, setWebForm] = useState<LandingPageModel>({ PageName: '' });
  const [surveyResult, setSurveyResult] = useState<any>();
  const dispatch = useDispatch();

  const getData = async () => {
    //@ts-ignore
    const response = await dispatch(getSurveyDetailsByWebformId(id)) as any;
    handleResponse(response.payload);
  }

  const handleResponse = (payload: PulseemResponse) => {
    switch (payload.StatusCode) {
      case 201: {
        setWebForm(payload?.Data?.WebForm)
        setSurveyResult(payload?.Data?.Survey)
        break;
      }
      case 401: {
        logout();
        break;
      }
      case 404: {
        break;
      }
    }
    setShowLoader(false);
  }

  useEffect(() => {
    getData();
  }, []);

  const onAnswerSelected = (params: any) => {
    console.log(params);
  }

  const createPieObject = (item: any, isMultipleSelection: boolean) => {
    const pieArr: any = [];

    Object.keys(item?.AnswerWithText)?.forEach((ans: any, idx: number) => {
      const optionAnswer = item?.AnswerWithText[ans];
      const answers = isMultipleSelection ? item?.Answers.map((a: string) => {
        return a.split('|');
      }) : (item?.AnswerAndCount[optionAnswer] || 0);

      const selected = isMultipleSelection ? (answers.flat().filter((x: any) => x === optionAnswer).length) : (answers || 0);

      pieArr.push({ id: idx, value: selected, label: ans.slice(0, 7) })
    });

    return pieArr;
  }

  const renderResults = (item: any) => {
    switch (item.QuestionType) {
      case 'checkbox': {
        const pieArr: any = createPieObject(item, true);
        return <PulseemPie data={pieArr} onChartClick={(p: any) => { onAnswerSelected(p) }} />;
      }
      case 'text': {
        return <>
          <Box style={{ padding: 15, direction: isRTL ? 'rtl' : 'ltr' }}>
            {item.Answers.map((t: string) => {
              return <Typography className={classes.font18}>{t}</Typography>
            })}
          </Box>
        </>
      }
      case 'select':
      case 'radio': {
        const arr: any = createPieObject(item, false);
        return <PulseemPie data={arr} onChartClick={(p: any) => { onAnswerSelected(p) }} />;
      }
    }
  }

  return (
    <DefaultScreen
      currentPage='SurveyDetails'
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}>
      <Box className={'topSection'}>
        <Title Text={`${t('landingPages.SurveyExportTitle')} - ${webForm?.PageName && webForm?.PageName}`} classes={classes} />
        <Box style={{ padding: 25 }}>
          {surveyResult && surveyResult?.map((item: any, idx: number) => {
            return <Box key={idx}>
              <Box>
                {item?.QuestionNumber}. {item?.Question}
              </Box>
              <Box style={{ direction: 'ltr', display: 'flex', alignItems: 'flex-end', flexDirection: 'column' }}>
                {renderResults(item)}
              </Box>
            </Box>
          })}
        </Box>
      </Box>
      <Loader isOpen={showLoader} />
    </DefaultScreen>
  )
}

export default SurveyDetails;