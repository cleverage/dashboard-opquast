/*
 * dashboard opquast
 * https://github.com/cleverage/dashboard-opquast
 *
 * gulpfile.js
 * - css : compile Sass to CSS, concatenation and minify CSS
 * - js : concatenation and minify JS
 * - dashboard : running dashboard with sexy data tables and sexy charts
 *
 * Copyright (c) 2019 Olivier Keul
 * Licensed under the MIT license.
 */


'use strict';


// Load plugins
const autoprefixer = require('gulp-autoprefixer');
const cheerio = require('cheerio');
const colors = require('colors');
const concat = require('gulp-concat');
const cssnano = require('gulp-cssnano');
const eslint = require('gulp-eslint');
const express = require('express');
const fs = require('fs');
const gulp = require('gulp');
const https = require('https');
const moment = require('moment');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify-es').default;


// Compile Sass to CSS and concat + minify CSS
function css() {
  return gulp.src('src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cssnano())
    .pipe(concat('main.css'))
    .pipe(gulp.dest('report/assets'));
}


// Lint JS
function jsLint() {
  return gulp.src(['src/js/main.js', 'gulpfile.js',])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}

// Concat + minify JS
function jsBuild() {
  return gulp.src('src/js/**/.js')
    .pipe(uglify())
    .pipe(concat('main.js'))
    .pipe(gulp.dest('report/assets'));
}


// dashboard launch with sexy tables and sexy charts
function dashboard() {

  // variables
  const host = 'https://directory.opquast.com/fr/';
  const urlIndex = host + 'agences/';
  const folder = 'report';
  const name = '/data';
  const link = 'a[class=\'pictoUser pl1 pr1\']';
  const number = 'section[class=\'grid-4-small-2 txtcenter\'] div:first-child span[class=\'number_source\']';
  const item = 'cartouche-large';
  const path = folder + name + '.json';
  const none = '0 certifié';
  const level0_fr = 'novice';
  const level1_fr = 'intermédiaire';
  const level2_fr = 'confirmé';
  const level3_fr = 'avancé';
  const level4_fr = 'expert';
  const level0_en = 'Beginner';
  const level1_en = 'Intermediate';
  const level2_en = 'Experienced';
  const level3_en = 'Advanced';
  const level4_en = 'Expert';

  // create report folder 
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  } else {
    fs.unlinkSync(path);
  }

  // init data json file
  let dataOrigin = JSON.stringify([], null, 2);
  fs.writeFileSync(path, dataOrigin);

  // request partner url
  https.get(urlIndex, (resp) => {
    let dataIndex = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      dataIndex += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {

      console.log(colors.cyan('Request : ') + urlIndex);

      const $ = cheerio.load(dataIndex),
        jsonFile = fs.readFileSync(path),
        jsonData = JSON.parse(jsonFile),
        arrLinks = [];

      // parse each item to find partners urls
      $(link).each(function() {
        if ($(this).text() !== none) {
          arrLinks.push($(this));
        }
      });

      for (let i in arrLinks) {
        const urlPartner = arrLinks[i].attr('href').replace('/fr/', ''),
          namePartner = arrLinks[i].parent().siblings('h2').text(),
          idPartner = namePartner.toLowerCase().replace(/\s/g, '');

        // update data json
        jsonData[i] = {
          'partner': namePartner,
          'url': host + urlPartner,
          'id': idPartner,
        };
        let data = JSON.stringify(jsonData, null, 2);
        fs.writeFileSync(path, data);
      }

      for (let j in jsonData) {
        // request partners url
        https.get(jsonData[j].url, (resp) => {
          let dataPartner = '';

          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
            dataPartner += chunk;
          });

          // The whole response has been received. Print out the result.
          resp.on('end', () => {

            console.log(colors.cyan('Request : ') + jsonData[j].url);

            const $ = cheerio.load(dataPartner),
              arrCertified = [],
              arrLevel = [];

            let countCertified = 0,
              countLevel0 = 0,
              countLevel1 = 0,
              countLevel2 = 0,
              countLevel3 = 0,
              countLevel4 = 0,
              levelCertified_en;

            // parse each item to find name, score & level
            $('.' + item).each(function(index) {
              const nameCertified = $(this).find('h2').text().trim(),
                tempCertified = $(this).find('h3').text().replace(/\s/g, '').split('points')[0].split('-'),
                levelCertified = tempCertified[0].toLowerCase(),
                scoreCertified = tempCertified[1];

              countCertified = index++;

              switch (levelCertified) {
              case level0_fr:
                levelCertified_en = level0_en;
                break;
              case level1_fr:
                levelCertified_en = level1_en;
                break;
              case level2_fr:
                levelCertified_en = level2_en;
                break;
              case level3_fr:
                levelCertified_en = level3_en;
                break;
              case level4_fr:
                levelCertified_en = level4_en;
                break;
              }

              arrLevel.push(levelCertified_en);

              arrCertified.push({
                'name': nameCertified,
                'score': scoreCertified,
                'level': levelCertified_en,
              });

              // update data json
              jsonData[j]['certified'] = arrCertified;
              let data = JSON.stringify(jsonData, null, 2);
              fs.writeFileSync(path, data);
            });

            for (var k = 0; k < arrLevel.length; k++) {
              switch (arrLevel[k]) {
              case level0_en:
                countLevel0++;
                break;
              case level1_en:
                countLevel1++;
                break;
              case level2_en:
                countLevel2++;
                break;
              case level3_en:
                countLevel3++;
                break;
              case level4_en:
                countLevel4++;
                break;
              }
            }

            // update data json
            jsonData[j]['stats'] = {
              'total': countCertified + 1,
              level0: countLevel0,
              level1: countLevel1,
              level2: countLevel2,
              level3: countLevel3,
              level4: countLevel4,
            };
            let data = JSON.stringify(jsonData, null, 2);
            fs.writeFileSync(path, data);

          }).on('error', (err) => {
            console.log(colors.red('Error : ') + err.message);
          });
        });
      }

      https.get(host, (resp) => {
        let dataHost = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          dataHost += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {

          console.log(colors.cyan('Request : ') + host);

          const $ = cheerio.load(dataHost),
            count = $(number).text().replace(/\s/g, ''),
            timestamp = moment().format('MMMM Do, YYYY');

          jsonData.push({
            'count': count,
            'timestamp': timestamp,
          });
          let data = JSON.stringify(jsonData, null, 2);
          fs.writeFileSync(path, data);

        });
      }).on('error', (err) => {
        console.log(colors.red('Error : ') + err.message);
      });

    });

  }).on('error', (err) => {
    console.log(colors.red('Error : ') + err.message);
  });

  // dashboard
  const app = express();
  app.use(express.static(__dirname));
  app.listen(3000);
  console.log(colors.cyan('Running : ') + 'http://localhost:3000/');

}


// define complex tasks
const js = gulp.series(jsLint, jsBuild);
const assets = gulp.parallel(css, js);
const build = gulp.series(assets, dashboard);


// export tasks
exports.css = css;
exports.js = js;
exports.jsLint = jsLint;
exports.build = build;
exports.default = build;