import baseApi from "..";

export type TScenarioTypesData = {
  id: string;
  name: string;
  description: string;
}

export const scenarioTypesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getScenarioTypesList: build.query<TScenarioTypesData[], void>({
      query: () => ({
        url: '/scenario-types/',
          method: 'GET'
        }),
      transformResponse: (response: TScenarioTypesData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetScenarioTypesListQuery,
} = scenarioTypesApi;
