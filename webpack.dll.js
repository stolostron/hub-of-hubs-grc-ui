/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* Copyright (c) 2020 Red Hat, Inc. */
/* Copyright Contributors to the Open Cluster Management project */

const path = require('path'),
      webpack = require('webpack'),
      AssetsPlugin = require('assets-webpack-plugin'),
      CompressionPlugin = require('compression-webpack-plugin')

const PRODUCTION = process.env.BUILD_ENV ? /production/.test(process.env.BUILD_ENV) : false

process.env.BABEL_ENV = process.env.BABEL_ENV ? process.env.BABEL_ENV : 'client'

module.exports = {
  entry: {
    'vendorhcm': [
      '@loadable/component',
      'lodash',
      'moment',
      'normalizr',
      'prop-types',
      'react-dom',
      'react-dom/server',
      'react-redux',
      'react-router-dom',
      'react',
      'redux-logger',
      'redux-thunk',
      'redux',
      'reselect'
    ]
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        include: path.resolve(__dirname, './node_modules/monaco-editor'),
        use: [{ loader: 'style-loader', options: { base: 2000 } },
          'css-loader',],
      },
    ],
  },

  output: {
    path: __dirname + '/public',
    filename: PRODUCTION ? 'dll.[name].[contenthash].min.js' : 'dll.[name].js',
    library: '[name]'
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(PRODUCTION ? 'production' : 'development')
      }
    }),
    new webpack.DllPlugin({
      path: path.join(__dirname, 'dll', '[name]-manifest.json'),
      name: '[name]',
      context: __dirname
    }),
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/
    }),
    new AssetsPlugin({
      path: path.join(__dirname, 'public'),
      fullPath: false,
      prettyPrint: true,
      update: true
    }),
  ],
  resolve: {
    modules: [path.join(__dirname, 'node_modules')]
  }
}
