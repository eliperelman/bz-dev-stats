import React, { Component } from 'react';
import { DataTable, TablePagination, TextField } from 'react-md';
import DevCard from './DevCard';
import Spinner from './Spinner';

const ROWS = 50;

export default class Dashboard extends Component {
  state = {
    users: null,
    loading: false,
    filterText: '',
    offset: 0
  };

  async componentWillMount() {
    this.setState({
      loading: true
    });

    const url = this.props.email ?
      `${process.env.STATS_URL}/${this.props.email}` :
      process.env.STATS_URL;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${this.props.credentials.accessToken}` } });

    if (response.ok) {
      this.setState({
        loading: false,
        users: await response.json()
      });
    } else {
      this.props.history.replace('/login');
    }
  }

  handleFilter = (value) => {
    this.setState({ filterText: value });
  };

  handlePagination = (offset) => {
    this.setState({ offset });
  };

  render() {
    const { loading, users, filterText, offset } = this.state;

    if (loading) {
      return (
        <div className="md-block-centered" style={{ height: 140, width: 140, marginTop: 100 }}>
          <Spinner height={140} width={140} color="#26c6da" />
        </div>
      )
    }

    if (!users) {
      return null;
    }

    const filteredUsers = users
      .filter(user => filterText ? user.name.toLowerCase().includes(filterText) : true);

    if (users.length < ROWS) {
      return (
        <div className="md-grid" style={{ alignItems: 'flex-start' }}>
          {filteredUsers.map((user, index) => <DevCard key={`user-card-${index}`} user={user} />)}
        </div>
      );
    }

    return (
      <div>
        <div className="md-grid">
          <div className="md-cell md-cell--6">
            <TextField
              id="floating-center-title"
              label="Filter users..."
              value={filterText}
              onChange={this.handleFilter}
              lineDirection="center"
              className="md-cell md-cell--bottom" />
          </div>
          {filteredUsers.length >= ROWS && (
            <div className="md-cell md-cell--6">
              <DataTable baseId="simple-pagination">
                <TablePagination rows={filteredUsers.length} defaultRowsPerPage={ROWS} onPagination={this.handlePagination} />
              </DataTable>
            </div>
          )}
        </div>
        <div className="md-grid" style={{ alignItems: 'flex-start' }}>
          {filteredUsers.slice(offset, offset + ROWS).map((user, index) => <DevCard key={`user-card-${index}`} user={user} />)}
        </div>
      </div>
    );
  }
}
