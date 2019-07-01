// JavaScript Document
"use strict";

app.constant('config', {
	serverHost: serverHost,
	webRoot: webRoot,
	requireLoginPage: requireLoginPage,
	afterLoginPage: afterLoginPage,
	dataServer: dataServer,
	
	uiTheme: theme,
	icon: icon,
	
	editMode: {
		None: 0,
		NUll: 1,
		
		Create: 5,
		Amend: 6,
		Delete: 7,
		View: 8,
		AmendAndDelete: 9,
		ImportExport: 10,
		Import: 11,
		Export: 12,
		
		Copy: 15,
		Fulllist: 20,
		Pageview: 21,
		Scrollview: 22
	},
	
	reservedPath: reservedPath,
	CookiesEffectivePath: CookiesEffectivePath,
    
    debugLog: {
        AllLogging: false,
        PageRecordsLimitDefault: true,
        LockControl: false,
        UnlockControl: false,
        TableStructureObtained: true,
		DirectiveFlow: false,
        ShowCallStack: false
    }
});

app.config(['config',
'$httpProvider',
'$locationProvider',
'$controllerProvider',
'$compileProvider',
'$filterProvider',
'$provide',
'$ocLazyLoadProvider',

'$urlRouterProvider',
'$stateProvider',

'LightboxProvider',

function(config, $httpProvider, $locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, $urlRouterProvider, $stateProvider, LightboxProvider) {
	config.test = "Keith";
	
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.defaults.headers.post['Accept'] = 'application/json, text/javascript';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
    // $httpProvider.defaults.headers.post['Access-Control-Max-Age'] = '1728000';
    // $httpProvider.defaults.headers.common['Access-Control-Max-Age'] = '1728000';
    $httpProvider.defaults.headers.common['Accept'] = 'application/json, text/javascript';
    $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
	$httpProvider.defaults.useXDomain = true;
	
	LightboxProvider.fullScreenMode = true;

	// this is important
	app.controller = $controllerProvider.register;
	app.directive = $compileProvider.directive;
	app.filter = $filterProvider.register;
	app.factory = $provide.factory;
	app.service = $provide.service;
	app.constant = $provide.constant;
	app.value = $provide.value;
	// this is important - End
	
	// third-party routing and loading controller before render the template
	/**
	 * for more details please study 
	 * https://oclazyload.readme.io/docs/with-your-router
	 * http://www.funnyant.com/angularjs-ui-router/
	 * https://github.com/ocombe/ocLazyLoad/issues/182
	 */
	$urlRouterProvider
	// redirect
	// .when('/legacy-route', {
	// 	redirectTo: '/'
	// })
	.otherwise('/Home');

	// AngularJS routing and anchor hash
	// https://stackoverflow.com/questions/30071821/angularjs-routing-and-anchor-hash
	// reference: https://stackoverflow.com/questions/13345927/angular-routing-overrides-href-behavior-utilized-by-tab-and-collapse-panel-plugi
	// $locationProvider.html5Mode(true);
	//   $locationProvider.html5Mode({
	// 	  enabled: false,
	// 	  requireBase: false,
	// 	  rewriteLinks: true
	// 	});
	// $locationProvider.hashPrefix('!');
	// e.g
	// <a href="#javascript" target="_self"
	// <a data-target="#javascript" for bootstrap controls

	var templateState = {
		name: "Home.pageName",
		url: "/urlName", // root route
		views: {
			"content": {
                templateUrl: 'templates.html',
                controller: 'templateCtrl'
			},
			resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
				loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				  // you can lazy load files for an existing module
				         return $ocLazyLoad.load('js/AppCtrl.js');
				}]
			}
		}
	}

	var homeState = {
		name: "Home",
		url: "/Home", // root route
		views: {
			"navmenu":{
				templateUrl: '../bank/navigation-menu.html',
			},
			"content": {
				templateUrl: '../bank/home.html',
				controller: 'homeController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load('./js/controller/home.js');
			}]
		}
	}
	var spec_01 = {
		name: "Home.spec01-sys-block-diagram",
		url: "/spec01-sys-block-diagram",
		views: {
			"content@": {
				templateUrl: '../bank/spec01-sys-block-diagram.html',
				caption: 'Optional caption',
                controller: 'specServerArchitectureController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load('./js/controller/spec01-sys-block-diagram.js');
			}]
		}
	}
	var spec_02 = {
		name: "Home.spec02-client-architecture",
		url: "/spec02-client-architecture",
		views: {
			"content@": {
				templateUrl: '../bank/spec02-client-architecture.html',
                controller: 'specClientArchitectureController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load('./js/controller/spec02-client-architecture.js');
			}]
		}
	}

	var bank_00 = {
		name: "Home.time-deposit-entry",
		url: "/time-deposit-entry",
		views: {
			"content@": {
				templateUrl: '../bank/time-deposit-entry.html',
				controller: 'updateTimeDepositController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load('./js/controller/time-deposit-entry.js');
			}]
		}
	}
	var bank_01 = {
		name: "Home.bank-maintenance",
		url: "/bank-maintenance",
		views: {
			"content@": {
				templateUrl: '../bank/bank-maintenance.html',
				controller: 'updateBankController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load(['./js/controller/bank-maintenance.js'],{cache: false});
			}]
		}
	}
	var bank_02 = {
		name: "Home.currency-maintenance",
		url: "/currency-maintenance",
		views: {
			"content@": {
				templateUrl: '../bank/currency-maintenance.html',
				controller: 'updateCurrencyController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load(['./js/controller/currency-maintenance.js'],{cache: false});
			}]
		}
	}
	var bank_03 = {
		name: "Home.holiday-maintenance",
		url: "/holiday-maintenance",
		views: {
			"content@": {
				templateUrl: '../bank/holiday-maintenance.html',
				controller: 'updateHolidayController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load(['./js/controller/holiday-maintenance.js'],{cache: false});
			}]
		}
	}
	var bank_04 = {
		name: "Home.view-calendar",
		url: "/view-calendar",
		views: {
			"content@": {
				templateUrl: '../bank/view-calendar.html',
				controller: 'viewCalendarController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load(['./js/controller/view-calendar.js'],{cache: false});
			}]
		}
	}
	var bank_05 = {
		name: "Home.exchange-rate-entry",
		url: "/exchange-rate-entry",
		views: {
			"content@": {
				templateUrl: '../bank/exchange-rate-entry.html',
				controller: 'updateExchangeRateController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load(['./js/controller/exchange-rate-entry.js'],{cache: false});
			}]
		}
	}
	var bank_06 = {
		name: "Home.bank-account-entry",
		url: "/bank-account-entry",
		views: {
			"content@": {
				templateUrl: '../bank/bank-account-entry.html',
				controller: 'updateBankAccountController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load(['./js/controller/bank-account-entry.js'],{cache: false});
			}]
		}
	}
	var bank_07 = {
		name: "Home.sal-entry",
		url: "/sal-entry",
		views: {
			"content@": {
				templateUrl: '../bank/saving-assets-liabilities-entry.html',
				controller: 'updateSALController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load(['./js/controller/saving-assets-liabilities-entry.js'],{cache: false});
			}]
		}
	}
    
	var bank_08 = {
		name: "Home.foreign-currency-entry",
		url: "/foreign-currency-entry",
		views: {
			"content@": {
				templateUrl: '../bank/foreign-currency-entry.html',
				controller: 'updateForeignCurrencyController'
			}
        },
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load(['./js/controller/foreign-currency-entry.js'],{cache: false});
			}]
		}
	}
	var bank_09 = {
		name: "Home.09directive-process",
		url: "/09directive-process",
		views: {
			"content@": {
				templateUrl: '../bank/09directive-process.html',
			}
		}
	}
    
    
	var bank_10 = {
		name: "Home.import-export-master",
		url: "/import-export-master",
		views: {
			"content@": {
				templateUrl: '../bank/import-export-master.html',
				controller: 'imExMasterController'
			}
        },
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load(['./js/controller/import-export-master.js'],{cache: false});
			}]
		}
	}
	var bank_11 = {
		name: "Home.import-iso4217",
		url: "/import-iso4217",
		views: {
			"content@": {
				templateUrl: '../bank/import-iso4217-currency.html',
                controller: 'imISO4217Controller'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load('./js/controller/import-iso4217.js');
			}]
		}
	}
	var bank_12 = {
		name: "Home.import-export-time-deposit",
		url: "/import-export-time-deposit",
		views: {
			"content@": {
				templateUrl: '../bank/import-export-time-deposit.html',
                controller: 'imTimeDepositController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load('./js/controller/import-export-time-deposit.js');
			}]
		}
	}
	var bank_13 = {
		name: "Home.schedule-task",
		url: "/schedule-task",
		views: {
			"content@": {
				templateUrl: '../bank/schedule-task.html',
                controller: 'scheduleTaskController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load('./js/controller/schedule-task.js');
			}]
		}
	}
	var bank_14 = {
		name: "Home.schedule-log",
		url: "/schedule-log",
		views: {
			"content@": {
				templateUrl: '../bank/schedule-log.html',
                controller: 'scheduleLogController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load('./js/controller/schedule-log.js');
			}]
		}
	}
	var bank_15 = {
		name: "Home.schedulable-program",
		url: "/schedulable-program",
		views: {
			"content@": {
				templateUrl: '../bank/schedulable-program.html',
                controller: 'schedulableProgramController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load('./js/controller/schedulable-program.js');
			}]
		}
	}
	var bank_16 = {
		name: "Home.import-export-foreign-currency",
		url: "/import-export-foreign-currency",
		views: {
			"content@": {
				templateUrl: '../bank/import-export-foreign-currency.html',
                controller: 'imForeignCurrencyController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load('./js/controller/import-export-foreign-currency.js');
			}]
		}
	}
	var bank_20 = {
		name: "Home.export-database",
		url: "/export-database",
		views: {
			"content@": {
				templateUrl: '../bank/export-database.html',
                controller: 'exPIMSDatabaseController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load('./js/controller/export-database.js');
			}]
		}
	}
	var bank_21 = {
		name: "Home.21create-staff-profile",
		url: "/21create-staff-profile",
		views: {
			"content@": {
				templateUrl: '../bank/21create-staff-profile.html',
                controller: 'staffProfileCreateController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load('./js/controller/21create-staff-profile.js');
			}]
		}
	}
	var bank_23 = {
		name: "Home.update-log",
		url: "/update-log",
		views: {
			"content@": {
				templateUrl: '../bank/update-log.html',
                controller: 'updateLogController'
			}
		},
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load('./js/controller/update-log.js');
			}]
		}
	}
	$stateProvider.state(homeState);
	// $stateProvider.state(spec_01);
	// $stateProvider.state(spec_02);
	$stateProvider.state(bank_00);
	$stateProvider.state(bank_01);
	$stateProvider.state(bank_02);
	$stateProvider.state(bank_03);
	$stateProvider.state(bank_04, {cache: false});
	$stateProvider.state(bank_05);
	$stateProvider.state(bank_06);
	$stateProvider.state(bank_07);
	$stateProvider.state(bank_08);
	$stateProvider.state(bank_09);
	$stateProvider.state(bank_10);
	$stateProvider.state(bank_11);
	$stateProvider.state(bank_12);
	$stateProvider.state(bank_13);
	$stateProvider.state(bank_14);
	$stateProvider.state(bank_15);
	$stateProvider.state(bank_16);
	$stateProvider.state(bank_20);
	$stateProvider.state(bank_21);
	$stateProvider.state(bank_23);

}]);