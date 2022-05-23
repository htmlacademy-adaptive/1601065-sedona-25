import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgo';
import svgstore from 'gulp-svgstore';
import del from 'del';



// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso() //
    ]))
    .pipe(rename ( 'style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML
const html = () => {
  return gulp.src ('source/*.html')
  .pipe (htmlmin({ collapseWhitespace: true }))
  .pipe (gulp.dest('build'))
}

// Scripts
const scripts = () => {
  return gulp.src ('source/js/*.js')
  .pipe (terser())
  .pipe (gulp.dest('build/js'))
}

// Images
const optimizeimages = () => {
  return gulp.src ('source/img/**/**(jpg,png)')
  .pipe (squoosh())
  .pipe (gulp.dest('build/img'))
}

const copyimages = () => {
  return gulp.src ('source/img/**/**(jpg,png)')
  .pipe (gulp.dest('build/img'))
}

// Webp
const createWebp = () => {
  return gulp.src ('source/img/webp/**(webp)')
  .pipe (squoosh({
    webp: {}
  }))
  .pipe (gulp.dest('build/img'))
}

//SVG
const svg = () => {
  return gulp.src ('source/img/*.svg')
  .pipe (svgo())
  .pipe (gulp.dest('build/img'))
}

const sprite = () => {
  return gulp.src ('source/img/*.svg')
  .pipe (svgo())
  .pipe (svgstore({
    inlineSvg: true
  }))
  .pipe (rename('sprite.svg'))
  .pipe (gulp.dest('build/img'))
}

//Copy
const copy = (done)  => {
  gulp.src ([
  'source/fonts/**(woff2,woff)',
  'source/*.ico',
  'source/*webmanifest',
], {
    base:'source'
  })
  .pipe (gulp.dest('build'))
  done ();
}

//Clean
const clean = ()  => {
  return del (('build'))
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}


// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/**/script.js', gulp.series(scripts));
  gulp.watch('source/*.html').on('change', browser.reload);
}

//Build
export const build = gulp.series (
  clean,
  copy,
  optimizeimages,
  gulp.parallel (
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp),
    gulp.series(
      server,
      watcher
    ));

 //Default
 export default gulp.series(
   clean,
   copy,
   copyimages,
   gulp.parallel(
     styles,
     html,
     scripts,
     svg,
     sprite,
     createWebp
   ),
 gulp.series(
   server,
   watcher
 ));
