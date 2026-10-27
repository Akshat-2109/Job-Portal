import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setJobs, setJobsLoading, setJobsError } from "@/redux/jobsSlice";
import { JOB_API_END_POINT } from "@/utils/constant";

const useGetAllJobs = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchJobs = async () => {
      dispatch(setJobsLoading(true));
      dispatch(setJobsError(null));

      try {
        const response = await axios.get(`${JOB_API_END_POINT}/get`, {
          withCredentials: true,
        });

        dispatch(setJobs(response.data.jobs || []));
      } catch (error) {
        if (error.response?.status === 404) {
          dispatch(setJobs([]));
          dispatch(setJobsError(null));
        } else {
          dispatch(
            setJobsError(
              error.response?.data?.message || "Failed to fetch jobs",
            ),
          );
        }
      } finally {
        dispatch(setJobsLoading(false));
      }
    };

    fetchJobs();
  }, [dispatch]);
};

export default useGetAllJobs;
