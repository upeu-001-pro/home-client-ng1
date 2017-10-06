app
//==================================
// Activar icones que se desactivaron en la versión de angular mayores a v1.0.9
//==================================
    .config(function($mdIconProvider, $$mdSvgRegistry) {
        // Add default icons from angular material para versiones no estables mayores a v1.0.9
        // la version v1.0.9 no necesita hacer esto
        $mdIconProvider
            .icon('md-close', $$mdSvgRegistry.mdClose)
            .icon('md-menu', $$mdSvgRegistry.mdMenu)
            .icon('md-toggle-arrow', $$mdSvgRegistry.mdToggleArrow);
    })
    //==================================
    // Interceptors de la app
    //==================================
    .config(function($httpProvider) {
        //$httpProvider.defaults.xsrfCookieName = 'csrftoken';
        //$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

        // interceptor en HTTP
        $httpProvider.interceptors.push('oauth2InterceptorService');
    })

//==================================
// para activar $resource https://docs.angularjs.org/api/ngResource/service/$resource
//==================================
.config(function($resourceProvider) {
    // Don't strip trailing slashes from calculated URLs
    $resourceProvider.defaults.stripTrailingSlashes = false;
})

//==================================
// Cambiar md-datepicker para formato 'DD/MM/YYYY' y primer día Domingo con moment.js
// <md-datepicker name="fecha_nac" ng-model="autor.fecha_nacT"></md-datepicker>
//==================================
.config(function($mdDateLocaleProvider, $provide) {

    $mdDateLocaleProvider.shortDays = [
        'Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'
    ];

    // Can change week display to start on Domingo.
    $mdDateLocaleProvider.firstDayOfWeek = 0;

    // Example uses moment.js to parse and format dates.
    $mdDateLocaleProvider.parseDate = function(dateString) {
        var m = moment(dateString, 'DD/MM/YYYY', true);
        return m.isValid() ? m.toDate() : new Date(NaN);
    };
    $mdDateLocaleProvider.formatDate = function(date) {
        if (angular.isDate(date)) {
            var m = moment(date);
            return m.isValid() ? m.format('DD/MM/YYYY') : '';
        }
        return '';
    };

})







//==================================
// routers de la app
//==================================
.config(function($stateProvider, $urlRouterProvider, $locationProvider, ROUTERS) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider

    //==================================
    // Página principal
    //==================================
        .state('home', {
        url: '',
        views: {
            "": {
                "templateUrl": "dist/views/layouts/home_layuot.html"
            }
        },
        loginRequired: false
    })

    .state("home.home", {
        "url": "/home",
        "data": {
            "page": "Home"
        },
        "templateUrl": "dist/views/home.html",
        "loginRequired": false
    })


    //==================================
    // Página segura de ejemplo voucher
    //==================================
    .state('home.voucher', {
        url: '/voucher',
        data: {
            page: "Voucher"
        },
        templateUrl: '/dist/views/layouts/voucher.html',
        controller: 'VoucherCtrl',
        loginRequired: true
    })

    .state('home.login', {
        url: '/login/?next',
        data: {
            page: "Login"
        },
        templateUrl: '/dist/views/layouts/login.html',
        controller: 'LoginCtrl'
    })

    .state('home.logout', {
        url: '/logout',
        data: {
            page: "Logout"
        },
        templateUrl: '/dist/views/layouts/logout.html',
        controller: 'LogoutCtrl'
    });


    //====================================================
    // Routers dinámicos de la app, ver router.js
    //====================================================
    ROUTERS.forEach(function(collection) {
        for (var routeName in collection) {
            $stateProvider.state(routeName, collection[routeName]);
        }
    });

    //console.log("access_token=" + localStorage.getItem("access_token")); //se llena en la segunda, se tiene que hacer F5
    //var collectionr = localStorage.getItem("collection"); //se llena en la segunda, se tiene que hacer F5

});



app
//====================================================
// Modelo lite para datos del usuario
//====================================================
    .service('userService', function() {
    return { userName: null };
});

app

//====================================================
// Permite acceder a $state and $stateParams desde cualquier parte de la pp
//====================================================
    .run(function($rootScope, $state, $stateParams, $window) {
    // It's very handy to add references to $state and $stateParams to the $rootScope
    // so that you can access them from any scope within your applications.For example,
    // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
    // to active whenever 'contacts.list' or one of its decendents is active.
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;


})

//====================================================
// Permite acceder a userService desde cualquier parte de la pp
//====================================================
.run(function($rootScope, userService) {
    $rootScope.userService = userService;
})










//====================================================
// 
//====================================================
.run(function(oauth2Service, $state, $rootScope, $location, authUrl, $window, userService) {


    oauth2Service.loginUrl = authUrl + "/o/authorize/";
    oauth2Service.oidcUrl = authUrl + "/api/oauth2_backend/localuserinfo/";
    //oauth2Service.routersUrl = authUrl + "/api/oauth2_backend/routers/"; // no activar pk no se puede activar un sesion en la misma app
    //oauth2Service.redirectUri = location.origin + ""; // si colocas, colocar tal cual está registrado en al app
    console.log("location.origin=" + location.origin);

    //oauth2Service.clientId = "6HdrRRJTmATwasHbR8BgrwzNTi69mEAJke4VWMKK";//sqlite3 de https://github.com/practian-ioteca-project/ioteca_service
    oauth2Service.clientId = "KBszLKA46J3hd2xzs1oGgRXftPH8tswTI47uMif5"; //posgres de heroku
    //oauth2Service.clientId = "97xtOaQ5ZU1g1C8Xh8CN2ibqCzIda7760Zy7yFMa"; //ORA
    oauth2Service.scope = "home"; //comentar si no está configurado

    //https://github.com/angular-ui/ui-router/wiki
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        console.log("$stateChangeStart isAauthenticated=" + oauth2Service.isAauthenticated());

        if (toState.loginRequired && !oauth2Service.isAauthenticated()) { //si no está logeado
            console.log('DENY');
            event.preventDefault();
            // transitionTo() promise will be rejected with 
            // a 'transition prevented' error
            var stateUrl = $state.href(toState, toParams); //obtiene la url del state
            console.log("stateUrl=" + stateUrl);
            console.log("window.location.hash=" + window.location.hash);
            //$state.transitionTo("login", { next: stateUrl });

            oauth2Service.createLoginUrl(stateUrl).then(function(url) {
                    console.log("scope.statea=" + stateUrl);
                    console.log("urla=" + url);
                    //element.attr("onclick", "location.href='" + url + "'");
                    $window.location = url;

                })
                .catch(function(error) {
                    console.log("createLoginUrl error");
                    console.log(error);
                    throw error;
                });
        }

        if (!oauth2Service.isAauthenticated()) {
            console.log('Desconectado');
            userService.userName = null;
        }
    });

    if (oauth2Service.isAauthenticated() || oauth2Service.tryLogin()) {
        console.log(" ... || oauth2Service.tryLogin() ");
        //$http.defaults.headers.common['Authorization'] = 'Bearer ' + oauth2Service.getAccessToken(); //no usar, no fresca al salir de la sesion
        if (oauth2Service.state) { // regresa a next #/url
            console.log("oauth2Service.state=" + oauth2Service.state);
            $location.url(oauth2Service.state.substr(1)); // führendes # abschneiden
        }
    }

    $rootScope.$on('$stateChangeSuccess', function() {
        console.log("$stateChangeSuccess isAauthenticated=" + oauth2Service.isAauthenticated());
        if (oauth2Service.isAauthenticated() && oauth2Service.getIdentityClaims()) {
            var userData = oauth2Service.getIdentityClaims();
            console.log("userData " + JSON.stringify(userData));
            userService.userName = userData.username; // complete aqui lo otros campos
        }
        if (oauth2Service.getRouters()) {
            var routers = oauth2Service.getRouters();
            console.log("routers " + JSON.stringify(routers));
        }
    });

    $rootScope.$on('loginRequired', function() {
        console.log("emit loginRequired ");
        //$state.go('login');
    });

});
