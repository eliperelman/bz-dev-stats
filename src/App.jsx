import React from 'react';
import { any } from 'prop-types';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './Login';
import './app.scss';
import FontLoader from './FontLoader';

console.log(3)

const App = () => (
  <div>
    <FontLoader />
    <BrowserRouter>
      <Switch>
        <Route path="/login" component={Login} />
        <Route
          path="/:email?"
          render={(props) => {
          const storedCredentials = localStorage.getItem('credentials');
          const credentials = (storedCredentials && JSON.parse(storedCredentials)) || (
            props.history.location.state &&
            props.history.location.state.credentials
          );

          if (credentials) {
            return (
              <Dashboard
                history={props.history}
                credentials={credentials}
                email={props.match.params.email} />
            );
          }

          return <Redirect to="/login" />;
        }}
        />
      </Switch>
    </BrowserRouter>
  </div>
);

export default App;
