import baseApi from '../../../../redux/api';

type TCompanyData = {
  id: number;
  name: string;
  slug?: string;
  scope: string;
  comment: string;
  time_create: string;
  time_update: string;
  active: boolean;
  author: number;
}

type TCreateCompany = {
  name: string;
  slug?: string;
  scope: string;
  comment?: string;
  active?: boolean;
  author?: number;
}

type TUpdateCompany = {
  id: number;
  name: string;
  slug?: string;
  scope: string;
  comment?: string;
  active?: boolean;
  author?: number;
}

export const companyApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		getCompanyList: build.query<TCompanyData[], void>({
			query: () => ({
				url: '/companies/',
				method: 'GET'
			}),
			transformResponse: (response: TCompanyData[]) => response,
    }),
    getCompanyById: build.query<TCompanyData, string>({
			query: (id) => ({
				url: `/companies/${id}`,
				method: 'GET'
			}),
			transformResponse: (response: TCompanyData) => response,
    }),
    createCompany: build.mutation<TCompanyData, TCreateCompany>({
      query: ({ name, scope, comment }) => ({
        url: '/companies/',
        method: 'POST',
        body: {
          name,
          scope,
          comment,
          author: 1,
        }
      }),
			transformResponse: (response: TCompanyData) => response,
      extraOptions: { showErrors: false }
    }),
    updateCompany: build.mutation<TCompanyData, TUpdateCompany>({
      query: ({ id, name, scope, comment }) => ({
        url: `/companies/${id}/`,
        method: 'PUT',
        body: {
          name,
          scope,
          comment,
          author: 1,
        }
      }),
			transformResponse: (response: TCompanyData) => response,
      extraOptions: { showErrors: false }
    }),
    deleteCompany: build.mutation<number, number>({
      query: (id) => ({
        url: `companies/${id}/`,
        method: 'DELETE'
      })
    }),
	}),
	overrideExisting: false,
});

export const {
  useGetCompanyListQuery,
  useGetCompanyByIdQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation
} = companyApi;
