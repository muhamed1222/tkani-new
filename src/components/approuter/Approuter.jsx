import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { authRoutes, publicRoutes } from "../../Routes";
import { SHOP_ROUTE } from "../../utils/consts";
import { observer } from "mobx-react-lite";
import { Context } from "../../main";


export let Approuter = observer(() => {

        const {user} = useContext(Context)

    return(
        <>
        
        {/* <div className="flex justify-center items-center min-h-screen"> */}
            <Routes>
                {/** Приватные маршруты (только для авторизованных) */}
                {/* Рендерим маршруты всегда, компоненты сами проверят авторизацию */}
                {authRoutes.map(({ path, element }) => (
                <Route
                    key={path}         // уникальный ключ
                    path={path}        // URL
                    element={element}  // JSX компонента
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

                <Route path="*" element={<Navigate to={SHOP_ROUTE} replace />} />

            </Routes>
       {/* </div> */}
        </>
    );
});