import {
  ADMIN_ROUTE,
  ACCOUNT_ROUTE,
  BASKET_ROUTE,
  TKAN_ROUTE,
  LOGIN_ROUTE,
  REGISTRATION_ROUTE,
  FORGOT_PASSWORD_ROUTE,
  VERIFY_CODE_ROUTE,
  RESET_PASSWORD_ROUTE,
  SHOP_ROUTE,
  ABOUTUS_ROUTE,
  UIKIT_ROUTE,
  CATALOG_ROUTE,
  FURNITURE_ROUTE,
  DISCOUNTS_ROUTE,
  OUR_WORKS_ROUTE,
  PRIVACY_POLICY_ROUTE,
  TERMS_OF_SERVICE_ROUTE,
  WORK_DETAIL_ROUTE 
} from "./utils/consts";

import { lazy, Suspense } from "react";
import Loading from "./components/ui/Loading/Loading";

// Lazy load heavy components for better performance
const Basket = lazy(() => import("./pages/basket/Basket").then(module => ({ default: module.Basket })));
const Shop = lazy(() => import("./pages/shop/Shop").then(module => ({ default: module.Shop })));
const Auth = lazy(() => import("./pages/auth/Auth").then(module => ({ default: module.Auth })));
const Tkanpage = lazy(() => import("./pages/tkanpage/Tkanpage").then(module => ({ default: module.Tkanpage })));
const Registration = lazy(() => import("./pages/registration/Registration").then(module => ({ default: module.Registration })));
const ForgotPassword = lazy(() => import("./pages/forgotPassword/ForgotPassword").then(module => ({ default: module.ForgotPassword })));
const VerifyCode = lazy(() => import("./pages/verifyCode/VerifyCode").then(module => ({ default: module.VerifyCode })));
const ResetPassword = lazy(() => import("./pages/resetPassword/ResetPassword").then(module => ({ default: module.ResetPassword })));
const AboutUs = lazy(() => import("./pages/aboutUs/AboutUs").then(module => ({ default: module.AboutUs })));
const Admin = lazy(() => import("./pages/admin/Admin").then(module => ({ default: module.Admin })));
const Account = lazy(() => import("./pages/account/Account").then(module => ({ default: module.Account })));
const UIKit = lazy(() => import("./pages/uikit/UIKit").then(module => ({ default: module.UIKit })));
const Catalog = lazy(() => import("./pages/catalog/Catalog").then(module => ({ default: module.Catalog })));
const Furniture = lazy(() => import("./pages/furniture/Furniture").then(module => ({ default: module.Furniture })));
const Discounts = lazy(() => import("./pages/discounts/Discounts").then(module => ({ default: module.Discounts })));
const OurWorks = lazy(() => import("./pages/ourWorks/OurWorks").then(module => ({ default: module.OurWorks })));
const PrivacyPolicy = lazy(() => import("./pages/privacyPolicy/PrivacyPolicy").then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import("./pages/termsOfService/TermsOfService").then(module => ({ default: module.TermsOfService })));
const Page404 = lazy(() => import("./pages/page404/Page404").then(module => ({ default: module.Page404 })));
const WorkPage = lazy(() => import("./pages/WorkPage/WorkPage").then(module => ({ default: module.WorkPage })));
const Checkout = lazy(() => import("./pages/checkout/Checkout").then(module => ({ default: module.Checkout })));

// Wrapper component for lazy-loaded routes
const LazyRoute = ({ children }) => (
  <div className="lazy-route-wrapper">
    <Suspense fallback={<Loading fullscreen text="Загрузка..." />}>
      {children}
    </Suspense>
  </div>
);

export const authRoutes = [
  {
    path: ADMIN_ROUTE,
    element: <LazyRoute><Admin /></LazyRoute>,
  },
  {
    path: ACCOUNT_ROUTE,
    element: <LazyRoute><Account /></LazyRoute>,
  },
  {
    path: BASKET_ROUTE,
    element: <LazyRoute><Basket /></LazyRoute>,
  },
];

export const publicRoutes = [
  {
    path: SHOP_ROUTE,
    element: <LazyRoute><Shop /></LazyRoute>,
  },
  {
    path: CATALOG_ROUTE,
    element: <LazyRoute><Catalog /></LazyRoute>,
  },
  {
    path: CATALOG_ROUTE + "/:category",
    element: <LazyRoute><Catalog /></LazyRoute>,
  },
  {
    path: "/catalog-clothing",
    element: <LazyRoute><Catalog /></LazyRoute>,
  },
  {
    path: "/catalog-clothing/:category",
    element: <LazyRoute><Catalog /></LazyRoute>,
  },
  {
    path: FURNITURE_ROUTE,
    element: <LazyRoute><Furniture /></LazyRoute>,
  },
  {
    path: LOGIN_ROUTE,
    element: <LazyRoute><Auth /></LazyRoute>,
  },
  {
    path: REGISTRATION_ROUTE,
    element: <LazyRoute><Registration /></LazyRoute>,
  },
  {
    path: FORGOT_PASSWORD_ROUTE,
    element: <LazyRoute><ForgotPassword /></LazyRoute>,
  },
  {
    path: VERIFY_CODE_ROUTE,
    element: <LazyRoute><VerifyCode /></LazyRoute>,
  },
  {
    path: RESET_PASSWORD_ROUTE,
    element: <LazyRoute><ResetPassword /></LazyRoute>,
  },
  {
    path: ABOUTUS_ROUTE,
    element: <LazyRoute><AboutUs /></LazyRoute>,
  },
  {
    path: TKAN_ROUTE + "/:id",
    element: <LazyRoute><Tkanpage /></LazyRoute>,
  },
  {
    path: WORK_DETAIL_ROUTE,
    element: <LazyRoute><WorkPage /></LazyRoute>,
  },
  {
    path: UIKIT_ROUTE,
    element: <LazyRoute><UIKit /></LazyRoute>,
  },
  {
    path: DISCOUNTS_ROUTE,
    element: <LazyRoute><Discounts /></LazyRoute>,
  },
  {
    path: OUR_WORKS_ROUTE,
    element: <LazyRoute><OurWorks /></LazyRoute>,
  },
  {
    path: PRIVACY_POLICY_ROUTE,
    element: <LazyRoute><PrivacyPolicy /></LazyRoute>,
  },
  {
    path: TERMS_OF_SERVICE_ROUTE,
    element: <LazyRoute><TermsOfService /></LazyRoute>,
  },
  {
    path: '/checkout',
    element: <LazyRoute><Checkout /></LazyRoute>,
  },
  {
    path: "*",
    element: <LazyRoute><Page404 /></LazyRoute>,
  },
];