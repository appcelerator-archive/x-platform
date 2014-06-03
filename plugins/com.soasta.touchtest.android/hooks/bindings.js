// Replaces functionality of bindings.py script.

var fs = require('fs'),
	path = require('path');

var dirs, modulesJson;

function init(androidDir) 
{
	if (!androidDir || typeof androidDir !== 'string') 
	{
		throw new Error('Bad argument: androidDir must be a string');
	}

	dirs = 
	{
		android: androidDir,
		modules: path.join(androidDir, 'modules')
	};
	modulesJson = JSON.parse(fs.readFileSync(path.join(dirs.android, 'modules.json'), 'utf8')) || {};
}
exports.init = init;

function findModuleJar(name) 
{
	if (!name || typeof name !== 'string') 
	{
		throw new Error('Bad argument: name must be a string');
	}

	if (modulesJson)
	{
		var jars = Object.keys(modulesJson);
		for (var i = 0; i < jars.length; i++) 
		{
			var jar = jars[i];
			var mods = modulesJson[jar];
			for (var j = 0; j < mods.length; j++) 
			{
				if (mods[j].toLowerCase() === name) 
				{
					if (jar === 'titanium.jar') 
					{
						return path.join(dirs.android, jar);
					} 
					else 
					{
						return path.join(dirs.modules, jar);
					}
				}
			}
		}
	}

	return null;
}
exports.findModuleJar = findModuleJar;
