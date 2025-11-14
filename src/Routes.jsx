import {
  ADMIN_ROUTE,
  BASKET_ROUTE,
  TKAN_ROUTE,
  LOGIN_ROUTE,
  REGISTRATION_ROUTE,
  SHOP_ROUTE,
  ABOUTUS_ROUTE,
  UIKIT_ROUTE,
  CATALOG_ROUTE
} from "./utils/consts";

import { Basket } from "./pages/basket/Basket";
import { Shop } from "./pages/shop/Shop";
import { Auth } from "./pages/auth/Auth";
import { Tkanpage } from "./pages/tkanpage/Tkanpage";
import { Registration } from "./pages/registration/Registration";
import { AboutUs } from "./pages/aboutUs/AboutUs";
import { Admin } from "./pages/admin/Admin";
import { UIKit } from "./pages/uikit/UIKit";
import { Catalog } from "./pages/catalog/Catalog";

export const authRoutes = [
  {
    path: ADMIN_ROUTE,
    element: <Admin />,
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
    path: ABOUTUS_ROUTE,
    element: <AboutUs/>,
  },
  {
    path: TKAN_ROUTE + "/:id",
    element: <Tkanpage/>,
  },
  {
    path: UIKIT_ROUTE,
    element: <UIKit/>,
  },

];