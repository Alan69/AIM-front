import { TPostData } from 'modules/post/redux/api';
import baseApi from '../../../../redux/api';
import { TCompanyData } from 'modules/company/redux/api';
import { TProductData } from 'modules/product/redux/api';

export type TSchedulesData = {
  id: string;
  post: TPostData;
  company: TCompanyData;
  product: TProductData;
  social_media: string;
  scheduled_date: string;
  scheduled_time: string;
  created_by: string;
  active: boolean;
}

export type TAddToSchedulersData = {
  post_id: string | undefined;
  company_id: string | undefined;
  social_media_account_ids: string[] | undefined;
  scheduled_date: string;
  scheduled_time: string;
  active: boolean;
}

export type TAddToSchedulersResponse = {
  id: string;
  post: string;
  company: string;
  social_media: string;
  scheduled_time: string;
  active: boolean;
}

export const contentPlanApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		getSchedulers: build.query<TSchedulesData[], string | undefined>({
			query: (company_id) => ({
				url: `/schedulers/by-current-company/${company_id}`,
				method: 'GET'
			}),
			transformResponse: (response: TSchedulesData[]) => response,
    }),
    addToSchedulers: build.mutation<TAddToSchedulersResponse, TAddToSchedulersData>({
			query: ({post_id, company_id, social_media_account_ids, scheduled_date, scheduled_time, active}) => ({
				url: '/scheduler/post/',
				method: 'POST',
        body: {
          post_id,
          company_id,
          social_media_account_ids,
          scheduled_date,
          scheduled_time,
          active
        }
			}),
			transformResponse: (response: TAddToSchedulersResponse) => response,
    }),
	}),
	overrideExisting: false,
});

export const {
  useGetSchedulersQuery,
  useAddToSchedulersMutation
} = contentPlanApi;
