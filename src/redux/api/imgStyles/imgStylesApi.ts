import baseApi from "..";

export type TImgStylesData = {
  id: string;
  name: string;
  en_name: string;
  en_description: string;
  picture: string;
}

export const imgStylesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getImgStylesList: build.query<TImgStylesData[], void>({
      query: () => ({
        url: '/img_styles/',
          method: 'GET'
        }),
      transformResponse: (response: TImgStylesData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetImgStylesListQuery,
} = imgStylesApi;
