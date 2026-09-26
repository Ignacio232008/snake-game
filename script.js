// Referencias al canvas y su contexto de dibujo
const canvas = document.getElementById("juego");
const ctx = canvas.getContext("2d");
const puntajeEl = document.getElementById("puntaje");

const tamCelda = 20; // tamaño de cada cuadradito del tablero
const columnas = canvas.width / tamCelda;
const filas = canvas.height / tamCelda;

let serpiente = [{ x: 10, y: 10 }]; // empieza con un solo segmento
let direccion = { x: 0, y: 0 }; // quieta hasta que apretes una tecla
let comida = generarComida();
let puntaje = 0;
let velocidad = 150; // milisegundos entre movimientos
let juegoTerminado = false;

// Genera una posición aleatoria para la comida
function generarComida() {
  return {
    x: Math.floor(Math.random() * columnas),
    y: Math.floor(Math.random() * filas)
  };
}

// Escucha las flechas del teclado para cambiar de dirección
document.addEventListener("keydown", (evento) => {
  switch (evento.key) {
    case "ArrowUp":
      if (direccion.y === 0) direccion = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direccion.y === 0) direccion = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direccion.x === 0) direccion = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direccion.x === 0) direccion = { x: 1, y: 0 };
      break;
  }
});

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

  if (juegoTerminado) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Perdiste - Presiona F5", canvas.width / 2, canvas.height / 2);
  }
}

function terminarJuego() {
  juegoTerminado = true;
}

function bucleDelJuego() {
  actualizar();
  dibujar();
  setTimeout(bucleDelJuego, velocidad);
}

bucleDelJuego();
