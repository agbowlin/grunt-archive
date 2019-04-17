module.exports = function(grunt)
{
	const PATH = require('path');
	const MOMENT = require('moment');
	const TIMESTAMP = MOMENT().format('YYYY-MM-DD_HH-mm');

	// Get the source path from the command line.
	const SOURCE_PATH = grunt.option('source');
	if (!grunt.file.isDir(SOURCE_PATH))
	{
		grunt.fail.fatal('The command line option "source" must be set to an existing file system directory.');
	}

	// Get the source name.
	const SOURCE_NAME = PATH.basename(SOURCE_PATH);

	// Set the mirror path.
	const MIRROR_ROOT = grunt.option('mirror') || 'sandbox/mirror';

	// Set the archive path.
	const ARCHIVE_ROOT = grunt.option('archive') || 'sandbox/archive';
	const ARCHIVE_PATH = ARCHIVE_ROOT + '/' + TIMESTAMP.substr(0, 7);
	const ARCHIVE_NAME = SOURCE_NAME + '_' + TIMESTAMP;

	// Some debug printing.
	grunt.log.write('SOURCE_PATH  =' + SOURCE_PATH + "\n");
	grunt.log.write('SOURCE_NAME  =' + SOURCE_NAME + "\n");
	grunt.log.write('MIRROR_PATH  =' + MIRROR_ROOT + "\n");
	grunt.log.write('ARCHIVE_ROOT =' + ARCHIVE_ROOT + "\n");
	grunt.log.write('ARCHIVE_PATH =' + ARCHIVE_PATH + "\n");
	grunt.log.write('ARCHIVE_NAME =' + ARCHIVE_NAME + "\n");

	// Grunt configuration.
	grunt.config.init(
	{
		bgShell:
		{

			//------------------------------------------
			_defaults:
			{
				execOpts:
				{
					cwd: '.',
				},
				stdout: true,
				stderr: true,
				bg: false,
				fail: true,
				done: function() {},
			},

			//------------------------------------------
			create_archive:
			{
				cmd: 'mkdir -p ' + ARCHIVE_PATH,
			},

			//------------------------------------------
			clean_archive:
			{
				// cmd: 'rm -rdv sandbox/archive/*',
				cmd: 'rm -rdv ' + ARCHIVE_PATH + '/*',
				fail: false,
			},

			//------------------------------------------
			create_mirror:
			{
				cmd: 'mkdir -p ' + MIRROR_ROOT,
			},

			//------------------------------------------
			clean_mirror:
			{
				cmd: 'rm -rdv ' + MIRROR_ROOT + '/*',
				fail: false,
			},

			//------------------------------------------
			update_mirror_with_rsync:
			{
				cmd: 'rsync -a --delete-after ' + SOURCE_PATH + ' ' + MIRROR_ROOT,
			},

			//------------------------------------------
			compress_mirror_with_zip:
			{
				cmd: 'zip -rov9 ' + ARCHIVE_PATH + '/' + ARCHIVE_NAME + '.zip ' + MIRROR_ROOT + '/' + SOURCE_NAME,
			},

			//------------------------------------------
			compress_mirror_with_7z:
			{
				cmd: '7z a -t7z -m0=lzma -mx=9 -mfb=64 -md=32m -ms=on ' + ARCHIVE_PATH + '/' + ARCHIVE_NAME + '.7z ' + MIRROR_ROOT + '/' + SOURCE_NAME,
			},

		},

	});

	grunt.task.loadNpmTasks('grunt-bg-shell');

	grunt.task.registerTask(
		'default', [
			'bgShell:create_archive',
			'bgShell:create_mirror',
			'bgShell:update_mirror_with_rsync',
			'bgShell:compress_mirror_with_zip',
			'bgShell:compress_mirror_with_7z',
		]
	);

	grunt.task.registerTask(
		'clean', [
			'bgShell:clean_archive',
			'bgShell:clean_mirror',
		]
	);

};
