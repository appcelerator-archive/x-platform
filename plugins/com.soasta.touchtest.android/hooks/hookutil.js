// Replaces functionality of hookutils.py script.

var fs = require('fs'),
	path = require('path');

/**
 * The 3.0+ CLI doesn't properly pass the deploy type for Android,
 * so get it based on the target
 */
function mapTargetToDeployType(target) 
{
	switch(target) 
	{
		case 'dist-playstore':
			return 'production';
		case 'device':
			return 'test';
		case 'emulator':
			return 'development';
		default:
			return 'development';
	}
}
exports.mapTargetToDeployType = mapTargetToDeployType;


// see if a value is contained in an array
function contains(array, value) 
{
	if (!Array.isArray(array)) 
	{
		throw new Error('Bad argument: array parameter must be an array');
	}

	return array && array.indexOf(value) !== -1;
}
exports.contains = contains;

// quick and dirty way to make array unique
function unique(array) 
{
	if (!Array.isArray(array)) 
	{
		throw new Error('Bad argument: array parameter must be an array');
	}

	var ret = [];
	array.forEach(function(i) 
  {
		if (!contains(ret, i)) 
		{
			ret.push(i);
		}
	});
	return ret;
}
exports.unique = unique;

// The MIT License

// Copyright (c) 2010 Ryan McGrath

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
function rmdirSyncRecursive(thePath, failSilent) 
{
	var files;

	try 
	{
		files = fs.readdirSync(thePath);
	} 
	catch (err) 
	{
		if(failSilent) { return; }
		throw new Error(err.message);
	}

	/*  Loop through and delete everything in the sub-tree after checking it */
	for(var i = 0; i < files.length; i++) 
	{
		var currFile = fs.lstatSync(path.join(thePath, files[i]));

		if(currFile.isDirectory()) 
		{ 
		  // Recursive function back to the beginning
			rmdirSyncRecursive(path.join(thePath, files[i]));
		}
		else if(currFile.isSymbolicLink()) 
		{ 
		  // Unlink symlinks
			fs.unlinkSync(path.join(thePath, files[i]));
		}
		else 
		{ 
		  // Assume it's a file - perhaps a try/catch belongs here?
			fs.unlinkSync(path.join(thePath, files[i]));
		}
	}

	// Now that we know everything in the sub-tree has been deleted, we can delete the main
	// directory. Huzzah for the shopkeep.
	return fs.rmdirSync(thePath);
}
exports.rmdirSyncRecursive = rmdirSyncRecursive;

function readdirSyncRecursive(baseDir) 
{
	baseDir = baseDir.replace(/\/$/, '');

	var _readdirSyncRecursive = function(baseDir) 
	{
		var files = [],
			curFiles,
			nextDirs,
			isDir = function(fname)
			{
				return fs.statSync( path.join(baseDir, fname) ).isDirectory();
			},
			prependBaseDir = function(fname)
			{
				return path.join(baseDir, fname);
			};

		curFiles = fs.readdirSync(baseDir);
		nextDirs = curFiles.filter(isDir);
		curFiles = curFiles.map(prependBaseDir);

		files = files.concat( curFiles );

		while (nextDirs.length) 
		{
			files = files.concat( _readdirSyncRecursive( path.join(baseDir, nextDirs.shift()) ) );
		}

		return files;
	};

	// convert absolute paths to relative
	var fileList = _readdirSyncRecursive(baseDir).map(function(val)
  {
		return path.relative(baseDir, val);
	});

	return fileList;
}
exports.readdirSyncRecursive = readdirSyncRecursive;
