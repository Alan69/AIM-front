import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TUpdateProfilesData, useUpdateProfilesMutation } from '../../redux/api';
import { Layout, Button, Form, Input, Upload, Select, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useGetJobTypesListQuery } from '../../../../redux/api/jobTypes/jobTypesApi';
import { useGetContriesListQuery } from '../../../../redux/api/contries/contriesApi';
import { useTypedSelector } from 'hooks/useTypedSelector';

type TUpdateProfilesForm = {
  user: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  bd_year: number;
  job?: {
    id: string;
    name: string;
  }
  location?: {
    id: string;
    name: string;
  }
  picture?: string | null;
};

export const AccountPage = () => {
  const { Content } = Layout;
  const { user } = useTypedSelector((state) => state.auth);

  const profileImage = user?.profile.picture ? `${user.profile.picture}` : '';

  const [updateProfiles, { isLoading: isUpdating }] = useUpdateProfilesMutation();
  const { data: jobTypesList, isLoading: isJobTypesListUpdating } = useGetJobTypesListQuery()
  const { data: contriesList, isLoading: isContriesListUpdating } = useGetContriesListQuery()
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<TUpdateProfilesForm>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      bd_year: 0,
      job: {
        id: '',
        name: ''
      },
      location: {
        id: '',
        name: ''
      },
      picture: '',
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.profile.user.first_name || '',
        last_name: user.profile.user.last_name || '',
        email: user.profile.user.email || '',
        bd_year: user.profile.bd_year,
        job: {
          id: user.profile.job?.id || '',
          name: user.profile.job?.name || ''
        },
        location: {
          id: user.profile.location?.id || '',
          name: user.profile.location?.name || ''
        },
        picture: user.profile.picture || '',
      });
    }
  }, [user, reset]);

  const onSubmit = (data: TUpdateProfilesForm) => {
    if (user) {
      let pictureUrl = data.picture;

      if (typeof pictureUrl === 'string' && !pictureUrl.startsWith('http')) {
        pictureUrl = `${pictureUrl}`;
      }

      const updatedData = {
        ...data,
        picture: pictureUrl,
        location: data.location?.id,
        job: data.job?.id,
        id: user.profile.id,
      };

      // @ts-ignore
      updateProfiles(updatedData);
    }
  };

  const handleFileChange = (info: any) => {
    const fileList = info.fileList;

    if (fileList.length > 0) {
      const lastFile = fileList[fileList.length - 1];
      setValue('picture', lastFile.originFileObj);
    } else {
      setValue('picture', null);
    }
  };
  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
        <h1>Профиль</h1>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="Email" validateStatus={errors.email ? 'error' : ''} help={errors.email && 'Заполните это поле.'}>
            <Controller
              name="email"
              control={control}
              rules={{ required: true }}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item label="Имя">
            <Controller name="first_name" control={control} render={({ field }) => <Input {...field} />} />
          </Form.Item>

          <Form.Item label="Фамилия">
            <Controller name="last_name" control={control} render={({ field }) => <Input {...field} />} />
          </Form.Item>

          <Form.Item label="Год рождения" validateStatus={errors.bd_year ? 'error' : ''} help={errors.bd_year && 'Заполните это поле.'}>
            <Controller
              name="bd_year"
              control={control}
              rules={{ required: true }}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item label="Работа">
            <Controller
              name="job.id"
              control={control}
              disabled={isJobTypesListUpdating}
              render={({ field }) => (
                <Select {...field}>
                  {jobTypesList?.map((job) => (
                    <Select.Option key={job.id} value={job.id}>
                      {job.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="Страна">
            <Controller
              name="location.id"
              control={control}
              disabled={isContriesListUpdating}
              render={({ field }) => (
                <Select {...field}>
                  {contriesList?.map((contry) => (
                    <Select.Option key={contry.id} value={contry.id}>
                      {contry.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="Фото">
            {user && (
              <Image width={200} src={profileImage} alt={user.profile.picture ? user.profile.picture : 'Аватар'} />
            )}
            <Controller
              name="picture"
              control={control}
              render={({ field }) => (
                <Upload
                  {...field}
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={handleFileChange}
                >
                  <Button icon={<UploadOutlined />}>Выберите файл</Button>
                </Upload>
              )}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isUpdating}>
              Сохранить
            </Button>
            <Button htmlType="button" style={{ margin: '0 8px' }}>
              Изменить пароль
            </Button>
            <Button htmlType="button" style={{ color: '#faad14', borderColor: '#faad14' }}>
              Отменить
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};
