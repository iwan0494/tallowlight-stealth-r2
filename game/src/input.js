// Keyboard and mouse input. Keys are tracked in a plain object the game
// loop reads each frame; a click on the canvas is delivered as a world point.

export function makeInput(canvas, onClick) {
  const input = {
    up: false, down: false, left: false, right: false, sneak: false,
    pressed: new Set(),
  };
  const keyMap = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ShiftLeft: 'sneak', ShiftRight: 'sneak',
  };
  function down(e) {
    if (keyMap[e.code] !== undefined) {
      input[keyMap[e.code]] = true;
      e.preventDefault();
    }
    input.pressed.add(e.code);
    if (e.code === 'Space') e.preventDefault();
  }
  function up(e) {
    if (keyMap[e.code] !== undefined) input[keyMap[e.code]] = false;
  }
  function click(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    onClick((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  }
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  canvas.addEventListener('mousedown', click);
  // consume returns true once per physical press, so menus react to a tap
  input.consume = (code) => {
    if (input.pressed.has(code)) {
      input.pressed.delete(code);
      return true;
    }
    return false;
  };
  return input;
}
