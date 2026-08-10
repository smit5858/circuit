import React, { lazy, Suspense } from "react";
import MainLayout from "../layout/mainLayout/MainLayout";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

const Diagram = lazy(() => import("../pages/diagram"));

const routesConfig = [
  {
    children: [
      {
        path: "/",
        element: (
          <MainLayout>
            <Suspense fallback={<div>Loading diagram...</div>}>
              <Diagram />
            </Suspense>
          </MainLayout>
        ),
      },
    ],
  },
];

const routes = createBrowserRouter(routesConfig);
const AppRouting = () => {
  return <RouterProvider router={routes} />;
};

export default AppRouting;
