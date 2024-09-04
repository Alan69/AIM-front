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
  scheduled_time: string;
  created_by: string;
  active: boolean;
}

export type TAddToSchedulersData = {
  post: string;
  company: string;
  product: string;
  social_media: string;
  scheduled_time: string;
  created_by: string;
  active: boolean;
}

export type TAddToSchedulersResponse = {
  post: string;
  company: string;
  product: string;
  social_media: string;
  scheduled_time: string;
  created_by: string;
  active: boolean;
}

export const contentPlanApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		getSchedulers: build.query<TSchedulesrData[], void>({
			query: () => ({
				url: '/schedulers/',
				method: 'GET'
			}),
			transformResponse: (response: TSchedulesrData[]) => response,
    }),
    addToSchedulers: build.mutation<TAddToSchedulersResponse, TAddToSchedulersData>({
			query: () => ({
				url: '/schedulers/',
				method: 'POST'
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
