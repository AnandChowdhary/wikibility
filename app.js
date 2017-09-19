var app = angular.module("wikibility", ["ngRoute"]);

app.config(function($routeProvider, $locationProvider) {
	$routeProvider.when("/", {
		templateUrl: "home.html",
		controller: "homeCtrl"
	}).when("/wiki/:slug", {
		templateUrl: "article.html",
		controller: "articleCtrl"
	});
	$locationProvider.html5Mode(true);
});

app.factory("wikiService", function($http, $sce) {
	var wikiService = {
		query: function(params) {
			var url = "https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=" + params.q + "&format=json&section=" + params.section;
			var trustedUrl = $sce.trustAsResourceUrl(url);
			return $http.jsonp(trustedUrl, { jsonpCallbackParam: "callback" });
		},
		nSections: function(params) {
			var url = "https://en.wikipedia.org/w/api.php?action=parse&page=" + params.q + "&prop=sections&format=json";
			var trustedUrl = $sce.trustAsResourceUrl(url);
			return $http.jsonp(trustedUrl, { jsonpCallbackParam: "callback" });
			
		}
	};
	return wikiService;
});

app.controller("homeCtrl", function($scope, $location) {
	$scope.searchArticle = function() {
		$location.path("/wiki/" + $scope.searchModel.replace(/ /g,"_"));
	};
});

app.controller("articleCtrl", function($scope, $routeParams, $sce, wikiService, $timeout) {
	wikiService.query({ q: $routeParams["slug"], section: 0 }).then(function(wikiData) {
		$scope.wikiTitle = wikiData.data.parse.title;
		$scope.wikiData = $sce.trustAsHtml(wikiData.data.parse.text["*"]);
		$timeout(function() {
			angular.element("sup").each(function() {
				$(this).html($(this).html().replace("[", "").replace("]", ""));
			});
		}, 1);
	});
	$scope.sectionsArray = [];
	wikiService.nSections({ q: $routeParams["slug"] }).then(function(data) {
		console.log(data.data.parse.sections);
		var count = 0;
		for (var i = 0; i < data.data.parse.sections.length - 1; i++) {
			if (data.data.parse.sections[i].toclevel === 1) {
				count++;
				$scope.sectionsArray.push({
					id: count,
					title: data.data.parse.sections[i].line,
					text: "Sample text"
				});
			}
		}
		var count2 = 0;
		for (var j = 0; j < $scope.sectionsArray.length; j++) {
			var a = j;
			wikiService.query({ q: $routeParams["slug"], section: $scope.sectionsArray[j].id }).then(function(wikiData) {
				var raw = wikiData.data.parse.text["*"];
				raw = raw.split("mw-headline")[1];
				raw = raw.split(">")[1];
				raw = raw.split("<")[0];
				for (var k = 0; k < $scope.sectionsArray.length; k++) {
					if ($scope.sectionsArray[k].title === raw) {
						$scope.sectionsArray[k].text = wikiData.data.parse.text["*"];
						count2++;
						if (count2 === $scope.sectionsArray.length) {
							console.log($scope.sectionsArray);
						}
					}
				}
			});
		}
	});
});