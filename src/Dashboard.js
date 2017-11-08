import React, { Component } from 'react';
import { Button, TextField, Toolbar } from 'react-md';
import DevCard from './DevCard';
import Spinner from './Spinner';

const PAGE_LIMIT = 8;

export default class Dashboard extends Component {
  state = {
    users: null,
    loading: false,
    filterText: '',
    page: 0
  };

  async componentWillMount() {
    this.setState({
      loading: true
    });

    const url = this.props.email ?
      `${process.env.STATS_URL}/${this.props.email}` :
      process.env.STATS_URL;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${this.props.credentials.idToken}` } });

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
    this.setState({
      filterText: value,
      page: 0
    });
  };

  handleNavClick = () => {
    this.setState({ searching: false });
  };

  handleActionClick = () => {
    if (this.state.searching) {
      this.setState({ filterText: '', searching: false });
    } else {
      this.setState({ searching: true });
    }
  };

  handlePrevious = () => {
    this.setState({ page: this.state.page - 1 });
  };

  handleNext = () => {
    this.setState({ page: this.state.page + 1 });
  };

  title() {
    if (this.state.searching) {
      return (
        <TextField
          block
          id="name-filter"
          value={this.state.filterText}
          placeholder="Filter users..."
          toolbar
          autoFocus
          onChange={this.handleFilter} />
      );
    }

    return (
      <Button flat primary iconChildren="bug_report">
        <span style={{ textTransform: 'none', fontSize: 22 }}>Bugzilla Developer Stats</span>
      </Button>
    );
  }

  toolbar() {
    const { searching, users, page } = this.state;
    const paging = users.length > PAGE_LIMIT;
    const pages = Math.ceil(users.length / PAGE_LIMIT);
    const actions = [(
      <Button key="search" icon onClick={this.handleActionClick}>
        {searching ? 'close' : 'search'}
      </Button>
    )];
    const nav = searching ?
      (
        <Button key="nav" icon onClick={this.handleNavClick}>
          arrow_back
        </Button>
      ) :
      null;

    if (paging && !searching) {
      actions.push((
        <Button key="previous" icon onClick={this.handlePrevious} disabled={page === 0}>
          keyboard_arrow_left
        </Button>
      ));
      actions.push((
        <Button key="wat" flat disabled style={{ fontSize: 14, textTransform: 'none' }}>
          {page + 1} of {pages}
        </Button>
      ));
      actions.push((
        <Button key="next" icon onClick={this.handleNext} disabled={page === pages - 1}>
          keyboard_arrow_right
        </Button>
      ));
    }

    return (
      <Toolbar
        fixed
        colored
        id="stats-toolbar"
        titleId="filter-text"
        nav={nav}
        actions={actions}
        title={this.title()} />
    );
  }

  render() {
    const { users, loading, filterText, page } = this.state;

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

    const filteredUsers = filterText ?
      users.filter(user => user.name.toLowerCase().includes(filterText)) :
      users;

    if (users.length < PAGE_LIMIT) {
      return (
        <div>
          {this.toolbar()}
          <div className="md-grid" style={{ alignItems: 'flex-start', marginTop: 64 }}>
            {filteredUsers.map((user, index) => <DevCard key={`user-card-${index}`} user={user} />)}
          </div>
        </div>
      );
    }

    return (
      <div>
        {this.toolbar()}
        <div className="md-grid" style={{ alignItems: 'flex-start', marginTop: 64 }}>
          {
            filteredUsers
              .slice(page * PAGE_LIMIT, (page + 1) * PAGE_LIMIT)
              .map((user, index) => (
                <DevCard
                  key={`user-card-${user.name.replace(/\s/g, '-')}`}
                  user={user} />
              ))
          }
        </div>
      </div>
    );
  }
}
