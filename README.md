# home-client-ng1

home-client-ng1 es home site corporativo y también es un **Client application** construido en Angular para consumir los servicios REST de [Catalogo resource server] autorizado por el [Authorization server] cumpliendo así con una aplicación SSO.


![Image of Yaktocat](https://github.com/upeu-001-pro/home-client-ng1/blob/master/doc/e4-client_app_home_web.png)




## Installation en modo local 

### Development version


Clone **latest development version** directly from [github]:

```sh
    # Universal
    
    D:\dev>git clone https://github.com/upeu-001-pro/home-client-ng1.git
```

## Deployment to Local

Instale las dependencias
```sh
    
	D:\dev>cd home-client-ng1
	D:\dev\home-client-ng1>npm install
	D:\dev\home-client-ng1>bower install
```

Run
```sh
	D:\dev\home-client-ng1_web>gulp

	[23:28:59] Using gulpfile D:\dev\home-client-ng1\gulpfile.js
	...
	[Browsersync] Access URLs:
	-------------------------------
		Local: http://localhost:9001
	External: http://127.0.0.1:9001
	-------------------------------
	...
```


## Revise las configuraciones

1. angular module app setting like this:

```sh


	var app = angular.module("home", [

		"ui.router",
		'ngResource',
		'ngAnimate',
		'ngAria',
		'ngSanitize',
		'ngMaterial',
		'ngMdIcons',
		'toastr',

		'ngMessages',

		"pi.oauth2",
		"pi.appPagination",
		"pi.tableResponsive",
	]);
```
2. Constantes de la app  (opcional)
```sh
	// Authorization Server -> oauth2_backend_service
	app.constant("authUrl", "https://upeuauth-serve.herokuapp.com"); 

	// Resource Server -> catalogo
	app.constant("apiUrl", "http://localhost:8003"); 
```
3. Constantes de la app home::
```sh
	// Página de inicio o de convergencia
	app.constant("homeUrl", "http://localhost:9001"); 

```


4. config.js file setting like this::
```sh
	app
		//====================================================
		// oauth2Service  runing
		//====================================================
	.run(function(oauth2Service, $state, $rootScope, $location, authUrl, $window, userService) {
		oauth2Service.loginUrl = authUrl + "/o/authorize/";
		oauth2Service.oidcUrl = authUrl + "/api/oauth2_backend/localuserinfo/";
		oauth2Service.clientId = "KBszLKA46J3hd2xzs1oGgRXftPH8tswTI47uMif5"; //posgres de heroku
		oauth2Service.scope = "home"; //comentar si no está configurado
	    ...
```

## Deployment to Heroku

    $ git add --all
    $ git commit -m "Version to heroku"

Si aún no ha creado su app, revise https://dashboard.heroku.com/apps

    $ heroku create home-client-ng1

deployar:

    $ git push heroku master


See also, a [ready-made application](https://github.com/heroku/node-js-getting-started), ready to deploy.


## License

BSD-3-Clause: [LICENSE](https://github.com/upeu-001-pro/home-client-ng1/blob/master/LICENSE)


### Contributors


See https://github.com/upeu-001-pro/home-client-ng1/graphs/contributors

[github]: https://github.com/upeu-001-pro/home-client-ng1


[Authorization server]:  https://github.com/upeu-001-pro/upeuauth-serve
[Catalogo resource server]:  https://github.com/upeu-001-pro/catalogo-serve