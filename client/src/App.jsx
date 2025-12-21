import { Suspense, lazy, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import DarkModeToggle from "./components/ui/DarkModeToggle";
import ProtectedRoute from "./router/ProtectedRoute";
import { appRoutes } from "./router/AppRoutes";

import "react-toastify/dist/ReactToastify.css";
import "./index.css"; // Tailwind entry

export default function App() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentRoute =
    appRoutes.find(
      (route) =>
        route.path === location.pathname ||
        (route.path?.includes("*") &&
          location.pathname.startsWith(route.path.replace("/*", "")))
    ) || appRoutes.find((route) => route.path === "*");

  console.log(currentRoute);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-12 h-12 border-4 border-primary border-dashed rounded-full animate-spin"></div>
          </div>
        }
      >
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {appRoutes.map((route) => {
              const RouteComponent = route.component;

              if (route.children) {
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      route.requiresAuth ? (
                        <ProtectedRoute allowedRoles={route.allowedRoles}>
                          <RouteComponent />
                        </ProtectedRoute>
                      ) : (
                        <RouteComponent />
                      )
                    }
                  >
                    {route.children.map((child) => {
                      const ChildComponent = child.component;
                      return (
                        <Route
                          key={child.path}
                          path={child.path}
                          element={
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChildComponent />
                            </motion.div>
                          }
                        />
                      );
                    })}
                  </Route>
                );
              }

              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {route.requiresAuth ? (
                        <ProtectedRoute allowedRoles={route.allowedRoles}>
                          <RouteComponent />
                        </ProtectedRoute>
                      ) : (
                        <RouteComponent />
                      )}
                    </motion.div>
                  }
                />
              );
            })}
          </Routes>
        </AnimatePresence>

        <DarkModeToggle />

        <ToastContainer
          position="top-right"
          autoClose={1500}
          closeOnClick
          className="text-sm"
          toastClassName="bg-secondary dark:bg-gray-800 text-white rounded-lg shadow-lg"
        />
      </Suspense>
    </div>
  );
}
