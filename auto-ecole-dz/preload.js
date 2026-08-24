const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('appInfo', {
  version: process.env.npm_package_version || '1.0.0'
});
