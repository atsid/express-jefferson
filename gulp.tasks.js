const gulp = require('gulp');
const mocha = require('gulp-mocha');
const babel = require('gulp-babel');
const changed = require('gulp-changed');
const runSequence = require('run-sequence');
const istanbul = require('gulp-istanbul');
const eslint = require('gulp-eslint');
const isparta = require('isparta');
const del = require('del');
require('gulp-semver-tasks')(gulp);

let MOCHA_REPORTER = 'nyan';
const paths = {
    source: ['src/**/*.js', '!src/**/*.test.js'],
    staticAssets: ['package.json', 'LICENSE', 'README.md', '.npmignore'],
    dest: './dist',
    main: 'src/index.js',
    test: 'src/**/*.test.js',
    testhelpers: 'test/**/*.js',
    build: {
        main: 'Gulpfile.js',
        tasks: 'gulp.tasks.js',
    },
};
const SRC_STATIC_CHECK_GLOB = paths.source.concat([
        paths.main,
        paths.build.main,
        paths.build.tasks,
    ]);
const TEST_STATIC_CHECK_GLOB = [
        paths.test,
        paths.testhelpers,
    ];

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
gulp.task('lint', ['lint-source', 'lint-test']);
gulp.task('lint-source', () => {
    return gulp.src(SRC_STATIC_CHECK_GLOB)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});
gulp.task('lint-test', () => {
    return gulp.src(TEST_STATIC_CHECK_GLOB)
        .pipe(eslint({
            rules: {
                'no-unused-expressions': 0,
            },
            globals: {
                'describe': true,
                'it': true,
            },
        }))
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});


/**
 * Testing Tasks
 */
gulp.task('test', () => {
    return new Promise((resolve, reject) => {
        gulp.src(paths.source)
            .pipe(istanbul({
                instrumenter: isparta.Instrumenter,
                includeUntested: true,
            }))
            .pipe(istanbul.hookRequire())
            .on('finish', () => {
                gulp.src(paths.test)
                    .pipe(mocha({reporter: MOCHA_REPORTER}))
                    .pipe(istanbul.writeReports({
                        reporters: ['lcov', 'text-summary'],
                    }))
                    .on('end', resolve);
            })
            .on('error', (err) => { reject(err); });
    });
});

/**
 * Clean
 */
gulp.task('clean', () => {
    return del(['jefferson.js', 'proxies', 'domain']);
});

gulp.task('static-assets', () => {
    return gulp.src(paths.staticAssets)
        .pipe(gulp.dest(paths.dest));
});

/**
 * Meta/Control Tasks
 */
gulp.task('build', (cb) => {
    runSequence(
        ['lint', 'babel', 'static-assets'],
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
