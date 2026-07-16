import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MatchAnalysisResult } from 'csdm/node/analysis/types';

type AnalysisState = {
  isLoading: boolean;
  result: MatchAnalysisResult | null;
  coachingReport: string;
  isGeneratingReport: boolean;
  error: string | null;
};

const initialState: AnalysisState = {
  isLoading: false,
  result: null,
  coachingReport: '',
  isGeneratingReport: false,
  error: null,
};

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    analysisStarted(state) {
      state.isLoading = true;
      state.error = null;
      state.result = null;
    },
    analysisSuccess(state, action: PayloadAction<MatchAnalysisResult>) {
      state.isLoading = false;
      state.result = action.payload;
    },
    analysisFailed(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    coachingReportStarted(state) {
      state.isGeneratingReport = true;
      state.coachingReport = '';
    },
    coachingReportChunk(state, action: PayloadAction<string>) {
      state.coachingReport += action.payload;
    },
    coachingReportFinished(state) {
      state.isGeneratingReport = false;
    },
    resetAnalysis() {
      return initialState;
    },
  },
});

export const {
  analysisStarted,
  analysisSuccess,
  analysisFailed,
  coachingReportStarted,
  coachingReportChunk,
  coachingReportFinished,
  resetAnalysis,
} = analysisSlice.actions;

export const analysisReducer = analysisSlice.reducer;

export function selectAnalysisResult(state: { analysis: AnalysisState }) {
  return state.analysis.result;
}

export function selectAnalysisLoading(state: { analysis: AnalysisState }) {
  return state.analysis.isLoading;
}

export function selectCoachingReport(state: { analysis: AnalysisState }) {
  return state.analysis.coachingReport;
}

export function selectIsGeneratingReport(state: { analysis: AnalysisState }) {
  return state.analysis.isGeneratingReport;
}
