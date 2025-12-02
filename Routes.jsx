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
  DISCOUNTS_ROUTE,
  OUR_WORKS_ROUTE,
  PRIVACY_POLICY_ROUTE,
  TERMS_OF_SERVICE_ROUTE,
  WORK_DETAIL_ROUTE 
} from "./utils/consts";

import { Basket } from "./pages/basket/Basket";
import { Shop } from "./pages/shop/Shop";
import { Auth } from "./pages/auth/Auth";
import { Tkanpage } from "./pages/tkanpage/Tkanpage";
import { Registration } from "./pages/registration/Registration";
import { ForgotPassword } from "./pages/forgotPassword/ForgotPassword";
import { VerifyCode } from "./pages/verifyCode/VerifyCode";
import { ResetPassword } from "./pages/resetPassword/ResetPassword";
import { AboutUs } from "./pages/aboutUs/AboutUs";
import { Admin } from "./pages/admin/Admin";
import { Account } from "./pages/account/Account";
import { UIKit } from "./pages/uikit/UIKit";
import { Catalog } from "./pages/catalog/Catalog";
import { Discounts } from "./pages/discounts/Discounts";
import { OurWorks } from "./pages/ourWorks/OurWorks";
import { PrivacyPolicy } from "./pages/privacyPolicy/PrivacyPolicy";
import { TermsOfService } from "./pages/termsOfService/TermsOfService";
import { Page404 } from "./pages/page404/Page404"; 
import { WorkPage } from "./pages/WorkPage/WorkPage"; // Импортируйте компонент WorkPage
import { Checkout } from "./pages/checkout/Checkout";

export const authRoutes = [
  {
    path: ADMIN_ROUTE,
    element: <Admin />,
  },
  {
    path: ACCOUNT_ROUTE,
    element: <Account />,
  },
  {
    path: BASKET_ROUTE,
    element: <Basket />,
  },
];

export const publicRoutes = [
  {
    path: SHOP_ROUTE,
    element: <Shop />,
  },
  {
    path: CATALOG_ROUTE,
    element: <Catalog />,
  },
  {
    path: CATALOG_ROUTE + "/:category",
    element: <Catalog />,
  },
  {
    path: "/catalog-clothing",
    element: <Catalog />,
  },
  {
    path: "/catalog-clothing/:category",
    element: <Catalog />,
  },
  {
    path: LOGIN_ROUTE,
    element: <Auth />,
  },
  {
    path: REGISTRATION_ROUTE,
    element: <Registration />,
  },
  {
    path: FORGOT_PASSWORD_ROUTE,
    element: <ForgotPassword />,
  },
  {
    path: VERIFY_CODE_ROUTE,
    element: <VerifyCode />,
  },
  {
    path: RESET_PASSWORD_ROUTE,
    element: <ResetPassword />,
  },
  {
    path: ABOUTUS_ROUTE,
    element: <AboutUs/>,
  },
  {
    path: TKAN_ROUTE + "/:id",
    element: <Tkanpage/>,
  },
  {
    path: WORK_DETAIL_ROUTE, // Добавьте этот маршрут
    element: <WorkPage/>,
  },
  {
    path: UIKIT_ROUTE,
    element: <UIKit/>,
  },
  {
    path: DISCOUNTS_ROUTE,
    element: <Discounts/>,
  },
  {
    path: OUR_WORKS_ROUTE,
    element: <OurWorks/>,
  },
  {
    path: PRIVACY_POLICY_ROUTE,
    element: <PrivacyPolicy/>,
  },
  {
    path: TERMS_OF_SERVICE_ROUTE,
    element: <TermsOfService/>,
  },
  {
  path: '/checkout',
  element: <Checkout />
},
  {
    path: "*",
    element: <Page404 />,
  },
];