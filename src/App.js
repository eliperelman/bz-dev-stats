import React, { Component } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { Paper } from 'react-md';
import Dashboard from './Dashboard';
import Login from './Login';
import './app.scss';
import FontLoader from "./FontLoader";

export default class App extends Component {
  state = {
    hasError: false
  };

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Paper zDepth={1}>
          <FontLoader />
          An error occurred while attempting to create the dashboard. Please check the console and try again.
        </Paper>
      );
    }

    return (
      <div>
        <FontLoader />
        <BrowserRouter>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/:email?" render={props => {
              const storedCredentials = localStorage.getItem('credentials');
              const credentials = (storedCredentials && JSON.parse(storedCredentials)) || (
                props.history.location.state &&
                props.history.location.state.credentials
              );

              if (credentials) {
                return <Dashboard history={props.history} credentials={credentials} email={props.match.params.email} />
              }

              return <Redirect to="/login" />;
            }} />
          </Switch>
        </BrowserRouter>
      </div>
    )
  }
}
