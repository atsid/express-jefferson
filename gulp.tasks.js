'use strict';
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    mocha = require('gulp-mocha'),
    babel = require('gulp-babel'),
    changed = require('gulp-changed'),
    runSequence = require('run-sequence'),
    paths = {
        source: 'src/**/*.js',
        dest: 'lib/',
        main: 'index.js',
        test: 'test/**/*.test.js',
        build: {
            main: 'Gulpfile.js',
            tasks: 'gulp.tasks.js'
        }
    },
    STATIC_CHECK_GLOB = [
        paths.main,
        paths.source,
        paths.test,
        paths.build.main,
        paths.build.tasks
    ];

/**
 * Transpiling Tasks
 */
gulp.task('babel', () => {
    let BABEL_SRC = paths.source,
        BABEL_DEST = paths.dest;
    return gulp.src(BABEL_SRC)
        .pipe(changed(BABEL_DEST))
        .pipe(babel())
        .pipe(gulp.dest(BABEL_DEST));
});

/**
 * Static Analysis Tasks
 */
gulp.task('lint', () => {
    return gulp.src(STATIC_CHECK_GLOB)
        .pipe(jshint({lookup: true}))
        .pipe(jshint.reporter('default'));
});
gulp.task('jscs', () => {
    return gulp.src(STATIC_CHECK_GLOB)
        .pipe(jscs({
            configPath: '.jscrc'
        }));
});
gulp.task('static-analysis', [
    'lint',
    'jscs'
]);

/**
 * Testing Tasks
 */
gulp.task('test', () => {
    return gulp.src(paths.test)
        .pipe(mocha({reporter: 'nyan'}));
});

/**
 * Meta/Control Tasks
 */
gulp.task('build', (cb) => {
    runSequence(
        ['static-analysis', 'babel'],
        'test',
        cb
    );
});
gulp.task('default', ['build']);
