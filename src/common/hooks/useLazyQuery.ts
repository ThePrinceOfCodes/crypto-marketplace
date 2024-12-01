import { useCallback, useState } from "react";
import {
  QueryFunction,
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "react-query";

type UseLazyQueryPropTypes<TData, TError> = {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData, QueryKey>;
  options?: Omit<
    UseQueryOptions<TData, TError, TData, QueryKey>,
    "queryKey" | "queryFn"
  >;
};

export function useLazyQuery<TData, TError>({
  queryKey,
  queryFn,
  options,
}: UseLazyQueryPropTypes<TData, TError>): [
  () => void,
  UseQueryResult<TData, TError>,
] {
  const [enabled, setEnabled] = useState(false);

  const query = useQuery<TData, TError, TData, QueryKey>(queryKey, queryFn, {
    ...options,
    enabled,
  });

  const trigger = useCallback(() => {
    if (!enabled) {
      setEnabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryFn, enabled]);

  return [trigger, query];
}
