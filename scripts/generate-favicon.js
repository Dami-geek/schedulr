const path = require('path');
const fs = require('fs');
const { favicons } = require('favicons');

const source = path.resolve(__dirname, '..', 'public', 'favicon-source.svg');
const outDir = path.resolve(__dirname, '..', 'public');

const configuration = {
  path: '/',
  appName: 'Schedulr',
  appShortName: 'Schedulr',
  appDescription: 'Academic Calendar Assistant',
  developerName: null,
  developerURL: null,
  background: '#ffffff',
  theme_color: '#2563eb',
  icons: {
    android: false,
    appleIcon: false,
    appleStartup: false,
    favicons: true,
    windows: false,
    yandex: false,
    coast: false,
    firefox: false,
  },
  iconsTheme: 'favicons',
};

favicons(source, configuration)
  .then((response) => {
    response.files
      .filter((f) => f.name === 'favicon.ico')
      .forEach((file) => {
        const target = path.join(outDir, file.name);
        fs.writeFileSync(target, file.contents);
        console.log('Generated', target);
      });
  })
  .catch((error) => {
    console.error('Favicon generation failed:', error);
    process.exit(1);
  });
