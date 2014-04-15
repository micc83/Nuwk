jQuery(document).ready(function($) {

	// Check that node-webkit is there
	checkNodeWebkit(function () {
		$('#screen-main').hide();
		$('#no-node-webkit-screen').show();
		$('#message-container').append('<span class="alert error"><i class="fa fa-info-circle"></i> Cannot find node-webkit in your Applications folder</span>');
	});

	// Download node-webkit button
	$('#download-node-webkit-button').click(function() {
		var gui = require('nw.gui');
		gui.Shell.openExternal('https://github.com/rogerwang/node-webkit');
	});

	// Click on create new project
	$('#new-project-button').click(function() {
		$('.new-project-name').fadeIn(300);
		$('.new-project-name input').focus();
	});

	// Click on close new project
	$('#new-project-button .close-icon').click(function(e) {
		closeProjectName();
		e.stopPropagation();
	});

	// Hide project name input dialog
	function closeProjectName () {
		$('.new-project-name').fadeOut(300, function () {
			$(this).find('input').val('');
		});
	}

	// New project folder dialog
	var NewProjectFolderDialog = new folderDialog('#new-project-dialog');

	// On Enter trigger click
	$('#new-project-button input').keydown( function(e) {
		var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
		if(key == 13) {
			$('#new-project-button .ok-icon').trigger('click');
			e.preventDefault();
		}
	});

	// Click on confirm project name
	$('#new-project-button .ok-icon').click(function (e) {

		// If empty project name
		if ( !$('#new-project-button input').val() ) {
			showAlert('error', 'Project name cannot be empty!');
			return;
		}

		// Check valid characters
		if ( !/^[A-Za-z0-9 _-]+$/.test($('#new-project-button input').val()) ){
			showAlert('error', 'Project name can only contain: alfanumeric, spaces, _, -');
			return;
		}

		// Open folder dialog
		NewProjectFolderDialog.open(function (path) {

			// Set project data
			project.name = $('#new-project-button input').val();
			project.path = path + '/' + project.name + '/';

			// Create new project
			createNewProject(function() {

				// Success!
				showAlert('success', 'Well done! ' + project.name + ' is ready...');

				// If everything allright
				openProject(project.path);

			}, function (err) {
				// If folder already exist
				showAlert('error', err);
			});
			
		});
		e.stopPropagation();
	});

	// Drag folders to open project
	makeDroppable('open-project-button', function (path) {
		openProject(path);
	});

	// Open folder dialog
	var OpenProjectFolderDialog = new folderDialog('#open-project-dialog');

	// Open project
	$('#open-project-button').click(function() {
		OpenProjectFolderDialog.open(function (path) {
			openProject(path);
		});
	});
	
	// Show the build screen and load project
	function openProject(path) {

		// Load project
		loadProject( path, function() {

			// if everything go right show build screen
			$('#screen-main').fadeOut(300, function() {

				// Close project name if opened
				closeProjectName();

				// Resize logo
				$('header').animate({padding : '20px'}, 300, function () {

					// Show project name
					$('.project-title').text(project.name);

					// Show next screen
					$('#screen-build').fadeIn(300);

					// Enable last project button
					$('#open-last-project-button').removeAttr('disabled')

				});

			});

		}, function (err) {
			// If there is any error reading the json file
			showAlert('error', err);
		});

	}

	// Click on build project button
	$('#build-project-button').click(function(event) {
		
		$(this).attr('disabled', 'disabled');

		// Enable spinner
		var icon_class = $('#build-project-button i').attr('class');
		$('#build-project-button i').removeClass().addClass('fa fa-spinner fa-spin');

		// Build project
		buildProject(function() {
			$('#build-project-button i').removeClass().addClass(icon_class);
			$('#build-project-button').removeAttr('disabled');
			showAlert('success', '<i class="fa fa-check"></i> Your App was built successfully!');
			var audio = $('#audioclip')[0];
			audio.src = process.cwd() + '/sound.wav';
			audio.play();
		},function (err) {
			showAlert('error', err);
			$('#build-project-button').removeAttr('disabled');
		},
		$('#compress-check .check-field').hasClass('active'));

	});

	// Run project button
	$('#run-project-button').click(function() {
		runProject();
	});

	// Edit project button
	$('.edit-project-icon').click(function() {
		editProject();
	});

	// Close current opened project
	$('#screen-build .close-icon').click(function() {

		$('#screen-build').fadeOut(300, function () {
			$('header').animate({padding : '50px'}, 300, function () {
				$('#screen-main').fadeIn(300);
			});
		});

	});

	// Toggle checkfield value
	$('.check-field-container').click(function() {
		$(this).find('.check-field').toggleClass('active');
	});

	// Show project folder in finder
	$('.show-in-finder-icon').click(function() {
		openFinder(project.path);
	});

	// If no project has been opened before
	if ( !localStorage.fav_path ){
		$('#open-last-project-button').attr('disabled', 'disabled');
	}

	// Open last project
	$('#open-last-project-button').click(function() {
		openProject(localStorage.fav_path);
	});

});
