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
const UiState = {
    input: null,
    active: Base.u640,
    hot: Base.u640,
    last_active: Base.u640,
    last_hot: Base.u640,
    stack: [],
    current_frame: 0,
    dt: 0
};
export function set_input_instance(input) {
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
        UiState.stack.unshift(wid);
    }
}
function Ui_PopFront() {
    return UiState.stack.shift();
}
function Ui_PopBack() {
    return UiState.stack.pop();
}
export function Rect(x, y, width, height) {
    return (Base.Rect(x, y, width + Ui_DefaultWidgetPaddingPxH2, height + Ui_DefaultWidgetPaddingPxV2));
}
function Ui_Widget_new(text, rect, flags) {
    let text_rect = null;
    if (flags & UiDrawText) {
        text_rect = Ui_RectFromText(text);
    }
    const id = Base.hash_string(text);
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
    w, h);
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
function UiWidgetIsActive(id) {
    return (id === UiState.active);
}
function UiDrawBorders(widget) {
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
function UiWidgetIsHot(id) {
    return (id === UiState.hot);
}
function UiWidgetSetActive(id) {
    UiState.last_active = UiState.active;
    UiState.active = id;
}
function UiWidgetWasHot(id) {
    return (id === UiState.last_hot);
}
function UiWidgetWasActive(id) {
    console.log(id, UiState.last_active);
    return (id === UiState.last_active);
}
function UiWidgetSetHot(id) {
    if (UiState.active === Base.u640) {
        UiState.last_hot = UiState.hot;
        UiState.hot = id;
    }
}
export function FrameBegin(dt) {
    UiState.dt = dt;
    for (const widget of UiState.stack) {
        if (UiWidgetIsHot(widget.id) && !Ui_PointInRect(widget.id)) {
            UiWidgetSetHot(Base.u640);
        }
    }
}
export function FrameEnd() {
    UiState.current_frame += 1;
    UiState.last_hot = Base.u640;
    UiState.last_active = Base.u640;
}
function UiWidgetRecalculate(widget) {
    widget.actual_width = widget.rect.width - (Ui_DefaultBorderSize * 2) - Ui_DefaultWidgetPaddingPxH2;
    widget.actual_height = widget.rect.height - (Ui_DefaultBorderSize * 2) - Ui_DefaultWidgetPaddingPxV2;
}
function UiDrawWidget(id) {
    const widget = Ui_FindWidget(id);
    Base.assert(widget !== null, "UiDrawWidget()");
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
        if (UiWidgetIsHot(widget.id)) {
            color = widget.hot_color;
        }
        if (UiWidgetIsActive(widget.id)) {
            color = widget.active_color;
        }
        Ui_DrawRect(rect, color);
    }
    if (Base.has_flag(widget.flags, UiDrawText)) {
        Ui_DrawText(widget.str, widget.text_color, rect.position.x + text_offset_x + Ui_DefaultWidgetPaddingPxH, rect.position.y + text_offset_y + Ui_DefaultWidgetPaddingPxV, widget.text_size_px, widget.font);
    }
    if (Base.has_flag(widget.flags, UiDrawBorder)) {
        UiDrawBorders(widget);
    }
    UiWidgetRecalculate(widget);
}
export function Button(text, rect) {
    let ans = false;
    const widget = Ui_Widget_new(text, rect, UiDrawBorder | UiTextCentered | UiDrawText | UiClickable);
    if (UiWidgetIsActive(widget.id)) {
        if (!Ui_MButtonDown()) {
            if (UiWidgetIsHot(widget.id)) {
                ans = true;
            }
            UiWidgetSetActive(Base.u640);
        }
    }
    else if (UiWidgetIsHot(widget.id)) {
        if (Ui_MButtonDown()) {
            UiWidgetSetActive(widget.id);
        }
    }
    if (Ui_PointInRect(widget.id)) {
        UiWidgetSetHot(widget.id);
    }
    UiDrawWidget(widget.id);
    return (ans);
}
