# Opquast dashboard

List and statistics of certifieds by partners agencies Opquast.

**Demo:** [http://cleverage.github.io/dashboard-opquast](http://cleverage.github.io/dashboard-opquast)

![Alt](/src/img/ca.png)

## How it works ?

1. Get content of this url: [https://directory.opquast.com](https://directory.opquast.com)
2. In this content, identify the URL of the certification pages for each partner agency (example: [https://directory.opquast.com/fr/clever-age/certifications/](https://directory.opquast.com/fr/clever-age/certifications/)
3. Get content of each partner's certification pages
4. In this content, identify for each certified its name, level and points
5. Store all this information in a JSON file
6. From this JSON file create sexy data tables
7. From this data tables create sexy charts

## List of task

* build-css task : compile Sass to CSS, concatenation and minify CSS
* build-js task : concatenation and minify JS
* dashboard task : running dashboard with sexy data tables and sexy charts

## License

MIT © [Clever Age](https://github.com/cleverage/)

<hr />

Opquast means Open Quality Standards. The project has been launched in 2004. The goal of the projet is to improve the quality of the Web by writing and publishing simple, checkable, realistic, universal and transversal checklists. The main publication is [the Opquast Web quality checklist](https://www.opquast.com/opquast-web-quality-checklist/).

Dashboard made with ❤ by Clever Age.

