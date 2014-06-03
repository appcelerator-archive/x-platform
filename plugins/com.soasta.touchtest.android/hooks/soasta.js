// This is the main entry point of the plugin.
// This is a direct conversion of TouchTest Python plugin file.

var bindings = require('./bindings'),
	compiler = require('./compiler'),
	exec = require('child_process').exec,
	fs = require('fs'),
	HU = require('./hookutil'),
	jar = require('./jar'),
	path = require('path');

// Minimizing the use of global variables.
var SOASTA_HOOK = {};
	
// Export supported versions
exports.cliVersion = '>=3.2';

// Main entry point for the hook; at this point we know the version is above 3.2.0 because
// it is the version of Titanium that introduced and allow the hook js script to function.
exports.init = function(logger, config, cli, appc)
{	
	// Constants
	SOASTA_HOOK.BLACKLIST = 'blacklist.txt';
	SOASTA_HOOK.MODULE_ID = 'com.soasta.touchtest';
	SOASTA_HOOK.LIB_DIR = path.join(__dirname, '..', 'lib');
	SOASTA_HOOK.TMP_DIR = path.join(__dirname, '..', 'soasta');
	SOASTA_HOOK.TMP_DIR_SDK = path.join(SOASTA_HOOK.TMP_DIR, 'sdk');
	SOASTA_HOOK.TMP_DIR_EXTM = path.join(SOASTA_HOOK.TMP_DIR, 'externalModules');
	SOASTA_HOOK.LINEBREAK_RX = /(?:\r\n|\n|\r)/;
	SOASTA_HOOK.IS_WINDOWS = /^win/i.test(process.platform);
	SOASTA_HOOK.SEP = SOASTA_HOOK.IS_WINDOWS ? ';' : ':';
	SOASTA_HOOK.FILE_SEP = SOASTA_HOOK.IS_WINDOWS ? '\\' : '/';

	// Prep logger and config for use throughout hook
	SOASTA_HOOK.appc = appc;
	SOASTA_HOOK.config = config;
	SOASTA_HOOK.config.platform = cli.argv.platform;
	SOASTA_HOOK.logger = logger || {
		error : console.error,
		debug : console.log
	};
	
	SOASTA_HOOK.modulesOrigPath = []; // list of full-path external module jars that needs weaving.
	SOASTA_HOOK.aspectJars = [];  // list of successfully weaved Titanium SDK jars.
	SOASTA_HOOK.skip = false;
	SOASTA_HOOK.restored = false;
	SOASTA_HOOK.moduleEnabled = false;

	var libTouchTest = ['aspectjrt', 'TouchTestDriver', 'TouchTestDriver-APIv11', 'TouchTestDriver-APIv12', 'TouchTestDriver-Titanium'],
		// List of Titanium SDK jars that must be weaved in order for an app
		// to be made TouchTestable.
		sdkTitanium = ['titanium', 'modules' + SOASTA_HOOK.FILE_SEP + 'titanium-ui'];  // Must not contain the '.jar' extension.

	// Add the pre-compiler hook.  This part of the code weaves the jars 
	// (external and titanium SDK jars) necessary to make the app TouchTestable.
	// the cli.on() code-order is in the order the hooks are fired.
	cli.on('build.pre.compile', function(build, done)
	{
		//SOASTA_HOOK.logger.debug('[FUNCTION-PRE-HOOK] build.pre.compile');

		var funcs = [],
 			blacklist, jars, classpaths, classpath;

		// This Plugin is only for the Android platform.
		if (SOASTA_HOOK.config.platform !== 'android')
		{
			SOASTA_HOOK.skip = true;
			SOASTA_HOOK.logger.trace('TouchTest : Plugin is only for android, skipping...');
			return done();
		}

		// Create a single config object that also holds the build information
		// needed, provided at pre-compile.
		SOASTA_HOOK.config.titaniumSdkPath = build.titaniumSdkPath;
		SOASTA_HOOK.config.templateDir = build.platformPath;
		SOASTA_HOOK.config.androidJar = build.androidTargetSDK.androidJar;
		
		// Initialize modules
		bindings.init(SOASTA_HOOK.config.templateDir);
		jar.init(SOASTA_HOOK.appc, SOASTA_HOOK.logger);

		SOASTA_HOOK.moduleEnabled = isAndroidModuleEnabled(build);
		if (!SOASTA_HOOK.moduleEnabled)
		{
			SOASTA_HOOK.logger.trace('TouchTest : Hook launched, but module not found, skipping...');
			return done();
		}
		
		SOASTA_HOOK.logger.debug('TouchTest : Checking the jars blacklisted...');
		
		// Generate the blacklist of modules
		blacklist = getBlackList();
		blacklist.push(SOASTA_HOOK.MODULE_ID);

		// Find android modules to be weaved
		jars = findAndroidModuleJars(blacklist, build);

		// Initialize classpath
		classpaths = HU.unique([SOASTA_HOOK.config.androidJar]
			.concat(
				compiler.findCompilerJarLibraries(SOASTA_HOOK.config.templateDir, SOASTA_HOOK.logger), [
				path.join(SOASTA_HOOK.LIB_DIR, 'aspectjrt.jar'),
				path.join(SOASTA_HOOK.LIB_DIR, 'aspectjtools.jar')], 
				jars));
		classpath = classpaths.join(SOASTA_HOOK.SEP);
		SOASTA_HOOK.logger.debug('TouchTest : Using classpath ' + classpath);

		// Create array of functions to be executed in sequence via async
		// These functions will be executed asynchronously. We need to make sure nobody is touching Titanium SDK
		// while we are performing these functions.
		sdkTitanium.forEach(function(jar)
		{
			// Create the copy of the Titanium SDK that needs altering in a SOASTA-
			// specific location.
			createTitaniumSDKBackup(jar);
			funcs.push(function(cb)
			{
				// Push the altered jar into the array for future processing.
				SOASTA_HOOK.logger.debug('TouchTest : Instrumenting ' + jar);
				instrument(classpath, jar, cb);
			});
		});
		jars.forEach(function(jar)
		{
			funcs.push(function(cb)
			{
				SOASTA_HOOK.logger.debug('TouchTest : Instrumenting ' + jar);
				instrumentExternalJars(classpath, jar, cb);
			});
		});

		// Instrument all jars
		try
		{
			SOASTA_HOOK.appc.async.series(this, funcs, function(err)
			{
				if (err)
				{ 
					throw err; 
				}

				SOASTA_HOOK.logger.debug('TouchTest : TouchTest Driver for Android installed');
				return done(err);
			});
		} catch (e)
		{
			SOASTA_HOOK.logger.error('TouchTest : ' + e.stack);
			SOASTA_HOOK.logger.error('TouchTest : Exception occured. Removing SOASTA temporary directory.');
			// Remove SOASTA temporary directory
			if (fs.existsSync(SOASTA_HOOK.TMP_DIR))
			{
				HU.rmdirSyncRecursive(SOASTA_HOOK.TMP_DIR);
			}
			SOASTA_HOOK.logger.error('TouchTest : TouchTest Driver was not installed.');
			return done(e);
		}
	});
	
	cli.on('build.android.javac', function(data, done) {
		
		SOASTA_HOOK.logger.debug('[FUNCTION-PRE-HOOK] build.android.javac');
		
		// Add TouchTest jars to the project
		for ( i = 0; i < libTouchTest.length; i++) {
			var jar = path.join(SOASTA_HOOK.LIB_DIR, libTouchTest[i] + '.jar');
			this.jarLibraries[jar] = 1;
		}

		return done();
	}); 

	
	// To prevent corrupting the Titanium SDK jars, copy the jars that were
	// successfully weaved from the sdkTitanium array.  In this part of the 
	// code we are altering the build path to go to the already weaved 
	// Titanium jars, instead of using the original jars.
	cli.on('build.android.dexer',
	{
		pre : function(data, next)
		{
			//SOASTA_HOOK.logger.debug('[FUNCTION-PRE-HOOK] build.android.dexer');
			//dump({
			//	type : data.type,
			//	args : data.args
			//});

			// Output this log if the number of jars we weaved does not match the number of jars we should have.
			if (SOASTA_HOOK.aspectJars.length !== (sdkTitanium.length + SOASTA_HOOK.modulesOrigPath.length))
			{
			  SOASTA_HOOK.logger.trace('TouchTest : Weaving mismatch between the number of jars to be weaved and the jars that were successfully weaved.');
				SOASTA_HOOK.logger.trace('TouchTest : All successfully weaved jars ' + JSON.stringify(SOASTA_HOOK.aspectJars));
				SOASTA_HOOK.logger.trace('TouchTest : All jars we expected to weave sdk: ' + JSON.stringify(sdkTitanium) + 
					' and external: ' + JSON.stringify(SOASTA_HOOK.modulesOrigPath));
			}
			
			// A Titanium jar file is identified for being inside of a mobilesdk/.../android/ path and has a
			// jar extension.
			var current, originalArg, isMobilesdkJar, weavedJar, i;
			
			// Check each argument to see if it is a file that needs altering.
			for (current in data.args[1])
			{
				originalArg = data.args[1][current];
				isMobilesdkJar = originalArg.indexOf(SOASTA_HOOK.config.titaniumSdkPath) === 0;
				isExternalModule = !isMobilesdkJar && SOASTA_HOOK.modulesOrigPath.indexOf(originalArg) >= 0;

				if (!isMobilesdkJar && !isExternalModule)
				{
					//SOASTA_HOOK.logger.debug("TouchTest : Did not qualify as a file needing redirection" + originalArg);
					continue;
				}

				weavedJar = path.basename(originalArg, '.jar');
				if (SOASTA_HOOK.aspectJars.indexOf(weavedJar) >= 0)
				{
					// A successfully weaved Titanium jar file that needs its path
					// redirected to the weaved jar.
					weavedJar = weavedJar + '.jar';
				}
				else
				{
					continue;
				}

				// Prevent the corruption of the Titanium SDK jar by switching the build to find the
				// altered jar elsewhere.
				if (isMobilesdkJar)
				{
					data.args[1][current] = path.join(SOASTA_HOOK.TMP_DIR_SDK, weavedJar);
				}
				else if (isExternalModule)
				{
					data.args[1][current] = path.join(SOASTA_HOOK.TMP_DIR_EXTM, weavedJar);
				}
			}

			//dump({
			//	type : data.type,
			//	args : data.args
			//});

			//SOASTA_HOOK.logger.trace('TouchTest : Appcelerator version is ' + cli.version);
			// Titanium version 3.2.1 and above takes 2 arguments for next.
			if (SOASTA_HOOK.appc.version.gte(SOASTA_HOOK.appc.version.format(cli.version, 0, 3, true), '3.2.1'))
			{
				next(null, data); // next(err-obj, data-obj);
			}
			else
			{
				next(data); // does not pass an err-obj along for 3.2.0.
			}
		}
	});

	// This is executed last.  Add the CLI finalize hook and delete the copied and 
	// weaved Titanium SDK jars from the project.  (Clean up.)
	cli.on('build.finalize', function(build, done)
	{
		if (SOASTA_HOOK.skip)
		{ 
			return done(); 
		}

		// If the module is enabled and we haven't already restored
		if (SOASTA_HOOK.moduleEnabled && !SOASTA_HOOK.restored)
		{
			SOASTA_HOOK.logger.debug('TouchTest : Restoring files changed during build.');
			SOASTA_HOOK.logger.debug('TouchTest : Removing ' + SOASTA_HOOK.TMP_DIR);

			// Remove SOASTA temporary directory and all the weaved jars within it.
			if (fs.existsSync(SOASTA_HOOK.TMP_DIR))
			{
				HU.rmdirSyncRecursive(SOASTA_HOOK.TMP_DIR);
			}
			SOASTA_HOOK.restored = true;
			SOASTA_HOOK.logger.debug('TouchTest : The application is now TouchTest ready.');
		}

		return done();
	});
};

// Is the TouchTest android module enabled?
function isAndroidModuleEnabled(build)
{
	var moduleFound = false;
	if (!build.modules)
	{
		return moduleFound;
	}
	
	build.modules.forEach(function(module)
	{
		if (module.id === SOASTA_HOOK.MODULE_ID)
		{
			SOASTA_HOOK.logger.trace('TouchTest : Valid module that matches ' + SOASTA_HOOK.MODULE_ID + ' found.');
			moduleFound = true;
		}
	});
	
	return moduleFound;
}

// Return the list of modules from blacklist.txt that should not be weaved.
function getBlackList()
{
	var file = path.join(__dirname, '..', SOASTA_HOOK.BLACKLIST),
		list = [],
		contents;

	// Make sure the blacklist.txt file exists and contains data
	if (!fs.existsSync(file))
	{
		return list;
	}
	
	contents = fs.readFileSync(file, 'utf8').toString();
	
	// Read each line of the blacklist, skipping comments
	contents.split(SOASTA_HOOK.LINEBREAK_RX).forEach(function(line)
	{
		line = line.trim();
		if (!line || line.indexOf('#') === 0)
		{ 
			return; 
		}
		list.push(line);
	});

	SOASTA_HOOK.logger.debug('TouchTest : The list of blacklisted modules ' + JSON.stringify(list));

	return list;
}

// Returns a list of (non-blacklisted) external module jars
// that should be scheduled for weaving.
function findAndroidModuleJars(blacklist, build)
{
	var jars = [],
		version, modulePath, modulePathTouchTest, fullpath, moduleLibPath,
		jarPath, jarName;

	if (!build.modules)
	{ 
		return jars; 
	}

	build.modules.forEach(function(module)
	{
		//SOASTA_HOOK.logger.debug('TouchTest : Module info ' + JSON.stringify(module));
		
		// Make sure it's a non-blacklisted external module
		if (HU.contains(blacklist, module.id))
		{
			return;
		}
		
		// Get the full path to the module jar file.
		moduleJar = module.jarFile;
		jarName = module.jarName;
		if (!moduleJar)
		{
			SOASTA_HOOK.logger.debug('TouchTest : Module ' + module.id + ' not found, skipping the module.');
			return;
		}

		// We will create a copy of the module directory in our temporary folder.
		// Thus, we move it from the global modules directory to the temporary directory
		// where we will directly weave the copies and change the path.
		// The jar will live within the external modules directory provided.
		jarPath = getModulePath(module);
		tmpModuleJar = path.normalize(path.join(SOASTA_HOOK.TMP_DIR_EXTM, jarPath, 'copied-' + jarName));

		if (fs.existsSync(tmpModuleJar))
		{
			fs.unlinkSync(tmpModuleJar);
		}

		SOASTA_HOOK.logger.debug('TouchTest : Creating backup to: ' + tmpModuleJar);
		SOASTA_HOOK.appc.fs.copyFileSync(moduleJar, tmpModuleJar);
		jars.push(path.join(jarPath, jarName));
	});

	return jars;
}

/*
 * Accessing module object's jarFile property will give us the absolute path of this module's jar file.
 * Thus, we can simply split this path on "/modules/android/" and return the last element of the resulting array (after removing the jar file's name).
 * This method works for modules located in User's project as well as Titanium SDK.
 * Example: 
 * Jar File Path : /Users/msharma/Library/Application Support/Titanium/modules/android/com.appcelerator.apm/1.0.7/crittercism.jar
 * Will return : com.appcelerator.apm/1.0.7
 * 
 * Jar File Path : /Users/msharma/Desktop/tester/modules/android/com.mykingdom.media/1.0/media.jar
 * Will return : com.mykingdom.media/1.0
 */
function getModulePath(module)
{
    var jarFilePath = module.jarFile;
    if (jarFilePath)
    {
        // We will split on /modules/android (for Unix based systems) and \modules\android\ (for Windows)
        var splitOn = SOASTA_HOOK.FILE_SEP + 'modules' + SOASTA_HOOK.FILE_SEP + 'android' + SOASTA_HOOK.FILE_SEP;
        var array = jarFilePath.split(splitOn);
        
        // Obtain the last element of the array. Example: com.appcelerator.apm/1.0.7/crittercism.jar
        var moduleAndJarFilePath = array[array.length-1];
        
        // Remove the jar file name and return the result. Example: com.appcelerator.apm/1.0.7
        return moduleAndJarFilePath.replace(SOASTA_HOOK.FILE_SEP + module.jarName, "");
    }

    return ''; // Jar file's absolute path is not available, nothing to return.    
}

function createTitaniumSDKBackup(jar)
{
	var jarFile = path.join(SOASTA_HOOK.config.templateDir, jar + '.jar'),
		jarBakFile = path.join(SOASTA_HOOK.TMP_DIR_SDK, 'copied-' + path.basename(jar) + '.jar');

	// Overwrite the existing titanium backup file.
	// This is for corrupted titanium jars that
	// failed the weave the first time.  If it had been
	// properly woven the first time, it would have been
	// deleted after the app was built during the finalize
	// phase.
	if (fs.existsSync(jarBakFile))
	{
		fs.unlinkSync(jarBakFile);
	}

	//SOASTA_HOOK.logger.debug('TouchTest : Creating backup of file: ' + jarFile);
	SOASTA_HOOK.logger.debug('TouchTest : Creating backup to: ' + jarBakFile);
	SOASTA_HOOK.appc.fs.copyFileSync(jarFile, jarBakFile);
}

function weaveJar(classpath, inpath, aspectpath, outjar, callback)
{
	var args = [
		'java',
		'-classpath',
		'"' + classpath + '"',
		'-Xmx256M',
		'org.aspectj.tools.ajc.Main',
		'-Xlint:ignore',
		'-inpath',
		'"' + inpath + '"',
		'-aspectpath',
		'"' + aspectpath + '"',
		'-outjar',
		'"' + outjar + '"'
	];

	//SOASTA_HOOK.logger.debug('TouchTest : weaving jar from ' + inpath);
	SOASTA_HOOK.logger.debug('TouchTest : weaving jar to create ' + outjar);
	//SOASTA_HOOK.logger.trace('TouchTest : ' + args.join(' '));
	try
	{
		exec(args.join(' '), function(err)
		{
			return callback(err);
		});
	} 
	catch(e) 
	{
		return callback(e);
	}
}

function instrument(classpath, jar, callback)
{
	var inpath = path.join(SOASTA_HOOK.TMP_DIR_SDK, 'copied-' + path.basename(jar) + '.jar'),
		aspectpath = path.join(SOASTA_HOOK.LIB_DIR, 'TouchTestDriver.jar') + SOASTA_HOOK.SEP + 
				path.join(SOASTA_HOOK.LIB_DIR, 'TouchTestDriver-Titanium.jar'),
		outjar = path.join(SOASTA_HOOK.TMP_DIR_SDK, path.basename(jar) + '.jar');

	SOASTA_HOOK.logger.debug('TouchTest : Process ' + inpath);
	//SOASTA_HOOK.logger.debug('TouchTest : Weaved jar at ' + outjar);
	if (fs.existsSync(outjar))
	{
		fs.unlinkSync(outjar);
	}

	try
	{
		weaveJar(classpath, inpath, aspectpath, outjar, function(err)
		{
			if (err)
			{
				SOASTA_HOOK.logger.error('TouchTest : Failed to weave the jar because of ' + JSON.stringify(err));
				return callback(err);
			}

			if (fs.existsSync(inpath)) 
			{
				fs.unlinkSync(inpath);
			}

			//SOASTA_HOOK.logger.debug('TouchTest : Success in weaving ' + outjar);
			SOASTA_HOOK.aspectJars.push(path.basename(jar));
			return callback();
		});
	} catch (e)
	{
		SOASTA_HOOK.logger.error('TouchTest : Unexpected error: ' + JSON.stringify(e));
	}
}

function instrumentExternalJars(classpath, jar, callback)
{
	var inpath = path.join(SOASTA_HOOK.TMP_DIR_EXTM, path.dirname(jar), 'copied-' + path.basename(jar)),
		aspectpath = path.join(SOASTA_HOOK.LIB_DIR, 'TouchTestDriver.jar') + SOASTA_HOOK.SEP + path.join(SOASTA_HOOK.LIB_DIR, 'TouchTestDriver-Titanium.jar'),
		outjar = path.join(SOASTA_HOOK.TMP_DIR_EXTM, jar);

	SOASTA_HOOK.logger.debug('TouchTest : Process ' + inpath);
	//SOASTA_HOOK.logger.debug('TouchTest : Weaved jar at ' + outjar);
	if (fs.existsSync(outjar))
	{
		fs.unlinkSync(outjar);
	}

	try
	{
		weaveJar(classpath, inpath, aspectpath, outjar, function(err) 
    	{
			if (err) 
			{ 
				return callback(err);
			}

			if (fs.existsSync(inpath)) 
			{
				fs.unlinkSync(inpath);
			}
			
			//SOASTA_HOOK.logger.debug('TouchTest : Success in weaving ' + outjar);
			SOASTA_HOOK.modulesOrigPath.push(jar);
			SOASTA_HOOK.aspectJars.push(path.basename(jar, '.jar'));
			return callback();
		});
	} 
	catch (e) 
	{
		SOASTA_HOOK.logger.error('TouchTest : Unexpected error: ' + JSON.stringify(e));
	}
}
