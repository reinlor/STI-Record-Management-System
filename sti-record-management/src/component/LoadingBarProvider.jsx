import LoadingBar from 'react-top-loading-bar';
import { createContext, useContext, useRef } from "react";

const LoadingBarContext = createContext();

export function LoadingBarProvider({children}) {

    const loadingRef = useRef();

    const start = () => loadingRef.current?.continuousStart();
    const complete = () => loadingRef.current?.complete();

    return (
        <LoadingBarContext.Provider value={{ start, complete }}>
            <LoadingBar color="#4fd1c5" height={3} ref={loadingRef} />
            {children}
        </LoadingBarContext.Provider>
    );
}

export function useLoadingBar() {
    return useContext(LoadingBarContext);
}