/* eslint no-var: "error" */
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
		/*nSections: function(params) {
			var url = "https://en.wikipedia.org/w/api.php?action=parse&page=" + params.q + "&prop=sections&format=json";
			var trustedUrl = $sce.trustAsResourceUrl(url);
			return $http.jsonp(trustedUrl, { jsonpCallbackParam: "callback" });
		},*/
		search: function(params) {
			var url = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + params.q + "&utf8=&format=json";
			var trustedUrl = $sce.trustAsResourceUrl(url);
			return $http.jsonp(trustedUrl, { jsonpCallbackParam: "callback" });
		}
	};
	return wikiService;
});

app.controller("homeCtrl", function($scope, $location, wikiService) {
	$scope.searchArticle = function() {
		$location.path("/wiki/" + $scope.searchModel.replace(/ /g, "_"));
	};
	$scope.searchWiki = function() {
		if ($scope.searchModel !== undefined) {
			wikiService.search({ q: $scope.searchModel, section: 0 }).then(function(wikiData) {
				$scope.searchResults = wikiData.data.query.search;
			});
		}
	}
});

app.controller("articleCtrl", function($scope, $routeParams, $sce, wikiService, $timeout, $location) {

    document.getElementById("paradeiser-dropdown").addEventListener("click", function(event){
        event.preventDefault();
        document.getElementById("paradeiser-more").classList.toggle("open");
    });

    document.getElementById("greybox").addEventListener("click", function(event){
        event.preventDefault();
        document.getElementById("paradeiser-more").classList.remove("open");
    });

    var myElement = document.querySelector(".paradeiser");
    var headroom  = new Headroom(myElement, {
        tolerance : 5,
        onUnpin : function() {
            document.getElementById("paradeiser-more").classList.remove("open");
        }
    });
	headroom.init();

	wikiService.query({ q: $routeParams["slug"], section: 0 }).then(function(wikiData) {
		wikiService.article({ q: $routeParams["slug"] }).then(function(wikiData) {
			var p = wikiData.data.parse.text["*"].split('<div id="toc" class="toc">')[1];
			$scope.sections = $sce.trustAsHtml(p);
			$timeout(function() {
				if (angular.element("#redirectMsg")) {
					$location.path(angular.element(".redirectText a").attr("href"));
				}
				smartquotes();
				var g = 0;
				angular.element("sup").each(function() {
					g++;
					$(this).find("a").html(g);
					$(this).find("a").attr("href", "#cite_note-" + g);
					$(this).mouseover(function() {
						$(".ref-tooltip").fadeIn(200);
						$(".ref-tooltip").css("left", $(this).offset().left + "px");
						$(".ref-tooltip").css("top", ($(this).offset().top + 25) + "px");
						$(".ref-tooltip").html(angular.element($(this).find("a").attr("href")).html());
					});
					$(this).mouseout(function() {
						$(".ref-tooltip").fadeOut(200);
					});
				});
				angular.element("a").each(function() {
					var a = new RegExp("/" + window.location.host + "/");
					if(!a.test(this.href)) {
						$(this).attr("target", "_blank");
					}
				 });
			}, 1);
		});
		$scope.wikiTitle = wikiData.data.parse.title;
		$scope.wikiData = $sce.trustAsHtml(wikiData.data.parse.text["*"]);
		$timeout(function() {
			smartquotes();
			angular.element("sup").each(function() {
				$(this).find("a").html("");
			});
		}, 1);
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

app.filter("wikipediafy", function() {
	return function(str) {
		return str.replace(/ /g, "_");
	};
});