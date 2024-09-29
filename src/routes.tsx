import React, { FC, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout/MainLayout';
import { UnauthorisedLayout } from './layouts/UnauthorisedLayout/UnauthorisedLayout';
import { useTypedSelector } from './hooks/useTypedSelector';

import { RecoveryPage } from 'modules/auth/pages/RecoveryPage';
import { SignUpPage } from 'modules/auth/pages/SignUpPage';
import { LoginPage } from 'modules/auth/pages/LoginPage';

import { AccountPage } from 'modules/account/pages/AccountPage/AccountPage';
import { CompanyCreatePage } from 'modules/company/pages/CompanyCreatePage/CompanyCreatePage';
import { CompanyDetailsPage } from 'modules/company/pages/CompanyDetailsPage/CompanyDetailsPage';
import { CompanyUpdatePage } from 'modules/company/pages/CompanyUpdatePage/CompanyUpdatePage';
import { CompanyDeletePage } from 'modules/company/pages/CompanyDeletePage/CompanyDeletePage';
import { ProductCreatePage } from 'modules/product/pages/ProductCreatePage/ProductCreatePage';
import { ProductUpdatePage } from 'modules/product/pages/ProductUpdatePage/ProductUpdatePage';
import { ProductDeletePage } from 'modules/product/pages/ProductDeletePage/ProductDeletePage';
import { PostQueryListPage } from 'modules/post-query/pages/PostQueryListPage/PostQueryListPage';
import { PostQueryCreatePage } from 'modules/post-query/pages/PostQueryCreatePage/PostQueryCreatePage';
import { PostQueryDetailsPage } from 'modules/post-query/pages/PostQueryDetailsPage/PostQueryDetailsPage';
import { PostUpdatePage } from 'modules/post/pages/PostUpdatePage/PostUpdatePage';
import { PostDeletePage } from 'modules/post/pages/PostDeletePage/PostDeletePage';
import { PostDetailsPage } from 'modules/post/pages/PostDetailsPage/PostDetailsPage';
import { ContentPlanPage } from 'modules/content-plan/pages/ContentPlanPage/ContentPlanPage';
import { SocialMediaAddPage } from 'modules/social-media/pages/SocialMediaAddPage/SocialMediaAddPage';
import { TariffListPage } from 'modules/tariff/pages/TariffListPage/TariffListPage';

import { LandingPage } from 'layouts/UnauthorisedLayout/Pages/LandingPage';
import { PolicyPage } from 'layouts/UnauthorisedLayout/Pages/PolicyPage';
import { AgreementPage } from 'layouts/UnauthorisedLayout/Pages/AgreementPage';
import { useLazyGetAuthUserQuery } from 'modules/auth/redux/api';

const AppRoutes: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [getAuthUser] = useLazyGetAuthUserQuery();
  const { token } = useTypedSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      // navigate('/login', { replace: true });
    } else {
      getAuthUser();
    }
  }, [token, navigate, getAuthUser, location.pathname]);

  if (!token) {
    return (
      <Routes>
        <Route element={<UnauthorisedLayout />}>
          <Route path="/home" element={<LandingPage />} />
          <Route path="/agreement" element={<AgreementPage />} />
          <Route path="/policy" element={<PolicyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/recovery" element={<RecoveryPage />} />
          <Route path="*" element={<LandingPage />} />
        </Route>
      </Routes>
    )
  }

  if (location.pathname === '/' && token) {
    navigate('/post-query/create')
  }

  if (location.pathname === '/' && !token) {
    navigate('/home')
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/home" element={<LandingPage />} />
        <Route path="/agreement" element={<AgreementPage />} />
        <Route path="/policy" element={<PolicyPage />} />
        <Route path='/account/profile/edit' element={<AccountPage />} />
        <Route path='/account/tariffs' element={<TariffListPage />} />
        <Route path='/tariffs' element={<TariffListPage />} />
        <Route path="/post-query" element={<PostQueryListPage />} />
        <Route path="/post-query/list" element={<PostQueryListPage />} />
        <Route path="/post-query/create" element={<PostQueryCreatePage />} />
        <Route path="/post-query/:id" element={<PostQueryDetailsPage />} />
        <Route path="/company/create" element={<CompanyCreatePage />} />
        <Route path="/company/:id" element={<CompanyDetailsPage />} />
        <Route path="/company/:id/update" element={<CompanyUpdatePage />} />
        <Route path="/company/:id/delete" element={<CompanyDeletePage />} />
        <Route path="/product/:companyId/create" element={<ProductCreatePage />} />
        <Route path="/product/:companyId/:id/update" element={<ProductUpdatePage />} />
        <Route path="/product/:companyId/:id/delete" element={<ProductDeletePage />} />
        <Route path="/post/:id" element={<PostDetailsPage />} />
        <Route path="/post/:postQueryId/:id" element={<PostDetailsPage />} />
        <Route path="/post/:postQueryId/:id/update" element={<PostUpdatePage />} />
        <Route path="/post/:postQueryId/:id/delete" element={<PostDeletePage />} />
        <Route path="/content-plan" element={<ContentPlanPage />} />
        <Route path="/social-media/:companyId/add" element={<SocialMediaAddPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/post-query" replace />} />
    </Routes>
  )
}

export default AppRoutes;
