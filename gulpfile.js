/*
 * dashboard opquast
 * https://github.com/cleverage/dashboard-opquast
 *
 * gulpfile.js
 * - build-css : compile Sass to CSS, concatenation and minify CSS
 * - build-js : concatenation and minify JS
 * - dashboard : running dashboard with sexy data tables and sexy charts
 *
 * Copyright (c) 2019 Olivier Keul
 * Licensed under the MIT license.
 */


'use strict';


// gulp plugins
const autoprefixer = require('gulp-autoprefixer'),
			cheerio = require('cheerio'),
			colors = require('colors'),
			concat = require('gulp-concat'),
			cssmin = require('gulp-cssnano'),
			express = require('express'),
			fs = require('fs'),
	    gulp = require('gulp-help')(require('gulp')),
	    https = require('https'),
	    sass = require('gulp-sass'),
	    uglify = require('gulp-uglify-es').default;


gulp.task('build-css', 'Compile Sass to CSS and concat + minify CSS', function() {
  return gulp.src('src/**/*.scss')
    .pipe(sass().on('error', sass.logError)) 
    .pipe(autoprefixer())
    .pipe(cssmin())
    .pipe(concat('main.css'))
    .pipe(gulp.dest('report/assets'));
})


gulp.task('build-js', 'Concat + minify JS', function() {
  return gulp.src([
	  'src/js/lib/mustache.js',
	  'src/js/lib/highcharts.js',
	  'src/js/lib/data.js',
	  'src/js/lib/exporting.js',
	  'src/js/lib/export-data.js',
	  'src/js/main.js'
		])
  	.pipe(uglify())
    .pipe(concat('main.js'))
    .pipe(gulp.dest('report/assets'));
});


// dashboard launch with sexy tables and sexy charts
gulp.task('dashboard', 'Running dashboard', function() {

	// variables
	const host = 'https://directory.opquast.com',
				urlIndex = host + '/fr/agences/',
				folder = 'report',
				name = '/data',
				link = 'a[class=\'pictoUser pl1 pr1\']',
				item = 'cartouche-large',
				path = folder + name + '.json',
				none = '0 certifié',
				level0_fr = 'novice',
				level1_fr = 'intermédiaire',
				level2_fr = 'confirmé',
				level3_fr = 'avancé',
				level4_fr = 'expert',
				level0_en = 'Beginner',
				level1_en = 'Intermediate',
				level2_en = 'Experienced',
				level3_en = 'Advanced',
				level4_en = 'Expert';

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
			$(link).each(function () {
				if($(this).text() !== none) {
					arrLinks.push($(this));
				}
	    });

	    for(let i in arrLinks) {
	    	const urlPartner = arrLinks[i].attr('href'),
	    				namePartner = arrLinks[i].parent().siblings('h2').text(),
	    				idPartner = namePartner.toLowerCase().replace(/\s/g, '');
		    	
	    	// update data json
	    	jsonData[i] = { 
	    		'partner' : namePartner, 
	    		'url' : host + urlPartner,
	    		'id' : idPartner
	    	};
	    	let data = JSON.stringify(jsonData, null, 2);
				fs.writeFileSync(path, data);
	    }

	    for(let j in jsonData) {

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
	  				$('.' + item).each(function (index, elem) {
	  					const nameCertified = $(this).find('h2').text().trim(),
	  								tempCertified = $(this).find('h3').text().replace(/\s/g,'').split('points')[0].split('-'),
	  								levelCertified = tempCertified[0].toLowerCase(),
	  								scoreCertified = tempCertified[1];

	  					countCertified = index++;

	  					switch (levelCertified) {
							  case level0_fr:
							    levelCertified_en =	level0_en;
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
								'name' : nameCertified, 
								'score' : scoreCertified, 
								'level': levelCertified_en
							});
	  					
	  					// update data json
	  					jsonData[j]['certified'] = arrCertified;
							let data = JSON.stringify(jsonData, null, 2);
							fs.writeFileSync(path, data);
	  				});

						for(var k = 0; k < arrLevel.length; k++){
						  switch (arrLevel[k]) {
							  case	level0_en:
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
							'total' : countCertified+1, 
							level0 : countLevel0, 
							level1 : countLevel1,
							level2 : countLevel2,
							level3 : countLevel3,
							level4 : countLevel4
						};
						let data = JSON.stringify(jsonData, null, 2);
						fs.writeFileSync(path, data);

	  			}).on('error', (err) => {
					  console.log(colors.red('Error : ') + err.message);
					});
				});

	    }

	  });

	}).on('error', (err) => {
	  console.log(colors.red('Error : ') + err.message);
	});

	// dashboard
	const app = express();
	app.use(express.static(__dirname));
	app.listen(3000);
	console.log(colors.cyan('Running : ') + 'http://localhost:3000/');

});


// default task
gulp.task('default', ['build-css', 'build-js', 'dashboard']);

