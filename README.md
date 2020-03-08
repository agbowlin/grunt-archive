

# grunt-archive

A simple file archiving system using Grunt.


## Operation

`grunt-archive` will create a mirror of a set of files and compress them into an archive.
You are required to specify the source path of the files to operate on and can
optionally specify the mirror location and the archive location.
Archive are stored in timestamped folders of the format YYYY-MM.
Archive filenames are further timestamped with: name_YYYY-MM-DD_HH-mm.ext

All relevant code is maintained in the `Gruntfile.js` file which is automatically
loaded and executed by grunt.


## Installation

~~~bash
# Get the grunt-archive project
git clone https://github.com/agbowlin/grunt-archive.git .
# Install the project dependencies
npm install
~~~

Requires the following command-line utilities to be available:

* NodeJS:	[https://nodejs.org/en/](https://nodejs.org/en/)

* Grunt:	[https://gruntjs.com/](https://gruntjs.com/)
			This loads and executes the commands stored in `Gruntfile.js`.

* rsync:	[https://rsync.samba.org/](https://rsync.samba.org/)
			Used to create the mirror from the source files.
			This is probably already on most modern linux systems.

* 7zip:		[https://www.7-zip.org/7z.html](https://www.7-zip.org/7z.html)
			Used to create archive files from the mirrored files.


## Usage

Run grunt in the top folder of the `grunt-archive` project and supply the path
to the files to be archived.

~~~bash
grunt --source=path/to/my/files
~~~

Or, specify all parameters:

~~~bash
grunt --source=path/to/my/files --mirror=my/mirror/location --archive=archive/location
~~~


## TODO

* Implement a `trim` command to enforce archive retention for a number of days, deleting aged archives.

