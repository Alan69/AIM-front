import baseApi from '../../../../redux/api';

type TUserData = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

type TProfilesData = {
  user: TUserData;
  location: string | null;
  job: string | null;
  bd_year: number;
  picture: string | null;
  time_create?: string;
  time_update?: string;
}

type TUpdateProfiles = {
  user: TUserData;
  location?: string | null;
  job?: string | null;
  bd_year?: number;
  picture?: string | null;
  time_create?: string;
  time_update?: string;
}

export const profilesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProfiles: build.query<TProfilesData[], void>({
      query: () => ({
        url: '/profiles/',
          method: 'GET'
        }),
      transformResponse: (response: TProfilesData[]) => response,
    }),
    updateProfiles: build.mutation<TProfilesData, TUpdateProfiles>({
      query: ({ user, location, job, bd_year, picture }) => ({
        url: `/profiles/${user.id}/`,
        method: 'PUT',
        body: {
          user,
          location,
          job,
          bd_year,
          picture
        }
      }),
			transformResponse: (response: TProfilesData) => response,
      extraOptions: { showErrors: false }
    }),
  }),
  overrideExisting: false,
});

export const {
    useGetProfilesQuery,
    useUpdateProfilesMutation
} = profilesApi;
