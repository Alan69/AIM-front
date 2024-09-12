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
import { CompanyCreatePage } from 'modules/company/pages/CompanyCreatePage/CompanyCreatePage';
import { CompanyDetailsPage } from 'modules/company/pages/CompanyDetailsPage/CompanyDetailsPage';
import { CompanyUpdatePage } from 'modules/company/pages/CompanyUpdatePage/CompanyUpdatePage';
import { CompanyDeletePage } from 'modules/company/pages/CompanyDeletePage/CompanyDeletePage';
import { OffersPage } from 'modules/account/pages/OffersPage/OffersPage';
import { ProductCreatePage } from 'modules/product/pages/ProductCreatePage/ProductCreatePage';
import { ProductUpdatePage } from 'modules/product/pages/ProductUpdatePage/ProductUpdatePage';
import { ProductDeletePage } from 'modules/product/pages/ProductDeletePage/ProductDeletePage';
import { useDispatch } from 'react-redux';
import { authActions } from 'modules/auth/redux/slices/auth.slice';
import Cookies from 'js-cookie';
import { PostQueryListPage } from 'modules/post-query/pages/PostQueryListPage';
import { PostQueryCreatePage } from 'modules/post-query/pages/PostQueryCreatePage/PostQueryCreatePage';
import { PostQueryDetailsPage } from 'modules/post-query/pages/PostQueryDetailsPage/PostQueryDetailsPage';
import { PostUpdatePage } from 'modules/post/pages/PostUpdatePage/PostUpdatePage';
import { PostDeletePage } from 'modules/post/pages/PostDeletePage/PostDeletePage';
import { PostDetailsPage } from 'modules/post/pages/PostDetailsPage/PostDetailsPage';
import { useLazyGetAuthUserQuery, useRefreshTokenMutation } from 'modules/auth/redux/api';
import { ContentPlanPage } from 'modules/content-plan/pages/ContentPlanPage/ContentPlanPage';
import { SocialMediaAddPage } from 'modules/social-media/pages/SocialMediaAddPage/SocialMediaAddPage';

const REFRESH_TOKEN_INTERVAL = 20 * 60 * 1000;

const AppRoutes: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, refreshToken } = useTypedSelector((state) => state.auth);
  const [getAuthUser] = useLazyGetAuthUserQuery();
  const [refreshTokenMutation] = useRefreshTokenMutation();

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    } else {
      getAuthUser();
    }
  }, [token, navigate, getAuthUser, location.pathname]);

  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        if (refreshToken) {
          const response = await refreshTokenMutation({ refresh: refreshToken }).unwrap();
          dispatch(authActions.setToken({ token: response.access, refreshToken }));
          Cookies.set('token', response.access, { expires: 7 });
        } else {
          throw new Error('No refresh token found');
        }
      } catch (error) {
        dispatch(authActions.logOut());
        navigate('/login', { replace: true });
      }
    };

    const intervalId = setInterval(() => {
      refreshAccessToken();
    }, REFRESH_TOKEN_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [refreshToken, dispatch, navigate, refreshTokenMutation, location.pathname]);

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
    navigate('/post-query/create')
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path='/account/profile/edit' element={<AccountPage />} />
        <Route path='/account/offers' element={<OffersPage />} />
        <Route path='/offer' element={<OfferPage />} />
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
