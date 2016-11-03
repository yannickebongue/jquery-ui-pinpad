/**
 * Created by yannick.ebongue on 20/10/2016.
 */

module.exports = function (grunt) {

    "use strict";

    var pkg = grunt.file.readJSON("package.json");

    grunt.initConfig({

        pkg: pkg,

        clean: ["dist/"],

        copy: {
            build: {
                options: {
                    process: function (content, srcpath) {
                        return content.replace(/@VERSION/g, pkg.version);
                    }
                },
                files: [
                    {
                        expand: true,
                        cwd: "src/",
                        src: ["**"],
                        dest: "dist/"
                    }
                ]
            }
        },

        uglify: {
            options: {
                banner: "/*! <%=pkg.name %> | <%= pkg.version %> | <%= grunt.template.today('yyyy-mm-dd') %> */\n"
            },
            build: {
                files: {
                    "dist/js/<%= pkg.name %>.min.js": "dist/js/<%= pkg.name %>.js"
                }
            }
        },

        cssmin: {
            build: {
                src: "dist/css/*.css",
                dest: "dist/css/<%= pkg.name %>.min.css"
            }
        },

        jquerymanifest: {
            options: {
                source: pkg,
                overrides: {
                    name: "ui.pinpad",
                    title: pkg.title
                }
            }
        }

    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-jquerymanifest");

    grunt.registerTask("default", ["clean", "copy", "uglify", "cssmin", "jquerymanifest"]);

};