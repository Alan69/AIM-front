import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useUpdateProfilesMutation } from '../../redux/api';
import { Layout, Button, Form, Input, Upload, Select, Image, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useGetJobTypesListQuery } from '../../../../redux/api/jobTypes/jobTypesApi';
import { useGetContriesListQuery } from '../../../../redux/api/contries/contriesApi';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { useLazyGetAuthUserQuery } from 'modules/auth/redux/api';
import avatar from 'assets/avatar.png';
import styles from './AccountPage.module.scss'

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

const { Content } = Layout;

export const AccountPage = () => {
  const { user } = useTypedSelector((state) => state.auth);
  const [file, setFile] = useState<File | null>(null);

  const profileImage = user?.profile.picture ? `${user.profile.picture}` : avatar;

  const [getAuthUser] = useLazyGetAuthUserQuery();
  const [updateProfiles, { isLoading: isUpdating }] = useUpdateProfilesMutation();
  const { data: jobTypesList, isLoading: isJobTypesListUpdating } = useGetJobTypesListQuery()
  const { data: contriesList, isLoading: isContriesListUpdating } = useGetContriesListQuery()
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TUpdateProfilesForm>({
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

  useEffect(() => {
    getAuthUser();
  }, []);

  const onSubmit = (data: TUpdateProfilesForm) => {
    if (user) {
      const updatedData = {
        ...data,
        picture: file,
        location: data.location,
        job: data.job,
        id: user.profile.id,
      };

      // @ts-ignore
      updateProfiles(updatedData).unwrap().then(() => {
        getAuthUser().refetch();
        message.success('Ваш профиль был успешно изменен!')
      }).catch(() => {
        message.error('Произошла ошибка! Ваш профиль не был изменен!')
      });
    }
  };

  const currentYear = new Date().getFullYear();

  const handleFileChange = (info: any) => {
    const fileList = info.fileList;
    if (fileList.length > 0) {
      const lastFile = fileList[fileList.length - 1];
      setFile(lastFile.originFileObj);
    } else {
      setFile(null);
    }
  };

  return (
    <Layout>
      <Content className='page-layout'>
        <h1 className='main-title'>Профиль</h1>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="Фото">
            <div className={styles.photo}>
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
            </div>
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

          <Form.Item label="Год рождения" validateStatus={errors.bd_year ? 'error' : undefined} help={errors.bd_year?.message}>
            <Controller
              name="bd_year"
              control={control}
              rules={{
                required: 'Год рождения обязателен.',
                min: {
                  value: 1964,
                  message: 'Год рождения не может быть меньше 1964.'
                },
                max: {
                  value: currentYear,
                  message: `Год рождения не может быть больше ${currentYear}.`
                },
                pattern: {
                  value: /^\d{4}$/,
                  message: 'Год рождения должен содержать ровно четыре цифры.'
                }
              }}
              render={({ field }) => <Input {...field} type="number" />}
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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isUpdating}>
              Сохранить
            </Button>
            <Button htmlType="button" style={{ margin: '0 8px' }}>
              Изменить пароль
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};
