const { app, Menu, BrowserWindow } = require('electron')

const background_color = '#06090f'


function createWindow () {
    const mainWindow = new BrowserWindow({
      width: 530,
      height: 800,
      show: false,
      title: 'GAiA Chess',
      backgroundColor: background_color,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      }
    })
  
    mainWindow.loadFile('src/index.html')

    const template = [
        {
            label: 'GAiA',
            submenu: [
                {
                    label: 'New Game',
                    accelerator: "CmdOrCtrl+N",
                    click() {
                        mainWindow.reload()
                    }
                },
                {
                    label: 'Copy',
                    accelerator: "CmdOrCtrl+C",
                    selector: "copy:"
                },
                {
                    label: 'Paste',
                    accelerator: "CmdOrCtrl+V",
                    selector: "paste:"
                },
                {
                    label: 'Select All',
                    accelerator: 'CmdOrCtrl+A',
                    role: "selectAll"
                },
                {
                    label: 'Quit',
                    accelerator: "CmdOrCtrl+Q",
                    click () { app.quit() }
                }
          ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Toggle Developper Tools',
                    accelerator: 'CmdOrCtrl+T',
                    click() {
                        mainWindow.webContents.toggleDevTools()
                    }
                }
            ]
        },
        {
            label: 'Engine',
            submenu: [
                {
                    label: 'Manage Engine',
                    accelerator: "CmdOrCtrl+M",
                    click() {
                        const engineWindow = new BrowserWindow({
                            width: 400,
                            height: 380,
                            title: 'Engine Manager',
                            backgroundColor: background_color,
                            webPreferences: {
                                nodeIntegration: true,
                                contextIsolation: false,
                                enableRemoteModule: true
                              }
                          })

                        engineWindow.loadFile('src/engines/manage.html')
                    }
                },
                {
                    label: 'Show Logs',
                    accelerator: "CmdOrCtrl+L",
                    click () {
                        const LogWindow = new BrowserWindow({
                            width: 800,
                            height: 600,
                            title: 'Logs',
                            backgroundColor: background_color,
                            webPreferences: {
                                nodeIntegration: true,
                                contextIsolation: false,
                                enableRemoteModule: true
                              }
                          })

                          LogWindow.loadFile('src/engines/log.html')
                    }
                }
            ]
        },
        
    ]
    
    mainWindow.once('ready-to-show', () => {
        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
        mainWindow.show()
    })

    mainWindow.on('closed', () => {
        app.quit()
    })
  }
  
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
  
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

