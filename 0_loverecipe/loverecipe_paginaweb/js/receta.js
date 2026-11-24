// --- BOTONES DEL EDITOR ---
document.getElementById('bold').addEventListener('click', () => {
    document.execCommand('bold', false, null);
});

document.getElementById('italic').addEventListener('click', () => {
    document.execCommand('italic', false, null);
});

document.getElementById('underline').addEventListener('click', () => {
    document.execCommand('underline', false, null);
});

document.getElementById('strikethrough').addEventListener('click', () => {
    document.execCommand('strikethrough', false, null);
});

// Alineación
document.getElementById('alignLeft').addEventListener('click', () => {
    document.execCommand('justifyLeft', false, null);
});

document.getElementById('alignCenter').addEventListener('click', () => {
    document.execCommand('justifyCenter', false, null);
});

document.getElementById('alignRight').addEventListener('click', () => {
    document.execCommand('justifyRight', false, null);
});

document.getElementById('alignJustify').addEventListener('click', () => {
    document.execCommand('justifyFull', false, null);
});

// Listas
document.getElementById('orderedList').addEventListener('click', () => {
    document.execCommand('insertOrderedList', false, null);
});

document.getElementById('unorderedList').addEventListener('click', () => {
    document.execCommand('insertUnorderedList', false, null);
});

// Fuente y tamaño
document.getElementById('font').addEventListener('change', (e) => {
    document.execCommand('fontName', false, e.target.value);
});

document.getElementById('fontSize').addEventListener('change', (e) => {
    document.execCommand('fontSize', false, e.target.value);
});

// --- SUBIR Y PREVISUALIZAR IMAGEN ---
const input_imagen = document.querySelector("#imagen_comida");
const preview_imagen = document.querySelector("#PreviewImagenComida");
let imagen_base64 = "";

input_imagen.addEventListener("change", () => {
    const archivo = input_imagen.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = (e) => {
        imagen_base64 = e.target.result;
        preview_imagen.src = imagen_base64;
    };
    lector.readAsDataURL(archivo);
});

// --- DETECTAR SI ES CREAR O EDITAR ---
const input_titulo = document.querySelector("#input_titulo");
const input_descripcion = document.querySelector("#input_descripcion");
const textArea = document.querySelector("#textArea");
const btn_guardar_receta = document.querySelector("#btn_guardar_receta");

const parametros = new URLSearchParams(window.location.search);
const id_editar = parametros.get("id");

if (id_editar) {
    btn_guardar_receta.textContent = "Actualizar receta";

    apiObtenerRecetaPorId(id_editar).then(receta => {
        if (receta.mensaje) {
            alert(receta.mensaje);
            return;
        }
        input_titulo.value = receta.titulo;
        input_descripcion.value = receta.descripcion;
        textArea.innerHTML = receta.contenido;
        if (receta.imagen) {
            preview_imagen.src = receta.imagen;
        }
    });
}

// --- BOTÓN GUARDAR / ACTUALIZAR ---
btn_guardar_receta.addEventListener("click", () => {
    if (input_titulo.value.trim() === "") {
        alert("Por favor escribe un título para tu receta.");
        return;
    }

    if (id_editar) {
        const receta_editada = {
            id: id_editar,
            titulo: input_titulo.value,
            descripcion: input_descripcion.value,
            imagen: imagen_base64,
            contenido: textArea.innerHTML
        };

        apiEditarReceta(receta_editada)
            .then(respuesta => {
                alert(respuesta.mensaje);
                window.location.href = "catalogo.html";
            })
            .catch(error => console.error("Error al editar:", error));
    } else {
        const nueva_receta = {
            titulo: input_titulo.value,
            descripcion: input_descripcion.value,
            imagen: imagen_base64,
            contenido: textArea.innerHTML
        };

        apiCrearReceta(nueva_receta)
            .then(respuesta => {
                alert(respuesta.mensaje);
                window.location.href = "catalogo.html";
            })
            .catch(error => console.error("Error al crear:", error));
    }
}); 