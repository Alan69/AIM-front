import baseApi from "..";

export type TLanguagesData = {
  id: string;
  name: string;
  en_name: string;
}

export const languagesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getLanguagesList: build.query<TLanguagesData[], void>({
      query: () => ({
        url: '/languages/',
          method: 'GET'
        }),
      transformResponse: (response: TLanguagesData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLanguagesListQuery,
} = languagesApi;
