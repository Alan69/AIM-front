import baseApi from "..";

export type TJobTypesData = {
  id: string
  name: string
}

export const jobTypesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getJobTypesList: build.query<TJobTypesData[], void>({
      query: () => ({
        url: '/jobtypes/',
          method: 'GET'
        }),
      transformResponse: (response: TJobTypesData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetJobTypesListQuery,
} = jobTypesApi;
