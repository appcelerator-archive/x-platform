// Replaces functionality of compiler.py script.

var bindings = require('./bindings'),
	fs = require('fs'),
	HU = require('./hookutil'),
	path = require('path');

var DEPENDENCY_JSON = 'dependency.json',
	DEPENDENCY_SKIP = ['buildhash', 'builddate'];

function findCompilerJarLibraries(androidDir, logger) 
{
	var jars = [], dependencies;

	if (!androidDir || typeof androidDir !== 'string') 
	{
		throw new Error('Bad argument: androidDir must be a string');
	}
	logger = logger || { error: console.error, debug: console.log };

	// parse the dependency JSON file
	try 
	{
		dependencies = JSON.parse(fs.readFileSync(path.join(androidDir, DEPENDENCY_JSON), 'utf8'));
	} 
	catch (e) 
	{
		logger.error('Touchtest: failed to load android compiler jars');
		return [];
	}

	// add v8 dependencies
	dependencies.runtimes.v8.forEach(function(d) 
  {
		jars.push(path.join(androidDir, d));
	});

	// find jars associated with all required dependencies
	dependencies.required.forEach(function(d) 
  {
		d = d.toLowerCase();
		if (DEPENDENCY_SKIP.indexOf(d) !== -1) 
		{ 
		  return; 
	  }
		_findCompilerJarLibraries(d);
	});

	// recursively walk jar dependencies
	function _findCompilerJarLibraries(d) 
	{
		// find the jar for the given dependency
		var moduleJar = bindings.findModuleJar(d);
		if (moduleJar && fs.existsSync(moduleJar)) 
		{
			logger.debug('detected module ' + d + ', path = ' + moduleJar);
			jars.push(moduleJar);
		}
		else 
		{
			logger.debug('unknown module = ' + d);
		}

		// find the associated library for the jar
		Object.keys(dependencies.libraries).forEach(function(key) 
    {
			dependencies.libraries[key].forEach(function(lib) 
	    {
				var libPath = path.join(androidDir, lib);
				if (fs.existsSync(libPath)) 
				{
					jars.push(libPath);
				}
			});
		});

		// traverse the dependency chain
		if (dependencies[d]) 
		{
			dependencies[d].forEach(function(next) 
	    {
				_findCompilerJarLibraries(next);
			});
		}
	}

	return HU.unique(jars);
}
exports.findCompilerJarLibraries = findCompilerJarLibraries;
