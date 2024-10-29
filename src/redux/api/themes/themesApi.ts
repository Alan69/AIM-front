import baseApi from "..";

export type TThemesData = {
  id: string;
  name: string;
  description: string;
}

export const themesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getThemesList: build.query<TThemesData[], void>({
      query: () => ({
        url: '/themes/',
          method: 'GET'
        }),
      transformResponse: (response: TThemesData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetThemesListQuery,
} = themesApi;
