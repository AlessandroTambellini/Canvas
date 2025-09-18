const canvas = document.querySelector('#canvas');

/* cursor stands for both the mouse and the finger */
let prev_cursor_x = 0;
let prev_cursor_y = 0;

let active_marker = null;
let active_marker_container = null;
let active_marker_container_rect = null;
let grid_rect = canvas.getBoundingClientRect();

window.addEventListener('resize', () => {
    grid_rect = canvas.getBoundingClientRect();
    /* I do not need to also re-calculate the active_marker_container_rect
    because, it is re-calculated every time the mousedown event fires on a marker. */
});

document.querySelectorAll('.marker').forEach(marker => {
    marker.addEventListener('mousedown', e => {
        select_marker(e, marker)
    });
    marker.addEventListener('touchstart', e => {
        select_marker(e, marker)
    }, { passive: true });
});

function select_marker(e, marker) 
{
    if (e.type === 'mousedown' && e.button !== 0) {
        return;
    }
    active_marker = marker;
    active_marker_container = marker.parentNode;
    active_marker_container_rect = active_marker_container.getBoundingClientRect();
    prev_cursor_x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    prev_cursor_y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    active_marker.style.zIndex = 2; /* To be above the other
    markers if hovered. */
}

document.addEventListener('mouseup', e => {
    lay_marker(e);
});
document.addEventListener('touchend', e => {
    lay_marker(e);
});

function lay_marker(e) 
{
    if (e.type === 'mouseup' && e.button !== 0) {
        return;
    }
    if (active_marker) 
    {
        const active_marker_left = Number(window.getComputedStyle(active_marker).left.split('px')[0]);
        const active_marker_top = Number(window.getComputedStyle(active_marker).top.split('px')[0]);
        if (active_marker_top + active_marker.offsetHeight > active_marker_container_rect.top &&
            active_marker_top < active_marker_container_rect.bottom &&
            active_marker_left + active_marker.offsetWidth > active_marker_container_rect.left &&
            active_marker_left < active_marker_container_rect.right
        ) {
            active_marker_container.classList.remove('marker-container-hover');
            active_marker.style.top = 'unset';
            active_marker.style.left = 'unset';
        }
        active_marker.style.zIndex = 1;
        active_marker = null;
    } 
}

document.addEventListener('mousemove', e => {
    e.preventDefault(); // prevent scrolling
    move_marker(e);
}, { passive: false });
// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#using_passive_listeners
document.addEventListener('touchmove', e => {
    e.preventDefault(); // prevent scrolling
    move_marker(e);
}, { passive: false });

function move_marker(e) {
    if (active_marker) 
    {
        const active_marker_left = Number(window.getComputedStyle(active_marker).left.split('px')[0]);
        const active_marker_top = Number(window.getComputedStyle(active_marker).top.split('px')[0]);
        
        const cursor_x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const cursor_y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        let left = 0;
        if (active_marker_left < 0) {
            left = 0;
        } else if (document.body.offsetWidth - (active_marker_left + active_marker.offsetWidth) < 0) {
            left = document.body.offsetWidth - active_marker.offsetWidth;
        } else {
            left = active_marker_left + (cursor_x - prev_cursor_x);
        }
        
        let top = 0;
        if (active_marker_top < 0) {
            top = 0;
        } else if (document.body.offsetHeight - (active_marker_top + active_marker.offsetHeight) < 0) {
            top = document.body.offsetHeight - active_marker.offsetHeight;
        } else {
            top = active_marker_top + (cursor_y - prev_cursor_y);
        }

        active_marker.style.left = `${left}px`;
        active_marker.style.top = `${top}px`;
        prev_cursor_x = cursor_x;
        prev_cursor_y = cursor_y;

        /* active_marker touches its container */
        if (active_marker_top + active_marker.offsetHeight > active_marker_container_rect.top &&
            active_marker_top < active_marker_container_rect.bottom &&
            active_marker_left + active_marker.offsetWidth > active_marker_container_rect.left &&
            active_marker_left < active_marker_container_rect.right
        ) {
            active_marker_container.classList.add('marker-container-hover');
        } else {
            active_marker_container.classList.remove('marker-container-hover');
        }

        /* active_marker on the canvas */
        if (active_marker_top + active_marker.offsetHeight > grid_rect.top &&
            active_marker_top < grid_rect.bottom &&
            active_marker_left + active_marker.offsetWidth > grid_rect.left &&
            active_marker_left < grid_rect.right
        ) {
            const cell_size = canvas.children[0].children[0].offsetWidth;
            
            const dist_from_left_border = active_marker_left - grid_rect.left;
            const dist_from_top_border = active_marker_top - grid_rect.top;

            const leftmost_cell = Math.floor(dist_from_left_border / cell_size); 
            const rightmost_cell = Math.floor((dist_from_left_border + active_marker.offsetWidth) / cell_size);
            const topmost_cell = Math.floor(dist_from_top_border / cell_size);
            const bottommost_cell = Math.floor((dist_from_top_border + active_marker.offsetHeight) / cell_size);

            const grid_size = canvas.children.length;
            for (let i = topmost_cell; i <= bottommost_cell; i++) {
                for (let j = leftmost_cell; j <= rightmost_cell; j++) {
                    if (i >= 0 && j >= 0 && i < grid_size && j < grid_size) {
                        if (active_marker.id === 'u') {
                            canvas.children[i].children[j].className = 'cell';
                        } else {
                            const child_class = canvas.children[i].children[j].className;
                            let color = child_class === 'cell' ? '---' : child_class.split(' ')[1];
                            if (!color.includes(active_marker.id)) {
                                if (active_marker.id === 'r') color = 'r' + color[1] + color[2];
                                else if (active_marker.id === 'g') color = color[0] + 'g' + color[2];
                                else if (active_marker.id === 'b') color = color[0] + color[1] + 'b';
                                else {
                                    console.error('unidentifiable active_marker.id:', active_marker.id);
                                    return;
                                }
                                canvas.children[i].children[j].className = `cell ${color}`;
                            }
                        }
                    }
                }
            }
        } // endif (active_marker on the canvas)
    }
}
