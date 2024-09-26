import { TCompanyData } from 'modules/company/redux/api';
import baseApi from '../../../../redux/api';
import { TLocationTypesData } from 'redux/api/contries/contriesApi';
import { TJobTypesData } from 'redux/api/jobTypes/jobTypesApi';
import { TTariffData } from 'modules/tariff/redux/api';

export type TUserData = {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  current_company: TCompanyData | null;
  tariff: TTariffData;
}

export type TProfileData = {
  profile: {
    id: string;
    first_name?: string;
    last_name?: string;
    coins?: number;
    location: TLocationTypesData;
    job: TJobTypesData;
    bd_year: number;
    picture: string;
    time_create?: string;
    time_update?: string;
    user: TUserData;
  }
}

export type TUpdateProfilesData = {
  location: TLocationTypesData;
  job: TJobTypesData;
  bd_year?: number;
  picture?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  id: string;
}

export const profilesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateProfiles: build.mutation<TUpdateProfilesData, TUpdateProfilesData>({
      query: ({ location, job, bd_year, picture, email, first_name, last_name, id }) => {
        const formData = new FormData();
        formData.append('location', location.id || '');
        formData.append('job', job.id || '');
        formData.append('bd_year', bd_year?.toString() || '');
        formData.append('email', email || '');
        formData.append('first_name', first_name || '');
        formData.append('last_name', last_name || '');
        
        if (picture) {
          formData.append('picture', picture);
        }

        return {
          url: `/profiles/${id}/`,
          method: 'PUT',
          body: formData,
        };
      },
      transformResponse: (response: TUpdateProfilesData) => response,
      extraOptions: { showErrors: false },
    }),
  }),
  overrideExisting: false,
});

export const {
  useUpdateProfilesMutation,
} = profilesApi;
