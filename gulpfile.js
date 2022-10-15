const minify = require('gulp-minify');
const {series, parallel} = require('gulp');
const gulp = require('gulp');
var concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');


function build(cb) {
    gulp.src(['src/colorCalculator.js', 'src/shapesBuilder.js', 'src/workarea.js',
        'src/hotkeys.js', 'src/menu.js', 'src/grid.js', 'src/propertyPanel.js',
        'src/main.js', 'src/shapeEvents.js', 'src/tftCodeArea.js'])
        .pipe(concat('app.js'))
        .pipe(minify())
        .pipe(gulp.dest('dist'))
    cb();
}

function minifyCss(cb) {
   gulp.src('src/*.css')
       .pipe(concat('styles.css'))
       .pipe(cleanCSS({
           
       }))
       .pipe(gulp.dest('dist'))
    cb();
}

exports.default = series(parallel(
    build, minifyCss
));