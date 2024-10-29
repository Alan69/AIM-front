import baseApi from '../../../../redux/api';

export type TIdeaText = {
  Idea: string;
  Description: string;
}

export type TIdeasData = {
  id: string;
  idea_query: string;
  idea_text: TIdeaText[];
  author: string;
  time_create: string;
}

export const ideasApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getIdeasList: build.query<TIdeasData[], string>({
      query: (idea_query_id) => ({
        url: `/ideas/${idea_query_id}/`,
        method: 'GET'
      }),
      transformResponse: (response: TIdeasData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetIdeasListQuery,
} = ideasApi;
