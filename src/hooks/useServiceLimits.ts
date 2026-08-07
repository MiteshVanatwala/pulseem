import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAccountLimits } from "../redux/reducers/serviceLimitsSlice";
import { IServiceLimits, IServiceUsage } from "../Models/ServiceLimits/ServiceLimits";

type NumericLimitKey =
  | 'maxServiceAgents'
  | 'maxChatbots'
  | 'maxAiContextWords'
  | 'monthlyMessageVolume';

const isFiniteNumber = (value: any): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const useServiceLimits = () => {
  const dispatch = useDispatch();
  const { limits, usage, status } = useSelector((state: any) => state.serviceLimits) as {
    limits: IServiceLimits | null;
    usage: IServiceUsage | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
  };

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getAccountLimits() as any);
    }
  }, [status, dispatch]);

  const refresh = useCallback(() => {
    dispatch(getAccountLimits() as any);
  }, [dispatch]);

  // null = unlimited/unknown. Any missing, negative, or non-finite value fails open the same way.
  const getLimit = useCallback((key: NumericLimitKey): number | null => {
    const value = limits?.[key];
    return isFiniteNumber(value) && value >= 0 ? value : null;
  }, [limits]);

  // Structural fail-open: only a positive finite limit AND a finite current can ever produce true.
  const isAtLimit = useCallback((key: NumericLimitKey, current: number): boolean => {
    const limit = getLimit(key);
    return limit !== null && isFiniteNumber(current) && current >= limit;
  }, [getLimit]);

  return {
    limits,
    usage,
    isLoading: status === 'loading',
    isAtLimit,
    getLimit,
    refresh,
  };
};
