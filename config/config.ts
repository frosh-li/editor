// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';
const path = require('path');

const { REACT_APP_ENV } = process.env;
export default defineConfig({
  chainWebpack(config, { env, webpack, createCSSRule }) {
    config
      // 修改 entry 配置
      .entry('editor.worker')
      .add('monaco-editor/esm/vs/editor/editor.worker.js')
      .end()
      .output.globalObject('self')
      .path(path.resolve(__dirname, '../dist'))
      .filename('[name].bundle.js');
    config
      // 修改 entry 配置
      .entry('json.worker')
      .add('monaco-editor/esm/vs/language/json/json.worker')
      .end()
      .output.globalObject('self')
      .path(path.resolve(__dirname, '../dist'))
      .filename('[name].bundle.js');
    config
      // 修改 entry 配置
      .entry('css.worker')
      .add('monaco-editor/esm/vs/language/css/css.worker')
      .end()
      .output.globalObject('self')
      .path(path.resolve(__dirname, '../dist'))
      .filename('[name].bundle.js');
    config
      // 修改 entry 配置
      .entry('html.worker')
      .add('monaco-editor/esm/vs/language/html/html.worker')
      .end()
      .output.globalObject('self')
      .path(path.resolve(__dirname, '../dist'))
      .filename('[name].bundle.js');
    config
      // 修改 entry 配置
      .entry('ts.worker')
      .add('monaco-editor/esm/vs/language/typescript/ts.worker')
      .end()
      .output.globalObject('self')
      .path(path.resolve(__dirname, '../dist'))
      .filename('[name].bundle.js');
  },
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    name: '在线编辑功能',
    locale: true,
    siderWidth: 0,
    ...defaultSettings,
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // https://github.com/zthxxx/react-dev-inspector
  plugins: ['react-dev-inspector/plugins/umi/react-inspector'],
  inspectorConfig: {
    // loader options type and docs see below
    exclude: [],
    babelPlugins: [],
    babelOptions: {},
  },
  resolve: {
    includes: ['src/components'],
  },
});
