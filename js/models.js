/**
 * Config object
 *
 * Edit the following lines to your needs
 * 
 * @type {Object}
 */
var config = {

	// node-webkit path
	nwPath : '/Applications/node-webkit.app',

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
		return this.path + config.appPath;
	},
	getBuildPath: function () {
		return this.path + config.buildPath;
	},
	getPackageFile: function () {
		return this.getAppPath() + '/package.json';
	},
	getBuildFile: function () {
		return this.getBuildPath() + '/' + this.name + ' ' + this.version + '.app';
	},
	getResourcesPath: function () {
		return this.path + config.resourcesPath;
	}
};