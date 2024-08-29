import { TPostQueryData } from 'modules/post-query/redux/api';
import baseApi from '../../../../redux/api';
import { TUserData } from 'modules/account/redux/api';
import { TTextStylesData } from 'redux/api/textStyles/textStylesApi';

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
  img_style?: TTextStylesData;
  post_query: TPostQueryData;
  author: TUserData;
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
    updatePost: build.mutation<TPostData, TUpdatePost>({
      query: ({ id, title, img_prompt, txt_prompt, main_text, hashtags, like, active, img_style, post_query, author }) => ({
        url: `/pbs/${id}/`,
        method: 'PUT',
        body: {
          title,
          img_prompt,
          txt_prompt,
          main_text,
          hashtags,
          like,
          active,
          img_style,
          post_query,
          author
        }
      }),
			transformResponse: (response: TPostData) => response,
      extraOptions: { showErrors: false }
    }),
    deletePost: build.mutation<string, string>({
      query: (id) => ({
        url: `posts/${id}/`,
        method: 'DELETE'
      })
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPostListQuery,
  useGetPostByIdQuery,
  useUpdatePostMutation,
  useDeletePostMutation
} = postApi;
