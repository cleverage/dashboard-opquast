/*
 * dashboard Opquast
 * https://github.com/okeul/dashboard-opquast
 *
 * main.js
 * - load build data json
 * - generate sexy tables
 * - generate sexy charts
 * - generate dashboard
 *
 * Copyright (c) 2019 Olivier Keul
 * Licensed under the MIT license.
 */


'use strict';

import Mustache from 'mustache';
import Highcharts from 'highcharts';
 
// Load modules
import Data from 'highcharts/modules/data';
import Exporting from 'highcharts/modules/exporting';
// Initialize modules
Data(Highcharts);
Exporting(Highcharts);


// load data json
let json = 'report/data.json';
fetch(json)
  .then(res => res.json())
  .then((data) => {

    // display number of certifieds
    let tplCount = document.getElementById('tpl-count').innerHTML ;
    let dataCount = Mustache.to_html(tplCount, data.slice(-1)[0]);
    document.getElementById('desc').insertAdjacentHTML('beforeend', dataCount);

    data.pop();

    for (let i in data) {

      // insert option
      let option = '<option value="res-' + data[i].id + '">' + data[i].partner + ' - ' + data[i].stats.total + ' certifieds' + '</option>';
      document.getElementById('foo').insertAdjacentHTML('beforeend', option);

      // convert data json into a sexy HTML table
      let tplRes = document.getElementById('tpl-res').innerHTML ;
      let dataRes = Mustache.to_html(tplRes, data[i]);
      document.getElementById('main').insertAdjacentHTML('beforeend', dataRes);

      // convert sexy HTML table into a sexy HTML chart
      Highcharts.chart('chart-' + data[i].id, {
        data: {
          table: 'data-' + data[i].id,
        },
        plotOptions: {
          pie: {
            colors: [
              '#C2973E',
              '#667d18',
              '#127eb1',
              '#666666',
              '#313036',
              '#c74817',
            ],
            dataLabels: {
              enabled: true,
              formatter: function() {
                if (this.y != 0) {
                  return (this.percentage.toFixed(1) + ' %' + '<br />' + this.key);
                } else {
                  return null;
                }
              },
            },
          },
        },
        chart: {
          type: 'pie',
        },
        title: {
          text: '',
        },
      });
    }
  })
  .catch(err => { throw err });



document.addEventListener('DOMContentLoaded', function() {

  /*****************/
  /* validate form */
  /*****************/

  // insert form
  let form = '<form id="form"><div class="field"><label for="foo" class="label">Select a partner agency:</label><select id="foo" class="select"><option value="">-</option></select></div><button class="btn btn--primary" type="submit">Submit</button></form>';
  document.getElementById('main').insertAdjacentHTML('beforeend', form);

  // submit handler
  document.querySelector('#form').addEventListener('submit', function(e) {

    e.preventDefault(); //stop form from submitting

    let select = document.getElementById('foo'),
      option = select.options[select.selectedIndex].value,
      results = document.getElementById('main').getElementsByClassName('results');

    Array.prototype.forEach.call(results, function(e) {
      if (!e.classList.contains('hide')) {
        e.classList.add('hide');
      }
    });

    if (option !== null && option !== '') {
      document.getElementById(option).classList.remove('hide');

      /****************/
      /* toggle table */
      /****************/
      var btnToggle = document.getElementById(option).querySelector('.toggle');
      btnToggle.onclick = function () {
        let content = document.getElementById(this.getAttribute('aria-controls')),
          attrExpanded = 'aria-expanded',
          attrHidden = 'aria-hidden',
          labelMore = this.getAttribute('data-label--more'),
          labelLess = this.getAttribute('data-label--less'),
          bExpand = this.getAttribute(attrExpanded);

        if (bExpand == 'false') {
          content.setAttribute(attrHidden, 'false');
          this.innerHTML = labelLess;
          this.setAttribute(attrExpanded, 'true');
        } else if (bExpand == 'true') {
          content.setAttribute(attrHidden, 'true');
          this.innerHTML = labelMore;
          this.setAttribute(attrExpanded, 'false');
        }
      };

    }

  });

});