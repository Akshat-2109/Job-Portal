import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";

import {
  setAllAdminJobs,
  setAllAdminJobsLoading,
  setAllAdminJobsError,
} from "../../redux/jobsSlice";
import { JOB_API_END_POINT } from "../../utils/constant";

const useGetAllAdminJobs = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAdminJobs = async () => {
      dispatch(setAllAdminJobsLoading(true));
      dispatch(setAllAdminJobsError(null));

      try {
        const response = await axios.get(`${JOB_API_END_POINT}/getadminjobs`, {
          withCredentials: true,
        });

        if (response.data.success) {
          dispatch(setAllAdminJobs(response.data.jobs || []));
        } else {
          dispatch(
            setAllAdminJobsError(
              response.data.message || "Unable to fetch admin jobs.",
            ),
          );
        }
      } catch (error) {
        dispatch(
          setAllAdminJobsError(
            error.response?.data?.message || "Unable to fetch admin jobs.",
          ),
        );
      } finally {
        dispatch(setAllAdminJobsLoading(false));
      }
    };

    fetchAdminJobs();
  }, [dispatch]);
};

export default useGetAllAdminJobs;
