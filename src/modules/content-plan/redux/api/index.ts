import { TPostData } from 'modules/post/redux/api';
import baseApi from '../../../../redux/api';
import { TCompanyData } from 'modules/company/redux/api';
import { TProductData } from 'modules/product/redux/api';

export type TSchedulesrData = {
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
  post: string | undefined;
  company: string | undefined;
  social_media_account: string | undefined;
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
		getSchedulers: build.query<TSchedulesrData[], string | undefined>({
			query: (company_id) => ({
				url: `/schedulers/by-current-company/${company_id}`,
				method: 'GET'
			}),
			transformResponse: (response: TSchedulesrData[]) => response,
    }),
    addToSchedulers: build.mutation<TAddToSchedulersResponse, TAddToSchedulersData>({
			query: ({post, company, social_media_account, scheduled_date, scheduled_time, active}) => ({
				url: '/schedulers/',
				method: 'POST',
        body: {
          post,
          company,
          social_media_account,
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
