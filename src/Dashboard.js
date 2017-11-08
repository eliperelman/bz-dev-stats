import React, { Component } from 'react';
import { Button, MenuButton, Paper, TextField, Toolbar } from 'react-md';
import DevCard from './DevCard';
import Spinner from './Spinner';

const PAGE_LIMIT = 8;

export default class Dashboard extends Component {
  state = {
    hasError: false,
    users: [],
    loading: false,
    filterText: '',
    page: 0
  };

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  async componentWillMount() {
    this.setState({
      loading: true,
      hasError: false
    });

    try {
      const url = this.props.email ?
        `${process.env.STATS_URL}/${this.props.email}` :
        process.env.STATS_URL;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.props.credentials.idToken}`
        }
      });

      if (response.ok) {
        this.setState({
          loading: false,
          hasError: false,
          users: await response.json()
        });
      } else {
        this.props.history.replace('/login');
      }
    } catch (err) {
      this.setState({
        hasError: true,
        loading: false
      });
    }

  }

  handleFilter = (value) => {
    this.setState({
      filterText: value.toLowerCase(),
      page: 0
    });
  };

  handleNavClick = () => {
    this.setState({ searching: false, filterText: '' });
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

    return 'Bugzilla Developer Stats';
  }

  toolbar() {
    const { searching, users, page } = this.state;

    if (!users || !users.length) {
      return (
        <Toolbar
          fixed
          colored
          id="stats-toolbar"
          titleId="filter-text"
          title={this.title()} />
      );
    }

    const paging = users.length > PAGE_LIMIT;
    const pages = Math.ceil(users.length / PAGE_LIMIT);
    const actions = [(
      <Button key="search" icon onClick={this.handleActionClick}>
        {searching ? 'close' : 'search'}
      </Button>
    )];
    const nav = searching ?
      (
        <Button id="nav-arrow-back" key="nav" icon onClick={this.handleNavClick}>
          arrow_back
        </Button>
      ) :
      (
        <Button id="nav-bug" key="bug" icon disabled>
          bug_report
        </Button>
      );

    if (paging && !searching) {
      actions.push((
        <Button key="previous" icon onClick={this.handlePrevious} disabled={page === 0}>
          keyboard_arrow_left
        </Button>
      ));
      actions.push((
        <Button key="page" flat disabled style={{ fontSize: 14, textTransform: 'none' }}>
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
        className={searching ? 'searching' : null}
        nav={nav}
        actions={actions}
        title={this.title()} />
    );
  }

  render() {
    const { users, loading, hasError, filterText, page } = this.state;
    const filteredUsers = filterText ?
      users.filter(user => user.name.toLowerCase().includes(filterText)) :
      users;
    const pagedUsers = filteredUsers.length < PAGE_LIMIT ?
      filteredUsers :
      filteredUsers.slice(page * PAGE_LIMIT, (page + 1) * PAGE_LIMIT);

    return (
      <div>
        {this.toolbar()}
        {loading && (
          <div className="md-block-centered" style={{ height: 140, width: 140, marginTop: 100 }}>
            <Spinner height={140} width={140} color="#26c6da" />
          </div>
        )}
        {hasError && (
          <Paper zDepth={1}>
            An error occurred while attempting to create the dashboard.
            Please check the console and try again.
          </Paper>
        )}
        {!loading && !hasError && (
          <div className="md-grid" style={{ alignItems: 'flex-start', marginTop: 64 }}>
            {pagedUsers.map((user, index) => (
              <DevCard
                key={`user-card-${user.name.toLowerCase().replace(/\s/g, '')}`}
                user={user} />
            ))}
          </div>
        )}
      </div>
    );
  }
}
