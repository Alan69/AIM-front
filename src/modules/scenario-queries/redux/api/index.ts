import { TCompanyData } from 'modules/company/redux/api';
import baseApi from '../../../../redux/api';
import { TProductData } from 'modules/product/redux/api';
import { TLanguagesData } from 'redux/api/languages/languagesApi';
import { TScenarioTypesData } from 'redux/api/scenarioTypes/scenarioTypesApi';
import { TScenarioThemesData } from 'redux/api/scenarioThemes/scenarioThemesApi';

export type TScenarioQueriesData = {
  id: string;
  latency: string;
  description: string;
  time_create: string;
  time_update?: string;
  company: TCompanyData | null;
  product: TProductData | null;
  target_audience: string;
  scenario_type: TScenarioTypesData;
  scenario_theme: TScenarioThemesData;
  language: TLanguagesData;
  author: string;
}

export type TScenarioQueriesCreateData = {
  id?: string;
  latency: string;
  description: string;
  company: string | undefined;
  product: string;
  target_audience: string; 
  scenario_type: string;
  scenario_theme: string;
  language: string;
}

export type TIdeaQueriesCreateResponse = {
  id: string;
}

export const scenarioQueriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getScenarioQueriesList: build.query<TScenarioQueriesData[], void>({
      query: () => ({
        url: '/scenario-queries/',
        method: 'GET'
      }),
      transformResponse: (response: TScenarioQueriesData[]) => response,
    }),
    getScenarioQueriesById: build.query<TScenarioQueriesData, string>({
      query: (id) => ({
        url: `/scenario-queries/${id}`,
        method: 'GET'
      }),
      transformResponse: (response: TScenarioQueriesData) => response,
    }),
    createScenarioQueries: build.mutation<TIdeaQueriesCreateResponse, TScenarioQueriesCreateData>({
      query: ({ latency, description, company, product, target_audience, scenario_type, scenario_theme, language }) => ({
        url: '/scenario-queries/',
        method: 'POST',
        body: {
          latency,
          description,
          company,
          product,
          target_audience,
          scenario_type,
          scenario_theme,
          language,
        }
      }),
      transformResponse: (response: TIdeaQueriesCreateResponse) => response,
    }),
    createScenarioQueriesReplay: build.mutation<TIdeaQueriesCreateResponse, TScenarioQueriesCreateData>({
      query: ({ id, latency, description, company, product, target_audience, scenario_type, scenario_theme, language }) => ({
        url: `/scenario-queries/${id}/replay/`,
        method: 'POST',
        body: {
          latency,
          description,
          company,
          product,
          target_audience,
          scenario_type,
          scenario_theme,
          language,
        }
      }),
      transformResponse: (response: TIdeaQueriesCreateResponse) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetScenarioQueriesListQuery,
  useGetScenarioQueriesByIdQuery,
  useCreateScenarioQueriesMutation,
  useCreateScenarioQueriesReplayMutation
} = scenarioQueriesApi;
