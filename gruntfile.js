"use strict";

module.exports = function(grunt) {

  // Load grunt tasks
  require('load-grunt-tasks')(grunt);

  // Grunt configuration
  grunt.initConfig({
    copy: {
      main: {
        expand: true,
        cwd: 'src/css/fonts/',
        src: '**',
        dest: 'dist/css/fonts/'
      }
    },
    bowercopy: {
      options: {
        srcPrefix: 'bower_components'
      },
      css: {
        options: {
          destPrefix: 'src/css/lib'
        },
        files: {
          'normalize.css': 'normalize-css/normalize.css',
          'font-awesome.css': 'font-awesome/css/font-awesome.min.css',
          '../fonts': 'font-awesome/fonts'
        }
      },
      js: {
        options: {
          destPrefix: 'src/js/lib'
        },
        files: {
          'async.js': 'requirejs-plugins/src/async.js',
          'knockout.js': 'knockout/dist/knockout.js',
          'require.js': 'requirejs/require.js',
          'jquery.js': 'jquery/dist/jquery.js',
          'underscore.js': 'underscore/underscore.js'
        }
      }
    },
    htmlmin: {
      target: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['**/*.html'],
            dest: 'dist/',
            ext: '.html'
          }
        ]
      }
    },
    cssmin: {
      options: {
        roundingPrecision: 2
      },
      target: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['**/*.css'],
            dest: 'dist/',
            ext: '.css'
          }
        ]
      }
    },
    uglify: {
      options: {
        mangle: true
      },
      target: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['**/*.js'],
            dest: 'dist/',
            ext: '.js'
          }
        ]
      }
    }
  });

  // Register default tasks
  grunt.registerTask('default', ['copy','bowercopy','newer:htmlmin','newer:cssmin','newer:uglify']);
};
