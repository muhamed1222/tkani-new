import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { authRoutes, publicRoutes } from "../../Routes";
import { SHOP_ROUTE } from "../../utils/consts";
import { observer } from "mobx-react-lite";
import { Context } from "../../main";

export let Approuter = observer(() => {
  const { user } = useContext(Context);

  return (
    <>
      <Routes>
        {/** Приватные маршруты (только для авторизованных) */}
        {authRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={element}
          />
        ))}

        {/** Публичные маршруты (доступны всем) */}
        {publicRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={element}
          />
        ))}

        {/** Редирект с корня на главную */}
        <Route path="/" element={<Navigate to={SHOP_ROUTE} replace />} />
        
        
      </Routes>
    </>
  );
});