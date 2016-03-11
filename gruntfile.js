"use strict";

module.exports = function(grunt) {

  // Load grunt tasks
  require('load-grunt-tasks')(grunt);

  // Grunt configuration
  grunt.initConfig({
    bowercopy: {
      options: {
        srcPrefix: 'bower_components'
      },
      css: {
        options: {
          destPrefix: 'src/css/lib'
        },
        files: {
          'normalize.css': 'normalize-css/normalize.css'
        }
      },
      js: {
        options: {
          destPrefix: 'src/js/lib'
        },
        files: {
          'knockout.js': 'knockout/dist/knockout.js',
          'require.js': 'requirejs/require.js',
          'jquery.js': 'jquery/dist/jquery.js',
          'underscore.js': 'underscore/underscore.js'
        }
      }
    },
    imagemin: {
      png: {
        options: {
          optimizationLevel: 7
        },
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['**/*.png'],
            dest: 'dist/',
            ext: '.png'
          }
        ]
      },
      jpg: {
        options: {
          progressive: true
        },
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['**/*.jpg'],
            dest: 'dist/',
            ext: '.jpg'
          }
        ]
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
  grunt.registerTask('default', ['bowercopy','newer:htmlmin','newer:cssmin','newer:uglify','newer:imagemin','newer:responsive_images']);
};
