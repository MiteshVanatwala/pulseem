import { Box, Button, Divider, Grid, List, ListItem, ListItemAvatar, ListItemText, ListSubheader, Paper, Select, Typography } from "@material-ui/core";
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
import { useNavigate, useParams } from "react-router-dom";
import { LandingPageModel, SurveyDataBarChart, SurveyResponse, eQuestionType } from "../../../Models/LandingPage/LandingPage";
import PulseemPie from "../../../components/Chart/PieChart";
import { StateType } from "../../../Models/StateTypes";
import { exportSurvey } from "../../../redux/reducers/landingPagesSlice";
import { ExportFile } from "../../../helpers/Export/ExportFile";
import { FaFileExcel } from "react-icons/fa";
import { ColorPalettes } from "../../../helpers/UI/ColorPalettes";
import ColorPaletteView from "../../../components/Chart/ColorPalette";
import { MdArrowBackIos, MdArrowForwardIos, MdQuestionAnswer } from "react-icons/md";
import { getCookie, setCookie } from "../../../helpers/Functions/cookies";
import PulseemBarChart from "../../../components/Chart/BarChart";
import { v4 as uuidv4 } from 'uuid';
import IconSwitch from "../../../components/Controlls/IconSwitch";
import { FaChartPie } from "react-icons/fa";
import { PiChartBarHorizontalFill } from "react-icons/pi";
import { sitePrefix } from "../../../config";

const SurveyDetails = ({ classes }: any) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { windowSize, isRTL } = useSelector((state: StateType) => state.core);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const cookie_colorPalette = getCookie('chartsColorPalette');
  const cookie_surveyGridSize = getCookie('surveyGridSize');
  const [selectedPalette, setSelectedPallete] = useState<any>(cookie_colorPalette || 'Pulseem');
  const [gridSize, setGridSize] = useState<any>(cookie_surveyGridSize || 4);
  // @ts-ignore
  const [webForm, setWebForm] = useState<LandingPageModel>({ PageName: '' });
  const [surveyResult, setSurveyResult] = useState<SurveyResponse[]>();
  const dispatch = useDispatch();

  const getData = async () => {
    //@ts-ignore
    const response = await dispatch(getSurveyDetailsByWebformId(id)) as any;
    handleResponse(response.payload);
  }

  const handleResponse = (payload: PulseemResponse) => {
    switch (payload.StatusCode) {
      case 201: {
        setWebForm(payload?.Data?.WebForm);
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


  const createBarChartObject = (barData: SurveyDataBarChart[]) => {
    const dataset: any = [];

    barData?.forEach((ans: any) => {
      const tempObj: any = [];
      tempObj["answer"] = ans.answer
      tempObj['question'] = ans.question;
      tempObj['percentage'] = ans.percentage;

      dataset.push(tempObj);

    });
    return dataset;
  }

  const renderResults = (item: any) => {
    switch (item.QuestionType) {
      case eQuestionType.MultipleSelect: {
        let arr: any;
        arr = item.ShowAsPie ? item?.pieChart : createBarChartObject(item?.barChart);

        return !item.ShowAsPie ? (<PulseemBarChart
          gridSize={gridSize}
          key={item.ID || uuidv4()}
          data={arr}
          labels={[...Object.values(item.AnswerAndCount)]}
          yAxis={[{ scaleType: 'band', dataKey: 'question', tickFontSize: 14, tickLabelPlacement: 'middle', tickPlacement: 'middle', labelStyle: { width: 200 } }]}
          onChartClick={(p: any) => { onAnswerSelected(p) }}
          colors={ColorPalettes[selectedPalette]} />) :
          (<PulseemPie
            key={item.ID || uuidv4()}
            data={arr}
            gridSize={gridSize}
            onChartClick={(p: any) => { onAnswerSelected(p) }} colorPalette={ColorPalettes[selectedPalette]} />)
      }
      case eQuestionType.Text: {
        return <List key={uuidv4()} className={classes.answerListContainer}>
          {
            item.Answers.map((answer: string, idx: number) => {
              return <Box key={idx}><ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <MdQuestionAnswer />
                </ListItemAvatar>
                <ListItemText
                  className={classes.font16}
                  primary={t('landingPages.survey.surveyAnswer')}
                  secondary={answer}
                />
              </ListItem>
                <Divider variant="inset" component="li" />
              </Box>
            })
          }
        </List>
      }
      case eQuestionType.SingleSelect: {
        let arr: any;
        arr = item.ShowAsPie || item.ShowAsPie === undefined ? item?.pieChart : createBarChartObject(item?.barChart);

        return (item.ShowAsPie === true || item.ShowAsPie === undefined) ? (<PulseemPie
          key={item.ID || uuidv4()}
          data={arr}
          onChartClick={(p: any) => { onAnswerSelected(p) }} colorPalette={ColorPalettes[selectedPalette]} />) :
          (<PulseemBarChart
            key={item.ID || uuidv4()}
            data={arr}
            labels={[...Object.values(item.AnswerAndCount)]}
            yAxis={[{ scaleType: 'band', dataKey: 'question' }]}
            onChartClick={(p: any) => { onAnswerSelected(p) }}
            colors={ColorPalettes[selectedPalette]} />)
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

  useEffect(() => {
    if (windowSize === 'sm' || windowSize === 'xs')
      setGridSize(12);
  }, [windowSize]);

  return (
    <DefaultScreen
      currentPage='SurveyDetails'
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}>
      <Box className={'topSection'}>
        <Title
          classes={classes}
          Element={
            <Box
              className={clsx(windowSize !== 'xs' ? classes.dFlex : '', classes.flexWrap, classes.justifySpaceBetween)}>
              <Typography
                className={clsx(classes.managementTitle, "mgmtTitle")}
                style={{ width: 'auto' }}>{`${t('landingPages.SurveyExportTitle')} - ${webForm?.PageName && webForm?.PageName}`}
              </Typography>
              <Box className={classes.dFlex}>
                <Box className={clsx(classes.dFlex, classes.surveySettingContainer)}>
                  <ColorPaletteView selected={selectedPalette} onSelected={(selectedPlt: any) => {
                    setCookie('chartsColorPalette', selectedPlt, { maxAge: 36000000000 });
                    setSelectedPallete(selectedPlt);
                  }} />
                  {windowSize !== 'sm' && windowSize !== 'xs' && <><Select native onChange={(event: any) => {
                    setCookie('surveyGridSize', event.target.value, { maxAge: 36000000000 });
                    setGridSize(event.target.value)
                  }} value={gridSize}>
                    <option value={12}>1</option>
                    <option value={6}>2</option>
                    {/* <option value={4}>3</option>
                    <option value={3}>4</option> */}
                  </Select>
                    &nbsp;<Typography>{t('landingPages.survey.surveysPerLine')}</Typography>
                  </>
                  }
                </Box>
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
                <Button
                  onClick={() => {
                    navigate(`${sitePrefix}EditRegistrationPage`, {
                      state: {
                        from: 'surveydetails',
                        PageProperty: 'landingPagesManagement'
                      }
                    })
                  }}
                  className={clsx(
                    classes.mr10,
                    classes.ml10,
                    windowSize !== "xs" ? classes.implementButtonFlex : classes.mt10,
                    classes.btn, classes.btnRounded,
                  )}
                  endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                  style={{ alignSelf: 'flex-end' }}
                >
                  {t('common.back')}
                </Button>
              </Box>
            </Box>
          }
        />
        <Box style={{ padding: 15 }}>
          <Grid container>
            {surveyResult && surveyResult?.map((item: SurveyResponse, idx: number) => {
              item.ID = !item.ID ? uuidv4() : item.ID;
              return <Grid item xs={gridSize || 0} key={`grid_${idx}`}>
                <Paper elevation={2} key={idx} className={classes.surveyPapaerContainer}>
                  {item.QuestionType === eQuestionType.Text ? (
                    <ListSubheader className={clsx(classes.textAnswerDirection, classes.subHeaderInherit, classes.font16)}>
                      <b className={classes.font16}>{item?.Question}</b>&nbsp;({renderQuestionType(item.QuestionType)})
                      <Box className={classes.font16}>{`${item?.Answers.length} ${t('common.Comments')}`}</Box>
                    </ListSubheader>
                  ) : (
                    <Box className={classes.p15}>
                      <Box className={clsx(classes.dFlex, classes.justifySpaceBetween)}>
                        <Box className={classes.font16}><b>{item?.Question}</b>&nbsp;({renderQuestionType(item.QuestionType)})</Box>
                        {(item.QuestionType === eQuestionType.MultipleSelect ||
                          item.QuestionType === eQuestionType.SingleSelect) &&
                          <Box className={classes.dFlex}>
                            <IconSwitch
                              classes={classes}
                              icons={[
                                {
                                  ID: uuidv4(),
                                  Icon: <FaChartPie />,
                                  OnClick: () => {
                                    const newArr = surveyResult?.map((sItem: SurveyResponse, idx: number) => {
                                      if (sItem.ID === item.ID) {
                                        sItem.ShowAsPie = true;
                                      }
                                      return sItem;
                                    });
                                    setSurveyResult(newArr);
                                  },
                                  Title: 'show as Pie',
                                  Enabled: item.ShowAsPie === true || (item.QuestionType === eQuestionType.SingleSelect && item.ShowAsPie === undefined)
                                },
                                {
                                  ID: uuidv4(),
                                  Icon: <PiChartBarHorizontalFill />,
                                  OnClick: () => {
                                    const newArr = surveyResult?.map((sItem: SurveyResponse, idx: number) => {
                                      if (sItem.ID === item.ID) {
                                        sItem.ShowAsPie = false;
                                      }
                                      return sItem;
                                    });
                                    setSurveyResult(newArr);
                                  },
                                  Title: 'show as graph',
                                  Enabled: item.ShowAsPie === false || (item.QuestionType === eQuestionType.MultipleSelect && item.ShowAsPie === undefined)
                                }]}
                            />
                          </Box>
                        }
                      </Box>
                      <Box className={classes.font16}>{`${item?.Answers.length} ${t('common.Comments')}`}</Box>
                    </Box>
                  )}
                  <Divider className={classes.mt15} />
                  <Box className={classes.surveyResults}>
                    {renderResults(item)}
                  </Box>
                </Paper>
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