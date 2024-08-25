import baseApi from "..";

export type TTextStylesData = {
  id: string;
  name: string;
  en_name: string;
  en_description: string;
}

export const textStylesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTextStylesList: build.query<TTextStylesData[], void>({
      query: () => ({
        url: '/text_styles/',
          method: 'GET'
        }),
      transformResponse: (response: TTextStylesData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTextStylesListQuery,
} = textStylesApi;
