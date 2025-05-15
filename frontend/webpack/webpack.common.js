const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const webpack = require('webpack');

const devMode = process.env.NODE_ENV !== 'production';

/**
 * 웹팩 공통 설정 파일
 * 모든 환경(개발 및 프로덕션)에 적용되는 웹팩 설정을 정의합니다.
 */
module.exports = {
  // 애플리케이션의 진입점 설정
  entry: './src/index.js',
  plugins: [
    // 빌드 전 디렉토리 정리
    new CleanWebpackPlugin(),
    // HTML 파일 생성 및 번들 파일 주입
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      favicon: 'src/images/favicon.png',
    }),
    // CSS 파일 추출 설정
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    }),
    // jQuery 관련 설정 (현재 주석 처리됨)
    // new webpack.ProvidePlugin({
    //   $: 'mdbootstrap/js/jquery-3.4.1.min',
    //   jQuery: 'mdbootstrap/js/jquery-3.4.1.min',
    //   jquery: 'mdbootstrap/js/jquery-3.4.1.min',
    //   'window.$': 'mdbootstrap/js/jquery-3.4.1.min',
    //   'window.jQuery': 'mdbootstrap/js/jquery-3.4.1.min',
    //   // Waves: 'mdbootstrap/js/modules/waves',
    // }),
  ],
  // 빌드 산출물 설정
  output: {
    filename: 'main.js',
    // 청크 파일명 설정 (현재 주석 처리됨)
    // chunkFilename: 'vendors/[name].bundle.js',
    path: path.resolve(__dirname, '../dist'),
  },
  // 모듈 처리 규칙
  module: {
    rules: [
      // SASS/SCSS/CSS 파일 처리
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          // CSS를 별도 파일로 추출
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // 개발 모드에서 HMR(Hot Module Replacement) 활성화
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          // CSS 로딩 및 소스맵 생성
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          // PostCSS 처리 (브라우저 호환성 등)
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          },
          // SASS/SCSS를 CSS로 변환
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      // 이미지 파일 처리
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[contenthash].[ext]',
          outputPath: 'assets/images',
        },
      },
      // SVG 파일 처리
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
      // 폰트 파일 처리
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: 'file-loader',
        options: {
          outputPath: 'assets/fonts',
        },
      },
      // 오디오 파일 처리
      {
        test: /\.wav$/,
        loader: 'file-loader',
        options: {
          outputPath: 'assets/audio',
        },
      },
      // JavaScript 파일 처리 (Babel 트랜스파일링)
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            // 주석 처리된 설정: core-js 사용한 폴리필 적용
            // presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: '3.3.2' }]],
            presets: ['@babel/preset-env'],
          },
        },
      },
      // HTML 파일 처리 및 최소화
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true },
          },
        ],
      },
    ],
  },
};
