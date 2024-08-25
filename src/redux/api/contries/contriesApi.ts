import baseApi from "..";

export type TLocationTypesData = {
  id: string
  name: string
}

export const contriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getContriesList: build.query<TLocationTypesData[], void>({
      query: () => ({
        url: '/contries/',
          method: 'GET'
        }),
      transformResponse: (response: TLocationTypesData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetContriesListQuery
} = contriesApi;
