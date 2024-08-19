import React, { FC, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout/MainLayout';
import { UnauthorisedLayout } from './layouts/UnauthorisedLayout/UnauthorisedLayout';
import { useTypedSelector } from './hooks/useTypedSelector';
import { RecoveryPage } from 'modules/auth/pages/RecoveryPage/RecoveryPage';
import { SignUpPage } from 'modules/auth/pages/SignUpPage/SignUpPage';
import { LoginPage } from 'modules/auth/pages/LoginPage/LoginPage';
import { AccountPage } from 'modules/account/pages/AccountPage/AccountPage';
import { OfferPage } from 'modules/offer/pages/OfferPage/OfferPage';
import { PostCreatePage } from 'modules/post/pages/PostCreatePage';
import { PostListPage } from 'modules/post/pages/PostListPage';
import { CompanyCreatePage } from 'modules/company/pages/CompanyCreatePage/CompanyCreatePage';
import { CompanyDetailsPage } from 'modules/company/pages/CompanyDetailsPage/CompanyDetailsPage';
import { CompanyUpdatePage } from 'modules/company/pages/CompanyUpdatePage/CompanyUpdatePage';
import { CompanyDeletePage } from 'modules/company/pages/CompanyDeletePage/CompanyDeletePage';
import { OffersPage } from 'modules/account/pages/OffersPage/OffersPage';
import { ProductCreatePage } from 'modules/product/pages/ProductCreatePage/ProductCreatePage';
import { ProductUpdatePage } from 'modules/product/pages/ProductUpdatePage/ProductUpdatePage';
import { ProductDeletePage } from 'modules/product/pages/ProductDeletePage/ProductDeletePage';

const AppRoutes: FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const { token } = useTypedSelector((state) => state.auth)

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  if (!token) {
    return (
      <Routes>
        <Route element={<UnauthorisedLayout />}>
          <Route path="/recovery" element={<RecoveryPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<LoginPage />} />
        </Route>
      </Routes>
    )
  }

  if (location.pathname === '/') {
    navigate('/post')
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path='/account/profile/edit' element={<AccountPage />} />
        <Route path='/account/offers' element={<OffersPage />} />
        <Route path='/offer' element={<OfferPage />} />
        <Route path="/post" element={<PostListPage />} />
        <Route path="/post/list" element={<PostListPage />} />
        <Route path="/post/create" element={<PostCreatePage />} />
        <Route path="/company/create" element={<CompanyCreatePage />} />
        <Route path="/company/:id/" element={<CompanyDetailsPage />} />
        <Route path="/company/:id//update" element={<CompanyUpdatePage />} />
        <Route path="/company/:id//delete" element={<CompanyDeletePage />} />
        <Route path="/product/:companyId/:id/create" element={<ProductCreatePage />} />
        <Route path="/product/:companyId/:id/update" element={<ProductUpdatePage />} />
        <Route path="/product/:companyId/:id/delete" element={<ProductDeletePage />} />
        <Route path="/content-plan" element={<ProductDeletePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/post" replace />} />
    </Routes>
  )
}

export default AppRoutes;
