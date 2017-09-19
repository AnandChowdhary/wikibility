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
		article: function(params) {
			var url = "https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=" + params.q + "&format=json";
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
				$(this).find("a").html("");
			});
		}, 1);
	});
	wikiService.article({ q: $routeParams["slug"] }).then(function(wikiData) {
		var p = wikiData.data.parse.text["*"].split('<div id="toc" class="toc">')[1];
		//p = p.split("</ul>")[1];
		$scope.sections = $sce.trustAsHtml(p);
	});
	/*$scope.sectionsArray = [];
	wikiService.nSections({ q: $routeParams["slug"] }).then(function(data) {
		var count = 0;
		console.log(data.data.parse.sections);
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
				console.log(raw);
				raw = raw.split("mw-headline")[1];
				raw = raw.split(">")[1];
				raw = raw.split("<")[0];
				for (var k = 0; k < $scope.sectionsArray.length; k++) {
					if ($scope.sectionsArray[k].title === raw) {
						$scope.sectionsArray[k].text = wikiData.data.parse.text["*"];
						count2++;
						if (count2 === $scope.sectionsArray.length) {
							var p = "";
							for (var l = 0; l < $scope.sectionsArray.length; l++) {
								p += $scope.sectionsArray[l].text;
							}
							$scope.sections = $sce.trustAsHtml(p);
							$timeout(function() {
								var g = 0;
								angular.element("sup").each(function() {
									g++;
									$(this).find("a").html(g);
									$(this).find("a").attr("href", "#cite_note-" + g);
								});
							}, 1);
						}
					}
				}
			});
		}
	});*/
});