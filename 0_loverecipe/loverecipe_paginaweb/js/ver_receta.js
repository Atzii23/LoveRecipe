const ver_imagen = document.querySelector("#ver_imagen");
const ver_titulo = document.querySelector("#ver_titulo");
const ver_descripcion = document.querySelector("#ver_descripcion");
const ver_contenido = document.querySelector("#ver_contenido");
const btn_ir_editar = document.querySelector("#btn_ir_editar");

// 1. Leemos el ?id= que viene en la URL
const parametros = new URLSearchParams(window.location.search);
const id_receta = parametros.get("id");

// 2. Pedimos esa receta a nuestra API
if (id_receta) {
    apiObtenerRecetaPorId(id_receta).then(receta => {
        if (receta.mensaje) {
            alert(receta.mensaje);
            window.location.href = "catalogo.html";
            return;
        }

        // 3. Mostramos los datos en la página
        ver_titulo.innerHTML = receta.titulo;
        ver_descripcion.innerHTML = receta.descripcion;
        ver_contenido.innerHTML = receta.contenido;

        if (receta.imagen) {
            ver_imagen.src = receta.imagen;
        }

        // Conectamos el botón de editar con el ID de esta misma receta
        btn_ir_editar.href = "Crear_receta.html?id=" + receta.id;
    });
} else {
    alert("No se seleccionó ninguna receta.");
    window.location.href = "catalogo.html";
}