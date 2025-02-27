// Forge Configuration
const path = require('path');
const rootDir = process.cwd();
const fsExtra = require('fs-extra');

module.exports = {
  hooks: {
    generateAssets: (forgeConfig, platform, arch) => {
      fsExtra.copySync("../web", ".wallet", { filter: filterFunc }, (err) => {
        if (err) {
          console.error('An error occurred while copying the folder.');
          console.error(err);
        } else {
          console.log('Folder copied successfully.');
        }
      });
      fsExtra.removeSync(".wallet/next.config.js", (err) => console.log(err));
      fsExtra.renameSync(".wallet/next.config-deploy.js", ".wallet/next.config.js");
    },
    packageAfterCopy: async (config, buildPath, electronVersion, platform, arch) => {
      var src = path.join(rootDir, '.wallet');
      console.log("src: ", src);
      var dst = buildPath;
      console.log("dst: ", dst);
      fsExtra.copySync(src, dst + '/.wallet');
    }
  },
  // Packager Config
  packagerConfig: {
    // Create asar archive for main, renderer process files
    asar: true,
    // Set executable name
    executableName: 'desktop',
    // Set application copyright
    appCopyright: 'Copyright (C) 2023 Mariano Vicario',
    // Set application icon
    icon: path.resolve('assets/images/appIcon.ico'),
    name: 'llavero',
    extraResource: [".wallet"],
  },
  // Forge Makers
  makers: [
    {
      // Squirrel.Windows is a no-prompt, no-hassle, no-admin method of installing
      // Windows applications and is therefore the most user friendly you can get.
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'Llavero',
      },
    },
    {
      // The Zip target builds basic .zip files containing your packaged application.
      // There are no platform specific dependencies for using this maker and it will run on any platform.
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      // The deb target builds .deb packages, which are the standard package format for Debian-based
      // Linux distributions such as Ubuntu.
      name: '@electron-forge/maker-deb',
      config: {
        name: 'Llavero',
      },
    },
    {
      // The RPM target builds .rpm files, which is the standard package format for
      // RedHat-based Linux distributions such as Fedora.
      name: '@electron-forge/maker-rpm',
      config: {
        name  : 'Llavero',
      },
    },
    { //mac
      name: '@electron-forge/maker-dmg',
      config: {
        background: path.join(rootDir, 'assets/llavero-logo.png'),
        format: 'ULFO',
        name: 'Llavero',
      }
    }
  ],
  // Forge Plugins
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        // Fix content-security-policy error when image or video src isn't same origin
        // Remove 'unsafe-eval' to get rid of console warning in development mode.
        devContentSecurityPolicy: `default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-inline' data:`,
        // Ports
        port: 3000, // Webpack Dev Server port
        loggerPort: 9000, // Logger port
        // Main process webpack configuration
        mainConfig: path.join(rootDir, 'tools/webpack/webpack.main.js'),
        // Renderer process webpack configuration
        renderer: {
          // Configuration file path
          config: path.join(rootDir, 'tools/webpack/webpack.renderer.js'),
          // Entrypoints of the application
          entryPoints: [
            {
              // Window process name
              name: 'app_window',
              // React Hot Module Replacement (HMR)
              rhmr: 'react-hot-loader/patch',
              // HTML index file template
              html: path.join(rootDir, 'src/renderer/app.html'),
              // Renderer
              js: path.join(rootDir, 'src/renderer/appRenderer.tsx'),
              // Main Window
              // Preload
              preload: {
                js: path.join(rootDir, 'src/renderer/appPreload.tsx'),
              },
            },
          ],
        },
        devServer: {
          liveReload: false,
        },
      },
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'elranu',
          name: 'llavero',
          repository: 'https://github.com/elranu/llavero.git'
        },
        prerelease: true
      }
    }
  ]
};



const filterFunc = (src) => {
  // Paths to omit
  const omitPaths = ['node_modules', '/.next', '.sst', '.open-next'];
  for (const omitPath of omitPaths) {
    if (src.includes(omitPath)) {
      return false;
    }
  }
  return true;
};
