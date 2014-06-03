// Implements JAR extraction functionality.

var exec = require('child_process').exec,
	fs = require('fs'),
	HU = require('./hookutil'),
	path = require('path');

var TMP_FOLDER = path.join(__dirname, '.tmp');

var appc, logger, _init;

function init(_appc, _logger) 
{
	if (!_appc || typeof _appc !== 'object') 
	{
		throw new Error('Bad argument: appc must be an instance of node-appc');
	}
	if (!_logger || typeof _logger !== 'object') 
	{
		throw new Error('Bad argument: logger must be an object');
	}

	appc = _appc;
	logger = _logger;
	_init = true;
}
exports.init = init;

function create(target, source, callback) 
{
	if (!_init) 
	{ 
	  return callback(new Error('module not initialized, call init()')); 
  }
	if (!target || typeof target !== 'string') 
	{
		return callback(new Error('Bad argument: target must be a string'));
	}
	if (!source || typeof source !== 'string') 
	{
		return callback(new Error('Bad argument: source must be a string'));
	}

	var cmd = 'cd "' + source + '" && jar -cf "' + target + '" *';
	logger.trace('Touchtest: ' + cmd);
	exec(cmd, function(err) 
  {
		if (fs.existsSync(source)) 
		{ 
		  HU.rmdirSyncRecursive(source); 
	  }
		return callback(err);
	});
}
exports.create = create;

function extract(jarfiles, callback) 
{
	if (!_init) 
	{ 
	  return callback(new Error('module not initialized, call init()')); 
  }
	if (!jarfiles) 
	{ 
	  return callback(); 
  }
	if (!fs.existsSync(TMP_FOLDER)) 
	{
		fs.mkdirSync(TMP_FOLDER);
	}

	var funcs = [];
	jarfiles.forEach(function(jarfile) 
  {
		funcs.push(function(cb) 
    {
			var cmd = 'cd "' + TMP_FOLDER + '" && jar -xf "' + jarfile + '"';
			logger.trace('Touchtest: ' + cmd);
			exec(cmd, function(err) 
	    {
				return cb(err);
			});
		});
	});

	appc.async.series(this, funcs, function(err) 
  {
		if (err) 
		{
			logger.error('Touchtest: jar extraction failed: ' + err);
		} 
		else 
		{
			logger.debug('Touchtest: jars extracted to ' + TMP_FOLDER);
		}
		return callback(err, TMP_FOLDER);
	});
}
exports.extract = extract;