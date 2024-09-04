import { TCompanyData } from 'modules/company/redux/api';
import baseApi from '../../../../redux/api';
import { TLocationTypesData } from 'redux/api/contries/contriesApi';
import { TJobTypesData } from 'redux/api/jobTypes/jobTypesApi';

export type TUserData = {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  current_company: TCompanyData | null;
}

export type TProfileData = {
  profile: {
    id: string;
    first_name?: string;
    last_name?: string;
    coins?: number;
    location: TLocationTypesData | null;
    job: TJobTypesData | null;
    bd_year: number;
    picture: string | null;
    time_create?: string;
    time_update?: string;
    user: TUserData;
  }
}

export type TUpdateProfilesData = {
  location?: string; // location-id
  job?: string; // job-id
  bd_year?: number;
  picture?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  id: string; // user-id
}

export const profilesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // getProfiles: build.query<TUserData[], void>({
    //   query: () => ({
    //     url: '/profiles/',
    //       method: 'GET'
    //     }),
    //   transformResponse: (response: TUserData[]) => response,
    // }),
    updateProfiles: build.mutation<TUpdateProfilesData, TUpdateProfilesData>({
      query: ({ location, job, bd_year, picture, email, first_name, last_name, id }) => ({
        url: `/profiles/${id}/`,
        method: 'PUT',
        body: {
          location,
          job,
          bd_year,
          picture,
          email,
          first_name,
          last_name,
          id
        }
      }),
			transformResponse: (response: TUpdateProfilesData) => response,
      extraOptions: { showErrors: false }
    }),
  }),
  overrideExisting: false,
});

export const {
  useUpdateProfilesMutation,
} = profilesApi;
