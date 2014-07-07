

var path	= require('path-extra'),
	os		= require('os'),
	fs		= require('fs'),
	_		= require('underscore');

var HOME = path.homedir();

module.exports = path_finder = {

	// Path are priorized. that's to say, first matched got it all.
	//
	// Take care to let the user override the system settings, so that
	// home-wide application are *always* matched before system-wide
	// example:
	//		~/Applications/node-webkit.app should be used before
	//		/Applications/node-webkit.app
	possible_paths: {
		Darwin: {
			app_directories: [
				HOME + '/Applications',
				'/Applications',
			],
			app_name: 'node-webkit.app'
		},
		Linux: {
			app_directories: [
				HOME + '/usr/local/bin',
				HOME + '/usr/bin',
				HOME + '/bin',
				'/usr/local/bin',
				'/usr/bin'
			],
			app_name: 'nw'
		}
	},

	platform_paths: function() {
		// TODO check the existence of the os path
		return path_finder.possible_paths[os.type()];
	},

	findNodeWebkit: function () {
		var paths	= path_finder.platform_paths();
		var res		= _.find(paths.app_directories, function(dir)
		{
			// Use sync here becuase we want the order to be consistent
			return fs.existsSync(path.join(dir, paths.app_name));
		});

		if (res == null)
			return null;
		else
			return path.join(res, paths.app_name);
	}
}
