/*
* This file contains the app configuration and exports configuration variables
* 
*/

// Container for all env
var environments = {};

// Staging (default) evn
environments.staging = {
	'httpPort' : 4000,
	'httpsPort' : 4001,
	'envName' : 'staging'
};

// Production env
environments.production = {
	'httpPort' : 5000,
	'httpsPort' : 5001,
	'envName' : 'prodcution'
};

// Determine which env was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the env is one of the evns above, if not, default to staging
var environtmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environtmentToExport;