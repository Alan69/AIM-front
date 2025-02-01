import { TPostData } from "modules/post/redux/api";
import baseApi from "../../../../redux/api";
import { TCompanyData } from "modules/company/redux/api";
import { TProductData } from "modules/product/redux/api";
import { TReelData } from "modules/reel/redux/api";
import { TStoriesData } from "modules/stories/redux/api";

export type TSchedulesData = {
  id: string;
  post: TPostData;
  reel: TReelData;
  storie: TStoriesData;
  company: TCompanyData;
  product: TProductData;
  social_media: string;
  scheduled_date: string;
  scheduled_time: string;
  created_by: string;
  active: boolean;
};

export type TAddToSchedulersData = {
  post_id: string | undefined;
  company_id: string | undefined;
  social_media_account_ids: string[] | undefined;
  scheduled_date: string;
  scheduled_time: string;
  active: boolean;
};

export type TAddToSchedulersRequest = {
  post_images: string[];
  post_id?: string | undefined;
  reel_id?: string | undefined;
  storie_id?: string | undefined;
  company_id: string | undefined;
  social_media_account_ids: string[] | undefined;
  scheduled_date: string;
  scheduled_time: string;
  active: boolean;
};

export type TAddToSchedulersResponse = {
  id: string;
  post: string;
  company: string;
  social_media: string;
  scheduled_time: string;
  active: boolean;
};

export type TDeleteFromSchedulerResponse = {
  message: string;
};

export type TEditPostFromSchedulersRequest = {
  scheduler_id: string;
  scheduled_date: string;
  scheduled_time: string;
};

export type TEditPostFromSchedulerResponse = {
  message: string;
  post_data: string;
};

export const contentPlanApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSchedulers: build.query<TSchedulesData[], string | undefined>({
      query: (company_id) => ({
        url: `/schedulers/by-current-company/${company_id}`,
        method: "GET",
      }),
      transformResponse: (response: TSchedulesData[]) => response,
    }),
    addToSchedulers: build.mutation<
      TAddToSchedulersResponse,
      TAddToSchedulersRequest
    >({
      query: ({
        post_id,
        reel_id,
        storie_id,
        company_id,
        social_media_account_ids,
        scheduled_date,
        scheduled_time,
        active,
        post_images,
      }) => ({
        url: "/scheduler/post/",
        method: "POST",
        body: {
          post_id,
          reel_id,
          storie_id,
          company_id,
          social_media_account_ids,
          scheduled_date,
          scheduled_time,
          active,
          post_images,
        },
      }),
      transformResponse: (response: TAddToSchedulersResponse) => response,
    }),
    deteleFromScheduler: build.mutation<TDeleteFromSchedulerResponse, string>({
      query: (scheduler_id) => ({
        url: `/scheduler/delete/${scheduler_id}/`,
        method: "DELETE",
      }),
      transformResponse: (response: TDeleteFromSchedulerResponse) => response,
    }),
    editPostFromScheduler: build.mutation<
      TDeleteFromSchedulerResponse,
      TEditPostFromSchedulersRequest
    >({
      query: ({ scheduler_id, scheduled_date, scheduled_time }) => ({
        url: `/scheduler/edit/${scheduler_id}/`,
        method: "PUT",
        body: {
          scheduled_date,
          scheduled_time,
        },
      }),
      transformResponse: (response: TDeleteFromSchedulerResponse) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSchedulersQuery,
  useAddToSchedulersMutation,
  useDeteleFromSchedulerMutation,
  useEditPostFromSchedulerMutation,
} = contentPlanApi;
