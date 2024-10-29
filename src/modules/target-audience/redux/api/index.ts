import baseApi from '../../../../redux/api';

type TCreateTargetAudienceResponse = {
  result: {
    "1. Демографические данные": {
      "Возраст": string;
      "Пол": string;
      "Местоположение": string;
      "Образование": string;
      "Семейное положение": string;
      "Доход": string;
    };
    "2. Психографические данные": {
      "Интересы и увлечения": string;
      "Ценности и убеждения": string;
      "Стиль жизни": string;
      "Личностные характеристики": string;
      "Проблемы и потребности": string;
    };
    "3. Профессиональные данные": {
      "Род занятий": string;
      "Должность": string;
      "Отрасль": string;
      "Размер компании": string;
      "Профессиональные проблемы": string;
    };
    "4. Поведенческие характеристики": {
      "Покупательские привычки": string;
      "Частота покупок": string;
      "Лояльность к брендам": string;
      "Ценовая чувствительность": string;
      "Использование технологий": string;
      "Платформы для взаимодействия": string;
    };
    "5. Проблемы и задачи аудитории": {
      "Какие проблемы они пытаются решить": string;
      "Какие барьеры мешают покупке": string;
      "Что мотивирует их к действию": string;
    };
    "6. Цели и желания аудитории": {
      "Чего они хотят достичь": string;
      "Как ваш продукт помогает достичь этих целей": string;
    };
    "7. Целевая аудитория в социальных сетях": {
      "Какие социальные сети используют": string;
      "Время активности": string;
      "Тип контента, который им интересен": string;
    };
    "8. Эмоциональные триггеры": {
      "Какие эмоции движут их решениями": string;
      "Как они хотят себя чувствовать": string;
    };
  };
};

type TTargetAudienceData = {
  id: string;
  author: string;
  company: string;
  prompt: string;
  created_at: string;
}

type TCreateTargetAudience = {
  company: string;
}

type TUpdateTargetAudience = {
  id: string | undefined;
  text: string;
}

type TSaveTargetAudience = {
  text: string;
  id?: string
}

export const targetAudienceApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
    getCurrentTargetAudience: build.query<TSaveTargetAudience, void>({
			query: () => ({
				url: '/audience/current/',
				method: 'GET'
			}),
			transformResponse: (response: TSaveTargetAudience) => response,
    }),
    getTargetAudienceList: build.query<TTargetAudienceData[], void>({
			query: () => ({
				url: '/target-audience/',
				method: 'GET'
			}),
			transformResponse: (response: TTargetAudienceData[]) => response,
    }),
    createTargetAudience: build.mutation<TCreateTargetAudienceResponse, TCreateTargetAudience>({
      query: ({ company }) => ({
        url: '/target-audience/',
        method: 'POST',
        body: {
          company
        }
      }),
			transformResponse: (response: TCreateTargetAudienceResponse) => response,
      extraOptions: { showErrors: false }
    }),
    updateTargetAudience: build.mutation<TUpdateTargetAudience, TUpdateTargetAudience>({
      query: ({ text, id }) => ({
        url: `/audience/update/${id}/`,
        method: 'PUT',
        body: {
          text
        }
      }),
			transformResponse: (response: TUpdateTargetAudience) => response,
      extraOptions: { showErrors: false }
    }),
    saveTargetAudience: build.mutation<string, TSaveTargetAudience>({
      query: ({ text }) => ({
        url: '/audience/save/',
        method: 'POST',
        body: {
          text
        }
      }),
			transformResponse: (response: string) => response,
      extraOptions: { showErrors: false }
    }),
	}),
	overrideExisting: false,
});

export const {
  useGetCurrentTargetAudienceQuery,
  useGetTargetAudienceListQuery,
  useCreateTargetAudienceMutation,
  useUpdateTargetAudienceMutation,
  useSaveTargetAudienceMutation
} = targetAudienceApi;
