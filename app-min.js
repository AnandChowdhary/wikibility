var app=angular.module("wikibility",["ngRoute"]);app.config(function(t,a){t.when("/",{templateUrl:"home.html",controller:"homeCtrl"}).when("/wiki/:slug",{templateUrl:"article.html",controller:"articleCtrl"}),a.html5Mode(!0)}),app.factory("wikiService",function(t,a){var e={query:function(e){var r="https://en.wikipedia.org/w/api.php?action=parse&prop=text&page="+e.q+"&format=json&section="+e.section,n=a.trustAsResourceUrl(r);return t.jsonp(n,{jsonpCallbackParam:"callback"})},article:function(e){var r="https://en.wikipedia.org/w/api.php?action=parse&prop=text&page="+e.q+"&format=json",n=a.trustAsResourceUrl(r);return t.jsonp(n,{jsonpCallbackParam:"callback"})},nSections:function(e){var r="https://en.wikipedia.org/w/api.php?action=parse&page="+e.q+"&prop=sections&format=json",n=a.trustAsResourceUrl(r);return t.jsonp(n,{jsonpCallbackParam:"callback"})}};return e}),app.controller("homeCtrl",function(t,a){t.searchArticle=function(){a.path("/wiki/"+t.searchModel.replace(/ /g,"_"))}}),app.controller("articleCtrl",function(t,a,e,r,n){r.query({q:a.slug,section:0}).then(function(a){t.wikiTitle=a.data.parse.title,t.wikiData=e.trustAsHtml(a.data.parse.text["*"]),n(function(){angular.element("sup").each(function(){$(this).find("a").html("")})},1)}),r.article({q:a.slug}).then(function(a){var r=a.data.parse.text["*"].split('<div id="toc" class="toc">')[1];t.sections=e.trustAsHtml(r)})});
//# sourceMappingURL=./app-min.js.map