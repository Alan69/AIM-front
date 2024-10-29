import baseApi from "..";

export type TContentTypesData = {
  id: string;
  name: string;
  description: string;
}

export const contentTypesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getContentTypesList: build.query<TContentTypesData[], void>({
      query: () => ({
        url: '/content-types/',
          method: 'GET'
        }),
      transformResponse: (response: TContentTypesData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetContentTypesListQuery,
} = contentTypesApi;
