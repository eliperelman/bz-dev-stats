import React, { Component } from 'react';
import FoutStager from 'react-fout-stager';
import 'material-design-icons/iconfont/material-icons.css';

export default class FontLoader extends Component {
  render() {
    return (
      <FoutStager
        stages={[
          {
            className: 'font-stage-material-icons',
            families: [{ family: 'Material Icons' }]
          },
          {
            className: 'font-stage-primary',
            families: [{ family: 'Roboto400' }],
            stages: [
              {
                className: 'font-stage-secondary',
                families: [
                  { family: 'Roboto400Italic', options: { style: 'italic' } },
                  { family: 'Roboto700', options: { weight: 700 } },
                  { family: 'Roboto700Italic', options: { weight: 700, style: 'italic' } }
                ]
              }
            ]
          }
        ]} />
    );
  }
}
