import './web-bridge'; // 必须在所有其他导入之前
globalThis.logger = window.csdm.logger;
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { router } from './router';
import 'csdm/ui/index.css';

document.title = 'CS Demo Manager';

window.addEventListener('error', (event) => {
  logger.error('未捕获的错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('未处理的 Promise 拒绝:', event.reason);
});

const root = ReactDOM.createRoot(document.getElementById('app')!);
root.render(<RouterProvider router={router} />);
