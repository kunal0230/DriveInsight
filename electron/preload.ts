import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  scanDirectory: (path: string) => ipcRenderer.invoke('scan-directory', path),
  getCommonDirectories: () => ipcRenderer.invoke('get-common-directories'),
  listDirectory: (path: string) => ipcRenderer.invoke('list-directory', path),
  openPath: (path: string) => ipcRenderer.invoke('open-path', path),
  ipcRenderer: {
    on: (channel: string, func: (...args: any[]) => void) => {
      // Allow specific channels for security? For now open.
      const validChannels = ['scan-progress', 'main-process-message'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (_, ...args) => func(...args));
      }
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    }
  }
})

