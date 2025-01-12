import * as Base from "./base.js";
import * as Input from "./input.js";
const Ui_DefaultWidgetPaddingPxH = 10;
const Ui_DefaultWidgetPaddingPxV = 10;
const Ui_DefaultWidgetPaddingPxH2 = Ui_DefaultWidgetPaddingPxH * 2;
const Ui_DefaultWidgetPaddingPxV2 = Ui_DefaultWidgetPaddingPxV * 2;
const Ui_DefaultBorderSize = 1;
const Ui_DefaultTextSize = 16;
const Ui_DefaultFont = "serif";
const Ui_DefaultBackgroundcolor = Base.RGBA(195, 75, 114);
const Ui_DefaultActiveBackgroundcolor = Base.RGBA(0, 255, 0);
const Ui_DefaultHotBackgroundcolor = Base.RGBA(255, 0, 0);
const Ui_DefaultBorderColor = Base.RGBA(0, 0, 0);
const Ui_DefaultTextColor = Base.RGBA(0, 0, 0);
export function Ui_DrawText(text, color, x, y, font_size_px = Ui_DefaultTextSize, font = Ui_DefaultFont) {
    Base.assert(Base.GlobalContext !== null, "`Ui_DrawText()` GlobalContext must be initialized");
    Base.GlobalContext.fillStyle = Base.RGBA_to_hex_string(color);
    Base.GlobalContext.font = `${font_size_px}px ${font}`;
    Base.GlobalContext.fillText(text, x, y);
}
function Ui_DrawRect(rect, color) {
    Base.assert(Base.GlobalContext !== null, "`Ui_DrawRect()` GlobalContext must be initialized");
    Base.GlobalContext.fillStyle = Base.RGBA_to_css_string(color);
    Base.GlobalContext.beginPath();
    Base.GlobalContext.fillRect(rect.position.x, rect.position.y, rect.width, rect.height);
    Base.GlobalContext.fill();
}
const UiTextCenteredX = 1 << 0;
const UiTextCenteredY = 1 << 1;
const UiTextCentered = UiTextCenteredX | UiTextCenteredY;
const UiDrawText = 1 << 2;
const UiDrawBackground = 1 << 3;
const UiDrawBorder = 1 << 4;
const UiClickable = 1 << 5;
const UiDragabble = 1 << 6;
const UiState = {
    input: null,
    active: Base.u640,
    hot: Base.u640,
    stack: [],
    sizes: new Map(),
    cleanup: new Map(),
    current_frame: 0,
    is_dragging: false,
    draggind_id: Base.u640,
    drag_offset: null,
    dt: 0,
    draggables: new Map(),
};
export function SetInputInstance(input) {
    UiState.input = input;
}
function Ui_Push(wid) {
    let push = true;
    for (let i = 0; i < UiState.stack.length; i++) {
        if (UiState.stack[i].id == wid.id) {
            push = false;
        }
    }
    if (push) {
        UiState.stack.push(wid);
    }
}
function Ui_PopFront() {
    const widget = UiState.stack.shift();
    if (widget) {
        UiState.cleanup.set(widget.id, { frame: UiState.current_frame, widget });
        Ui_RectClear(widget);
    }
    return (widget);
}
function Ui_PopBack() {
    return UiState.stack.pop();
}
function Ui_SetPosition(widget, new_pos) {
    if (!Base.has_flag(widget.flags, UiDragabble)) {
        console.warn("position of non draggables elements are not persistant");
        return;
    }
    const draggable = UiState.draggables.get(widget.id);
    Ui_RectClearPos(widget, draggable.previous_position);
    UiState.draggables.set(widget.id, {
        previous_position: draggable.position,
        position: new_pos,
        frame: draggable.frame
    });
}
function Ui_SetSize(widget, width, height) {
    UiState.sizes.set(widget.id, { width, height });
}
export function Rect(a, b) {
    const [x, y] = a;
    const [width, height] = b;
    return (Base.Rect(x, y, width + Ui_DefaultWidgetPaddingPxH2, height + Ui_DefaultWidgetPaddingPxV2));
}
function Ui_Widget_new(text, rect, flags) {
    const id = Base.hash_string(text);
    const from_stack = Ui_FindWidget(id);
    if (from_stack) {
        return (from_stack);
    }
    let text_rect = null;
    if (Base.has_flag(flags, UiDrawText)) {
        text_rect = Ui_RectFromText(text);
    }
    const widget = {
        id,
        rect,
        str: text,
        flags: flags,
        background_color: Ui_DefaultBackgroundcolor,
        active_color: Ui_DefaultActiveBackgroundcolor,
        hot_color: Ui_DefaultHotBackgroundcolor,
        border_color: Ui_DefaultBorderColor,
        text_color: Ui_DefaultTextColor,
        text_rect,
        font: Ui_DefaultFont,
        text_size_px: Ui_DefaultTextSize,
        actual_width: rect.width - (Ui_DefaultBorderSize * 2) - Ui_DefaultWidgetPaddingPxH2,
        actual_height: rect.height - (Ui_DefaultBorderSize * 2) - Ui_DefaultWidgetPaddingPxV2,
        border_size_px: Ui_DefaultBorderSize
    };
    if (Base.has_flag(flags, UiDragabble)) {
        const draggable = UiState.draggables.get(id);
        if (!draggable) {
            UiState.draggables.set(id, { position: widget.rect.position, previous_position: Base.V2.Zero(), frame: 0 });
        }
        else {
            draggable.frame = UiState.current_frame;
            widget.rect.position.set(draggable.position);
        }
    }
    const sz = UiState.sizes.get(id);
    if (sz) {
        widget.rect.width = sz.width;
        widget.rect.height = sz.height;
    }
    Ui_Push(widget);
    return (widget);
}
function Ui_RectFromText(text, font_size_px = Ui_DefaultTextSize, font = Ui_DefaultFont) {
    Base.assert(Base.GlobalContext !== null, "`Ui_RectFromText()` GlobalContext must be initialized");
    Base.GlobalContext.font = `${font_size_px}px ${font}`;
    const metrics = Base.GlobalContext.measureText(text);
    const w = metrics.actualBoundingBoxRight +
        metrics.actualBoundingBoxLeft;
    //Ui_DefaultWidgetPaddingPxH2;
    const h = metrics.actualBoundingBoxAscent +
        metrics.actualBoundingBoxDescent;
    //Ui_DefaultWidgetPaddingPxV2;
    return Base.Rect(metrics.actualBoundingBoxLeft, //	+ Ui_DefaultWidgetPaddingPxH,
    metrics.actualBoundingBoxAscent, //+ Ui_DefaultWidgetPaddingPxV,
    Base.round(w), Base.round(h));
}
function Ui_FindWidget(id) {
    let widget = null;
    for (let i = 0; i < UiState.stack.length; i++) {
        if (UiState.stack[i].id == id) {
            widget = UiState.stack[i];
        }
    }
    return (widget);
}
function Ui_RectClear(widget) {
    Base.assert(Base.GlobalContext !== null, "`Ui_RectClear()` GlobalContext must be initialized");
    const x = widget.rect.position.x - widget.border_size_px;
    const y = widget.rect.position.y - widget.border_size_px;
    Base.GlobalContext.clearRect(x, y, widget.rect.width + (widget.border_size_px * 2), widget.rect.height + (widget.border_size_px * 2));
}
function Ui_RectClearPos(widget, position) {
    Base.assert(Base.GlobalContext !== null, "`Ui_RectClear()` GlobalContext must be initialized");
    const x = position.x - widget.border_size_px;
    const y = position.y - widget.border_size_px;
    Base.GlobalContext.clearRect(x, y, widget.rect.width + (widget.border_size_px * 2), widget.rect.height + (widget.border_size_px * 2));
}
function Ui_PointInRect(id) {
    Base.assert(UiState.input !== null, "Ui_State must be initialized");
    const widget = Ui_FindWidget(id);
    let result = false;
    if (widget === null) {
        return (result);
    }
    if (Base.point_in_rect(UiState.input.cursor.position, widget.rect)) {
        result = true;
    }
    return (result);
}
function Ui_MButtonDown() {
    Base.assert(UiState.input !== null, "Ui_State must be initialized");
    return (UiState.input.is_down(Input.MBttn.M_LEFT));
}
function Ui_WidgetIsActive(id) {
    return (id === UiState.active);
}
function Ui_DrawBorders(widget) {
    Base.assert(Base.GlobalContext !== null, "`Ui_DrawText()` GlobalContext must be initialized");
    const px = widget.border_size_px;
    const hpx = Base.round(px / 2);
    Base.GlobalContext.strokeStyle = Base.RGBA_to_css_string(widget.border_color);
    Base.GlobalContext.lineWidth = px;
    Base.GlobalContext.beginPath();
    let x = widget.rect.position.x;
    let y = widget.rect.position.y;
    Base.GlobalContext.moveTo(x - hpx, y);
    Base.GlobalContext.lineTo(x + widget.rect.width + hpx, y);
    Base.GlobalContext.moveTo(x + widget.rect.width, y);
    Base.GlobalContext.lineTo(x + widget.rect.width, y + widget.rect.height + hpx);
    Base.GlobalContext.moveTo(x + widget.rect.width, y + widget.rect.height);
    Base.GlobalContext.lineTo(x - hpx, y + widget.rect.height);
    Base.GlobalContext.moveTo(x, y + widget.rect.height);
    Base.GlobalContext.lineTo(x, y);
    Base.GlobalContext.stroke();
}
function Ui_WidgetIsHot(id) {
    return (id === UiState.hot);
}
function Ui_WidgetSetActive(id) {
    UiState.active = id;
}
function Ui_WidgetSetHot(id) {
    if (UiState.active === Base.u640) {
        UiState.hot = id;
    }
}
function Ui_WidgetRecalculate(widget) {
    widget.actual_width = widget.rect.width - (Ui_DefaultBorderSize * 2) - Ui_DefaultWidgetPaddingPxH2;
    widget.actual_height = widget.rect.height - (Ui_DefaultBorderSize * 2) - Ui_DefaultWidgetPaddingPxV2;
}
function Ui_DrawWidget(widget) {
    let rect = widget.rect;
    let text_offset_x = 0;
    let text_offset_y = 0;
    if (Base.has_flag(widget.flags, UiDrawText)) {
        const text_rect = widget.text_rect;
        text_offset_x = text_rect.position.x;
        text_offset_y = text_rect.position.y;
        const aw = widget.actual_width;
        const ah = widget.actual_height;
        if (text_rect.width > widget.actual_width || text_rect.height > widget.actual_height) {
            rect.width = text_rect.width + Ui_DefaultWidgetPaddingPxH2;
            rect.height = text_rect.height + Ui_DefaultWidgetPaddingPxV2;
        }
        else if (Base.has_flag(widget.flags, UiTextCentered)) {
            text_offset_x = Base.round((aw - text_rect.width) / 2);
            text_offset_y = Base.round((ah + text_rect.height) / 2);
        }
        else if (Base.has_flag(widget.flags, UiTextCenteredX)) {
            text_offset_x = Base.round((aw - text_rect.width) / 2);
        }
        else if (Base.has_flag(widget.flags, UiTextCenteredY)) {
            text_offset_y = Base.round((ah + text_rect.height) / 2);
        }
    }
    Base.GlobalContext.clearRect(rect.position.x, rect.position.y, rect.width, rect.height);
    if (Base.has_flag(widget.flags, UiDrawBackground)) {
        let color = widget.background_color;
        if (Ui_WidgetIsHot(widget.id)) {
            color = widget.hot_color;
        }
        if (Ui_WidgetIsActive(widget.id)) {
            color = widget.active_color;
        }
        Ui_DrawRect(rect, color);
    }
    if (Base.has_flag(widget.flags, UiDrawText)) {
        Ui_DrawText(widget.str, widget.text_color, rect.position.x + text_offset_x + Ui_DefaultWidgetPaddingPxH, rect.position.y + text_offset_y + Ui_DefaultWidgetPaddingPxV, widget.text_size_px, widget.font);
    }
    if (Base.has_flag(widget.flags, UiDrawBorder)) {
        Ui_DrawBorders(widget);
    }
    Ui_WidgetRecalculate(widget);
    Ui_SetSize(widget, rect.width, rect.height);
}
export function Ui_WidgetWithInteraction(widget) {
    const interaction = {
        widget,
        clicked: false,
        dragging: false
    };
    if (Base.has_flag(widget.flags, UiClickable) && Base.has_flag(widget.flags, UiDragabble)) {
        console.warn(`UiWidgetWithInteraction(), widgets cannot be draggable and clickable at the same time at the moment. UiDraggable will be ignored`);
        widget.flags &= ~(UiDragabble);
    }
    if (Base.has_flag(widget.flags, UiClickable)) {
        if (Ui_WidgetIsActive(widget.id)) {
            if (!Ui_MButtonDown()) {
                if (Ui_WidgetIsHot(widget.id)) {
                    interaction.clicked = true;
                }
                Ui_WidgetSetActive(Base.u640);
            }
        }
        else if (Ui_WidgetIsHot(widget.id)) {
            if (Ui_MButtonDown()) {
                Ui_WidgetSetActive(widget.id);
            }
        }
        for (const widget of UiState.stack) {
            if (Ui_WidgetIsHot(widget.id) && !Ui_PointInRect(widget.id)) {
                Ui_WidgetSetHot(Base.u640);
            }
        }
    }
    if (Base.has_flag(widget.flags, UiDragabble)) {
        if (Ui_WidgetIsHot(widget.id) && !UiState.is_dragging) {
            if (Ui_MButtonDown()) {
                Ui_WidgetSetActive(widget.id);
                UiState.is_dragging = true;
                UiState.draggind_id = widget.id;
                if (!UiState.drag_offset) {
                    UiState.drag_offset = UiState.input.cursor.position.clone().sub(widget.rect.position);
                }
            }
        }
        if (Ui_WidgetIsActive(widget.id) && UiState.is_dragging && UiState.draggind_id === widget.id) {
            if (!Ui_MButtonDown()) {
                UiState.is_dragging = false;
                UiState.draggind_id = Base.u640;
                UiState.drag_offset = null;
                Ui_WidgetSetActive(Base.u640);
            }
            else {
                interaction.dragging = true;
                const new_position = UiState.input.cursor.position
                    .clone()
                    .sub(UiState.drag_offset);
                Ui_SetPosition(widget, new_position);
            }
        }
        for (const [id, _] of [...UiState.draggables.entries()]) {
            if (!UiState.is_dragging && Ui_WidgetIsHot(id) && !Ui_PointInRect(id)) {
                Ui_WidgetSetHot(Base.u640);
            }
        }
    }
    if (Ui_PointInRect(widget.id) && UiState.hot === Base.u640) {
        Ui_WidgetSetHot(widget.id);
    }
    return (interaction);
}
export function Button(text, rect) {
    const widget = Ui_Widget_new(text, rect, UiDrawBorder |
        UiTextCentered |
        UiDrawText |
        UiClickable |
        UiDrawBackground);
    return (Ui_WidgetWithInteraction(widget));
}
export function Container(text, rect) {
    const widget = Ui_Widget_new(text, rect, UiDrawBackground |
        UiDragabble |
        UiDrawText |
        UiTextCentered);
    return (Ui_WidgetWithInteraction(widget));
}
export function FrameBegin(dt) {
    UiState.dt = dt;
    for (const [id, { frame, widget }] of [...UiState.cleanup.entries()]) {
        if (UiState.current_frame - frame > 5) {
            Ui_RectClear(widget);
            UiState.cleanup.delete(id);
        }
    }
}
export function FrameEnd() {
    while (UiState.stack.length) {
        const widget = Ui_PopFront();
        Ui_DrawWidget(widget);
    }
    UiState.current_frame += 1;
}
export function ParentP(parent) {
    return (parent.widget.rect.position.array());
}
export function TextS() {
    return ([0, 0]);
}
