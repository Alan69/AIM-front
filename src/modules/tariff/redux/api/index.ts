import baseApi from '../../../../redux/api';

export type TTariffData = {
  id: number;
  name: string;
  company_limit: number;
  days: number;
  is_active: boolean;
  month: string;
}

export type TTariffCreateData = {
  company_limit: number;
  month: number;
}

export type TPaymentTokenResponse = {
  access_token: string;
  expires_in: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export type TPaymentInitiateRequest = {
  token: string;
}

export type TPaymentInitiateResponse = {
  invoice_url: string;
  invoice_id: string;
}

export const tariffApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createTariff: build.mutation<void, TTariffCreateData>({
      query: ({ company_limit, month }) => ({
        url: '/tariffs/create/',
        method: 'POST',
        body: {
          company_limit,
          month,
        }
      }),
      extraOptions: { showErrors: false }
    }),
    paymentToken: build.mutation<TPaymentTokenResponse, void>({
      query: () => ({
        url: '/payment/token/',
        method: 'POST',
      }),
			transformResponse: (response: TPaymentTokenResponse) => response,
      extraOptions: { showErrors: false }
    }),
    paymentInitiate: build.mutation<TPaymentInitiateResponse, TPaymentInitiateRequest>({
      query: ({ token }) => ({
        url: '/payment/initiate/',
        method: 'POST',
        body: {
          token
        }
      }),
			transformResponse: (response: TPaymentInitiateResponse) => response,
      extraOptions: { showErrors: false }
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateTariffMutation,
  usePaymentTokenMutation,
  usePaymentInitiateMutation
} = tariffApi;
