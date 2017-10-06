app
    .controller('MainCtrl', function($scope, $timeout, $mdSidenav, $log, $rootScope,
        oauth2Service, homeUrl, authUrl, $window, $mdBottomSheet, $mdToast) {

        // show menu
        $scope.toggleLeft = buildDelayedToggler('left');
        $scope.toggleRight = buildToggler('right');
        $scope.asideFolded = false;

        $rootScope.$on('$stateChangeSuccess', function() {
            $timeout(function() {
                if (document.getElementById('left')) {
                    $mdSidenav('left').close();
                }

            });
        });

        $scope.isOpenRight = function() {
            return $mdSidenav('right').isOpen();
        };

        /**
         * Supplies a function that will continue to operate until the
         * time is up.
         */
        function debounce(func, wait, context) {
            var timer;

            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function() {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        }

        /**
         * Build handler to open/close a SideNav; when animation finishes
         * report completion in console
         */
        function buildDelayedToggler(navID) {
            return debounce(function() {
                // Component lookup should always be available since we are not using `ng-if`
                $mdSidenav(navID)
                    .toggle()
                    .then(function() {
                        $log.debug("toggle " + navID + " is done");
                    });
            }, 200);
        }

        function buildToggler(navID) {
            return function() {
                // Component lookup should always be available since we are not using `ng-if`
                $mdSidenav(navID)
                    .toggle()
                    .then(function() {
                        $log.debug("toggle " + navID + " is done");
                    });
            };
        }

        // set save dynamicTheme
        function getCookie(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
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
            //$scope.app.setting.theme = theme;
            console.log("cookie dynamicTheme=" + getCookie("theme"));
        };

        $scope.dynamicTheme = getCookie("theme");
        // /set save dynamicTheme

        //
        $scope.app = {
            name: 'Home App',
            version: '1.0.1',
        };
        // /

        

        //
        $scope.logIn = function() {
            console.log("logIn");
            oauth2Service.createLoginUrl().then(function(url) {
                    console.log("urla=" + url);
                    $window.location = url;
                })
                .catch(function(error) {
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
            //oauth2Service.logOut();
            $window.location = homeUrl;
        };

        // /

        $scope.showGridBottomSheet = function() {
            $scope.alert = '';
            $mdBottomSheet.show({
                templateUrl: 'dist/views/bottom-sheet-grid-template.html',
                controller: 'GridBottomSheetCtrl',
                clickOutsideToClose: true
            }).then(function(clickedItem) {
                /*
                $scope.alert = clickedItem['name'] + ' clicked!';
                $mdToast.show(
                    $mdToast.simple()
                    .textContent(clickedItem['name'] + ' clicked!')

                    .hideDelay(1500)
                );
*/
            });
        };


    })

.controller('LeftCtrl', function($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav('left').close()
            .then(function() {
                $log.debug("close LEFT is done");
            });

    };
})

.controller('RightCtrl', function($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav('right').close()
            .then(function() {
                $log.debug("close RIGHT is done");
            });
    };
});





app.controller("VoucherCtrl", function($scope, $http, oauth2Service, authUrl) {

    $scope.model = {};

    $scope.model.message = "";
    $scope.model.buyVoucher = function() {
        $http
            .post(authUrl + "/api/voucher?betrag=150", null)
            .then(function(result) {
                $scope.model.message = result.data;
            })
            .catch(function(message) {
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




app
    .controller('BottomSheetExample', function($scope, $timeout, $mdBottomSheet, $mdToast) {
        $scope.alert = '';

        $scope.showListBottomSheet = function() {
            $scope.alert = '';
            $mdBottomSheet.show({
                templateUrl: 'dist/views/bottom-sheet-list-template.html',
                controller: 'ListBottomSheetCtrl'
            }).then(function(clickedItem) {
                //$scope.alert = clickedItem['name'] + ' clicked!';
            });
        };


    })

.controller('ListBottomSheetCtrl', function($scope, $mdBottomSheet) {

    $scope.items = [
        { name: 'Share', icon: 'share-arrow' },
        { name: 'Upload', icon: 'upload' },
        { name: 'Copy', icon: 'copy' },
        { name: 'Print this page', icon: 'print' },
    ];

    $scope.listItemClick = function($index) {
        var clickedItem = $scope.items[$index];
        $mdBottomSheet.hide(clickedItem);
    };
})

.controller('GridBottomSheetCtrl', function($scope, $mdBottomSheet, $window) {
    $scope.items = [
        { name: 'Home', icon: 'home', url: 'http://localhost:9001' },
        { name: 'Backend', icon: 'hangout', url: 'http://localhost:9002' },
        { name: 'Catálogo', icon: 'mail', url: 'http://localhost:9003' },
        { name: 'Message', icon: 'message', url: 'http://localhost:9004' },
        { name: 'Facebook', icon: 'facebook', url: 'http://localhost:9005' },
        { name: 'Twitter', icon: 'twitter', url: 'http://localhost:9006' },

        { name: 'Home', icon: 'home', url: 'http://localhost:9001' },
        { name: 'Backend', icon: 'hangout', url: 'http://localhost:9002' },
        { name: 'Catálogo', icon: 'mail', url: 'http://localhost:9003' },
        { name: 'Message', icon: 'message', url: 'http://localhost:9004' },
        { name: 'Facebook', icon: 'facebook', url: 'http://localhost:9005' },
        { name: 'Twitter', icon: 'twitter', url: 'http://localhost:9006' },
    ];

    $scope.listItemClick = function($index) {
        var clickedItem = $scope.items[$index];
        console.log("url=" + clickedItem.url);
        $window.location = clickedItem.url;
        $mdBottomSheet.hide(clickedItem);
    };
});


app
    .controller('ProductController', function($scope, $products, $mdMedia) {
        $scope.$mdMedia = $mdMedia;

        this.filterBy = "All Jackets";
        this.sortedBy = "Featured";
        this.availableFilters = $products.availableFilters;
        this.availableSorts = $products.availableSorts;
        this.catalog = $products.catalog;
        console.log("this.catalog=" + JSON.stringify(this.catalog));
    })
    .factory('$products', function() {
        return {
            availableFilters: ["All Jackets", "2016", "jacket", "Jackets", "layers", "Obermeyer", "Roxy", "womens"],
            availableSorts: ["Featured", "Best Selling", "Alphabetically, A-Z", "Alphabetically, Z-A", "Price, low to high", "Price, high to low", "Date, new to old", "Date, old to new"],
            catalog: makeJackets()
        };

        function makeJackets() {
            var list = [],
                master = {
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
