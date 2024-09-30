import { TPostQueryData } from 'modules/post-query/redux/api';
import baseApi from '../../../../redux/api';
import { TUserData } from 'modules/account/redux/api';
import { TImgStylesData } from 'redux/api/imgStyles/imgStylesApi';

export type TPostData = {
  id: string;
  title: string;
  img_prompt: string;
  txt_prompt?: string;
  main_text: string;
  hashtags: string;
  like?: boolean;
  picture?: string;
  time_create?: string;
  time_update?: string;
  active?: boolean;
  img_style?: TImgStylesData;
  post_query: TPostQueryData;
  author: TUserData;
}

export type TCreatePost = {
  title: string;
  main_text: string;
  hashtags: string;
  picture?: string;
  like?: boolean;
  active?: boolean;
}

export type TUpdatePost = {
  id: string;
  title: string;
  img_prompt: string;
  txt_prompt?: string;
  main_text: string;
  hashtags: string;
  like?: boolean;
  active?: boolean;
  img_style?: string;
  post_query: string;
  author: string;
  picture?: string;
}

export type TRecreatePostImage = {
  id: string | undefined;
  img_prompt: string;
  img_style?: string;
}

export type TRecreatePostText = {
  id: string | undefined;
  txt_prompt: string;
  main_text?: string;
}

export type TPostNow = {
  post_id: string;
  social_media_account_ids: string[];
}

export type TPostNowResponse = {
  message: string;
  post_id: string;
  social_media_accounts: string[];
}

export const postApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPostList: build.query<TPostData[], string>({
      query: (post_queries_id) => ({
        url: `/post_queries/${post_queries_id}/posts/`,
        method: 'GET'
      }),
      transformResponse: (response: TPostData[]) => response,
    }),
    getPostById: build.query<TPostData, string>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'GET'
      }),
      transformResponse: (response: TPostData) => response,
    }),
    getPostListByCompanyId: build.query<TPostData[], string | undefined>({
      query: (company_id) => ({
        url: `/posts/${company_id}/posts/`,
        method: 'GET'
      }),
      transformResponse: (response: TPostData[]) => response,
    }),
    createPost: build.mutation<TPostData, TCreatePost>({
      query: ({ title, main_text, hashtags, picture, like, active }) => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('main_text', main_text || '');
        formData.append('hashtags', hashtags || '');
        like && formData.append('like', like.toString());
        active && formData.append('active', active.toString());
        
        if (picture) {
          formData.append('picture', picture);
        }
    
        return {
          url: '/posts/',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: TPostData) => response,
      extraOptions: { showErrors: false },
    }),
    createCustomPost: build.mutation<TPostData, TCreatePost>({
      query: ({ title, main_text, hashtags, picture, like, active }) => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('main_text', main_text || '');
        formData.append('hashtags', hashtags || '');
        like && formData.append('like', like.toString());
        
        if (picture) {
          formData.append('picture', picture);
        }
    
        return {
          url: '/post/custom/',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: TPostData) => response,
      extraOptions: { showErrors: false },
    }),
    updatePost: build.mutation<TPostData, TUpdatePost>({
      query: ({ id, title, img_prompt, txt_prompt, main_text, hashtags, like, active, img_style, post_query, author, picture }) => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('img_prompt', img_prompt || '');
        formData.append('txt_prompt', txt_prompt || '');
        formData.append('main_text', main_text || '');
        formData.append('hashtags', hashtags || '');
        like && formData.append('like', like.toString());
        active && formData.append('active', active.toString());
        formData.append('img_style', img_style || '');
        formData.append('post_query', post_query.toString());
        formData.append('author', author.toString());
        
        if (picture) {
          formData.append('picture', picture);
        }
    
        return {
          url: `/posts/${id}/`,
          method: 'PUT',
          body: formData,
        };
      },
      transformResponse: (response: TPostData) => response,
      extraOptions: { showErrors: false },
    }),
    recreatePostImage: build.mutation<TRecreatePostImage, TRecreatePostImage>({
      query: ({ id, img_prompt, img_style }) => ({
        url: `/posts/image/update/${id}/`,
        method: 'PATCH',
        body: {
          img_prompt,
          img_style
        }
      }),
			transformResponse: (response: TRecreatePostImage) => response,
      extraOptions: { showErrors: false }
    }),
    recreatePostText: build.mutation<TRecreatePostText, TRecreatePostText>({
      query: ({ id, txt_prompt, main_text }) => ({
        url: `/posts/text/update/${id}/`,
        method: 'PATCH',
        body: {
          txt_prompt,
          main_text
        }
      }),
			transformResponse: (response: TRecreatePostText) => response,
      extraOptions: { showErrors: false }
    }),
    deletePost: build.mutation<string, string>({
      query: (id) => ({
        url: `/posts/${id}/`,
        method: 'DELETE'
      })
    }),
    postNow: build.mutation<TPostNowResponse, TPostNow>({
      query: ({post_id, social_media_account_ids}) => ({
        url: '/post/now/',
        method: 'POST',
        body: {
          post_id,
          social_media_account_ids
        }
      }),
      transformResponse: (response: TPostNowResponse) => response,
      extraOptions: { showErrors: false }
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPostListQuery,
  useGetPostByIdQuery,
  useLazyGetPostByIdQuery,
  useGetPostListByCompanyIdQuery,
  useCreatePostMutation,
  useCreateCustomPostMutation,
  useUpdatePostMutation,
  useRecreatePostImageMutation,
  useRecreatePostTextMutation,
  useDeletePostMutation,
  usePostNowMutation
} = postApi;
