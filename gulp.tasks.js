"use strict";
var gulp = require("gulp"),
    mocha = require("gulp-mocha"),
    babel = require("gulp-babel"),
    changed = require("gulp-changed"),
    runSequence = require("run-sequence"),
    istanbul = require("gulp-istanbul"),
    eslint = require("gulp-eslint"),
    isparta = require("isparta"),
    del = require("del");
require("gulp-semver-tasks")(gulp);

var MOCHA_REPORTER = "nyan",
    paths = {
        source: ["src/**/*.js", "!src/**/*.test.js"],
        dest: "./",
        main: "src/index.js",
        test: "src/**/*.test.js",
        testhelpers: "test/**/*.js",
        build: {
            main: "Gulpfile.js",
            tasks: "gulp.tasks.js"
        }
    },
    SRC_STATIC_CHECK_GLOB = paths.source.concat([
        paths.main,
        paths.build.main,
        paths.build.tasks
    ]),
    TEST_STATIC_CHECK_GLOB = [
        paths.test,
        paths.testhelpers
    ];

/**
 * Transpiling Tasks
 */
gulp.task("babel", () => {
    return gulp.src(paths.source)
        .pipe(changed(paths.dest))
        .pipe(babel())
        .pipe(gulp.dest(paths.dest));
});

/**
 * Static Analysis Tasks
 */
gulp.task("lint", ["lint-source", "lint-test"]);
gulp.task("lint-source", () => {
    return gulp.src(SRC_STATIC_CHECK_GLOB)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});
gulp.task("lint-test", () => {
    return gulp.src(TEST_STATIC_CHECK_GLOB)
        .pipe(eslint({
            rules: {
                "no-unused-expressions": false
            }
        }))
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});


/**
 * Testing Tasks
 */
gulp.task("test", () => {
    return new Promise((resolve, reject) => {
        gulp.src(paths.source)
            .pipe(istanbul({
                instrumenter: isparta.Instrumenter,
                includeUntested: true
            }))
            .pipe(istanbul.hookRequire())
            .on("finish", () => {
                gulp.src(paths.test)
                    .pipe(mocha({reporter: MOCHA_REPORTER}))
                    .pipe(istanbul.writeReports({
                        reporters: ["lcov", "text-summary"]
                    }))
                    .on("end", resolve);
            })
            .on("error", (err) => { reject(err); });
    });
});

/**
 * Clean
 */
gulp.task("clean", () => {
    return del(["jefferson.js", "proxies", "domain"]);
});

/**
 * Meta/Control Tasks
 */
gulp.task("build", (cb) => {
    runSequence(
        ["lint", "babel"],
        "test",
        cb
    );
});

gulp.task("ci-config", () => {
    MOCHA_REPORTER = "spec";
});

gulp.task("ci-build", (cb) => {
    runSequence(
        "ci-config",
        "build",
        cb
    );
});

gulp.task("release", (cb) => {
    runSequence(
        "clean",
        "build",
        cb
    );
});

gulp.task("default", ["build"]);
