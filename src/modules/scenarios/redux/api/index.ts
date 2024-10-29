import baseApi from '../../../../redux/api';

export type TScenariosData = {
  id: string;
  scenario_query: string;
  topic: string;
  main_text: string;
  short_description: string;
  hashtags: string;
  author: string;
  time_create: string;
}

export const scenariosApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getScenariosList: build.query<TScenariosData[], string>({
      query: (scenario_query_id) => ({
        url: `/scenarios/${scenario_query_id}/`,
        method: 'GET'
      }),
      transformResponse: (response: TScenariosData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetScenariosListQuery,
} = scenariosApi;
