const contenedor_tarjetas = document.querySelector("#contenedor_tarjetas");
const input_buscar = document.querySelector(".barra_busqueda input");
const btn_buscar = document.querySelector("#buscar");

// Revisamos si el usuario entró desde el botón "Favoritos"
const parametros = new URLSearchParams(window.location.search);
const solo_favoritos = parametros.get("favoritos") === "true";

let todas_las_recetas = [];

// 1. Traer las recetas desde la API
function CargarRecetas() {
    apiObtenerRecetas().then(recetas => {
        // Si estamos en la pestaña de favoritos, filtramos solo las que tienen favorito == 1
        if (solo_favoritos) {
            const lista_favoritos = [];
            for (let i = 0; i < recetas.length; i++) {
                if (recetas[i].favorito == 1) {
                    lista_favoritos.push(recetas[i]);
                }
            }
            todas_las_recetas = lista_favoritos;
        } else {
            todas_las_recetas = recetas;
        }

        MostrarRecetas(todas_las_recetas);
    });
}

// 2. Dibujar en pantalla las tarjetas
function MostrarRecetas(lista_recetas) {
    contenedor_tarjetas.innerHTML = "";

    if (lista_recetas.length === 0) {
        if (solo_favoritos) {
            contenedor_tarjetas.innerHTML = "<p>Todavía no tienes recetas marcadas como favoritas.</p>";
        } else {
            contenedor_tarjetas.innerHTML = "<p>No se encontraron recetas con ese nombre.</p>";
        }
        return;
    }

    for (let i = 0; i < lista_recetas.length; i++) {
        const receta = lista_recetas[i];

        // Si es favorita (1), le agregamos la clase "activo" para pintarla de color
        let clase_favorito = "";
        if (receta.favorito == 1) {
            clase_favorito = "activo";
        }

        contenedor_tarjetas.innerHTML += `
            <div class="tarjeta_receta">
                <div class="tarjeta_imagen">
                    <div class="bookmark ${clase_favorito}" onclick="CambiarFavorito(${receta.id}, ${receta.favorito})">
                        <i class="fas fa-bookmark"></i>
                    </div>
                    <img src="${receta.imagen || ''}" alt="${receta.titulo}" onclick="AbrirReceta(${receta.id})">
                </div>

                <div class="tarjeta_cuerpo" onclick="AbrirReceta(${receta.id})">
                    <div class="titulo_tarjeta">
                        <h3>${receta.titulo}</h3>
                    </div>
                    <div class="descripcion_tarjeta">${receta.descripcion}</div>
                </div>

                <div class="tarjeta_herramientas">
                    <div class="estrellas">
                        <span class="estrella" data-value="1">&#9733;</span>
                        <span class="estrella" data-value="2">&#9733;</span>
                        <span class="estrella" data-value="3">&#9733;</span>
                        <span class="estrella" data-value="4">&#9733;</span>
                        <span class="estrella" data-value="5">&#9733;</span>
                    </div>

                    <div class="acciones_iconos">
                        <div class="editar" onclick="window.location.href='Crear_receta.html?id=${receta.id}'">
                            <i class="fas fa-pen"></i>
                        </div>
                        <div class="eliminar" onclick="EliminarReceta(${receta.id})">
                            <i class="fas fa-trash-alt"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// 3. Marcar o desmarcar favorito
function CambiarFavorito(id, estado_actual) {
    // Si estaba en 1 pasa a 0; si estaba en 0 pasa a 1
    let nuevo_estado = 1;
    if (estado_actual == 1) {
        nuevo_estado = 0;
    }

    apiCambiarFavorito(id, nuevo_estado)
        .then(() => {
            CargarRecetas(); // Recarga las tarjetas para ver el cambio
        })
        .catch(error => console.error("Error al cambiar favorito:", error));
}

// 4. Abrir la receta completa
function AbrirReceta(id) {
    window.location.href = "ver_receta.html?id=" + id;
}

// 5. Buscar recetas
function BuscarRecetas() {
    const texto = input_buscar.value.toLowerCase();
    const resultados = [];

    for (let i = 0; i < todas_las_recetas.length; i++) {
        const receta = todas_las_recetas[i];
        const titulo = receta.titulo.toLowerCase();
        const descripcion = receta.descripcion.toLowerCase();

        if (titulo.includes(texto) || descripcion.includes(texto)) {
            resultados.push(receta);
        }
    }

    MostrarRecetas(resultados);
}

input_buscar.addEventListener("input", BuscarRecetas);
btn_buscar.addEventListener("click", BuscarRecetas);

// 6. Eliminar receta
function EliminarReceta(id) {
    const confirmar = confirm("¿Seguro que deseas eliminar esta receta?");
    if (!confirmar) return;

    apiEliminarReceta(id)
        .then(respuesta => {
            alert(respuesta.mensaje);
            CargarRecetas();
        })
        .catch(error => {
            console.error("Error al eliminar:", error);
            alert("No se pudo conectar con el servidor.");
        });
}

CargarRecetas();