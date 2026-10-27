import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  jobs: [],
  loading: false,
  error: null,

  // Recruiter ke Admin Jobs page ke liye separate state
  allAdminJobs: [],
  adminJobsLoading: false,
  adminJobsError: null,
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    // Existing Jobs page actions
    setJobs: (state, action) => {
      state.jobs = action.payload;
    },
    setJobsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setJobsError: (state, action) => {
      state.error = action.payload;
    },

    // Admin Jobs page actions
    setAllAdminJobs: (state, action) => {
      state.allAdminJobs = action.payload;
    },
    setAllAdminJobsLoading: (state, action) => {
      state.adminJobsLoading = action.payload;
    },
    setAllAdminJobsError: (state, action) => {
      state.adminJobsError = action.payload;
    },
  },
});

export const {
  setJobs,
  setJobsLoading,
  setJobsError,
  setAllAdminJobs,
  setAllAdminJobsLoading,
  setAllAdminJobsError,
} = jobsSlice.actions;

export default jobsSlice.reducer;
