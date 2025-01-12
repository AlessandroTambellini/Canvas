const grid = document.querySelector('#grid');
const red_btn = document.querySelector('#red-btn');
const green_btn = document.querySelector('#green-btn');
const blue_btn = document.querySelector('#blue-btn');
const rubber_btn = document.querySelector('#rubber-btn');

// for (let i = 0; i < 10; i++) {
//     const row = document.createElement('div');
//     row.classList.add('row');
//     for (let j = 0; j < 10; j++) {
//         const cell = document.createElement('span');
//         cell.classList.add('cell');
//         row.appendChild(cell);
//     }
//     grid.appendChild(row);
// }

let color = '';
let leftBtn_down = false;

document.addEventListener('dragstart', e => e.preventDefault());
document.addEventListener('mousedown', e => { if (e.button === 0) leftBtn_down = true; });
document.addEventListener('mouseup', () => leftBtn_down = false);

red_btn.addEventListener('click', () => color = 'red');
green_btn.addEventListener('click', () => color = 'green');
blue_btn.addEventListener('click', () => color = 'blue');
rubber_btn.addEventListener('click', () => color = 'white');

grid.addEventListener('mouseover', grid_mouseover_cb);

function grid_mouseover_cb(e)  {
    if (leftBtn_down) {
        if (e.fromElement.classList.contains('cell')) {
            e.fromElement.className = 'cell ' + color;
        }
        if (e.target.classList.contains('cell')) {
            // this if is to add a smooth effect when the mouse
            // hits the first cell to start drawing
            e.target.className = 'cell ' + color;
        }
    }
}
