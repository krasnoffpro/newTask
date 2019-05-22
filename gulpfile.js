'use strict';

var gulp         = require('gulp'),
	sass         = require('gulp-sass'),
	concat       = require('gulp-concat'),
	uglify       = require('gulp-uglify'),
	cssnano      = require('gulp-cssnano'),
	browserSync  = require('browser-sync'),
	autoprefixer = require('gulp-autoprefixer'),
	gcmq         = require('gulp-group-css-media-queries'),
	watch        = require('gulp-watch'),
	cache        = require('gulp-cache'),
	imagemin     = require('gulp-imagemin'),
	pngquant     = require('imagemin-pngquant'),
	imageminJpegRecompress = require('imagemin-jpeg-recompress');


/* Слежение */

gulp.task('browser-sync',function(){
	browserSync.init({
		server: {
			baseDir: './'
		},
		notify: false
	});
});

gulp.task('watch', function(){
	watch('./scss/*.scss', gulp.parallel('sass')).on('end',browserSync.reload);
	watch('./**/*.html', browserSync.reload);
	watch('./**/*.php', browserSync.reload);
	watch('./**/*.tpl', browserSync.reload);
	watch('./js/**/*.js', browserSync.reload);
});

gulp.task('default', gulp.parallel('watch', 'browser-sync'));


/* Обработка css/scss кода */

gulp.task('sass', function(){
	return gulp.src('./scss/style.scss')
	.pipe(sass().on('error',sass.logError))
	.pipe(gcmq())
	.pipe(autoprefixer(['last 5 versions', '> 1%'], {cascade: true}))
	.pipe(cssnano())
	.pipe(gulp.dest('./css'))
	.pipe(browserSync.reload({stream: true}));
});


/* Сжатие изображений */

gulp.task('imgmin', function() {
	return gulp.src('./images/**/*.{jpg,jpeg,png,gif}')
	.pipe(cache(imagemin([
		imagemin.gifsicle({interlaced: true}),
		imagemin.jpegtran({progressive: true}),
		imageminJpegRecompress({
			loops: 5,
			min: 70,
			max: 75,
			quality:'medium'
		}),
		imagemin.svgo(),
		imagemin.optipng({optimizationLevel: 3}),
		pngquant({quality: [0.7, 0.75], speed: 5})
	],{
		verbose: true
	})))
	.pipe(gulp.dest('./imagecompressor'));
});

gulp.task('clear', function (done) {
	return cache.clearAll(done);
});


/* Сборка библиотек */

gulp.task('compress-css', function () {
	gulp.src([
		'./app/bower/normalize.css/normalize.css',
		'./app/bower/bootstrap-css-only/css/bootstrap.min.css',
		'./app/bower/bootstrap-css-only/css/bootstrap-grid.min.css',
		'./app/bower/fancybox/dist/jquery.fancybox.min.css',
		'./app/bower/flickity/dist/flickity.css',
	])
	.pipe(concat('libs.min.css'))
	.pipe(cssnano())
	.pipe(gulp.dest('./css'));
});

gulp.task('compress-js', function () {
	gulp.src([
		'./app/bower/jquery.maskedinput/dist/jquery.maskedinput.js',
		'./app/bower/fancybox/dist/jquery.fancybox.min.js',
		'./app/bower/flickity/dist/flickity.pkgd.js'
	])
	.pipe(concat('libs.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('./js'));
});

gulp.task('build', gulp.series('compress-css','compress-js'), function(){
	console.log('Собрано.');
});