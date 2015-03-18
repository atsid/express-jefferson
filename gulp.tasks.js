'use strict';
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    mocha = require('gulp-mocha'),
    babel = require('gulp-babel'),
    changed = require('gulp-changed'),
    runSequence = require('run-sequence'),
    istanbul = require('gulp-istanbul'),
    coveralls = require('gulp-coveralls'),
    isparta = require('isparta'),
    del = require('del'),
    MOCHA_REPORTER = 'nyan',
    paths = {
        source: ['src/**/*.js', '!src/**/*.test.js'],
        dest: './',
        main: 'src/index.js',
        test: 'src/**/*.test.js',
        build: {
            main: 'Gulpfile.js',
            tasks: 'gulp.tasks.js'
        }
    },
    STATIC_CHECK_GLOB = paths.source.concat([
        paths.main,
        paths.test,
        paths.build.main,
        paths.build.tasks
    ]);

/**
 * Transpiling Tasks
 */
gulp.task('babel', () => {
    return gulp.src(paths.source)
        .pipe(changed(paths.dest))
        .pipe(babel())
        .pipe(gulp.dest(paths.dest));
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
gulp.task('report-coverage', () => {
    return gulp.src('coverage/**/lcov.info')
        .pipe(coveralls());
});


/**
 * Testing Tasks
 */
gulp.task('test', () => {
    return new Promise((resolve, reject) => {
        gulp.src(paths.source)
            .pipe(istanbul({
                instrumenter: isparta.Instrumenter,
                includeUntested: true
            }))
            .pipe(istanbul.hookRequire())
            .on('finish', () => {
                gulp.src(paths.test)
                    .pipe(mocha({reporter: MOCHA_REPORTER}))
                    .pipe(istanbul.writeReports({
                        reporters: ['lcov', 'text-summary']
                    }))
                    .on('end', resolve);
            });
    });
});

/**
 * Clean
 */
gulp.task('clean', () => {
    return del(['jefferson.js', 'proxies']);
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

gulp.task('ci-config', () => {
    MOCHA_REPORTER = 'spec';
});

gulp.task('ci-build', (cb) => {
    runSequence(
        'ci-config',
        'build',
        'report-coverage',
        cb
    );
});

gulp.task('release', (cb) => {
    runSequence(
        'clean',
        'build',
        cb
    );
});
gulp.task('default', ['build']);
