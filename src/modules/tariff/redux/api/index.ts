import baseApi from '../../../../redux/api';

export type TTariffData = {
  id: number;
  name: string;
  monthly_price: string | null;
  yearly_price: string | null;
  post_generations_limit: number;
  company_limit: number;
  social_media_account_limit: number;
}

export const tariffApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
		getTariffList: build.query<TTariffData[], void>({
			query: () => ({
				url: '/tariffs/',
				method: 'GET'
			}),
			transformResponse: (response: TTariffData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTariffListQuery,
} = tariffApi;
