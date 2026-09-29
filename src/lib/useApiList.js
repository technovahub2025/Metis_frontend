import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest } from "./api";

export function useApiList(path, initialParams = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep the params reference stable between renders
  const stableParams = useMemo(
    () => initialParams,
    [JSON.stringify(initialParams)]
  );

  const fetchList = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams(params).toString();

      const url = query
        ? `${path}?${query}`
        : path;

      try {
        const response = await apiRequest(url);

        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        setData(list);

        setTotal(
          response?.total ?? list.length
        );

        return response;
      } catch (apiError) {
        setError(apiError);
        setData([]);
        setTotal(0);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [path]
  );

  useEffect(() => {
    fetchList(stableParams);
  }, [fetchList, stableParams]);

  const refetch = useCallback(
    (params = {}) => fetchList(params),
    [fetchList]
  );

  return {
    data,
    total,
    loading,
    error,
    refetch,
  };
}