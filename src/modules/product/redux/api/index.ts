import baseApi from '../../../../redux/api';

export type TProductData = {
  id: string;
  name: string;
  slug?: string;
  scope: string;
  comment: string;
  time_create: string;
  time_update: string;
  active: boolean;
  author: string;
  company: string
}

type TCreateProduct = {
  name: string;
  slug?: string;
  scope: string;
  comment?: string;
  active?: boolean;
  author?: string;
  companyId: string;
}

type TUpdateProduct = {
  id: string;
  name: string;
  slug?: string;
  scope: string;
  comment?: string;
  active?: boolean;
  author?: string;
  companyId: string;
}

export const productApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		getProductListByCompanyId: build.query<TProductData[], string>({
			query: (company_id) => ({
				url: `/company/${company_id}/pbs/`,
				method: 'GET'
			}),
			transformResponse: (response: TProductData[]) => response,
    }),
    getProductById: build.query<TProductData, string>({
			query: (id) => ({
				url: `/pbs/${id}`,
				method: 'GET'
			}),
			transformResponse: (response: TProductData) => response,
    }),
    createProduct: build.mutation<TProductData, TCreateProduct>({
      query: ({ name, scope, comment, companyId, author }) => ({
        url: '/pbs/',
        method: 'POST',
        body: {
          name,
          scope,
          comment,
          company: companyId,
          author
        }
      }),
			transformResponse: (response: TProductData) => response,
      extraOptions: { showErrors: false }
    }),
    updateProduct: build.mutation<TProductData, TUpdateProduct>({
      query: ({ id, name, scope, comment, companyId, author }) => ({
        url: `/pbs/${id}/`,
        method: 'PUT',
        body: {
          name,
          scope,
          comment,
          company: companyId,
          author
        }
      }),
			transformResponse: (response: TProductData) => response,
      extraOptions: { showErrors: false }
    }),
    deleteProduct: build.mutation<string, string>({
      query: (id) => ({
        url: `pbs/${id}/`,
        method: 'DELETE'
      })
    }),
	}),
	overrideExisting: false,
});

export const {
    useGetProductListByCompanyIdQuery,
    useLazyGetProductListByCompanyIdQuery,
    useGetProductByIdQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation
} = productApi;
