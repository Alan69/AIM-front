import baseApi from '../../../../redux/api';

export type TCreateStoriesRequest = {
  media: File;
}

export type TCreateStoriesResponse = {
  message: string;
  storie_id: string;
  media_url: string;
}

export type TPostStoriesNowRequest = {
  story: string;
  social_media_accounts: string[];
}

export type TPostStoriesNowResponse = {
  message: string;
  storie_id: string;  
  social_media_accounts: string[];
}

export type TStoriesData = {
  id: string;
  media: string;
}

export const storiesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStoriesById: build.query<TStoriesData, string>({
      query: (id) => ({
        url: `/storie/${id}`,
        method: 'GET'
      }),
      transformResponse: (response: TStoriesData) => response,
    }),
    createCustomStories: build.mutation<TCreateStoriesResponse, TCreateStoriesRequest>({
      query: ({ media }) => {
        const formData = new FormData();

        if (media) {
          formData.append('media', media);
        }

        return {
          url: '/storie/create/',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: TCreateStoriesResponse) => response,
      extraOptions: { showErrors: false },
    }),
    postStoriesNow: build.mutation<TPostStoriesNowResponse, TPostStoriesNowRequest>({
      query: ({story, social_media_accounts}) => ({
        url: '/storie/now/',
        method: 'POST',
        body: {
          story,
          social_media_accounts,
        }
      }),
      transformResponse: (response: TPostStoriesNowResponse) => response,
      extraOptions: { showErrors: false }
    }),

  }),
  overrideExisting: false,
});

export const {
  useLazyGetStoriesByIdQuery,
  useCreateCustomStoriesMutation,
  usePostStoriesNowMutation
} = storiesApi;
