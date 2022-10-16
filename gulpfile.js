const {src, dest, series, watch} = require('gulp');
const del = require('del');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const fileinclude = require('gulp-file-include');
const imagemin = require('gulp-imagemin');
const ghPages = require('gulp-gh-pages');

function clean() {
  return del(['build/*'])
}

function watching() {
  browserSync.init({
        server: {
            baseDir: "build/"
        }
    });
    watch(['./src/sass/**/*.sass'], styles);
    watch(['./src/html/**/*.html'], html);
    watch(['./src/img/**/*'], img);
    watch(['./src/resources/**'], resources);
}

function html() {
  return src('./src/html/*.html')
    .pipe(fileinclude({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(dest('./build'))
    .pipe(browserSync.stream());
}

function styles() {
  return src('./src/sass/style.+(sass|scss)', { sourcemaps: true })
    .pipe(sass())
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 version'],
      grid: true
    }))
    .pipe(dest('./build/css', { sourcemaps: '.' }))
    .pipe(browserSync.stream());
}

function stylesBuild() {
  return src('./src/sass/style.+(sass|scss)')
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 version'],
      grid: true
    }))
    .pipe(dest('./build/css'))
    .pipe(browserSync.stream());
}

function img() {
  return src('./src/img/**/*')
    .pipe(dest('./build/img'))
}

function imgBuild() {
  return src('./src/img/**/*')
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 5
      }),
      imagemin.svgo({
        plugins: [{
            removeViewBox: true
          },
          {
            cleanupIDs: false
          }
        ]
      })
    ]))
    .pipe(dest('./build/img'))
}

function resources() {
  return src('./src/resources/**')
    .pipe(dest('./build'))
}

function deploy() {
  return src('./build/**/*')
  .pipe(ghPages())
}

exports.default = series(clean, html, styles, img, resources, watching);
exports.build = series(clean, html, stylesBuild, imgBuild, resources);
exports.gh = deploy;