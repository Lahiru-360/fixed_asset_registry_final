import { lazy } from "react";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const EmployeeSettings = lazy(() => import("../pages/EmployeeSettings"));
const AdminRequestsPage = lazy(() => import("../pages/RequestsPage"));
const QuotationPage = lazy(() => import("../pages/QuotationPage"));
const NotFound = lazy(() => import("../pages/NotFound"));
const RoleRedirector = lazy(() => import("../router/RoleRedirecter"));
const EmployeeDashboard = lazy(() => import("../pages/EmployeeDashboard"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const PurchaseOrderPage = lazy(() => import("../pages/PurchaseOrderPage"));
const AssetRegistryPage = lazy(() => import("../pages/AssetRegistryPage"));
const DepreciationPage = lazy(() => import("../pages/DepreciationPage"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const SOFP = lazy(() => import("../pages/SOFPPage"));

export const appRoutes = [
  {
    path: "/login",
    component: LoginPage,
    requiresAuth: false,
  },
  {
    path: "/",
    component: LoginPage,
    requiresAuth: false,
  },
  {
    path: "/register",
    component: RegisterPage,
    requiresAuth: false,
  },
  {
    path: "/admin/requests",
    component: AdminRequestsPage,
    requiresAuth: true,
    allowedRoles: ["admin"],
  },
  {
    path: "/admin/dashboard",
    component: AdminDashboard,
    requiresAuth: true,
    allowedRoles: ["admin"],
  },
  {
    path: "/admin/assets",
    component: AssetRegistryPage,
    requiresAuth: true,
    allowedRoles: ["admin"],
  },
  {
    path: "/admin/depreciation",
    component: DepreciationPage,
    requiresAuth: true,
    allowedRoles: ["admin"],
  },
  {
    path: "/admin/sofp",
    component: SOFP,
    requiresAuth: true,
    allowedRoles: ["admin"],
  },
  {
    path: "/admin/requests/:id/quotations",
    component: QuotationPage,
    requiresAuth: true,
    allowedRoles: ["admin"],
  },
  {
    path: "/redirect",
    component: RoleRedirector,
    requiresAuth: false,
  },
  {
    path: "/user",
    component: EmployeeDashboard,
    requiresAuth: true,
    allowedRoles: ["employee"],
  },
  {
    path: "/settings",
    component: EmployeeSettings,
    requiresAuth: true,
    allowedRoles: ["employee"],
  },

  {
    path: "/forgotpassword",
    component: ForgotPasswordPage,
    requiresAuth: false,
  },

  {
    path: "/admin/requests/:id/order",
    component: PurchaseOrderPage,
    requiresAuth: true,
    allowedRoles: ["admin"],
  },

  {
    path: "*",
    component: NotFound,
    requiresAuth: false,
  },

  /* {
    path: "/restaurants/:id/menu",
    component: RestaurantMenuList,
    requiresAuth: true,
    allowedRoles: ["customer", "guest"],
  },
  {
    path: "/reset-password",
    component: ResetPage,
    requiresAuth: false,
    hideHeader: true,
  },
  {
    path: "/forgotpassword",
    component: ForgotPasswordPage,
    requiresAuth: false,
    hideHeader: true,
  },

  {
    path: "/customerprofile/*",
    component: CustomerProfile,
    requiresAuth: true,
    allowedRoles: ["customer"],
    children: [
      {
        path: "analysis",
        component: Analysis,
      },
      {
        path: "orders",
        component: CustomerOrders,
      },
      {
        path: "settings",
        component: Settings,
      },
      {
        path: "details",
        component: CustomerPersonalDetails,
      },
       {
        path: "reservations",
        component: ReservationList,
      },
      {
        path: "wallet",
        component: CustomerWallet, 
      },
     
    ]
  },*/
];
