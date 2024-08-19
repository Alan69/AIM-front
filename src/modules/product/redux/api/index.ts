import baseApi from '../../../../redux/api';

export type TProductData = {
  id: number;
  name: string;
  slug?: string;
  scope: string;
  comment: string;
  time_create: string;
  time_update: string;
  active: boolean;
  author: number
  company: 2
}

type TCreateProduct = {
  name: string;
  slug?: string;
  scope: string;
  comment?: string;
  active?: boolean;
  author?: number;
  companyId: number;
}

type TUpdateProduct = {
  id: number;
  name: string;
  slug?: string;
  scope: string;
  comment?: string;
  active?: boolean;
  author?: number;
  companyId: number
}

export const productApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		getProductList: build.query<TProductData[], void>({
			query: () => ({
				url: '/pbs/',
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
      query: ({ name, scope, comment, companyId }) => ({
        url: '/pbs/',
        method: 'POST',
        body: {
          name,
          scope,
          comment,
          author: 1,
          company: companyId
        }
      }),
			transformResponse: (response: TProductData) => response,
      extraOptions: { showErrors: false }
    }),
    updateProduct: build.mutation<TProductData, TUpdateProduct>({
      query: ({ id, name, scope, comment, companyId }) => ({
        url: `/pbs/${id}/`,
        method: 'PUT',
        body: {
          name,
          scope,
          comment,
          author: 1,
          company: companyId
        }
      }),
			transformResponse: (response: TProductData) => response,
      extraOptions: { showErrors: false }
    }),
    deleteProduct: build.mutation<number, number>({
      query: (id) => ({
        url: `pbs/${id}/`,
        method: 'DELETE'
      })
    }),
	}),
	overrideExisting: false,
});

export const {
    useGetProductListQuery,
    useGetProductByIdQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation
} = productApi;
