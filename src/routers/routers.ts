import { lazy } from 'react';

const MainPage = lazy(() =>
  import('../pages/mainPage/MainPage').then(({ MainPage }) => ({
    default: MainPage,
  }))
);

// const UserPage = lazy(() =>
//   import('../pages/userPage/UserPage').then(({ UserPage }) => ({
//     default: UserPage,
//   }))
// );
// const StreamPage = lazy(() =>
//   import('../pages/streamPage/StreamPage').then(({ StreamPage }) => ({
//     default: StreamPage,
//   }))
// );

export const routers = [{ path: '/', Element: MainPage }];
