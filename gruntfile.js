"use strict";

module.exports = function(grunt) {

  // Load grunt tasks
  require('load-grunt-tasks')(grunt);

  // Grunt configuration
  grunt.initConfig({
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

  // Load NPM tasks
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-responsive-images');

  // Register default tasks
  grunt.registerTask('default', ['newer:htmlmin','newer:cssmin','newer:uglify','newer:imagemin','newer:responsive_images']);
};
