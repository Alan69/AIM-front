import baseApi from "..";

export type TPostTypesData = {
  id: string;
  name: string;
  en_name: string;
  en_description: string;
}

export const postTypesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPostTypesList: build.query<TPostTypesData[], void>({
      query: () => ({
        url: '/post_types/',
          method: 'GET'
        }),
      transformResponse: (response: TPostTypesData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPostTypesListQuery,
} = postTypesApi;
