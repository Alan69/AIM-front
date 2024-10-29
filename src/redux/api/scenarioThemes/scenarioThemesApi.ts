import baseApi from "..";

export type TScenarioThemesData = {
  id: string;
  name: string;
  description: string;
}

export const scenarioThemesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getScenarioThemesList: build.query<TScenarioThemesData[], void>({
      query: () => ({
        url: '/scenario-themes/',
          method: 'GET'
        }),
      transformResponse: (response: TScenarioThemesData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetScenarioThemesListQuery,
} = scenarioThemesApi;
