import baseApi from "..";

export type TVideoTypesData = {
  id: string;
  name: string;
  en_name: string;
  en_description: string;
}

export const videoTypesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getVideoTypesList: build.query<TVideoTypesData[], void>({
      query: () => ({
        url: '/post_types/',
          method: 'GET'
        }),
      transformResponse: (response: TVideoTypesData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVideoTypesListQuery,
} = videoTypesApi;
