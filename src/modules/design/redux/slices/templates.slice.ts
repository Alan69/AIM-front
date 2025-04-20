import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Template, TemplateSizeType } from '../../types';

interface TemplatesState {
  templates: Template[];
  loading: boolean;
  error: string | null;
  selectedSize: TemplateSizeType;
  currentPage: number;
  pageSize: number;
  total: number;
  searchQuery: string;
  activeTab: 'all' | 'my' | 'liked';
}

const initialState: TemplatesState = {
  templates: [],
  loading: false,
  error: null,
  selectedSize: '1080x1080',
  currentPage: 1,
  pageSize: 12,
  total: 0,
  searchQuery: '',
  activeTab: 'all'
};

export const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setTemplates: (state, action: PayloadAction<{ templates: Template[]; total: number }>) => {
      state.templates = action.payload.templates;
      state.total = action.payload.total;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedSize: (state, action: PayloadAction<TemplateSizeType>) => {
      state.selectedSize = action.payload;
      state.currentPage = 1; // Reset to first page when changing size
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page when searching
    },
    setActiveTab: (state, action: PayloadAction<'all' | 'my' | 'liked'>) => {
      state.activeTab = action.payload;
      state.currentPage = 1; // Reset to first page when changing tabs
    },
    updateTemplate: (state, action: PayloadAction<Template>) => {
      const index = state.templates.findIndex(t => t.uuid === action.payload.uuid);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
    },
    toggleLike: (state, action: PayloadAction<{ uuid: string; like: boolean }>) => {
      const template = state.templates.find(t => t.uuid === action.payload.uuid);
      if (template) {
        template.like = action.payload.like;
      }
    }
  }
});

export const templatesActions = templatesSlice.actions;
export const templatesReducer = templatesSlice.reducer; 