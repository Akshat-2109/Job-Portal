import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  companies: [],
  company: null,
  loading: false,
  error: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setCompanies: (state, action) => {
      state.companies = action.payload;
    },

    setCompany: (state, action) => {
      state.company = action.payload;
    },

    setCompanyLoading: (state, action) => {
      state.loading = action.payload;
    },

    setCompanyError: (state, action) => {
      state.error = action.payload;
    },

    addCompany: (state, action) => {
      state.companies.unshift(action.payload);
    },

    updateCompanyInList: (state, action) => {
      const updatedCompany = action.payload;

      state.companies = state.companies.map((company) =>
        company._id === updatedCompany._id ? updatedCompany : company,
      );

      if (state.company?._id === updatedCompany._id) {
        state.company = updatedCompany;
      }
    },

    removeCompany: (state, action) => {
      const companyId = action.payload;

      state.companies = state.companies.filter(
        (company) => company._id !== companyId,
      );

      if (state.company?._id === companyId) {
        state.company = null;
      }
    },

    clearCompanyError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCompanies,
  setCompany,
  setCompanyLoading,
  setCompanyError,
  addCompany,
  updateCompanyInList,
  removeCompany,
  clearCompanyError,
} = companySlice.actions;

export default companySlice.reducer;
