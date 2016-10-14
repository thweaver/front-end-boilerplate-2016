/*==============================================================================
Gulp
==============================================================================*/

var gulp = require( 'gulp' ),
	gulpLoadPlugins = require( 'gulp-load-plugins' ),
	p = gulpLoadPlugins(),
	dest = 'build/';

function handleError( err ) {
	console.log( err.toString() );
	this.emit( 'end' );
}

/*==============================================================================
Clean
==============================================================================*/

gulp.task( 'clean', function() {
	gulp.src( [ dest + 'css', dest + 'js', dest + 'img', dest + 'fnt', dest + 'vid' ], { 
			read: false
		})
		.pipe( p.rimraf() );
});

/*==============================================================================
Styles
==============================================================================*/

gulp.task( 'styles-wp', function() {
	return gulp.src( 'src/scss/wp-*.scss' )
		.pipe( p.sass({outputStyle: 'compressed'}).on('error', p.sass.logError))
		.pipe( p.autoprefixer() )
		.pipe( gulp.dest( dest + 'css' ) );
});

gulp.task( 'styles', [ 'styles-wp' ], function() {
	return gulp.src( 'src/scss/imports.scss' )
		.pipe( p.sass({outputStyle: 'expanded'}).on('error', p.sass.logError))
		.pipe( p.rename( 'main.css' ) )
		.pipe( gulp.dest( dest + 'css' ) )
		.pipe( p.autoprefixer() )
		.pipe( p.cssnano({
			advanced: false,
			minifyGradients: false,
			zindex: false
		}))
		.pipe( p.rename( 'main.min.css' ) )
		.pipe( gulp.dest( dest + 'css' ) );
});

/*==============================================================================
Scripts
==============================================================================*/

gulp.task( 'scripts1', function() {
	return gulp.src( [ 'src/js/*.js', '!src/js/imports.js',] )
		.pipe( p.jshint() )
		.pipe( p.jshint.reporter( 'default') );
});

gulp.task( 'scripts2', [ 'scripts1' ], function() {
	return gulp.src( 'src/js/lib/imports.js' )
		.pipe( p.imports() )
		.pipe( p.uglify() )
		.pipe( p.rename( 'imports.lib.min.js' ) )
		.pipe( gulp.dest( 'temp' ) );
});

gulp.task( 'scripts3', [ 'scripts2' ], function() {
	return gulp.src( 'src/js/imports.js' )
		.pipe( p.imports() )
		.pipe( p.uglify() )
		.on( 'error', handleError )
		.pipe( p.rename( 'imports.min.js' ) )
		.pipe( gulp.dest( 'temp' ) );
});

gulp.task( 'scripts4', [ 'scripts3' ], function() {
	return gulp.src( [ 'temp/imports.lib.min.js', 'temp/imports.min.js' ] )
		.pipe( p.concat( 'main.min.js') )
		.pipe( gulp.dest( dest + 'js' ) );
});

gulp.task( 'scripts5', [ 'scripts4' ], function() {
	return gulp.src( 'temp', {
			read: false
		})
		.pipe( p.rimraf() );
});

gulp.task( 'scripts', [ 'scripts5' ], function() {
	return gulp.src( 'src/js/lib/modernizr.min.js' )
		.pipe( gulp.dest( dest + 'js' ) );
});

/*==============================================================================
Images
==============================================================================*/

gulp.task( 'images', function() {
	gulp.src( 'src/img/**/*' )
		.pipe( p.changed( dest + 'img' ) )
		.pipe( p.imagemin( {
			optimizationLevel: 3,
			progressive: true,
			interlaced: true,
			svgoPlugins: [
				{ mergePaths: false },
				{ cleanupIDs: false }
			]
		} ) )
		.pipe( gulp.dest( dest + 'img' ) );
});

/*==============================================================================
Fonts
==============================================================================*/

gulp.task( 'fonts', function() {
	gulp.src('src/fnt/**/*' )
		.pipe( gulp.dest( dest + 'fnt' ) );
});

/*==============================================================================
Videos
==============================================================================*/

gulp.task( 'videos', function() {
	gulp.src('src/vid/**/*' )
		.pipe( gulp.dest( dest + 'vid' ) );
});

/*==============================================================================
Watch
==============================================================================*/

gulp.task('watch', function() {
	gulp.watch( 'src/scss/**/*', [ 'styles' ] );
	gulp.watch( 'src/js/**/*.js', [ 'scripts' ] );
	gulp.watch( 'src/img/**/*', [ 'images' ] );
	gulp.watch( 'src/fnt/**/*', [ 'fonts' ] );
	gulp.watch( 'src/vid/**/*', [ 'videos' ] );
});

/*==============================================================================
Default
==============================================================================*/

gulp.task( 'default', [ 'styles', 'scripts', 'images', 'fonts', 'videos' ], function() {
	gulp.start( 'watch' );
});