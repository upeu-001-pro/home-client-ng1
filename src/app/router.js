var ejemplo = { // nadie lo referencia, borrar
    "estado.nombre": {
        "url": "/url",
        "data": {
            "section": "Menu name",
            "page": "Menu item name"
        },
        "templateUrl": "distname_web_dists/distname_web/views/model/index.html"
    },
};

app.constant('ROUTERS', [

    {
        
        "home.catalogo": {
            "url": "/catalogo",
            "template": "<div ui-view ></div>"
        },
        "home.dashboard": {
            "url": "/dashboard",
            "data": {
                "page": "Dashboard"
            },
            "views": {
                "": {
                    "templateUrl": "dist/views/layouts/dashboard.wall.html"
                }
            }
        }
    },


    {
        "home.catalogo.categorias": {
            "url": "/categorias",
            "data": {
                "section": "Catálogo",
                "page": "Categorías"
            },
            "templateUrl": "dist/views/categorias/index.html",
            "loginRequired": true
        },
        "catalogo.catalogo.categoriasNew": {
            "url": "/categorias/new",
            "data": {
                "section": "Catálogo",
                "page": "Categorías"
            },
            "templateUrl": "dist/views/categorias/form.html"
        },
        "catalogo.catalogo.categoriasEdit": {
            "url": "/categorias/:id/edit",
            "data": {
                "section": "Catálogo",
                "page": "Categorías"
            },
            "templateUrl": "dist/views/categorias/form.html"
        }
    },

    {
        "home.catalogo.autores": {
            "url": "/autores",
            "data": {
                "section": "Catálogo",
                "page": "Autores"
            },
            "templateUrl": "dist/views/autores/index.html"
        },
        "catalogo.catalogo.autoresNew": {
            "url": "/autores/new",
            "data": {
                "section": "Catálogo",
                "page": "Autores"
            },
            "templateUrl": "dist/views/autores/form.html"
        },
        "catalogo.catalogo.autoresEdit": {
            "url": "/autores/:id/edit",
            "data": {
                "section": "Catálogo",
                "page": "Autores"
            },
            "templateUrl": "dist/views/autores/form.html"
        }

    }


]);
