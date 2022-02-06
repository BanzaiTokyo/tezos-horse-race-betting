import React from 'react';
import ReactDOM from 'react-dom';
import {MemoryRouter} from 'react-router-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
        <MemoryRouter>
            <App/>
            {/*<RaceRoutes/>*/}
        </MemoryRouter>,
    document.getElementById('root')
);


