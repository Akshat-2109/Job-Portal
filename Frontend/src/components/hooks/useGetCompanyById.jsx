import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  setCompany,
  setCompanyLoading,
  setCompanyError,
} from "../../redux/companySlice";
import { COMPANY_API_END_POINT } from "../../utils/constant";

const useGetCompanyById = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        dispatch(setCompanyLoading(true));
        dispatch(setCompanyError(null));

        const response = await axios.get(`${COMPANY_API_END_POINT}/get/${id}`, {
          withCredentials: true,
        });

        if (response.data.success) {
          dispatch(setCompany(response.data.company));
        }
      } catch (error) {
        dispatch(
          setCompanyError(
            error.response?.data?.message || "Failed to fetch company details",
          ),
        );
      } finally {
        dispatch(setCompanyLoading(false));
      }
    };

    if (id) {
      fetchCompany();
    }

    return () => {
      dispatch(setCompany(null));
    };
  }, [id, dispatch]);
};

export default useGetCompanyById;
