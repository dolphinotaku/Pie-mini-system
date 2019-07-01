angular.module('ngCRUD.config', []).
	constant('config', {
		serverHost: serverHost,
		webRoot: webRoot,
		requireLoginPage: requireLoginPage,
		afterLoginPage: afterLoginPage,
		dataServer: dataServer,
		
		uiTheme: theme,
		
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
		
		displayView: {
			listView: 'list',
			tileView: 'tile',
			scrollView: 'scroll'
		},
		defaultInquiryDisplay: 'list',
		
		debugLog: {
			AllLogging: false,
			PageRecordsLimitDefault: true,
			LockControl: false,
			UnlockControl: false,
			TableStructureObtained: true,
			DirectiveFlow: false,
			ShowCallStack: false
		}
	}).
	value('config123', {
		debug: true
	}).
	config(['$httpProvider', '$compileProvider', function($httpProvider, $compileProvider){
		
		delete $httpProvider.defaults.headers.common['X-Requested-With'];
		$httpProvider.defaults.headers.post['Accept'] = 'application/json, text/javascript';
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
		// $httpProvider.defaults.headers.post['Access-Control-Max-Age'] = '1728000';
		// $httpProvider.defaults.headers.common['Access-Control-Max-Age'] = '1728000';
		$httpProvider.defaults.headers.common['Accept'] = 'application/json, text/javascript';
		$httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
		$httpProvider.defaults.useXDomain = true;
		
		//if (angular.isDefined($compileProvider.urlSanitizationWhitelist)) {
		//	$compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|data):/);
		//} else {
		//	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|data):/);
		//}
	}]);

// Modules
angular.module('ngCRUD.directives', [
	'ngCRUD.directives.inquiry'
]);
angular.module('ngCRUD', [
	'ngCRUD.directives'
]);