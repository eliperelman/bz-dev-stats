import React, { Component } from 'react';
import { Avatar, Button, Card, CardText, CardTitle, Chip, Divider } from 'react-md';
import Heatmap from 'react-calendar-heatmap';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const Count = ({ color, label, children }) => (
  <div className="chip-wrapper">
    <Chip label={label} avatar={<Avatar suffix={color}>{children}</Avatar>} />
  </div>
);

const makeDate = (from = 0) => {
  const date = new Date(new Date().setDate(new Date().getDate() - from));

  date.setHours(0, 0 ,0, 0);
  return date;
};

export default class DevCard extends Component {
  state = {
    hasError: false
  };

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  getStatsForDays(days) {
    const dates = [...Array(days).keys()].reverse().map(makeDate);
    const [start] = dates;
    const stats = this.props.user.stats.filter(stat => new Date(stat.date) >= start);

    return dates
      .reduce((values, date, index) => {
        const stat = stats.find(stat => (
          date.getTime() === new Date(new Date(stat.date).setHours(0, 0, 0, 0)).getTime()
        )) || { ...values[index - 1] };

        values.push({
          reviewsP1: 0,
          reviews: 0,
          needinfos: 0,
          needinfosP1: 0,
          ...stat,
          date
        });

        return values;
      }, []);
  }

  current(stat) {
    return (
      <div className="md-grid chips">
        <Count label="Reviews, P1" color="grey">{stat.reviewsP1}</Count>
        <Count label="Reviews, Other" color="cyan">{stat.reviews}</Count>
        <Count label="Needinfos, P1" color="amber">{stat.needinfosP1}</Count>
        <Count label="Needinfos, Other" color="pink">{stat.needinfos}</Count>
      </div>
    );
  }

  month() {
    const values = this.getStatsForDays(30);

    return (
      <div style={{ padding: '0 20px' }}>
        Past 30 days
        <div style={{ height: 80, marginTop: 10 }}>
          <ResponsiveContainer>
            <LineChart data={values} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} isAnimationActive={false}>
              <Tooltip label="Requests" />
              <XAxis dataKey="date" hide />
              <Line type="monotone" dataKey="reviewsP1" stroke="#616161" dot={false} />
              <Line type="monotone" dataKey="reviews" stroke="#26c6da" dot={false} />
              <Line type="monotone" dataKey="needinfosP1" stroke="#ffca28" dot={false} />
              <Line type="monotone" dataKey="needinfos" stroke="#d81b60" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  biannual() {
    const values = this.getStatsForDays(180).reduce((requests, stat) => {
      requests.push({
        date: stat.date,
        requests: stat.reviewsP1 + stat.reviews + stat.needinfosP1 + stat.needinfos
      });
      return requests;
    }, []);

    return (
      <div style={{ padding: '0 20px' }}>
        Past 180 days
        <div style={{ height: 100, overflowX: 'auto', overflowY: 'hidden', marginLeft: 10 }}>
          <Heatmap
            titleForValue={(value) => {
              if (!value) {
                return '';
              }

              return value &&
                `${new Date(value.date).toLocaleDateString()} - ${value.requests} ${
                  value.requests === 1 ? 'request' : 'requests'
                }`;
            }}
            classForValue={(value) => {
              if (!value || !value.requests) {
                return 'color-0';
              } else if (value.requests < 5) {
                return 'color-1';
              } else if (value.requests < 10) {
                return 'color-2';
              } else if (value.requests < 15) {
                return 'color-3';
              } else {
                return 'color-4';
              }
            }}
            endDate={new Date()}
            startDate={makeDate(180)}
            values={values} />
        </div>
      </div>
    );
  }

  render() {
    const { user } = this.props;
    const { hasError } = this.state;

    if (!this.props.user) {
      return null;
    }

    const hasStats = user.stats && user.stats.length !== 0;
    const stat = hasStats && user.stats[user.stats.length - 1];
    const requestsCount = hasStats && stat.reviewsP1 + stat.reviews + stat.needinfosP1 + stat.needinfos;

    return (
      <Card className="md-cell md-cell--3 md-cell--4-tablet md-cell--4-phone">
        <CardTitle style={{ padding: '14px 24px' }} title={user.name} subtitle={`${requestsCount} OPEN ${requestsCount === 1 ? 'REQUEST' : 'REQUESTS'}`} />
        <CardText style={{ padding: '16px 0' }}>
          {hasError && <p style={{ padding: 20 }}>An error occurred trying to render this view. Please check the console and try again.</p>}
          {!hasError && !hasStats && <em style={{ padding: 20 }}>No stats for this user.</em>}
          {!hasError && hasStats && (
            <div>
              {this.current(stat)}
              <Divider />
              {this.month()}
              <Divider />
              {this.biannual()}
            </div>
          )}
        </CardText>
      </Card>
    );
  }
}