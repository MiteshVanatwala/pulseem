import { useState, memo, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import {
  Box, Button, FormHelperText, Grid, InputLabel, TextField
} from '@material-ui/core'
import { useTranslation } from 'react-i18next';
import 'moment/locale/he';
import Toast from '../../../components/Toast/Toast.component';
import { Title } from '../../../components/managment/Title';
import { BiSave } from 'react-icons/bi';
import { useDispatch, useSelector } from 'react-redux';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { Loader } from '../../../components/Loader/Loader';
import { GetExtraFields, SetExtraFields, update } from '../../../redux/reducers/ExtraFieldsSlice';
import { ExtraFields } from '../../../Models/ExtraFields';
import { StateType } from '../../../Models/StateTypes';
import { PulseemResponse } from '../../../Models/APIResponse';
import { logout } from '../../../helpers/Api/PulseemReactAPI';
import { getCommonFeatures } from '../../../redux/reducers/commonSlice'
import { getAccountExtraData } from '../../../redux/reducers/smsSlice';

const ExtraFieldsEditor = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispatch: any = useDispatch();
  const { isRTL } = useSelector((state: StateType) => state.core);
  const { extraData } = useSelector((state: StateType) => state.extraFields);
  const [toastMessage, setToastMessage] = useState<any | never>(null);
  const { subAccount } = useSelector((state: any) => state.common)
  const [showLoader, setLoader] = useState(true);
  const [formDisabled, setFormDisabled] = useState<boolean>(true);
  const [ExtraFieldList, setExtraFieldList] = useState<ExtraFields>({
    ExtraField1: '',
    ExtraField2: '',
    ExtraField3: '',
    ExtraField4: '',
    ExtraField5: '',
    ExtraField6: '',
    ExtraField7: '',
    ExtraField8: '',
    ExtraField9: '',
    ExtraField10: '',
    ExtraField11: '',
    ExtraField12: '',
    ExtraField13: '',
    ExtraDate1: '',
    ExtraDate2: '',
    ExtraDate3: '',
    ExtraDate4: ''
  });

  const [preventedValues, setPreventedValues] = useState<any>([
    'Email',
    'FirstName',
    'LastName',
    'Telephone',
    'Cellphone',
    'Address',
    'City',
    'State',
    'Country',
    'Zip',
    'Company',
    'BirthDate',
    'ReminderDate'
  ]);
  const [errorFields, setErrorField] = useState<any>([]);


  useEffect(() => {
    if (subAccount?.length === 0) {
      // @ts-ignore
      dispatch(getCommonFeatures({ forceRequest: true }))
    }
    const getAccountExtraFields = async () => {
      const response = await dispatch(GetExtraFields()) as any;
      switch (response.payload?.StatusCode) {
        case 201: {
          setExtraFieldList(response.payload?.Data);
          setLoader(false);
          break;
        }
        case 403: {
          setLoader(false);
          setFormDisabled(true);
          break;
        }
        case 500: {
          setLoader(false);
          setFormDisabled(true);
          alert('error occured');
          break;
        }
        case 401: {
          setFormDisabled(true);
          logout();
        }
      }
    }

    getAccountExtraFields();
  }, []);

  useEffect(() => {
    if (subAccount && subAccount?.CompanyAdmin === true) {
      setFormDisabled(false);
    }

  }, [subAccount]);

  const saveExtraFieldData = async () => {
    if (validateForm()) {
      setLoader(true);

      const request = {
        ...ExtraFieldList
      } as ExtraFields;


      for (let [key, value] of Object.entries(request)) {
        request[key] = (value === null || value?.trim() === '') ? '' : value;
      }


      const response = await dispatch(SetExtraFields(request as ExtraFields));
      setLoader(false);
      handleResponse(response?.payload);
    }
  }

  const validateForm = () => {
    function checkIfDuplicateExists(arr: any) {
      return new Set(arr).size !== arr.length
    }

    let isValid = true;
    setErrorField([]);

    const hasDuplicated = checkIfDuplicateExists([...preventedValues, ...Object.values(ExtraFieldList)]);

    if (hasDuplicated) {
      const keys: any = [];

      preventedValues.filter((z: any) => z !== '').forEach((str: string | any) => {
        const exists = Object.keys(ExtraFieldList).filter((x: any) => {
          return ExtraFieldList[x] !== null && ExtraFieldList[x] !== '' && ExtraFieldList[x]?.toLowerCase() === str?.toLowerCase()
        });
        if (exists?.length > 0) {
          keys.push(...exists);
        }
      });

      Object.values(ExtraFieldList).filter((z: any) => z !== '').forEach((str: string | any) => {
        const exists = Object.keys(ExtraFieldList).filter((x: any) => {
          return ExtraFieldList[x] !== null && ExtraFieldList[x] !== '' && ExtraFieldList[x]?.toLowerCase() === str?.toLowerCase()
        });
        if (exists?.length > 1) {
          keys.push(...exists);
        }
      });

      if (keys && keys?.length > 0) {
        setErrorField(keys);
        isValid = false;
      }

    }

    return isValid;
  }

  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return (
      <Toast data={toastMessage} customData={null} />
    );
  }

  const showErrorToast = (message: string) => setToastMessage({ severity: 'error', color: 'error', message, showAnimtionCheck: false } as any)

  const showSuccessToast = (message: string) => setToastMessage({ severity: 'success', color: 'success', message, showAnimtionCheck: true } as any);

  const handleResponse = (response: PulseemResponse) => {
    switch (response.StatusCode) {
      case 201: {
        showSuccessToast(t('common.ExtraFieldSaved'));
        // This is a patch!
        // We should move to the new method in ExtraFieldsSlice & global store state
        dispatch(getAccountExtraData());
        // New logic for updating global store state
        dispatch(update(ExtraFieldList))
        break;
      }
      case 401:
      case 403: {
        logout();
        break;
      }
      case 500:
      default: {
        showErrorToast(t('common.Error'));
        break;
      }
    }
  }

  const onExtraFieldChange = (event: any, field: string) => {
    const inputVal = event.target.value;

    setExtraFieldList({
      ...ExtraFieldList,
      [field]: inputVal
    });
  }

  return (
    <DefaultScreen
      currentPage="settings"
      subPage="accountExtraFields"
      key="accountExtraFields"
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      <Box className={classes.mb50}>
        {toastMessage && renderToast()}
        <Box className={'topSection'}>
          <Title Text={t('common.extraFields')} classes={classes} />

          <Box className={clsx(classes.p20)}>
            <div className={clsx(classes.f20, classes.semibold, classes.p10, classes.greyBackground, classes.mb20)}>{t('common.SharedSubAccountFields')}</div>
            <Grid container className={classes.pb25} spacing={4}>
              {
                Object.keys(ExtraFieldList).filter((x: string) => { return x.toLocaleLowerCase().indexOf('extrafield') > -1 }).map((field: string, idx: number) => {
                  return (
                    <Grid item xs={3} sm={3} md={3}>
                      <InputLabel className={classes.fBlack}>{t(`common.${field}`)}</InputLabel>
                      <TextField
                        variant='outlined'
                        size='small'
                        value={ExtraFieldList[field]}
                        onChange={(event: any) => onExtraFieldChange(event, field)}
                        className={clsx(classes.w100, classes.textField, classes.mt25, formDisabled ? classes.disabled : null)}
                      />
                      {
                        errorFields.indexOf(field) > -1 && <FormHelperText className={clsx(classes.f14, classes.red)} key={idx}>
                          {t('common.duplicatedValue')}
                        </FormHelperText>
                      }
                    </Grid>
                  );
                })
              }
            </Grid>

            <div className={clsx(classes.f20, classes.semibold, classes.p10, classes.greyBackground, classes.mb20, classes.mt20)}>{t('common.SharedSubAccountDateFields')}</div>
            <Grid container className={classes.pb25} spacing={4}>
              {
                Object.keys(ExtraFieldList).filter((x: string) => { return x.toLocaleLowerCase().indexOf('extradate') > -1 }).map((field: string) => {
                  return (
                    <Grid item xs={3} sm={3} md={3}>
                      <InputLabel className={classes.fBlack}>{t(`common.${field}`)}</InputLabel>
                      <TextField
                        variant='outlined'
                        size='small'
                        value={ExtraFieldList[field]}
                        onChange={(event: any) => setExtraFieldList({
                          ...ExtraFieldList,
                          [field]: event.target.value
                        })}
                        className={clsx(classes.w100, classes.textField, classes.mt25, formDisabled ? classes.disabled : null)}
                      />
                    </Grid>
                  );
                })
              }
            </Grid>

            <Box className={clsx(classes.flex, classes.pt25)} style={{ justifyContent: 'end', marginTop: 15 }}>
              {subAccount && subAccount?.CompanyAdmin === true && <Button
                className={clsx(
                  classes.btn,
                  classes.btnRounded
                )}
                style={{ margin: '8px' }}
                startIcon={<BiSave />}
                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                onClick={() => saveExtraFieldData()}
              >
                {t("common.save")}
              </Button>}
            </Box>
          </Box>
        </Box>
      </Box>
      <Loader isOpen={showLoader} />
    </DefaultScreen>
  )
}

export default memo(ExtraFieldsEditor);