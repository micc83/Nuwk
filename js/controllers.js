// Check if node-webkit is on its place
function checkNodeWebkit (callback_error) {
	var fs = require('fs');
	fs.stat(config.nwPath, function (err) {
		if (err !== null) {
			callback_error();
		}
	});
}

// Folder dialog function
function folderDialog(dialog) {
	var callback;
	this.chooser = $(dialog);
	this.chooser.change(function(el) {
		callback($(this).val());
	});
	this.open = function (mycallback) {
		this.chooser.val('');
		this.chooser.trigger('click');
		callback = mycallback;
	};
}

// Make an area droppable
function makeDroppable( holder_id, callback ) {
	var holder = document.getElementById(holder_id);
	window.ondragover = function(e) {
		holder.className = 'hover';
		e.preventDefault();
		return false;
	};
	window.ondrop = function(e) {
		holder.className = '';
		e.preventDefault();
		return false;
	};
	window.ondragleave = function () {
		holder.className = '';
		return false;
	};
	holder.ondrop = function (e) {
		this.className = '';
		e.preventDefault();

		for (var i = 0; i < e.dataTransfer.files.length; ++i) {
			// Return the path
			callback(e.dataTransfer.files[i].path);
		}
		return false;
	};
}

// Create new project
function createNewProject( callback_ok, callback_error ) {

	var fs = require('fs');

	fs.stat(project.path, function (err, stats) {

		if (err === null) {
			// Folder exist
			callback_error('Project folder already exist!');
		} else {

			// Folder doesn't exist, create it
			fs.mkdir(project.path,'0777', function() {

				// Create app folder
				fs.mkdir(project.getAppPath());

				// Create build folder
				fs.mkdir(project.getBuildPath());

				// Create resources folder
				fs.mkdir(project.getResourcesPath());

				// Move files to app folder
				var ncp = require('ncp').ncp;

				// Copy resources recursively
				ncp(process.cwd() + '/Resources', project.getResourcesPath());

				// Copy App files recursively
				ncp(process.cwd() + '/default', project.getAppPath(), function() {

					// Create the package.json file
					var package_config = {
						"name": project.name,
						"main": "index.html",
						"version": "1.0.0",
						"window": {
							"title": "node-webkit demo",
							"toolbar": true,
							"frame": true,
							"width": 600,
							"height": 560,
							"position": "mouse",
							"resizable": false
						}
					};

					fs.writeFile(project.getPackageFile(), JSON.stringify(package_config, null, 4), function(err) {
						if(err) {
							// Callback
							callback_error(err);
						} else {
							// Callback
							callback_ok();
						}
					});
					
				});

			});

		}

	});
}

// Open project
function loadProject ( path, callback_ok, callback_error ) {

	// Load project data from package.json
	var fs = require('fs');

	// Set project path removing trailing slash
	project.path = path.replace(/\/$/, "");

	// Store path
	localStorage.fav_path = project.path;

	// Read the package file
	fs.readFile(project.getPackageFile(), {encoding: 'utf-8'}, function (err, data) {

		// Check for errors
		if (err) {
			callback_error(err);
			return false;
		}
		
		// Parse the json file
		try {
			data = JSON.parse(data);
		} catch (e) {
			callback_error('Invalid package.json file');
			return false;
		}

		// Get project name 
		project.name = data.name;
		
		// Get version
		project.version = data.version;

		// Run UI script
		callback_ok();

		console.log(project);

	});
	
}

// Build project
function buildProject (callback_ok, callback_error, compress_app) {

	var fs = require('fs'),
		ncp = require('ncp').ncp,
		rimraf = require('rimraf');

	// Delete old build if present
	rimraf(project.getBuildFile(), function(){

		show_toolbar(false);

		// Ncp node-webkit to build folder
		ncp(config.nwPath, project.getBuildFile(), function(err) {

			if (err){
				callback_error(err);
				return;
			}

			// Don't do anything with ressource if the directory don't exists
			fs.exists(project.getResourcesPath(), function(val, err) {
				if (!val) {
					return;
				}

				if (err) {
					callback_error(err);
					return;
				}


				// Replace appname.app/Contents/Info.plist file with the one in Resources
				fs.readFile(project.getResourcesPath() + '/Info.plist', 'utf8', function (err, data) {
					data = data.replace(/\{\{name\}\}/g, project.name);
					data = data.replace(/\{\{version\}\}/g, project.version);
					fs.writeFile(project.getBuildFile() + '/Contents/Info.plist', data, 'utf8');
				});

				// Replace appname.app/Contents/Resources/nw.icns with the one in Resources
				fs.createReadStream(project.getResourcesPath() + '/nw.icns')
				.pipe(fs.createWriteStream(project.getBuildFile() + '/Contents/Resources/nw.icns'));
			});

			// If compress_app compress the App folder to appname.app/Resources/
			if (compress_app){

				var zipdir = require('zip-dir');
				zipdir(project.getAppPath(), project.getBuildFile() + '/Contents/Resources/App.nw', function (err, buffer) {
					if ( err ){
						callback_error(err);
						return;
					}
					callback_ok();
					run_built_app();
				});

			// else ncp App folder to appname.app/Resources/
			} else {

				ncp(project.getAppPath(),project.getBuildFile() + '/Contents/Resources/App.nw',function (err) {
					if ( err ){
						callback_error(err);
						return;
					}
					callback_ok();
					run_built_app();
				});

			}

		});

	});
	
}

// Show toolbar?
function show_toolbar (toolbar, callback) {

	var fs = require('fs');

	fs.readFile(project.getPackageFile(), {encoding: 'utf-8'}, function (err, data) {

		// Parse the json file
		try {
			data = JSON.parse(data);
		} catch (e) {
			return false;
		}

		data.window.toolbar = toolbar;

		fs.writeFile(project.getPackageFile(), JSON.stringify(data), 'utf8', callback);

	});
}

// Run build app 
function run_built_app() {

	var spawn = require('child_process').spawn;
	spawn('open', [ project.getBuildFile() ]);

}

// Run project
function runProject () {

	show_toolbar(true, function () {
		var spawn = require('child_process').spawn;
		spawn('open', ['-n', '-a', '/Applications/node-webkit.app', project.getAppPath()]);
	});
	
}

// Edit project folder
function editProject () {

	var spawn = require('child_process').spawn;
	spawn('open', ['-a', config.editor, project.path]);

}

// Show alerts
function showAlert( type, message ) {

	$('#message-container').children().remove();

	var popup = $('<span/>', {
		'class' : 'alert ' + type,
		'html'  : message
	}).hide().appendTo('#message-container').fadeIn(300);

	setTimeout(function() {
		popup.fadeOut(200);
	}, 5000);
	
}

function openFinder (path){

	var spawn = require('child_process').spawn;
	spawn('open', [ path ]);

}
