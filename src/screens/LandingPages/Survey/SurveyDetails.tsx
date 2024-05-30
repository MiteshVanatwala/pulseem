import { Box, Button, Divider, Grid, List, ListItem, ListItemAvatar, ListItemText, ListSubheader, Paper, Select, Typography } from "@material-ui/core";
import DefaultScreen from "../../DefaultScreen";
import { Title } from "../../../components/managment/Title";
import { Loader } from "../../../components/Loader/Loader";
import clsx from 'clsx';
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
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
import { MdQuestionAnswer } from "react-icons/md";
import { getCookie, setCookie } from "../../../helpers/Functions/cookies";

const SurveyDetails = ({ classes }: any) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { isRTL, windowSize } = useSelector((state: StateType) => state.core);
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
          <List style={{ width: '100%', maxWidth: 'calc(100% - 15px)', direction: isRTL ? 'rtl' : 'ltr' }}>
            {item.Answers.map((answer: string, idx: number) => {
              return <><ListItem alignItems="flex-start" key={idx}>
                <ListItemAvatar>
                  <MdQuestionAnswer />

                </ListItemAvatar>
                <ListItemText
                  primary="תשובת סקר"
                  secondary={answer}
                />
              </ListItem>
                <Divider variant="inset" component="li" />
              </>
            })}
          </List>
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
                {surveyResult && surveyResult?.length > 1 &&
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
                      <option value={4}>3</option>
                      <option value={3}>4</option>
                    </Select>
                      &nbsp;<Typography>{t('landingPages.survey.surveysPerLine')}</Typography>
                    </>
                    }
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
        <Box style={{ padding: 15 }}>
          <Grid container>
            {surveyResult && surveyResult?.map((item: SurveyResponse, idx: number) => {
              return <Grid item xs={gridSize}>
                <Paper elevation={2} key={idx} className={classes.surveyPapaerContainer}>
                  {item.QuestionType === eQuestionType.Text ? (
                    <ListSubheader className={clsx(classes.textAnswerDirection, classes.subHeaderInherit)}>
                      <b>{item?.Question}</b>&nbsp;({renderQuestionType(item.QuestionType)})
                      <Box>{`${item?.Answers.length} ${t('common.Comments')}`}</Box>
                    </ListSubheader>
                  ) : (
                    <Box className={classes.p15}>
                      <b>{item?.Question}</b>&nbsp;({renderQuestionType(item.QuestionType)})
                      <Box>{`${item?.Answers.length} ${t('common.Comments')}`}</Box>
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