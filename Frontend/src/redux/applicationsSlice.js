import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import { APPLICATION_API_END_POINT } from "../utils/constant";

// Fetch applicants for a particular job
export const getApplicants = createAsyncThunk(
  "applications/getApplicants",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${APPLICATION_API_END_POINT}/${jobId}/applicants`,
        { withCredentials: true },
      );

      return response.data.job;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch applicants.",
      );
    }
  },
);

// Update an applicant's status
export const updateApplicationStatus = createAsyncThunk(
  "applications/updateStatus",
  async ({ applicationId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${APPLICATION_API_END_POINT}/status/${applicationId}/update`,
        { status },
        { withCredentials: true },
      );

      return {
        applicationId,
        status: status.toLowerCase(),
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update application status.",
      );
    }
  },
);

const applicationsSlice = createSlice({
  name: "applications",
  initialState: {
    job: null,
    applicants: [],
    loading: false,
    updatingId: null,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearApplicationMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch applicants
      .addCase(getApplicants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getApplicants.fulfilled, (state, action) => {
        state.loading = false;
        state.job = action.payload;
        state.applicants = action.payload?.applications || [];
      })
      .addCase(getApplicants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch applicants.";
      })

      // Update status
      .addCase(updateApplicationStatus.pending, (state, action) => {
        state.updatingId = action.meta.arg.applicationId;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.updatingId = null;

        const { applicationId, status, message } = action.payload;

        state.applicants = state.applicants.map((application) =>
          application._id === applicationId
            ? { ...application, status }
            : application,
        );

        state.successMessage = message;
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.updatingId = null;
        state.error = action.payload || "Failed to update application status.";
      });
  },
});

export const { clearApplicationMessages } = applicationsSlice.actions;
export default applicationsSlice.reducer;
