import baseApi from '../../../../redux/api';

export type TCompanyData = {
  id: string;
  name: string;
  scope: string;
  comment: string;
  time_create: string;
  time_update: string;
  active: boolean;
  author: string;
}

type TCreateCompany = {
  name: string;
  scope: string;
  comment?: string;
  active?: boolean;
  author?: string;
}

type TUpdateCompany = {
  id: string;
  name: string;
  scope: string;
  comment?: string;
  active?: boolean;
  author?: string;
}

export const companyApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		getCompanyList: build.query<TCompanyData[], string | undefined>({
			query: (user_id) => ({
				url: `/companies/by-user/${user_id}/`,
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
      query: ({ name, scope, comment, author }) => ({
        url: '/companies/',
        method: 'POST',
        body: {
          name,
          scope,
          comment,
          author
        }
      }),
			transformResponse: (response: TCompanyData) => response,
      extraOptions: { showErrors: false }
    }),
    updateCompany: build.mutation<TCompanyData, TUpdateCompany>({
      query: ({ id, name, scope, comment, author }) => ({
        url: `/companies/${id}/`,
        method: 'PUT',
        body: {
          name,
          scope,
          comment,
          author
        }
      }),
			transformResponse: (response: TCompanyData) => response,
      extraOptions: { showErrors: false }
    }),
    deleteCompany: build.mutation<string, string>({
      query: (id) => ({
        url: `companies/${id}/`,
        method: 'DELETE'
      })
    }),
    updateCurrentCompany: build.mutation<string, string>({
      query: (company_id) => ({
        url: `auth/user/update-current-company/${company_id}/`,
        method: 'PUT'
      }),
    }),
	}),
	overrideExisting: false,
});

export const {
  useGetCompanyListQuery,
  useGetCompanyByIdQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useUpdateCurrentCompanyMutation
} = companyApi;
