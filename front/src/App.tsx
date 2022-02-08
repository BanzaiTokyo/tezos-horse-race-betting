import React from 'react';
import {Provider} from 'react-redux';

import './style.css';
import Layout from "./components/Layout";
import store from "./store";

function App() {
    return (
        <Provider store={store}>

        <Layout/>
        </Provider>
    );
}

export default App;
