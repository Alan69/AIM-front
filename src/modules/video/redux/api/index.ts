import { TVideoQueryData } from 'modules/video-query/redux/api';
import baseApi from '../../../../redux/api';
import { TUserData } from 'modules/account/redux/api';
import { TImgStylesData } from 'redux/api/imgStyles/imgStylesApi';
import { Template } from '../../../design/types';

export type TPreviousVideoImage = {
  id: string;
  media: string;
}

export type TVideoData = {
  id: string;
  title: string;
  img_prompt: string;
  txt_prompt?: string;
  main_text: string;
  hashtags: string;
  like?: boolean;
  cover?: string;
  time_create?: string;
  time_update?: string;
  active?: boolean;
  img_style?: TImgStylesData;
  video_query: TVideoQueryData;
  author: TUserData;
  media?: string;
  image_id: {
    id: string
  }
  previousvideoimage: TPreviousVideoImage[]
  template?: string;
}

export type TCreateVideo = {
  title: string;
  main_text: string;
  hashtags: string;
  cover?: string;
  like?: boolean;
  active?: boolean;
}

export type TUpdateVideo = {
  id: string;
  title: string;
  img_prompt: string;
  txt_prompt?: string;
  main_text: string;
  hashtags: string;
  like?: boolean;
  active?: boolean;
  img_style?: string;
  video_query: string;
  author: string;
  cover?: string;
  template?: string;
}

export type TRecreateVideoImage = {
  id: string | undefined;
  img_prompt: string;
  img_style?: string;
}

export type TRecreateVideoText = {
  id: string | undefined;
  txt_prompt: string;
  main_text?: string;
}

export type TVideoNow = {
  video_id: string;
  social_media_account_ids: string[];
  previous_video_image_id?: string;
}

export type TVideoNowResponse = {
  message: string;
  video_id: string;
  social_media_accounts: string[];
  previous_video_image_id?: string;
}

export type TVideoMediaData = {
  id: string;
  video: string;
  media: string;
  template?: string;
}

export type TCreateVideoImage = {
  video: string | undefined;
  media: File[];
}

export type TCreateVideoImageResponse = {
  id: string;
  video: string;
  media: string;
  created_at: string;
}

export type TCreateVideoMedia = {
  title: string;
  main_text: string;
  hashtags: string;
  media_files?: File[];
  like?: boolean;
}

export type TUpdateVideoMediaTemplate = {
  id: string;
  template_uuid: string;
};

export type TDeleteVideoMediaResponse = {
  detail: string;
}

export type TUploadVideoFileRequest = {
  video_id: string;
  video_file: File;
}

export type TUploadVideoFileResponse = {
  success: boolean;
  message: string;
  video_url: string;
}

export type TDeleteVideoFileResponse = {
  success: boolean;
  message: string;
}

export type TPatchVideoFileRequest = {
  video_id: string;
  video_file: File;
}

export type TPatchVideoFileResponse = {
  success: boolean;
  message: string;
  video_url: string;
  video_id: string;
}

export const videoApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getVideoList: build.query<TVideoData[], string>({
      query: (video_queries_id) => ({
        url: `/video_queries/${video_queries_id}/videos/`,
        method: 'GET'
      }),
      transformResponse: (response: TVideoData[]) => response,
    }),
    getVideoById: build.query<TVideoData, string>({
      query: (id) => ({
        url: `/videos/${id}/`,
        method: 'GET'
      }),
      transformResponse: (response: TVideoData) => response,
    }),
    getVideoListByCompanyId: build.query<TVideoData[], string | undefined>({
      query: (company_id) => ({
        url: `/videos/${company_id}/videos/`,
        method: 'GET'
      }),
      transformResponse: (response: TVideoData[]) => response,
    }),
    createVideo: build.mutation<TVideoData, TCreateVideo>({
      query: ({ title, main_text, hashtags, cover, like, active }) => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('main_text', main_text || '');
        formData.append('hashtags', hashtags || '');
        like && formData.append('like', like.toString());
        active && formData.append('active', active.toString());
        
        if (cover) {
          formData.append('cover', cover);
        }
    
        return {
          url: '/videos/',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: TVideoData) => response,
      extraOptions: { showErrors: false },
    }),
    createVideoMedia: build.mutation<TVideoData, TCreateVideoMedia>({
      query: ({ title, main_text, hashtags, media_files, like }) => {
        const formData = new FormData();
    
        formData.append('title', title);
        formData.append('main_text', main_text || '');
        formData.append('hashtags', hashtags || '');
        like && formData.append('like', like.toString());
    
        if (media_files && media_files.length > 0) {
          media_files.forEach((file) => {
            formData.append('media_files', file); 
          });
        }
    
        return {
          url: '/video/custom/',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: TVideoData) => response,
      extraOptions: { showErrors: false },
    }),
    updateVideo: build.mutation<TVideoData, TUpdateVideo>({
      query: ({ id, title, img_prompt, txt_prompt, main_text, hashtags, like, active, img_style, video_query, author, cover }) => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('img_prompt', img_prompt || '');
        formData.append('txt_prompt', txt_prompt || '');
        formData.append('main_text', main_text || '');
        formData.append('hashtags', hashtags || '');
        like && formData.append('like', like.toString());
        active && formData.append('active', active.toString());
        formData.append('img_style', img_style || '');
        formData.append('video_query', video_query.toString());
        formData.append('author', author.toString());
        
        if (cover) {
          formData.append('cover', cover);
        }
    
        return {
          url: `/videos/${id}/`,
          method: 'PUT',
          body: formData,
        };
      },
      transformResponse: (response: TVideoData) => response,
      extraOptions: { showErrors: false },
    }),
    recreateVideoImage: build.mutation<TRecreateVideoImage, TRecreateVideoImage>({
      query: ({ id, img_prompt, img_style }) => ({
        url: `/videos/image/update/${id}/`,
        method: 'PATCH',
        body: {
          img_prompt,
          img_style
        }
      }),
			transformResponse: (response: TRecreateVideoImage) => response,
      extraOptions: { showErrors: false }
    }),
    recreateVideoText: build.mutation<TRecreateVideoText, TRecreateVideoText>({
      query: ({ id, txt_prompt, main_text }) => ({
        url: `/videos/text/update/${id}/`,
        method: 'PATCH',
        body: {
          txt_prompt,
          main_text
        }
      }),
			transformResponse: (response: TRecreateVideoText) => response,
      extraOptions: { showErrors: false }
    }),
    deletePost: build.mutation<string, string>({
      query: (id) => ({
        url: `/videos/${id}/`,
        method: 'DELETE'
      })
    }),
    videoNow: build.mutation<TVideoNowResponse, TVideoNow>({
      query: ({video_id, social_media_account_ids, previous_video_image_id}) => ({
        url: '/video/now/',
        method: 'POST',
        body: {
          video_id,
          social_media_account_ids,
          previous_video_image_id
        }
      }),
      transformResponse: (response: TVideoNowResponse) => response,
      extraOptions: { showErrors: false }
    }),
    getVideoMediasById: build.query<TVideoMediaData[], string>({
      query: (video_id) => ({
        url: `/video/${video_id}/medias/`,
        method: 'GET'
      }),
      transformResponse: (response: TVideoMediaData[]) => response,
    }),
    createVideoImage: build.mutation<TCreateVideoImageResponse, TCreateVideoImage>({
      query: ({ video, media }) => {
        const formData = new FormData();
        if (video) formData.append('video', video);

        if (media && media.length > 0) {
          media.forEach((file) => {
            formData.append('media', file); 
          });
        }
    
        return {
          url: `/video-image/create/`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: TCreateVideoImageResponse) => response,
      extraOptions: { showErrors: false },
    }),
    updateVideoMediaTemplate: build.mutation<any, TUpdateVideoMediaTemplate>({
      query: (data) => ({
        url: `/video-media/${data.id}/update-template/`,
        method: 'POST',
        body: { template_uuid: data.template_uuid },
      }),
    }),
    deleteVideoMedia: build.mutation<TDeleteVideoMediaResponse, string>({
      query: (mediaId) => ({
        url: `/previous-video-image/${mediaId}/delete/`,
        method: 'DELETE',
      }),
    }),
    uploadVideoFile: build.mutation<TUploadVideoFileResponse, TUploadVideoFileRequest>({
      query: ({ video_id, video_file }) => {
        const formData = new FormData();
        formData.append('video', video_file);
        
        return {
          url: `/videos/${video_id}/upload-video/`,
          method: 'POST',
          body: formData,
        };
      },
    }),
    deleteVideoFile: build.mutation<TDeleteVideoFileResponse, string>({
      query: (video_id) => ({
        url: `/videos/${video_id}/delete-video/`,
        method: 'DELETE',
      }),
    }),
    patchVideoFile: build.mutation<TPatchVideoFileResponse, TPatchVideoFileRequest>({
      query: ({ video_id, video_file }) => {
        const formData = new FormData();
        formData.append('video', video_file);
        
        return {
          url: `/videos/${video_id}/patch-video/`,
          method: 'PATCH',
          body: formData,
        };
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVideoListQuery,
  useGetVideoByIdQuery,
  useLazyGetVideoByIdQuery,
  useGetVideoListByCompanyIdQuery,
  useCreateVideoMutation,
  useCreateVideoMediaMutation,
  useUpdateVideoMutation,
  useRecreateVideoImageMutation,
  useRecreateVideoTextMutation,
  useVideoNowMutation,
  useGetVideoMediasByIdQuery,
  useCreateVideoImageMutation,
  useUpdateVideoMediaTemplateMutation,
  useDeleteVideoMediaMutation,
  useUploadVideoFileMutation,
  useDeleteVideoFileMutation,
  usePatchVideoFileMutation
} = videoApi;
