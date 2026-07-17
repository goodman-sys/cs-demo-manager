/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable typescript/require-await */
/* eslint-disable lingui/no-unlocalized-strings */
// Web 版 PreloadApi 实现，替代 Electron preload.ts。
// 通过 window.csdm 暴露与 Electron 版相同的接口，内部使用 REST API 和浏览器 API。

import type { Settings } from 'csdm/node/settings/settings';
import type { ThemeName } from 'csdm/common/types/theme-name';
import type { ColumnState } from 'csdm/node/settings/table/column-state';
import type { TableName } from 'csdm/node/settings/table/table-name';
import type { StartupBehavior } from 'csdm/common/types/startup-behavior';
import type { Argument } from 'csdm/common/types/argument';
import type { Game, PremierRank, Rank } from 'csdm/common/types/counter-strike';
import type { AppInformation } from 'csdm/node/get-app-information';
import type { PreloadResult } from 'csdm/preload/preload-result';
import type { ImageInformation } from 'csdm/common/types/image-information';
import type { UpdateSettingsOptions } from 'csdm/node/settings/update-settings';
import { getPremierRankTier } from 'csdm/ui/shared/get-premier-rank-tier';

const THEME_STORAGE_KEY = 'csdm-theme';
const TABLE_STATE_PREFIX = 'csdm-table-state-';

function fetchSettings(): Promise<Settings> {
  return fetch('/api/settings')
    .then((response) => response.json() as Promise<{ settings: Settings }>)
    .then((data) => data.settings);
}

function putSettings(settings: Partial<Settings>): Promise<Settings> {
  return fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
    .then((response) => response.json() as Promise<{ settings: Settings }>)
    .then((data) => data.settings);
}

function readTableStateFromStorage(tableName: TableName): Promise<ColumnState[]> {
  try {
    const json = localStorage.getItem(`${TABLE_STATE_PREFIX}${tableName}`);
    if (!json) {
      return Promise.resolve([]);
    }
    return Promise.resolve(JSON.parse(json) as ColumnState[]);
  } catch {
    return Promise.resolve([]);
  }
}

function writeTableStateToStorage(tableName: TableName, columns: ColumnState[]): void {
  localStorage.setItem(`${TABLE_STATE_PREFIX}${tableName}`, JSON.stringify(columns));
}

const logger: PreloadApi['logger'] = {
  debug: (...data: unknown[]) => console.debug(...data),
  log: (...data: unknown[]) => console.log(...data),
  warn: (...data: unknown[]) => console.warn(...data),
  error: (...data: unknown[]) => console.error(...data),
  getLogFilePath: () => '',
  clear: () => Promise.resolve(),
};

const webBridge = {
  logger,

  // 平台信息：Web 固定值
  platform: 'web' as NodeJS.Platform,
  isWindows: false,
  isMac: false,
  isLinux: false,

  unknownImageFilePath: '/static/images/maps/thumbnail_unknown.png',
  IMAGES_FOLDER_PATH: '/static/images',
  ADDITIONAL_ARGUMENTS: [] as string[],
  WEB_SOCKET_SERVER_PORT: 0,

  getAppInformation: (): AppInformation => {
    return {
      platform: 'web' as NodeJS.Platform,
      arch: 'x64' as NodeJS.Architecture,
      osVersion: navigator.userAgent,
      electronVersion: '',
      chromeVersion: '',
    };
  },

  getStartupArguments: (): Promise<Argument[]> => Promise.resolve([]),
  clearStartupArguments: () => {},

  getTheme: (): Promise<ThemeName> => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return Promise.resolve(stored);
    }
    return Promise.resolve('dark');
  },

  getWebFilePath: (file: File): string => {
    return file.name;
  },

  getSystemStartupBehavior: (): Promise<StartupBehavior> => Promise.resolve('off'),
  updateSystemStartupBehavior: (behavior: StartupBehavior) => Promise.resolve(),

  getHlaeExecutablePath: (): Promise<string> => Promise.resolve(''),
  getFfmpegExecutablePath: (): Promise<string> => Promise.resolve(''),
  getVirtualDubExecutablePath: (): Promise<string> => Promise.resolve(''),

  // 设置读写：通过 REST API
  parseSettingsFile: fetchSettings,

  updateSettings: (settings: DeepPartial<Settings>, options?: UpdateSettingsOptions): Promise<Settings> => {
    return putSettings(settings as Partial<Settings>);
  },

  resetSettings: (): Promise<void> => {
    return fetch('/api/settings/reset', { method: 'POST' }).then(() => {});
  },

  writeJsonFile: (filePath: string, data: string): Promise<PreloadResult<boolean>> => {
    return Promise.resolve({ success: true });
  },

  // 表状态持久化：使用 localStorage
  readTableState: readTableStateFromStorage as unknown as PreloadApi['readTableState'],
  writeTableState: writeTableStateToStorage as unknown as PreloadApi['writeTableState'],

  // 图片资源：返回静态 URL
  getCameraPreviewBase64: (cameraId: string): Promise<string | null> => {
    return Promise.resolve(null);
  },

  getMapRadarBase64: (mapName: string, game: Game): Promise<string | undefined> => {
    return Promise.resolve(`/static/images/maps/radar/${mapName}.png`);
  },

  getMapLowerRadarBase64: (mapName: string, game: Game): Promise<string | undefined> => {
    return Promise.resolve(`/static/images/maps/lower_radar/${mapName}.png`);
  },

  getMapThumbnailBase64: (mapName: string, game: Game): Promise<string | undefined> => {
    return Promise.resolve(`/static/images/maps/thumbnail/${mapName}.png`);
  },

  getImageInformation: (filePath: string): Promise<ImageInformation> => {
    return Promise.resolve({ width: 0, height: 0, base64: '' });
  },

  getDefaultPlayerAvatar: (): string => {
    return '/static/images/avatar.jpg';
  },

  getRankImageSrc: (rankNumber: Rank): string => {
    return `/static/images/ranks/competitive/${rankNumber}.png`;
  },

  getPremierRankImageSrc: (rank: PremierRank): string => {
    const tier = getPremierRankTier(rank);
    return `/static/images/ranks/premier/tier-${tier}.png`;
  },

  // 文件系统操作：Web 不支持
  pathExists: (path: string): Promise<boolean> => Promise.resolve(false),
  getPathDirectoryName: (filePath: string): string => {
    const lastSlash = filePath.lastIndexOf('/');
    return lastSlash > 0 ? filePath.substring(0, lastSlash) : '';
  },
  getPathBasename: (filePath: string): string => {
    const lastSlash = filePath.lastIndexOf('/');
    return lastSlash >= 0 ? filePath.substring(lastSlash + 1) : filePath;
  },

  // 窗口管理：Web 无窗口概念
  showMainWindow: () => {},
  restartApp: () => {
    window.location.reload();
  },
  reloadWindow: () => {
    window.location.reload();
  },

  // 文件对话框：Web 不支持原生对话框
  showSaveDialog: (options: import('electron').SaveDialogOptions) => {
    return Promise.resolve({
      canceled: true,
      filePath: undefined,
    } as unknown as import('electron').SaveDialogReturnValue);
  },
  showOpenDialog: (options: import('electron').OpenDialogOptions) => {
    return Promise.resolve({ canceled: true, filePaths: [] } as unknown as import('electron').OpenDialogReturnValue);
  },

  elementToImage: (
    options: import('csdm/preload/element-to-image').ElementToImageOptions,
  ): Promise<string | undefined> => {
    return Promise.resolve(undefined);
  },

  // 文件管理器操作：Web 不支持
  browseToFolder: (folderPath: string) => {},
  browseToFile: (filePath: string) => {},

  localeChanged: (locale: string) => {},

  // 导航状态
  canGoBack: () => Promise.resolve(window.history.length > 1),
  canGoForward: () => Promise.resolve(false),

  showTitleBarMenu: () => {},

  // 窗口状态管理
  isWindowMaximized: () => Promise.resolve(false),
  maximizeWindow: () => {},
  unMaximizeWindow: () => {},
  closeWindow: () => {
    window.close();
  },
  minimizeWindow: () => {},

  // IPC 事件监听：Web 环境返回空取消函数
  onOpenDemoFile: (callback: (event: import('electron').IpcRendererEvent, demoPath: string) => void) => () => {},
  onOpenSettings: (callback: () => void) => () => {},
  onToggleSettingsVisibility: (callback: () => void) => () => {},
  onShowAbout: (callback: () => void) => () => {},
  onWindowClose: (callback: () => void) => () => {},
  onWindowMaximized: (callback: () => void) => () => {},
  onWindowUnMaximized: (callback: () => void) => () => {},
  onNavigateToPendingDownloads: (callback: () => void) => () => {},
  onNavigateToBans: (callback: () => void) => () => {},
  onUpdateDownloaded: (callback: () => void) => () => {},

  // 自动更新：Web 不需要
  hasUpdateReadyToInstall: () => Promise.resolve(false),
  installUpdate: () => {},
  toggleAutoDownloadUpdates: (isEnabled: boolean) => {},
  shouldShowChangelog: () => Promise.resolve(false),

  // Demo 音频
  getDemoAudioFilePath: (demoPath: string) => Promise.resolve(null),
  getDemoAudioData: (checksum: string, audioFilePath: string) => Promise.resolve(null),

  // CS 日志文件路径
  getCounterStrikeLogFilePath: (game: Game): Promise<PreloadResult<string>> => {
    return Promise.resolve({
      error: { code: 'FileNotFound' as PreloadResult<string>['error'] extends { code: infer C } ? C : never },
    });
  },

  // 剪贴板：使用 navigator.clipboard API
  clearClipboard: () => {
    void navigator.clipboard.writeText('');
  },
  getClipboardText: (): string => {
    return '';
  },

  // 图片文件读取
  readImageFile: (imagePath: string): Promise<Buffer<ArrayBuffer>> => {
    return Promise.resolve(Buffer.from([]));
  },
};

(window as unknown as { csdm: PreloadApi }).csdm = webBridge as unknown as PreloadApi;
