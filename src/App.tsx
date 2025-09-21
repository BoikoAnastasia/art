import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { NotFound } from './pages/notFound/NotFound';
import { routers } from './routers/routers';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/*<Route element={<PrivateRoute/>}>*/}
        {/*    {privateRouters.map(({path, Element}) => (*/}
        {/*        <Route key={path} element={<Element/>} />*/}
        {/*    ))}*/}
        {/*</Route>*/}
        {routers.map(({ path, Element, ...props }) => (
          <Route key={path} path={path} element={<Element {...props} />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const Loading = () => {
  return <div>загрузка</div>;
};

export default App;
