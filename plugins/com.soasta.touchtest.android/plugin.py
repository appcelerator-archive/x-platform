#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, sys, subprocess, hashlib, time, shutil, zipfile
from time import sleep
from os import listdir
from os.path import isfile, join

def compile(c):
    global project_dir
    global sdk_dir
    global deploy_type
    global builder
    global android
    global config
    global template_dir
    global jar_dir
    global touchtest_dir
    global restore_performed
    global classpath_separator
    global moduleAvailable
    global touchtest_module_dir_created
    global blacklist

    print "[DEBUG] TouchTest : %s" % c

    config = c

    # This Plugin is only for the Android platform.
    if config['platform'] != 'android':
        return

    moduleAvailable = isAndroidModuleEnabled(config['tiapp'].properties['modules'], config['deploy_type'])
    touchtest_module_dir_created = []

    if moduleAvailable:
        from android import Android
        from compiler import Compiler

        # Initialize variables
        project_dir = config['project_dir']
        sdk_dir = config['titanium_dir']
        deploy_type = config['deploy_type']
        template_dir = config['template_dir']
        touchtest_dir = project_dir + "/plugins/com.soasta.touchtest.android"
        jar_dir = touchtest_dir + "/lib/"

        # Initialize blacklist
        blacklist = getBlackList()
        # print "[DEBUG] TouchTest : Blacklist is " + blacklist

        # Initialize the restore_performed value to be False
        restore_performed = False

        # Initialize classpath
        builder = config['android_builder']
        android = Android(builder.name, builder.app_id, builder.sdk, 'test', builder.java)
        full_resource_dir = os.path.join(builder.project_dir, builder.project_dir + "/bin/assets/Resources")
        compiler = Compiler(config['tiapp'],
            full_resource_dir,
            builder.java,
            project_dir + "/bin/Classes",
            builder.project_gen_dir,
            project_dir,
            include_all_modules=True)
        classpath = os.pathsep.join([builder.sdk.get_android_jar(), os.pathsep.join(compiler.jar_libraries)])

        # Classpath separator on Windows is a semi-colon instead of a colon
        classpath_separator = ":"
        if (os.name == 'nt'):
            classpath_separator = ";"

        module_jars = findAndroidModuleJars(config['tiapp'].properties['modules'])

        classpath = classpath + classpath_separator + jar_dir + "aspectjrt.jar"
        classpath = classpath + classpath_separator + jar_dir + "aspectjtools.jar"

        for module_jar in module_jars:
            print "[DEBUG] TouchTest : Will also process %s" % module_jar
            classpath = classpath + classpath_separator + module_jar

        print "[DEBUG] TouchTest : Installing TouchTest Driver for Android"

        print "[DEBUG] TouchTest : Preparing libraries"
        print "[DEBUG] TouchTest : Using classpath %s" % classpath

        createBackup("titanium")
        createBackup("modules/titanium-ui")

        step = 0
        try:
            step = 1
            instrument(classpath, "titanium")
            step = 2
            instrument(classpath, "modules/titanium-ui")
            step = 3
            for module_jar in module_jars:
                instrumentExternalJars(classpath, module_jar)

            merge()
            print "[DEBUG] TouchTest : TouchTest Driver for Android installed"

        except:
            print "[ERROR] TouchTest : Unexpected error:", sys.exc_info()[0], sys.exc_info()[1], sys.exc_info()[2], "- step ", str(step)
            print "[ERROR] TouchTest : Exception occured. Restoring Titanium jar files."
            restore("titanium")
            restore("modules/titanium-ui")
            print "[ERROR] TouchTest : TouchTest Driver was not installed."

def postbuild():
    finalize()

def findAndroidModuleJars(modules):
    module_jars = []

    # Iterate through all available modules
    for module in modules:

        # Ignore the Module if it is not for android platform
        if module['platform'] != 'android':
            continue

        # Ignore the TouchTest module
        if module['id'] == 'com.soasta.touchtest':
            continue
        
        # Ignore the module if it's been blacklisted
        if blacklist is not None:
          module_name = "'" + module['id'] + "'"
          if module_name in blacklist:
            print "[DEBUG] TouchTest : Module " + module_name + " has been blacklisted, skipping this module for processing."
            continue

        # Does the module support the current deploy_type?
        # We need to validate that the deploy-type key actually is present in the module.
        # Because deploy-type key is not present on Titanium SDK before 3.0
        if 'deploy-type' in module.keys():
            if not module['deploy-type'] in ['', deploy_type]:
                continue

        # We will check if the module version is empty, if yes, we need to pick the most recent version available
        moduleVersion = module['version']
        if not module['version']:
            print "[DEBUG] TouchTest : Version number for Module " + module['id'] + " was not found. Will search for the latest version."
            moduleVersion = getModuleVersion(module)
            if moduleVersion == None:
                print "[DEBUG] TouchTest : No recent versions of Module " + module['id'] + " were found. Skipping this module."
                continue

        # Obtain module directory path
        modulePath = getModulePath(module, moduleVersion)
        if not modulePath:
            print "[DEBUG] TouchTest : Module " + module['id'] + " not found, skipping the module."
            continue

        # We will create a copy of the module directory with a suffix .touchtest
        # Thus, if the current module directory is module/1.1, the copy will be module/1.1.touchtest
        module['version'] = moduleVersion + ".touchtest"
        modulePathTouchTest = modulePath + ".touchtest"

        # If the backup directory already exists from the previous build, clean it up now
        if os.path.exists(modulePathTouchTest):
            shutil.rmtree(modulePathTouchTest)

        shutil.copytree(modulePath, modulePathTouchTest)
        touchtest_module_dir_created.append(modulePathTouchTest)

        # Set the new value of module directory (copy we just created), this will be used for weaving module jars
        modulePath = modulePathTouchTest

        # Find all files in the Module directory and make a list of all the jar files we need to weave
        filesInModuleDir = [ file for file in listdir(modulePath) if isfile(join(modulePath,file)) ]
        for file in filesInModuleDir:
            fileName, fileExtension = os.path.splitext(file)
            if fileExtension == ".jar":
                module_jars.append(modulePath + "/" + str(file))

        # Find all files in the module/lib directory and append all jar files to the list of jar files we need to weave
        libDir = modulePath + "/lib"
        if os.path.exists(libDir):
            filesInLibDir = [ file for file in listdir(libDir) if isfile(join(libDir,file)) ]

            for file in filesInLibDir:
                fileName, fileExtension = os.path.splitext(file)
                if fileExtension == ".jar":
                    module_jars.append(libDir + "/" + str(file))
                    if not os.path.exists(modulePathTouchTest):
                        os.makedirs(modulePathTouchTest)

    # Return the list of jar file we need to weave
    return module_jars

def getModuleVersion(module):

    # The idea here is to find the most recent version of the module present either in Project
    # directory or the SDK directory
    # So we will iterate both project and SDK directories and return the most recent version
    moduleDir = "/modules/android/" + module['id']
    versionDirList = []

    # Iterate through the module directory in project directory
    modulePath = project_dir + moduleDir

    # Build a list of all available versions
    if os.path.exists(modulePath):
        versionDirList = os.listdir(modulePath)

    # Iterate through the module directory in SDK directory
    modulePath = sdk_dir + moduleDir

    # Build a list of all available versions
    if os.path.exists(modulePath):
        versionDirList = versionDirList + os.listdir(modulePath)

    # Compare the major and minor version numbers with the latestVersion in store
    # and return the most recent version we find
    latestVersion = "0.0.0.0.0"
    for filename in versionDirList:
        versionNumbersList = filename.split('.')
        latestVersionNumbersList = latestVersion.split('.')

        for index in range(0, len(versionNumbersList)):
            try:
                if int(versionNumbersList[index]) > int(latestVersionNumbersList[index]):
                    latestVersion = filename
                    break
                elif int(versionNumbersList[index]) < int(latestVersionNumbersList[index]):
                    break
                elif int(versionNumbersList[index]) == int(latestVersionNumbersList[index]):
                    continue
            except ValueError:
                # If the directory name does not represent a version number, integer parsing will fail
                # We should skip the directory and continue
                continue

    # Return the latest version
    if latestVersion.split('.')[0] == "0":
        print "[DEBUG] TouchTest : No versions found for module " + module['id']
        return None
    else:
        print "[DEBUG] TouchTest : Latest Version for module " + module['id'] + " is " + latestVersion
        return latestVersion

def getModulePath(module, moduleVersion):

    # Create the module directory path assuming its in the project directory
    moduleDir = "/modules/android/" + module['id'] + "/" + moduleVersion
    modulePath = project_dir + moduleDir

    # Check if the module actually exists in the project directory
    if not os.path.exists(modulePath):
        print "[DEBUG] TouchTest : Module " + module['id'] + " does not exist in the Project directory."

        # Module does not exist in the project directory, try the SDK directory
        modulePath = sdk_dir + moduleDir

        # If the module doesn't exist in SDK directory either, skip it and continue
        if not os.path.exists(modulePath):
            return None
        else:
            print "[DEBUG] TouchTest : Module " + module['id'] + " found in the SDK directory."
            return modulePath
    else:
        return modulePath

def finalize():
    global restore_performed

    # This Plugin is only for the Android platform.
    if config['platform'] != 'android':
        return

    if moduleAvailable and restore_performed == False:

        print "[DEBUG] TouchTest : Restoring files changed during build."

        for dir in touchtest_module_dir_created:
            if os.path.exists(dir):
                shutil.rmtree(dir)

        restore("titanium")
        restore("modules/titanium-ui")
        restore_performed = True
        print "[DEBUG] TouchTest : The application is now TouchTest ready."

def createBackup(jar):

    jar_file = template_dir + "/" + jar + ".jar"
    jar_bak_file = jar_file + ".bak"

    if not os.path.exists(jar_bak_file):
        print "[DEBUG] TouchTest : Creating backup of file: {file}".format(file=jar_file)
        shutil.copy(jar_file, jar_bak_file)
    else:
        print "[DEBUG] TouchTest : Backpup already present: {file}".format(file=jar_file)
        shutil.copy(jar_file + ".bak", jar_file)

def restore(jar):

    jar_file = template_dir + "/" + jar + ".jar"

    print "[DEBUG] TouchTest : Restoring file: {file}".format(file=jar_file)
    shutil.copy(jar_file + ".bak", jar_file)
    os.remove(jar_file + ".bak")

def getBlackList():
  blacklist_file = touchtest_dir + "/blacklist.txt"
  
  blacklist_mod = []
  
  # Check to see if the file exists.  This shouldn't happen but if it does, we will act as if the
  # file was of size 0.
  if not os.path.exists(blacklist_file):
    return None
  elif os.path.getsize(blacklist_file) > 0:
    # Get the information out of the black list and ignore the modules with the specified names.
    with open(blacklist_file) as blackListFile:
      for line in blackListFile:
        # Skip the comments and empty lines
        if not line.strip() or line.strip().startswith("#"):
          continue
        blacklist_mod.append(`line.strip()`)
    # Joining the modules found into one long string to create the black list.
    # This way of creating the list came from: http://www.skymind.com/~ocrow/python_string/
    # which claimed that using the join was one of the fastest ways to concatenate
    # strings with the flexibility needed to exclude modules that are commented out.
    return ''.join(blacklist_mod)
  else:
    # There is nothing in the blacklist file so there's nothing to check.
    return None

def instrument(classpath, jar):

    if not os.path.exists(template_dir + "/touchtest/"):
        os.makedirs(template_dir + "/touchtest/")

    inpath = template_dir + "/" + jar + ".jar.bak"
    print "[DEBUG] TouchTest : Process %s " % inpath
    aspectpath = jar_dir + "TouchTestDriver.jar" + classpath_separator + jar_dir + "TouchTestDriver-Titanium.jar"
    outjar = template_dir + "/" + jar + ".jar"

    if os.path.exists(outjar):
        os.remove(outjar)

    weaveJar(classpath, inpath, aspectpath, outjar)

def instrumentExternalJars(classpath, jar):

    inpath = jar + ".original"
    shutil.copyfile(jar, inpath)

    print "[DEBUG] TouchTest : Processing %s " % jar
    aspectpath = jar_dir + "TouchTestDriver.jar" + classpath_separator + jar_dir + "TouchTestDriver-Titanium.jar"
    outjar = jar

    if os.path.exists(outjar):
        os.remove(outjar)

    try:
        weaveJar(classpath, inpath, aspectpath, outjar)
    except:
        # Jar weaving failed, restore the jar file
        print "[ERROR] TouchTest : Unexpected error:", sys.exc_info()[0], sys.exc_info()[1], sys.exc_info()[2]
        print "[ERROR] TouchTest : Exception occured. Restoring " + jar + " file."
        shutil.copyfile(inpath, jar)

    if os.path.exists(inpath):
        os.remove(inpath)

def weaveJar(classpath, inpath, aspectpath, outjar):

    param = "-Xlint:ignore -inpath \"" + inpath + "\" -aspectpath \"" + aspectpath + "\" -outjar \"" + outjar + "\" -cp \"" + classpath + "\""

    # Weave aspects into jar files
    ajc = [];
    ajc.append("java")
    ajc.append("-classpath")
    ajc.append(classpath)
    ajc.append("-Xmx256M")
    ajc.append("org.aspectj.tools.ajc.Main")
    ajc.append("-Xlint:ignore")
    ajc.append("-inpath")
    ajc.append(inpath)
    ajc.append("-aspectpath")
    ajc.append(aspectpath)
    ajc.append("-outjar")
    ajc.append(outjar)
    print "[DEBUG] TouchTest :   Using %s " % param
    sys.stdout.flush()
    subprocess.call(ajc)
    print "[DEBUG] TouchTest : %s processed" % inpath

def mergeAll(jars, targetjar):

    # Create the new temporary JAR
    tmpjar = targetjar + ".tmp"
    if os.path.exists(tmpjar):
        os.remove(tmpjar)
    with zipfile.ZipFile(tmpjar, mode='a') as zMerged:
        for fname in jars:
            zf = zipfile.ZipFile(fname, 'r')
            for n in zf.namelist():
                zMerged.writestr(n, zf.open(n).read())

    if os.path.exists(targetjar):
        # Remove the target JAR
        os.remove(targetjar)

    # Rename to tmp JAR to target JAR
    shutil.move(tmpjar, targetjar)

def merge():

    print "[DEBUG] TouchTest : Add TouchTest capabilities in %s" % template_dir + "/titanium.jar"

    mergeAll([template_dir + "/titanium.jar",
              jar_dir + "aspectjrt.jar",
              jar_dir + "TouchTestDriver-APIv12.jar",
              jar_dir + "TouchTestDriver-APIv11.jar",
              jar_dir + "TouchTestDriver-Titanium.jar",
              jar_dir + "TouchTestDriver.jar"],
             template_dir + "/titanium.jar")

# Checks for the presence of TouchTest Android Module
def isAndroidModuleEnabled(modules, deploy_type):
    for module in modules:
        if module['platform'] == 'android' and module['id'] == 'com.soasta.touchtest':
            # We need to validate that the deploy-type key actually is present in the module.
            # Because deploy-type key is not present on Titanium SDK before 3.0
            if 'deploy-type' in module.keys():
                if module['deploy-type'] in ['', deploy_type]:
                    return True
                else:
                    continue
            else:
                return True
    return False
