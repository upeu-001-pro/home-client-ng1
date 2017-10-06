/**
 * home_web - Un cliente resource server asegurado con OAuth2
 * @author practian
 * @version v1.0.0
 * @link 
 * @license ISC
 */
var app = angular.module("home", [ "ui.router", "ngResource", "ngAnimate", "ngAria", "ngSanitize", "ngMaterial", "ngMdIcons", "toastr", "ngMessages", "pi.oauth2", "pi.appPagination", "pi.tableResponsive" ]);

app.constant("authUrl", "https://upeuauth-serve.herokuapp.com");

app.constant("apiUrl", "http://localhost:8003");

app.constant("homeUrl", "http://localhost:9001");

app.config(function($mdThemingProvider) {
    $mdThemingProvider.definePalette("amazingPaletteName", {
        "50": "ffebee",
        "100": "ffcdd2",
        "200": "ef9a9a",
        "300": "e57373",
        "400": "ef5350",
        "500": "f44336",
        "600": "e53935",
        "700": "d32f2f",
        "800": "c62828",
        "900": "b71c1c",
        A100: "ff8a80",
        A200: "ff5252",
        A400: "ff1744",
        A700: "d50000",
        contrastDefaultColor: "light",
        contrastDarkColors: [ "50", "100", "200", "300", "400", "A100" ],
        contrastLightColors: undefined
    });
    $mdThemingProvider.theme("default").primaryPalette("amazingPaletteName");
    $mdThemingProvider.theme("docs-dark").primaryPalette("grey").warnPalette("red").accentPalette("blue").dark();
    $mdThemingProvider.theme("altTheme").primaryPalette("purple");
    var neonRedMap = $mdThemingProvider.extendPalette("red", {
        "500": "#ff0000",
        contrastDefaultColor: "dark"
    });
    $mdThemingProvider.definePalette("neonRed", neonRedMap);
    $mdThemingProvider.theme("panelTheme").primaryPalette("neonRed").dark();
});

app.config(function($mdThemingProvider) {
    $mdThemingProvider.alwaysWatchTheme(true);
});

app.config(function($mdIconProvider, $$mdSvgRegistry) {
    $mdIconProvider.icon("md-close", $$mdSvgRegistry.mdClose).icon("md-menu", $$mdSvgRegistry.mdMenu).icon("md-toggle-arrow", $$mdSvgRegistry.mdToggleArrow);
}).config(function($httpProvider) {
    $httpProvider.interceptors.push("oauth2InterceptorService");
}).config(function($resourceProvider) {
    $resourceProvider.defaults.stripTrailingSlashes = false;
}).config(function($mdDateLocaleProvider, $provide) {
    $mdDateLocaleProvider.shortDays = [ "Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa" ];
    $mdDateLocaleProvider.firstDayOfWeek = 0;
    $mdDateLocaleProvider.parseDate = function(dateString) {
        var m = moment(dateString, "DD/MM/YYYY", true);
        return m.isValid() ? m.toDate() : new Date(NaN);
    };
    $mdDateLocaleProvider.formatDate = function(date) {
        if (angular.isDate(date)) {
            var m = moment(date);
            return m.isValid() ? m.format("DD/MM/YYYY") : "";
        }
        return "";
    };
}).config(function($stateProvider, $urlRouterProvider, $locationProvider, ROUTERS) {
    $urlRouterProvider.otherwise("/home");
    $stateProvider.state("home", {
        url: "",
        views: {
            "": {
                templateUrl: "dist/views/layouts/home_layuot.html"
            }
        },
        loginRequired: false
    }).state("home.home", {
        url: "/home",
        data: {
            page: "Home"
        },
        templateUrl: "dist/views/home.html",
        loginRequired: false
    }).state("home.voucher", {
        url: "/voucher",
        data: {
            page: "Voucher"
        },
        templateUrl: "/dist/views/layouts/voucher.html",
        controller: "VoucherCtrl",
        loginRequired: true
    }).state("home.login", {
        url: "/login/?next",
        data: {
            page: "Login"
        },
        templateUrl: "/dist/views/layouts/login.html",
        controller: "LoginCtrl"
    }).state("home.logout", {
        url: "/logout",
        data: {
            page: "Logout"
        },
        templateUrl: "/dist/views/layouts/logout.html",
        controller: "LogoutCtrl"
    });
    ROUTERS.forEach(function(collection) {
        for (var routeName in collection) {
            $stateProvider.state(routeName, collection[routeName]);
        }
    });
});

app.service("userService", function() {
    return {
        userName: null
    };
});

app.run(function($rootScope, $state, $stateParams, $window) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
}).run(function($rootScope, userService) {
    $rootScope.userService = userService;
}).run(function(oauth2Service, $state, $rootScope, $location, authUrl, $window, userService) {
    oauth2Service.loginUrl = authUrl + "/o/authorize/";
    oauth2Service.oidcUrl = authUrl + "/api/oauth2_backend/localuserinfo/";
    console.log("location.origin=" + location.origin);
    oauth2Service.clientId = "KBszLKA46J3hd2xzs1oGgRXftPH8tswTI47uMif5";
    oauth2Service.scope = "home";
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        console.log("$stateChangeStart isAauthenticated=" + oauth2Service.isAauthenticated());
        if (toState.loginRequired && !oauth2Service.isAauthenticated()) {
            console.log("DENY");
            event.preventDefault();
            var stateUrl = $state.href(toState, toParams);
            console.log("stateUrl=" + stateUrl);
            console.log("window.location.hash=" + window.location.hash);
            oauth2Service.createLoginUrl(stateUrl).then(function(url) {
                console.log("scope.statea=" + stateUrl);
                console.log("urla=" + url);
                $window.location = url;
            }).catch(function(error) {
                console.log("createLoginUrl error");
                console.log(error);
                throw error;
            });
        }
        if (!oauth2Service.isAauthenticated()) {
            console.log("Desconectado");
            userService.userName = null;
        }
    });
    if (oauth2Service.isAauthenticated() || oauth2Service.tryLogin()) {
        console.log(" ... || oauth2Service.tryLogin() ");
        if (oauth2Service.state) {
            console.log("oauth2Service.state=" + oauth2Service.state);
            $location.url(oauth2Service.state.substr(1));
        }
    }
    $rootScope.$on("$stateChangeSuccess", function() {
        console.log("$stateChangeSuccess isAauthenticated=" + oauth2Service.isAauthenticated());
        if (oauth2Service.isAauthenticated() && oauth2Service.getIdentityClaims()) {
            var userData = oauth2Service.getIdentityClaims();
            console.log("userData " + JSON.stringify(userData));
            userService.userName = userData.username;
        }
        if (oauth2Service.getRouters()) {
            var routers = oauth2Service.getRouters();
            console.log("routers " + JSON.stringify(routers));
        }
    });
    $rootScope.$on("loginRequired", function() {
        console.log("emit loginRequired ");
    });
});

var ejemplo = {
    "estado.nombre": {
        url: "/url",
        data: {
            section: "Menu name",
            page: "Menu item name"
        },
        templateUrl: "distname_web_dists/distname_web/views/model/index.html"
    }
};

app.constant("ROUTERS", [ {
    "home.catalogo": {
        url: "/catalogo",
        template: "<div ui-view ></div>"
    },
    "home.dashboard": {
        url: "/dashboard",
        data: {
            page: "Dashboard"
        },
        views: {
            "": {
                templateUrl: "dist/views/layouts/dashboard.wall.html"
            }
        }
    }
}, {
    "home.catalogo.categorias": {
        url: "/categorias",
        data: {
            section: "Catálogo",
            page: "Categorías"
        },
        templateUrl: "dist/views/categorias/index.html",
        loginRequired: true
    },
    "catalogo.catalogo.categoriasNew": {
        url: "/categorias/new",
        data: {
            section: "Catálogo",
            page: "Categorías"
        },
        templateUrl: "dist/views/categorias/form.html"
    },
    "catalogo.catalogo.categoriasEdit": {
        url: "/categorias/:id/edit",
        data: {
            section: "Catálogo",
            page: "Categorías"
        },
        templateUrl: "dist/views/categorias/form.html"
    }
}, {
    "home.catalogo.autores": {
        url: "/autores",
        data: {
            section: "Catálogo",
            page: "Autores"
        },
        templateUrl: "dist/views/autores/index.html"
    },
    "catalogo.catalogo.autoresNew": {
        url: "/autores/new",
        data: {
            section: "Catálogo",
            page: "Autores"
        },
        templateUrl: "dist/views/autores/form.html"
    },
    "catalogo.catalogo.autoresEdit": {
        url: "/autores/:id/edit",
        data: {
            section: "Catálogo",
            page: "Autores"
        },
        templateUrl: "dist/views/autores/form.html"
    }
} ]);

app.controller("AutorCtrl", function($scope, $state, $stateParams, catalogoService, $window, $mdDialog, $log, toastr, $filter) {
    $scope.fields = "nombre";
    var params = {};
    $scope.lista = [];
    $scope.autor = {};
    $scope.list = function(params) {
        $scope.isLoading = true;
        catalogoService.Autor.query(params, function(r) {
            $scope.lista = r.results;
            $scope.options = r.options;
            $scope.isLoading = false;
        }, function(err) {
            $log.log("Error in list:" + JSON.stringify(err));
            toastr.error(err.data.results.detail, err.status + " " + err.statusText);
        });
    };
    $scope.list(params);
    $scope.buscar = function() {
        params.page = 1;
        params.fields = $scope.fields;
        params.query = $scope.query;
        $scope.list(params);
    };
    $scope.onReorder = function(order) {
        $log.log("Order: " + order);
    };
    $scope.delete = function(d) {
        if ($window.confirm("Seguro?")) {
            catalogoService.Autor.delete({
                id: d.id
            }, function(r) {
                $log.log("Se eliminó autor:" + JSON.stringify(d));
                toastr.success("Se eliminó autor " + d.nombre, "Autor");
                $scope.list(params);
            }, function(err) {
                $log.log("Error in delete:" + JSON.stringify(err));
                toastr.error(err.data.detail, err.status + " " + err.statusText);
            });
        }
    };
}).controller("AutorSaveCtrl", function($scope, $state, $stateParams, catalogoService, $window, $mdDialog, $log, toastr, $filter) {
    $scope.autor = {};
    $scope.sel = function() {
        catalogoService.Autor.get({
            id: $stateParams.id
        }, function(r) {
            $scope.autor = r;
            if (r.fecha_nac) $scope.autor.fecha_nacT = new Date($filter("date")(r.fecha_nac));
        }, function(err) {
            $log.log("Error in get:" + JSON.stringify(err));
            toastr.error(err.data.detail, err.status + " " + err.statusText);
        });
    };
    if ($stateParams.id) {
        $scope.sel();
    }
    $scope.save = function() {
        if ($scope.autor.fecha_nacT) {
            $scope.autor.fecha_nac = $filter("date")(new Date($scope.autor.fecha_nacT), "yyyy-MM-dd");
        }
        if ($scope.autor.id) {
            catalogoService.Autor.update({
                id: $scope.autor.id
            }, $scope.autor, function(r) {
                $log.log("r: " + JSON.stringify(r));
                toastr.success("Se editó autor " + r.nombre, "Autor");
                $state.go("catalogo.catalogo.autores");
            }, function(err) {
                $log.log("Error in update:" + JSON.stringify(err));
                toastr.error(err.data.detail, err.status + "wwwwwwwwwwwww " + err.statusText);
            });
        } else {
            catalogoService.Autor.save($scope.autor, function(r) {
                $log.log("r: " + JSON.stringify(r));
                toastr.success("Se insertó autor " + r.nombre, "Autor");
                $state.go("catalogo.catalogo.autores");
            }, function(err) {
                $log.log("Error in save:" + JSON.stringify(err));
                toastr.error(err.data.detail, err.status + " " + err.statusText);
            });
        }
    };
    $scope.cancel = function() {
        $state.go("catalogo.catalogo.autores");
    };
});

app.controller("CategoriaCtrl", function($scope, $state, $stateParams, catalogoService, $window, $mdDialog, $log, toastr) {
    $scope.fields = "name,codename";
    var params = {};
    $scope.lista = [];
    $scope.categoria = {};
    $scope.list = function(params) {
        $scope.isLoading = true;
        catalogoService.Categoria.query(params, function(r) {
            $scope.lista = r;
            $scope.isLoading = false;
        }, function(err) {
            $log.log("Error in list:" + JSON.stringify(err));
            toastr.error(err.data.results.detail, err.status + " " + err.statusText);
        });
    };
    $scope.list(params);
    $scope.buscar = function() {
        params.page = 1;
        params.fields = $scope.fields;
        params.query = $scope.query;
        $scope.list(params);
    };
    $scope.onReorder = function(order) {
        $log.log("Order: " + order);
    };
    $scope.delete = function(d) {
        if ($window.confirm("Seguro?")) {
            catalogoService.Categoria.delete({
                id: d.id
            }, function(r) {
                $log.log("Se eliminó la categoría:" + JSON.stringify(d));
                toastr.success("Se eliminó la categoría " + d.nombre, "Categoría");
                $scope.list(params);
            }, function(err) {
                $log.log("Error in delete:" + JSON.stringify(err));
                toastr.error(err.data.detail, err.status + " " + err.statusText);
            });
        }
    };
}).controller("CategoriaSaveCtrl", function($scope, $state, $stateParams, catalogoService, $window, $mdDialog, $log, toastr) {
    $scope.categoria = {};
    $scope.sel = function() {
        catalogoService.Categoria.get({
            id: $stateParams.id
        }, function(r) {
            $scope.categoria = r;
        }, function(err) {
            $log.log("Error in get:" + JSON.stringify(err));
            toastr.error(err.data.detail, err.status + " " + err.statusText);
        });
    };
    if ($stateParams.id) {
        $scope.sel();
    }
    $scope.save = function() {
        if ($scope.categoria.id) {
            catalogoService.Categoria.update({
                id: $scope.categoria.id
            }, $scope.categoria, function(r) {
                $log.log("r: " + JSON.stringify(r));
                toastr.success("Se editó la categoría " + r.nombre, "Categoría");
                $state.go("catalogo.catalogo.categorias");
            }, function(err) {
                $log.log("Error in update:" + JSON.stringify(err));
                toastr.error(err.data.detail, err.status + " " + err.statusText);
            });
        } else {
            catalogoService.Categoria.save($scope.categoria, function(r) {
                $log.log("r: " + JSON.stringify(r));
                toastr.success("Se insertó la categoría " + r.nombre, "Categoría");
                $state.go("catalogo.catalogo.categorias");
            }, function(err) {
                $log.log("Error in save:" + JSON.stringify(err));
                toastr.error(err.data.detail, err.status + " " + err.statusText);
            });
        }
    };
    $scope.cancel = function() {
        $state.go("catalogo.catalogo.categorias");
    };
});

app.controller("MainCtrl", function($scope, $timeout, $mdSidenav, $log, $rootScope, oauth2Service, homeUrl, authUrl, $window, $mdBottomSheet, $mdToast) {
    $scope.toggleLeft = buildDelayedToggler("left");
    $scope.toggleRight = buildToggler("right");
    $scope.asideFolded = false;
    $rootScope.$on("$stateChangeSuccess", function() {
        $timeout(function() {
            if (document.getElementById("left")) {
                $mdSidenav("left").close();
            }
        });
    });
    $scope.isOpenRight = function() {
        return $mdSidenav("right").isOpen();
    };
    function debounce(func, wait, context) {
        var timer;
        return function debounced() {
            var context = $scope, args = Array.prototype.slice.call(arguments);
            $timeout.cancel(timer);
            timer = $timeout(function() {
                timer = undefined;
                func.apply(context, args);
            }, wait || 10);
        };
    }
    function buildDelayedToggler(navID) {
        return debounce(function() {
            $mdSidenav(navID).toggle().then(function() {
                $log.debug("toggle " + navID + " is done");
            });
        }, 200);
    }
    function buildToggler(navID) {
        return function() {
            $mdSidenav(navID).toggle().then(function() {
                $log.debug("toggle " + navID + " is done");
            });
        };
    }
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
    $scope.setTheme = function(theme) {
        document.cookie = "theme=" + theme;
        $scope.dynamicTheme = theme;
        console.log("cookie dynamicTheme=" + getCookie("theme"));
    };
    $scope.dynamicTheme = getCookie("theme");
    $scope.app = {
        name: "Home App",
        version: "1.0.1"
    };
    $scope.logIn = function() {
        console.log("logIn");
        oauth2Service.createLoginUrl().then(function(url) {
            console.log("urla=" + url);
            $window.location = url;
        }).catch(function(error) {
            console.log("createLoginUrl error");
            console.log(error);
            throw error;
        });
    };
    $scope.logOut = function() {
        console.log("logOut");
        oauth2Service.logOut();
        $window.location = authUrl + "/accounts/logout/";
    };
    $scope.showApps = function() {
        console.log("showApps");
        $window.location = homeUrl;
    };
    $scope.showGridBottomSheet = function() {
        $scope.alert = "";
        $mdBottomSheet.show({
            templateUrl: "dist/views/bottom-sheet-grid-template.html",
            controller: "GridBottomSheetCtrl",
            clickOutsideToClose: true
        }).then(function(clickedItem) {});
    };
}).controller("LeftCtrl", function($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function() {
        $mdSidenav("left").close().then(function() {
            $log.debug("close LEFT is done");
        });
    };
}).controller("RightCtrl", function($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function() {
        $mdSidenav("right").close().then(function() {
            $log.debug("close RIGHT is done");
        });
    };
});

app.controller("VoucherCtrl", function($scope, $http, oauth2Service, authUrl) {
    $scope.model = {};
    $scope.model.message = "";
    $scope.model.buyVoucher = function() {
        $http.post(authUrl + "/api/voucher?betrag=150", null).then(function(result) {
            $scope.model.message = result.data;
        }).catch(function(message) {
            $scope.model.message = "Was not able to receive new voucher: " + message.status;
        });
    };
});

app.controller("LoginCtrl", function($scope, $stateParams, oauth2Service, $http) {
    $scope.next = $stateParams.next;
    console.log("next=" + $scope.next);
});

app.controller("LogoutCtrl", function(oauth2Service) {
    oauth2Service.logOut();
});

app.controller("BottomSheetExample", function($scope, $timeout, $mdBottomSheet, $mdToast) {
    $scope.alert = "";
    $scope.showListBottomSheet = function() {
        $scope.alert = "";
        $mdBottomSheet.show({
            templateUrl: "dist/views/bottom-sheet-list-template.html",
            controller: "ListBottomSheetCtrl"
        }).then(function(clickedItem) {});
    };
}).controller("ListBottomSheetCtrl", function($scope, $mdBottomSheet) {
    $scope.items = [ {
        name: "Share",
        icon: "share-arrow"
    }, {
        name: "Upload",
        icon: "upload"
    }, {
        name: "Copy",
        icon: "copy"
    }, {
        name: "Print this page",
        icon: "print"
    } ];
    $scope.listItemClick = function($index) {
        var clickedItem = $scope.items[$index];
        $mdBottomSheet.hide(clickedItem);
    };
}).controller("GridBottomSheetCtrl", function($scope, $mdBottomSheet, $window) {
    $scope.items = [ {
        name: "Home",
        icon: "home",
        url: "http://localhost:9001"
    }, {
        name: "Backend",
        icon: "hangout",
        url: "http://localhost:9002"
    }, {
        name: "Catálogo",
        icon: "mail",
        url: "http://localhost:9003"
    }, {
        name: "Message",
        icon: "message",
        url: "http://localhost:9004"
    }, {
        name: "Facebook",
        icon: "facebook",
        url: "http://localhost:9005"
    }, {
        name: "Twitter",
        icon: "twitter",
        url: "http://localhost:9006"
    }, {
        name: "Home",
        icon: "home",
        url: "http://localhost:9001"
    }, {
        name: "Backend",
        icon: "hangout",
        url: "http://localhost:9002"
    }, {
        name: "Catálogo",
        icon: "mail",
        url: "http://localhost:9003"
    }, {
        name: "Message",
        icon: "message",
        url: "http://localhost:9004"
    }, {
        name: "Facebook",
        icon: "facebook",
        url: "http://localhost:9005"
    }, {
        name: "Twitter",
        icon: "twitter",
        url: "http://localhost:9006"
    } ];
    $scope.listItemClick = function($index) {
        var clickedItem = $scope.items[$index];
        console.log("url=" + clickedItem.url);
        $window.location = clickedItem.url;
        $mdBottomSheet.hide(clickedItem);
    };
});

app.controller("ProductController", function($scope, $products, $mdMedia) {
    $scope.$mdMedia = $mdMedia;
    this.filterBy = "All Jackets";
    this.sortedBy = "Featured";
    this.availableFilters = $products.availableFilters;
    this.availableSorts = $products.availableSorts;
    this.catalog = $products.catalog;
    console.log("this.catalog=" + JSON.stringify(this.catalog));
}).factory("$products", function() {
    return {
        availableFilters: [ "All Jackets", "2016", "jacket", "Jackets", "layers", "Obermeyer", "Roxy", "womens" ],
        availableSorts: [ "Featured", "Best Selling", "Alphabetically, A-Z", "Alphabetically, Z-A", "Price, low to high", "Price, high to low", "Date, new to old", "Date, old to new" ],
        catalog: makeJackets()
    };
    function makeJackets() {
        var list = [], master = {
            imageURL: "media/img/im.jpeg",
            title: "Winter Jacket",
            price: "$99.99"
        };
        for (var j = 0; j < 6; j++) {
            list.push(angular.extend({}, master));
        }
        return list;
    }
});

app.factory("catalogoService", function($resource, apiUrl) {
    var url = apiUrl + "/api/catalogo/";
    return {
        Categoria: $resource(url + "categorias/:id/", {
            id: "@id"
        }, {
            update: {
                method: "PUT"
            }
        }),
        Autor: $resource(url + "autors/:id/", {
            id: "@id"
        }, {
            update: {
                method: "PUT"
            },
            query: {
                method: "GET",
                isArray: false,
                transformResponse: function(r) {
                    var results = [];
                    var options = {};
                    results = angular.fromJson(r).results ? angular.fromJson(r).results : angular.fromJson(r);
                    options = angular.fromJson(r).options ? angular.fromJson(r).options : {
                        count: 1,
                        pages: 1,
                        page: 1,
                        range: "all",
                        previous: null,
                        page_size: 1,
                        next: null
                    };
                    return {
                        results: results,
                        options: options
                    };
                }
            }
        })
    };
});