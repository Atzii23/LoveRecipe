const userPerfil = document.querySelector("#userPerfil");

apiObtenerIdUsuarios().then(respuesta => {
    for (let i = 0; i < respuesta.ids.length; i++) {
        apiObtenerUsuarioPorId(respuesta.ids[i].id).then(usuario => {
            if (usuario.nombres) {
                userPerfil.innerHTML = usuario.nombres;
            }
        });
    }
});