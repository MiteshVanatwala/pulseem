import { Box, Button, Divider, Grid, Select, Typography } from "@material-ui/core";
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
import { LandingPageModel, SurveyResponse, eQuestionType } from "../../../Models/LandingPage/LandingPage";
import PulseemPie from "../../../components/Chart/PieChart";
import { StateType } from "../../../Models/StateTypes";
import { exportSurvey } from "../../../redux/reducers/landingPagesSlice";
import { ExportFile } from "../../../helpers/Export/ExportFile";
import { FaFileExcel } from "react-icons/fa";
import { ColorPalettes } from "../../../helpers/UI/ColorPalettes";
import ColorPaletteView from "../../../components/Chart/ColorPalette";

const SurveyDetails = ({ classes }: any) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { isRTL, windowSize } = useSelector((state: StateType) => state.core);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [selectedPalette, setSelectedPallete] = useState<any>('Pulseem');
  // @ts-ignore
  const [webForm, setWebForm] = useState<LandingPageModel>({ PageName: '' });
  const [surveyResult, setSurveyResult] = useState<SurveyResponse[]>();
  const [gridSize, setGridSize] = useState<any>(4);
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
      case eQuestionType.MultipleSelect: {
        const pieArr: any = createPieObject(item, true);
        return <PulseemPie data={pieArr} onChartClick={(p: any) => { onAnswerSelected(p) }} colorPalette={ColorPalettes[selectedPalette]} />;
      }
      case eQuestionType.Text: {
        return <>
          <Box style={{ width: '100%', height: '50%', overflow: 'hidden', overflowY: 'auto' }}>
            <Box style={{ padding: 15, direction: isRTL ? 'rtl' : 'ltr' }}>
              {item.Answers.map((answer: string) => {
                return <Typography className={classes.font18}>{answer}</Typography>
              })}
            </Box>
          </Box>
        </>
      }
      case eQuestionType.SingleSelect: {
        const arr: any = createPieObject(item, false);
        return <PulseemPie data={arr} onChartClick={(p: any) => { onAnswerSelected(p) }} colorPalette={ColorPalettes[selectedPalette]} />;
      }
    }
  }

  const onExportSurvey = async () => {
    //@ts-ignore
    const surveysResponse = await dispatch(exportSurvey(id)) as any;
    const surveys = surveysResponse?.payload;
    const fields = surveys?.length > 0 && Object.keys(surveys[0]);
    ExportFile({
      data: surveys,
      fileName: 'surveyReport',
      exportType: 'xls',
      fields: fields
    });
  }

  const renderQuestionType = (questionType: eQuestionType) => {
    switch (questionType) {
      case eQuestionType.Text: {
        return t('landingPages.survey.text');

      }
      case eQuestionType.SingleSelect: {
        return t('landingPages.survey.SingleSelect');
      }
      case eQuestionType.MultipleSelect: {
        return t('landingPages.survey.MultipleSelect');
      }
    }
  }

  return (
    <DefaultScreen
      currentPage='SurveyDetails'
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}>
      <Box className={'topSection'}>
        <Title
          classes={classes}
          Element={
            <Box className={clsx(windowSize !== 'xs' ? classes.dFlex : '', classes.flexWrap)}
              style={{ justifyContent: 'space-between' }}>
              <Typography
                className={clsx(classes.managementTitle, "mgmtTitle")}
                style={{ width: 'auto' }}>{`${t('landingPages.SurveyExportTitle')} - ${webForm?.PageName && webForm?.PageName}`}
              </Typography>
              <Box style={{ display: 'flex' }}>
                {surveyResult && surveyResult?.length > 1 &&
                  <Box className={clsx(classes.dFlex)} style={{ alignItems: 'center', justifySelf: 'flex-end', paddingInline: 15 }}>
                    <Typography>{t('common.Preview')}</Typography>
                    <Box style={{ width: 300 }}>
                      <ColorPaletteView selected={selectedPalette} onSelected={setSelectedPallete} />
                    </Box>
                    <Select native onChange={(event: any) => {
                      setGridSize(event.target.value)
                    }} value={gridSize}>
                      <option value={12}>1</option>
                      <option value={6}>2</option>
                      <option value={4}>3</option>
                      <option value={3}>4</option>
                    </Select>
                    &nbsp;<Typography>{t('landingPages.survey.surveysPerLine')}</Typography>
                  </Box>
                }
                <Button
                  onClick={onExportSurvey}
                  className={clsx(
                    windowSize !== "xs" ? classes.implementButtonFlex : classes.mt10,
                    classes.btn, classes.btnRounded,
                  )}
                  style={{ alignSelf: 'flex-end' }}
                  endIcon={<FaFileExcel className={clsx(classes.f25)} />}>
                  {t('master.download')}
                </Button>
              </Box>
            </Box>
          }
        />
        <Box style={{ padding: 25 }}>
          <Grid container>
            {surveyResult && surveyResult?.map((item: SurveyResponse, idx: number) => {
              return <Grid item xs={gridSize}>
                <Box key={idx}>
                  <Box>
                    <b>{item?.Question}</b>&nbsp;({renderQuestionType(item.QuestionType)})
                  </Box>
                  <Box>{`${item?.Answers.length} ${t('common.Comments')}`}</Box>
                  <Box style={{ direction: 'ltr', display: 'flex', alignItems: 'flex-end', flexDirection: 'column' }}>
                    {renderResults(item)}
                  </Box>
                  {idx < (surveyResult.length - 1) && <Divider style={{ marginBlock: 25 }} />}
                </Box>
              </Grid>
            })}
          </Grid>
        </Box>
      </Box>
      <Loader isOpen={showLoader} />
    </DefaultScreen>
  )
}

export default SurveyDetails;