import baseApi from "..";

export type TFeedbackData = {
    name: string
    phone_number: string
}

export type TFeedbackResponse = {
    message: string
}

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    submitFeedback: build.mutation<TFeedbackResponse, TFeedbackData>({
        query: ({ name, phone_number }) => ({
          url: '/submit-info/',
          method: 'POST',
          body: {
            name,
            phone_number
          }
        }),
        transformResponse: (response: TFeedbackResponse) => response,
        extraOptions: { showErrors: false }
      }),
  }),
  overrideExisting: false,
});

export const {
  useSubmitFeedbackMutation
} = feedbackApi;
