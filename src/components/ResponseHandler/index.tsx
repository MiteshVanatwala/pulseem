import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../Models/StateTypes";
import { setAPIResponse } from "../../redux/reducers/coreSlice"; //smsOldVersion
import Toast from "../Toast/Toast.component";

type ResponseType = {
  payload: {
    StatusCode: string;
    Message: {
      StatusCode: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
};

const ResponseHandler = () => {
  const { APIResponse } = useSelector((state: StateType) => state.core);
  const dispatch = useDispatch();
  if (!APIResponse) {
    return <></>;
  }
  console.log("APIResponse: ", APIResponse);
  let { payload, toastMessages } = APIResponse;
  if (["200", "201"].indexOf(payload.StatusCode) > -1) {
    setTimeout(() => {
      dispatch(setAPIResponse(null));
    }, 4000);
    return <Toast data={toastMessages[payload.StatusCode]} />;
  } else {
    setTimeout(() => {
      dispatch(setAPIResponse(null));
    }, 4000);
    return <Toast data={toastMessages[payload.StatusCode]} />;
  }
};

export default ResponseHandler;

// const handleResponses = (response, actions = {
//     'S_200': {
//       code: 200,
//       message: '',
//       Func: () => null
//     },
//     'S_201': {
//       code: 201,
//       message: '',
//       Func: () => getData()
//     },
//     'S_400': {
//       code: 400,
//       message: '',
//       Func: () => null
//     },
//     'S_401': {
//       code: 401,
//       message: '',
//       Func: () => null
//     },
//     'S_404': {
//       code: 404,
//       message: '',
//       Func: () => null
//     },
//     'S_405': {
//       code: 405,
//       message: '',
//       Func: () => null
//     },
//     'S_406': {
//       code: 406,
//       message: '',
//       Func: () => null
//     },
//     'S_422': {
//       code: 422,
//       message: '',
//       Func: () => null
//     },
//     'S_500': {
//       code: 500,
//       message: '',
//       Func: () => null
//     },
//     'default': {
//       message: '',
//       Func: () => null
//     },
//   }) => {
//     switch (response.payload?.StatusCode || response.payload?.Message.StatusCode) {
//       case 200: {
//         actions?.S_200?.Func?.();
//         actions?.S_200?.message && setToastMessage(actions?.S_200?.message);
//         break;
//       }
//       case 201: {
//         actions?.S_201?.Func?.();
//         actions?.S_201?.message && setToastMessage(actions?.S_201?.message);
//         break;
//       }
//       case 400: {
//         actions?.S_400?.Func?.();
//         actions?.S_400?.message && setToastMessage(actions?.S_400?.message);
//         break;
//       }
//       case 401: {
//         actions?.S_401?.Func?.();
//         actions?.S_401?.message && setToastMessage(actions?.S_401?.message);
//         break;
//       }
//       case 404: {
//         actions?.S_404?.Func?.();
//         actions?.S_404?.message && setToastMessage(actions?.S_404?.message);
//         break;
//       }
//       case 405: {
//         actions?.S_405?.Func?.();
//         actions?.S_405?.message && setToastMessage(actions?.S_405?.message);
//         break;
//       }
//       case 406: {
//         actions?.S_406?.Func?.();
//         actions?.S_406?.message && setToastMessage(actions?.S_406?.message);
//         break;
//       }
//       case 422: {
//         actions?.S_422?.Func?.();
//         actions?.S_422?.message && setToastMessage(actions?.S_422?.message);
//         break;
//       }
//       case 500: {
//         actions?.S_500?.Func?.();
//         actions?.S_500?.message && setToastMessage(actions?.S_500?.message);
//         break;
//       }
//       default: {
//         actions?.default?.Func?.();
//         actions?.default?.message && setToastMessage(actions?.default?.message);
//         setDialog(null);
//       }
//         setLoader(false);
//     }
//   }
