import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useUpdateProfilesMutation, useGetProfilesQuery } from '../../redux/api';
import { Layout, Button, Form, Input, Upload, Select, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

type TUpdateProfilesForm = {
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  bd_year: number;
  job?: string;
  location?: string;
  picture?: string | null;
};

export const AccountPage = () => {
  const { Content } = Layout;
  const { data: profiles } = useGetProfilesQuery();
  const [updateProfiles, { isLoading: isUpdating }] = useUpdateProfilesMutation();
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<TUpdateProfilesForm>({
    defaultValues: {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      bd_year: 0,
      job: '',
      location: '',
      picture: null,
    }
  });

  useEffect(() => {
    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      reset({
        username: profile.user.username,
        first_name: profile.user.first_name || '',
        last_name: profile.user.last_name || '',
        email: profile.user.email || '',
        bd_year: profile.bd_year,
        job: profile.job || '',
        location: profile.location || '',
        picture: profile.picture || null,
      });
    }
  }, [profiles, reset]);

  const onSubmit = (data: TUpdateProfilesForm) => {
    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      updateProfiles({ ...data, user: profile.user });
    }
  };

  const handleFileChange = (info: any) => {
    if (info.file.status === 'done' || info.file.status === 'removed') {
      setValue('picture', info.file.originFileObj ? URL.createObjectURL(info.file.originFileObj) : null);
    }
  };

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: '100vh' }}>
        <h1>Профиль</h1>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="Логин" validateStatus={errors.username ? 'error' : ''} help={errors.username && 'Заполните это поле.'}>
            <Controller
              name="username"
              control={control}
              rules={{ required: true }}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

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
              name="job"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  <Select.Option value="Developer">Developer</Select.Option>
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="Страна">
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  <Select.Option value="Kazakhstan">Kazakhstan</Select.Option>
                  <Select.Option value="Russia">Russia</Select.Option>
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="Фото">
            {profiles && profiles.length > 0 && profiles[0].picture && (
              <Image width={200} src={profiles[0].picture} alt="Profile Picture" />
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
