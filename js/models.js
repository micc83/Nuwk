var finder = require('./path_finder.js');

/**
    * Config object
    *
    * Edit the following lines to your needs
    * 
    * @type {Object}
    */
var config = {

    // node-webkit path
    nwPath : finder.findNodeWebkit(),

    // Application path inside project folder
    appPath : '/App',

    // Build path inside project folder
    buildPath : '/Build',

    // Resources path inside project folder
    resourcesPath : '/Resources',

    // Default editor
    editor : '/Applications/Sublime Text 2.app'

};

/**
    * Project
    *
    * Do not edit this... Allright?
    *
    * @type {Object}
    */
var project = {
    name		: '',
    path		: '',
    version     : '',
    getAppPath: function () {
        return project.path + config.appPath;
    },
    getBuildPath: function () {
        return project.path + config.buildPath;
    },
    getPackageFile: function () {
        return project.getAppPath() + '/package.json';
    },
    getBuildFile: function () {
        return project.getBuildPath() + '/' + project.name +
            ' ' + project.version + '.app';
    },
    getResourcesPath: function () {
        return project.path + config.resourcesPath;
    }
}

module.exports = {
    config: config,
    project: project
};

