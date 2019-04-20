module.exports = function(grunt)
{
	const NPM_PATH = require('path');
	const NPM_MOMENT = require('moment');

	// Get the command line arguments.
	// - Required parameters.
	const SOURCE_PATH = grunt.option('source') || '';
	// - Optional parameters.
	const MIRROR_ROOT = grunt.option('mirror') || 'sandbox/mirror';
	const ARCHIVE_ROOT = grunt.option('archive') || 'sandbox/archive';
	const USE_ZIP = grunt.option('zip') || false;
	const DO_TRIM = grunt.option('trim') || false;
	const TEST_RUN = grunt.option('test') || false;

	// Get the timestamp of the operation.
	const TIMESTAMP = NPM_MOMENT();

	// Validate the file source.
	if (!grunt.file.isDir(SOURCE_PATH))
	{
		grunt.fail.fatal('The command line option "source" must be set to an existing file system directory.');
	}

	// Extract the source name.
	const SOURCE_NAME = NPM_PATH.basename(SOURCE_PATH);

	// Set the archive path and filename.
	const ARCHIVE_PATH = ARCHIVE_ROOT + '/' + TIMESTAMP.format('YYYY-MM');
	const ARCHIVE_NAME = SOURCE_NAME + '_' + TIMESTAMP.format('YYYY-MM-DD_HH-mm');

	// Report the parameters.
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
				// cmd: 'mkdir -p ' + ARCHIVE_PATH,
				cmd: function()
				{
					let command = 'mkdir -p ' + ARCHIVE_PATH;
					if (TEST_RUN)
					{
						return 'echo TEST_RUN enabled, would have executed: "' + command + '"';
					}
					return command;
				},
			},

			//------------------------------------------
			clean_archive:
			{
				// cmd: 'rm -rdv ' + ARCHIVE_PATH + '/*',
				cmd: function()
				{
					let command = 'rm -rdv ' + ARCHIVE_PATH + '/*';
					if (TEST_RUN)
					{
						return 'echo TEST_RUN enabled, would have executed: "' + command + '"';
					}
					return command;
				},
				fail: false,
			},

			//------------------------------------------
			create_mirror:
			{
				// cmd: 'mkdir -p ' + MIRROR_ROOT,
				cmd: function()
				{
					let command = 'mkdir -p ' + MIRROR_ROOT;
					if (TEST_RUN)
					{
						return 'echo TEST_RUN enabled, would have executed: "' + command + '"';
					}
					return command;
				},
			},

			//------------------------------------------
			clean_mirror:
			{
				// cmd: 'rm -rdv ' + MIRROR_ROOT + '/*',
				cmd: function()
				{
					let command = 'rm -rdv ' + MIRROR_ROOT + '/*';
					if (TEST_RUN)
					{
						return 'echo TEST_RUN enabled, would have executed: "' + command + '"';
					}
					return command;
				},
				fail: false,
			},

			//------------------------------------------
			update_mirror_with_rsync:
			{
				// cmd: 'rsync -a --delete-after ' + SOURCE_PATH + ' ' + MIRROR_ROOT,
				cmd: function()
				{
					let command = 'rsync -a --delete-after ' + SOURCE_PATH + ' ' + MIRROR_ROOT;
					if (TEST_RUN)
					{
						return 'echo TEST_RUN enabled, would have executed: "' + command + '"';
					}
					return command;
				},
			},

			//------------------------------------------
			compress_mirror_to_archive:
			{
				cmd: function()
				{
					let command = '7z a -t7z -m0=lzma -mx=9 -mfb=64 -md=32m -ms=on ' + ARCHIVE_PATH + '/' + ARCHIVE_NAME + '.7z ' + MIRROR_ROOT + '/' + SOURCE_NAME;
					if (USE_ZIP)
					{
						command = 'zip -rov9 ' + ARCHIVE_PATH + '/' + ARCHIVE_NAME + '.zip ' + MIRROR_ROOT + '/' + SOURCE_NAME;
					}
					if (TEST_RUN)
					{
						return 'echo TEST_RUN enabled, would have executed: "' + command + '"';
					}
					return command;
				},
			},

			//------------------------------------------
			trim_archive:
			{
				cmd: function()
				{
					if (!DO_TRIM || (DO_TRIM.length === 0))
					{
						return 'echo Trim option not provided. No archives will be deleted.';
					}

					// Get the duration of time requested for archive retention. (e.g. "7" = 7 days)
					let retention_days = parseFloat(DO_TRIM);
					if (retention_days <= 0)
					{
						return 'echo Trim option (duration) is invalid. No archives will be deleted.';
					}

					// Return the command.
					let command = 'find ' + ARCHIVE_ROOT + '/* -ctime +' + retention_days + ' -exec rm {} \\;';
					if (TEST_RUN)
					{
						return 'echo TEST_RUN enabled, would have executed: "' + command + '"';
					}
					return command;
				},
			},

		},

	});

	grunt.task.loadNpmTasks('grunt-bg-shell');

	grunt.task.registerTask(
		'default', [
			'bgShell:create_archive',
			'bgShell:create_mirror',
			'bgShell:update_mirror_with_rsync',
			// 'bgShell:compress_mirror_with_zip',
			// 'bgShell:compress_mirror_with_7z',
			'bgShell:compress_mirror_to_archive',
			'bgShell:trim_archive',
		]
	);

	grunt.task.registerTask(
		'clean', [
			'bgShell:clean_archive',
			'bgShell:clean_mirror',
		]
	);

};
