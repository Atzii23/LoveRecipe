const URL_BASE = "http://localhost:3000";

function apiObtenerIdUsuarios() {
    return fetch(URL_BASE + "/obtener_id_usuarios")
        .then(recurso => recurso.json());
}

function apiObtenerUsuarioPorId(id) {
    return fetch(URL_BASE + "/obtener_usuario_" + id)
        .then(recurso => recurso.json());
}

function apiObtenerRecetas() {
    return fetch(URL_BASE + "/obtener_recetas")
        .then(recurso => recurso.json());
}

function apiObtenerRecetaPorId(id) {
    return fetch(URL_BASE + "/obtener_receta_" + id)
        .then(recurso => recurso.json());
}

function apiCrearReceta(nueva_receta) {
    return fetch(URL_BASE + "/crear_receta", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(nueva_receta)
    }).then(recurso => recurso.json());
}

function apiEditarReceta(receta_editada) {
    return fetch(URL_BASE + "/editar_receta", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(receta_editada)
    }).then(recurso => recurso.json());
}

function apiEliminarReceta(id) {
    return fetch(URL_BASE + "/eliminar_receta", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: id })
    }).then(recurso => recurso.json());
}

function apiCambiarFavorito(id, nuevo_estado) {
    return fetch(URL_BASE + "/cambiar_favorito", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: id,
            favorito: nuevo_estado
        })
    }).then(recurso => recurso.json());
}