const fs = require('fs-extra');

const User = require('../models/user');


module.exports = async () => {
  let urls = [
    'https://www.collabzapp.com',
    'https://www.collabzapp.com/',
    'https://www.collabzapp.com/contact',
    'https://www.collabzapp.com/faq',
    'https://www.collabzapp.com/login',
    'https://www.collabzapp.com/privacy',
    'https://www.collabzapp.com/terms'
  ];

  // let users = await User.find({deactivated: null}).lean().exec();

  // users.forEach(user => {
  //   urls.push('https://www.collabzapp.com/' + user.slug);
  // });

  let outputStrings = ['<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  urls.forEach(url => {
    outputStrings.push('  <url>');
    outputStrings.push('    <loc>' + url + '</loc>');
    outputStrings.push('  </url>');
  });
  outputStrings.push('</urlset>');
  
  const localTempDirectory = __dirname + '/../../tmp';
  const localFilePath = 'sitemap.xml';

  fs.ensureDir(localTempDirectory, (err) => {
    if (err) {
      return console.log('Error creating sitemap temp directory: ', err);
    }
    
    fs.writeFile(localTempDirectory + '/' + localFilePath, outputStrings.join('\n'), (err) => {
      if (err) {
        return console.log('Error saving sitemap: ', err);
      }
      console.log('[Sitemap Helper] - Sitemap saved.');
    });
  });

}
