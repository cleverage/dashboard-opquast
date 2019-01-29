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


// load data json
let json = 'report/data.json';
fetch(json)
  .then(res => res.json())
  .then((data) => {

    for (let i in data) {

      // insert option
      let option = '<option value="res-' + data[i].id + '">' + data[i].partner + '</option>';
      document.getElementById('foo').insertAdjacentHTML('beforeend', option);

      // convert data json into a sexy HTML table
      let template = document.getElementById('template').innerHTML,
          info = Mustache.to_html(template, data[i]);
      document.getElementById('main').insertAdjacentHTML('beforeend', info);

      // convert sexy HTML table into a sexy HTML chart
      Highcharts.chart('chart-' + data[i].id, {
        data: {
          table: 'data-' + data[i].id
        },
        plotOptions: {
          pie: {
            colors: [
              '#C2973E',
              '#667d18',
              '#127eb1',
              '#666666',
              '#313036',
              '#c74817'
            ],
            dataLabels: {
              enabled: true,
              formatter: function() {
                if (this.y != 0) {
                  return (this.percentage.toFixed(1) + ' %' + '<br />Niveau ' + this.key);
                } else {
                  return null;
                }
              }
            }
          }
        },
        chart: {
          type: 'pie'
        },
        title: {
          text: ''
        }
      });
    }
  })
  .catch(err => { throw err });



document.addEventListener('DOMContentLoaded', function() {

  /*****************/
  /* validate form */
  /*****************/

  // insert form
  let form = '<form id="form"><div class="field"><label for="foo" class="label">Choix du partenaire :</label><select id="foo" class="select"><option value="">-</option><option value="all">Voir tous les partenaires</option></select></div><button class="btn btn--primary" type="submit">Envoyer</button></form>',
    bSubmit = false;
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

    if (option === 'all') {
      Array.prototype.forEach.call(results, function(e) {
        e.classList.remove('hide');
      });
    } else if (option) {
      document.getElementById(option).classList.remove('hide');
    }

    /****************/
    /* toggle table */
    /****************/

    if (bSubmit == false) {
      var btn = document.querySelectorAll('.toggle');

      function onClick() {
        'use strict';

        let btn = this,
          content = document.getElementById(btn.getAttribute('aria-controls')),
          attrExpanded = 'aria-expanded',
          attrHidden = 'aria-hidden',
          labelMore = btn.getAttribute('data-label--more'),
          labelLess = btn.getAttribute('data-label--less'),
          bExpand = btn.getAttribute(attrExpanded);

        if (bExpand == 'false') {
          content.setAttribute(attrHidden, 'false');
          btn.innerHTML = labelLess;
          btn.setAttribute(attrExpanded, 'true');
        } else if (bExpand == 'true') {
          content.setAttribute(attrHidden, 'true');
          btn.innerHTML = labelMore;
          btn.setAttribute(attrExpanded, 'false');
        }
      }

      Array.from(btn).forEach(e => {
        e.addEventListener('click', onClick);
      });

      bSubmit = true;
    }

  });

});