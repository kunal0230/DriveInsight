import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  scanDirectory: (path: string) => ipcRenderer.invoke('scan-directory', path),
  getCommonDirectories: () => ipcRenderer.invoke('get-common-directories'),
  listDirectory: (path: string) => ipcRenderer.invoke('list-directory', path),
  ipcRenderer: {
    on: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.on(channel, (_, ...args) => func(...args))
    }
  }
})

