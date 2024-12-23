import baseApi from '../../../../redux/api';

export type TCreateReelRequest = {
  title: string;
  main_text: string;
  hashtags: string;
  media: File[];
}

export type TCreateReelResponse = {
  message: string;
  reel_id: string;
}

export type TPostReelNowRequest = {
  reel: string;
  social_media_accounts: string[];
  reel_media: string[] | undefined;
}

export type TPostReelNowResponse = {
  message: string;
  reel_id: string;  
  social_media_accounts: string[];
  reel_media: string[];
}

export type TReelMediaData = {
  id: string;
  media: string;
}

export type TReelData = {
  id: string;
  title: string;
  main_text: string;
  hashtags: string;
  reelMediaList?: TReelMediaData[];
  previous_media?: TReelMediaData[];
}

export const reelApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReelById: build.query<TReelData, string>({
      query: (id) => ({
        url: `/reel/${id}`,
        method: 'GET'
      }),
      transformResponse: (response: TReelData) => response,
    }),
    getReelMediaListById: build.query<TReelMediaData[], string>({
      query: (id) => ({
        url: `/reel/${id}/media/`,
        method: 'GET'
      }),
      transformResponse: (response: TReelMediaData[]) => response,
    }),
    createCustomReel: build.mutation<TCreateReelResponse, TCreateReelRequest>({
      query: ({ title, main_text, hashtags, media }) => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('main_text', main_text || '');
        formData.append('hashtags', hashtags || '');
        
        if (media && media.length > 0) {
            media.forEach((file) => {
              formData.append('media', file); 
            });
          }
    
        return {
          url: '/reel/create/',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: TCreateReelResponse) => response,
      extraOptions: { showErrors: false },
    }),
    postReelNow: build.mutation<TPostReelNowResponse, TPostReelNowRequest>({
      query: ({reel, social_media_accounts, reel_media}) => ({
        url: '/reel/now/',
        method: 'POST',
        body: {
          reel,
          social_media_accounts,
          reel_media
        }
      }),
      transformResponse: (response: TPostReelNowResponse) => response,
      extraOptions: { showErrors: false }
    }),

  }),
  overrideExisting: false,
});

export const {
  useLazyGetReelByIdQuery,
  useLazyGetReelMediaListByIdQuery,
  useCreateCustomReelMutation,
  usePostReelNowMutation
} = reelApi;
