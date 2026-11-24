const http = require("node:http");
const basesdatos = require("mysql");

const puerto = 3000;

const server = http.createServer((request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "*");

    const mysql = basesdatos.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "recipelove_db"
    });

    switch (request.method) {
        case "GET":
            switch (request.url) {
                case "/obtener_id_usuarios":
                    mysql.query("SELECT id FROM usuarios", (err, resultado) => {
                        if (err) {
                            console.log(err);
                            mysql.end();
                            return;
                        }

                        const arreglo_ids_usuarios = {
                            ids: resultado
                        };

                        response.statusCode = 200;
                        response.setHeader("Content-Type", "application/json");
                        response.end(JSON.stringify(arreglo_ids_usuarios));
                        mysql.end();
                    });
                    break;

                case "/obtener_recetas":
                    mysql.query("SELECT id, titulo, descripcion, imagen, contenido, favorito, puntuacion FROM recetas", (err, resultado) => {
                        if (err) {
                            console.log(err);
                            mysql.end();
                            return;
                        }

                        for (i = 0; i < resultado.length; i++) {
                            if (resultado[i].imagen && Buffer.isBuffer(resultado[i].imagen)) {
                                resultado[i].imagen = ConvertirImagenABase64(resultado[i].imagen);
                            }
                        }

                        response.statusCode = 200;
                        response.setHeader("Content-Type", "application/json");
                        response.end(JSON.stringify(resultado));
                        mysql.end();
                    });
                    break;

                default:
                    if (request.url.startsWith("/obtener_usuario_")) {
                        const id = request.url.replace("/obtener_usuario_", "");

                        mysql.query("SELECT nombre FROM usuarios WHERE id = ?", [id], (err, resultado) => {
                            if (err) {
                                console.log(err);
                                response.statusCode = 404;
                                response.setHeader("Content-Type", "application/json");
                                response.end(JSON.stringify({
                                    mensaje: "peticion no valida"
                                }));
                                mysql.end();
                                return;
                            }

                            if (resultado.length == 0) {
                                response.statusCode = 404;
                                response.setHeader("Content-Type", "application/json");
                                response.end(JSON.stringify({
                                    mensaje: "no existe un usuario con ese id"
                                }));
                                mysql.end();
                                return;
                            }

                            const nombres_usuario = {
                                nombres: resultado[0].nombre
                            };

                            response.statusCode = 200;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify(nombres_usuario));
                            mysql.end();
                        });
                    } else if (request.url.startsWith("/obtener_receta_")) {
                        const id = request.url.replace("/obtener_receta_", "");

                        mysql.query("SELECT id, titulo, descripcion, imagen, contenido, favorito, puntuacion FROM recetas WHERE id = ?", [id], (err, resultado) => {
                            if (err || resultado.length === 0) {
                                response.statusCode = 404;
                                response.setHeader("Content-Type", "application/json");
                                response.end(JSON.stringify({
                                    mensaje: "Receta no encontrada"
                                }));
                                mysql.end();
                                return;
                            }

                            if (resultado[0].imagen && Buffer.isBuffer(resultado[0].imagen)) {
                                resultado[0].imagen = ConvertirImagenABase64(resultado[0].imagen);
                            }

                            response.statusCode = 200;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify(resultado[0]));
                            mysql.end();
                        });
                    }
                    break;
            }
            break;

        case "POST":
            if (request.url === "/crear_receta") {
                let cuerpo = "";

                request.on("data", parte => {
                    cuerpo += parte;
                });

                request.on("end", () => {
                    const datos = JSON.parse(cuerpo);

                    let imagen_binario = null;
                    if (datos.imagen) {
                        imagen_binario = ConvertirBase64ABinario(datos.imagen);
                    }

                    const sql = "INSERT INTO recetas (titulo, descripcion, imagen, contenido, favorito, puntuacion) VALUES (?, ?, ?, ?, ?, ?)";
                    const valores = [
                        datos.titulo,
                        datos.descripcion,
                        imagen_binario,
                        datos.contenido,
                        0,
                        0
                    ];

                    mysql.query(sql, valores, (err, resultado) => {
                        if (err) {
                            console.log(err);
                            response.statusCode = 500;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify({ mensaje: "Error al guardar la receta" }));
                            mysql.end();
                            return;
                        }

                        response.statusCode = 201;
                        response.setHeader("Content-Type", "application/json");
                        response.end(JSON.stringify({ mensaje: "Receta guardada correctamente" }));
                        mysql.end();
                    });
                });
            }
            break;

        case "PUT":
            if (request.url === "/editar_receta") {
                let cuerpo = "";

                request.on("data", parte => {
                    cuerpo += parte;
                });

                request.on("end", () => {
                    const datos = JSON.parse(cuerpo);
                    let sql = "";
                    let valores = [];

                    if (datos.imagen) {
                        const imagen_binario = ConvertirBase64ABinario(datos.imagen);
                        sql = "UPDATE recetas SET titulo = ?, descripcion = ?, imagen = ?, contenido = ? WHERE id = ?";
                        valores = [datos.titulo, datos.descripcion, imagen_binario, datos.contenido, datos.id];
                    } else {
                        sql = "UPDATE recetas SET titulo = ?, descripcion = ?, contenido = ? WHERE id = ?";
                        valores = [datos.titulo, datos.descripcion, datos.contenido, datos.id];
                    }

                    mysql.query(sql, valores, (err, resultado) => {
                        if (err) {
                            console.log(err);
                            response.statusCode = 500;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify({ mensaje: "Error al actualizar la receta" }));
                            mysql.end();
                            return;
                        }

                        response.statusCode = 200;
                        response.setHeader("Content-Type", "application/json");
                        response.end(JSON.stringify({ mensaje: "Receta actualizada correctamente" }));
                        mysql.end();
                    });
                });
            }
            else if (request.url === "/cambiar_favorito") {
                let cuerpo = "";

                request.on("data", parte => {
                    cuerpo += parte;
                });

                request.on("end", () => {
                    const datos = JSON.parse(cuerpo);

                    mysql.query("UPDATE recetas SET favorito = ? WHERE id = ?", [datos.favorito, datos.id], (err, resultado) => {
                        if (err) {
                            console.log(err);
                            response.statusCode = 500;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify({ mensaje: "Error al actualizar favorito" }));
                            mysql.end();
                            return;
                        }

                        response.statusCode = 200;
                        response.setHeader("Content-Type", "application/json");
                        response.end(JSON.stringify({ mensaje: "Favorito actualizado" }));
                        mysql.end();
                    });
                });
            }
            break;

        case "DELETE":
            if (request.url === "/eliminar_receta") {
                let cuerpo = "";

                request.on("data", parte => {
                    cuerpo += parte;
                });

                request.on("end", () => {
                    const datos = JSON.parse(cuerpo);

                    mysql.query("DELETE FROM recetas WHERE id = ?", [datos.id], (err, resultado) => {
                        if (err) {
                            console.log(err);
                            response.statusCode = 500;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify({ mensaje: "Error al eliminar la receta" }));
                            mysql.end();
                            return;
                        }

                        if (resultado.affectedRows === 0) {
                            response.statusCode = 404;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify({ mensaje: "No se encontró una receta con ese ID" }));
                            mysql.end();
                            return;
                        }

                        response.statusCode = 200;
                        response.setHeader("Content-Type", "application/json");
                        response.end(JSON.stringify({ mensaje: "Receta eliminada correctamente" }));
                        mysql.end();
                    });
                });
            }
        break;

        case "OPTIONS":
            response.writeHead(204);
            response.end();
        break;
    }
});

server.listen(puerto, () => {
    console.log("servidor a la escucha en http://localhost:" + puerto);
});

function ConvertirImagenABase64(imagen_binario) {
    return "data:;base64," + imagen_binario.toString("base64");
}

function ConvertirBase64ABinario(imagen_base64) {
    const base64Limpio = imagen_base64.split(",")[1];
    return Buffer.from(base64Limpio, "base64");
}