import React from 'react';

import { BrowserRouter as Router, Routes, Route, useRoutes } from 'react-router-dom';

import Join from './components/Join/Join';
import Chat from './components/Chat/Chat';

const App = () => {
    let routes = useRoutes([
        { path: "/", element: <Join /> },
        { path: "/chat", element: <Chat /> }
    ]);
    return routes;
};

const AppWrapper = () => {
    return (
        <Router>
            <App />
        </Router>
    );
};

export default AppWrapper;