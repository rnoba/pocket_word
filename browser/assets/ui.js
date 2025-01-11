import * as Base from "./base.js";
import * as Input from "./input.js";
var UiEvent;
(function (UiEvent) {
    UiEvent[UiEvent["REDRAW_ALL"] = 0] = "REDRAW_ALL";
})(UiEvent || (UiEvent = {}));
;
export function UiRect_new(rect, color, is_draggable = false, drag_interaction_rect = null) {
    return {
        rect,
        color,
        is_draggable,
        drag_interaction_rect,
        drag_pivot: null,
        id: -1,
        idx: -1
    };
}
const _MAX_UI_ELEMENTS = 100;
export class UI {
    ctx = null;
    rects = new Map();
    draw_qeue = [];
    element_count = 0;
    ipt;
    #dragging_id = -1;
    #last_interacted_id = -1;
    #last_draw_state = [];
    constructor(ctx, input_instance) {
        this.ctx = ctx;
        this.ipt = input_instance;
    }
    draw_rect(rect, color) {
        this.ctx.fillStyle = Base.RGBA_to_css_string(color);
        this.ctx.beginPath();
        this.ctx.fillRect(rect.position.x, rect.position.y, rect.width, rect.height);
        this.ctx.fill();
    }
    refresh_indexes() {
        let idx = 0;
        for (const id of this.#last_draw_state) {
            const ui_rect = this.rects.get(id);
            ui_rect.idx = idx++;
        }
    }
    add_rect(rect) {
        const id = this.element_count;
        rect.id = id;
        rect.rect.width = Base.round(rect.rect.width);
        rect.rect.height = Base.round(rect.rect.height);
        this.rects.set(id, rect);
        this.#last_draw_state.unshift(id);
        this.element_count = (this.element_count + 1) % _MAX_UI_ELEMENTS;
        this.refresh_indexes();
        return (id);
    }
    prepare_redraw_all() {
        for (const id of this.#last_draw_state) {
            this.draw_qeue.unshift(id);
        }
    }
    raise_rect(rect) {
        this.#last_draw_state.splice(rect.idx, 1);
        this.#last_draw_state.unshift(rect.id);
        this.refresh_indexes();
    }
    handle_drag(rect) {
        if (this.#dragging_id != -1 && this.#dragging_id != rect.id)
            return;
        const interaction_rect = rect.drag_interaction_rect ?
            rect.drag_interaction_rect :
            rect.rect;
        if (Base.point_in_rect(this.ipt.cursor.position, interaction_rect)) {
            if (this.ipt.is_down(Input.MBttn.M_LEFT)) {
                this.#dragging_id = rect.id;
                if (!rect.drag_pivot) {
                    rect.drag_pivot = this.ipt.cursor.position.copy().sub(rect.rect.position);
                }
            }
        }
        if (rect.drag_pivot) {
            if (!this.ipt.is_down(Input.MBttn.M_LEFT)) {
                rect.drag_pivot = null;
                this.#last_interacted_id = this.#dragging_id;
                this.#dragging_id = -1;
                this.raise_rect(rect);
            }
            else {
                this.ctx.clearRect(rect.rect.position.x, rect.rect.position.y, rect.rect.width, rect.rect.height);
                const new_position = this.ipt.cursor.position
                    .clone()
                    .sub(rect.drag_pivot);
                rect.rect.position.set(new_position);
                if (interaction_rect != rect.rect) {
                    interaction_rect.position.set(new_position);
                }
            }
        }
    }
    // just redraw everything i dont care
    update() {
        this.prepare_redraw_all();
        while (this.draw_qeue.length) {
            const ui_rect_idx = this.draw_qeue.shift();
            const ui_rect = this.rects.get(ui_rect_idx);
            if (ui_rect.is_draggable) {
                this.handle_drag(ui_rect);
            }
            this.draw_rect(ui_rect.rect, ui_rect.color);
        }
    }
}
