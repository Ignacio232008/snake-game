// Referencias al canvas y su contexto de dibujo
const canvas = document.getElementById("juego");
const ctx = canvas.getContext("2d");
const puntajeEl = document.getElementById("puntaje");

// Referencias a las pantallas de menú y juego
const menu = document.getElementById("menu");
const pantallaJuego = document.getElementById("pantallaJuego");
const botonJugar = document.getElementById("botonJugar");

// Referencias a los botones táctiles de dirección
const btnArriba = document.getElementById("btnArriba");
const btnAbajo = document.getElementById("btnAbajo");
const btnIzquierda = document.getElementById("btnIzquierda");
const btnDerecha = document.getElementById("btnDerecha");

// Referencias a la pantalla de fin de juego
const pantallaGameOver = document.getElementById("pantallaGameOver");
const puntajeFinalEl = document.getElementById("puntajeFinal");
const botonReiniciar = document.getElementById("botonReiniciar");
const botonMenu = document.getElementById("botonMenu");

const tamCelda = 20; // tamaño de cada cuadradito del tablero
const columnas = canvas.width / tamCelda;
const filas = canvas.height / tamCelda;

let serpiente;
let direccion;
let comida;
let puntaje;
let velocidad = 150; // milisegundos entre movimientos
let juegoTerminado;

// Deja todo el estado del juego como al arrancar (se usa al jugar y al reiniciar)
function iniciarEstadoDelJuego() {
  serpiente = [{ x: 10, y: 10 }]; // empieza con un solo segmento
  direccion = { x: 0, y: 0 }; // quieta hasta que apretes una tecla
  comida = generarComida();
  puntaje = 0;
  juegoTerminado = false;
  puntajeEl.textContent = puntaje;
}

// Genera una posición aleatoria para la comida
function generarComida() {
  return {
    x: Math.floor(Math.random() * columnas),
    y: Math.floor(Math.random() * filas)
  };
}

// Cambia la dirección, evitando que la serpiente se choque contra sí misma
// al girar 180 grados de golpe (por ejemplo ir para la derecha y tocar izquierda)
function cambiarDireccion(nuevaX, nuevaY) {
  if (nuevaX !== 0 && direccion.x === 0) direccion = { x: nuevaX, y: 0 };
  if (nuevaY !== 0 && direccion.y === 0) direccion = { x: 0, y: nuevaY };
}

// Escucha las flechas del teclado para cambiar de dirección
document.addEventListener("keydown", (evento) => {
  switch (evento.key) {
    case "ArrowUp":
      cambiarDireccion(0, -1);
      break;
    case "ArrowDown":
      cambiarDireccion(0, 1);
      break;
    case "ArrowLeft":
      cambiarDireccion(-1, 0);
      break;
    case "ArrowRight":
      cambiarDireccion(1, 0);
      break;
  }
});

// Los botones táctiles usan la misma función que el teclado
btnArriba.addEventListener("click", () => cambiarDireccion(0, -1));
btnAbajo.addEventListener("click", () => cambiarDireccion(0, 1));
btnIzquierda.addEventListener("click", () => cambiarDireccion(-1, 0));
btnDerecha.addEventListener("click", () => cambiarDireccion(1, 0));

function actualizar() {
  if (juegoTerminado) return;

  // Si todavía no apretó ninguna tecla, no se mueve
  if (direccion.x === 0 && direccion.y === 0) return;

  const cabezaActual = serpiente[0];
  const nuevaCabeza = {
    x: cabezaActual.x + direccion.x,
    y: cabezaActual.y + direccion.y
  };

  // Choque contra la pared
  if (
    nuevaCabeza.x < 0 ||
    nuevaCabeza.x >= columnas ||
    nuevaCabeza.y < 0 ||
    nuevaCabeza.y >= filas
  ) {
    terminarJuego();
    return;
  }

  // Choque contra su propio cuerpo
  const chocaConCuerpo = serpiente.some(
    (segmento) => segmento.x === nuevaCabeza.x && segmento.y === nuevaCabeza.y
  );
  if (chocaConCuerpo) {
    terminarJuego();
    return;
  }

  serpiente.unshift(nuevaCabeza); // agrega la nueva cabeza adelante

  // Si come, suma puntos y genera comida nueva; si no, se achica la cola
  if (nuevaCabeza.x === comida.x && nuevaCabeza.y === comida.y) {
    puntaje += 10;
    puntajeEl.textContent = puntaje;
    comida = generarComida();
  } else {
    serpiente.pop();
  }
}

function dibujar() {
  // Limpia el tablero
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dibuja la serpiente
  ctx.fillStyle = "#4caf50";
  serpiente.forEach((segmento) => {
    ctx.fillRect(
      segmento.x * tamCelda,
      segmento.y * tamCelda,
      tamCelda - 2,
      tamCelda - 2
    );
  });

  // Dibuja la comida
  ctx.fillStyle = "#e53935";
  ctx.fillRect(
    comida.x * tamCelda,
    comida.y * tamCelda,
    tamCelda - 2,
    tamCelda - 2
  );
}

function terminarJuego() {
  juegoTerminado = true;
  puntajeFinalEl.textContent = puntaje;
  pantallaGameOver.classList.remove("oculto");
}

function bucleDelJuego() {
  actualizar();
  dibujar();
  // Deja de programar la próxima vuelta apenas termina el juego
  if (!juegoTerminado) {
    setTimeout(bucleDelJuego, velocidad);
  }
}

// Cuando se aprieta "Jugar", arranca el estado del juego, se esconde el menú y comienza el bucle
botonJugar.addEventListener("click", () => {
  iniciarEstadoDelJuego();
  menu.classList.add("oculto");
  pantallaJuego.classList.remove("oculto");
  canvas.focus();
  bucleDelJuego();
});

// Reiniciar: vuelve a arrancar el juego sin salir de la pantalla de juego
botonReiniciar.addEventListener("click", () => {
  iniciarEstadoDelJuego();
  pantallaGameOver.classList.add("oculto");
  bucleDelJuego();
});

// Menú: vuelve a la pantalla de inicio
botonMenu.addEventListener("click", () => {
  pantallaGameOver.classList.add("oculto");
  pantallaJuego.classList.add("oculto");
  menu.classList.remove("oculto");
});
