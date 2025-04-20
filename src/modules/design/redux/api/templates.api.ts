import baseApi from '../../../../redux/api';
import { Template, TemplateSizeType } from '../../types';

export interface TemplatesResponse {
  templates: Template[];
  total: number;
}

export interface TemplateParams {
  size: TemplateSizeType;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  tab: 'all' | 'my' | 'liked';
}

// Extended API with template endpoints
export const templatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<TemplatesResponse, TemplateParams>({
      query: ({ size, page = 1, pageSize = 12, searchQuery = '', tab }) => ({
        url: '/designs/templates/',
        method: 'GET',
        params: {
          size,
          page,
          page_size: pageSize,
          search: searchQuery,
          tab,
        },
      }),
      keepUnusedDataFor: 60, // Cache for 60 seconds
    }),
    getTemplateById: builder.query<Template, string>({
      query: (uuid) => ({
        url: `/designs/templates/${uuid}/`,
        method: 'GET',
      }),
    }),
    createTemplate: builder.mutation<Template, { name: string; size: string; userId: string; backgroundImage?: string; isDefault?: boolean }>({
      query: ({ name, size, userId, backgroundImage, isDefault = false }) => ({
        url: '/designs/templates/',
        method: 'POST',
        body: {
          name,
          size,
          user_id: userId,
          is_default: isDefault,
          background_image: backgroundImage,
        },
      }),
    }),
    updateTemplate: builder.mutation<Template, { uuid: string; updates: any }>({
      query: ({ uuid, updates }) => ({
        url: `/designs/templates/${uuid}/`,
        method: 'PATCH',
        body: updates,
      }),
    }),
    toggleLikeTemplate: builder.mutation<{ success: boolean }, { uuid: string; like: boolean }>({
      query: ({ uuid, like }) => ({
        url: `/designs/templates/${uuid}/like/`,
        method: 'POST',
        body: { like },
      }),
      // Optimistic update
      async onQueryStarted({ uuid, like }, { dispatch, queryFulfilled, getState }) {
        const patchResult = dispatch(
          templatesApi.util.updateQueryData('getTemplates', { 
            size: '1080x1080', 
            tab: 'all',
            // @ts-ignore - getState type definition issue
            ...templatesApi.util.selectCachedArgsForQuery(getState(), 'getTemplates')
          }, (draft) => {
            const template = draft.templates.find(t => t.uuid === uuid);
            if (template) {
              template.like = like;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTemplatesQuery,
  useGetTemplateByIdQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useToggleLikeTemplateMutation,
  useLazyGetTemplatesQuery,
} = templatesApi; 