import * as Base from "./base.js";
import * as Input from "./input.js";
import * as Sprite from "./sprite.js";
import * as Socket from "./socket.js";
import * as Packet from "./packet.js";
const Ui_DefaultWidgetPaddingPxH = 1;
const Ui_DefaultWidgetPaddingPxV = 1;
const Ui_DefaultWidgetPaddingPxH2 = Ui_DefaultWidgetPaddingPxH * 2;
const Ui_DefaultWidgetPaddingPxV2 = Ui_DefaultWidgetPaddingPxV * 2;
const Ui_DefaultRoundedCornersRadii = 10;
const Ui_DefaultBorderSize = 2;
const Ui_DefaultTextSize = 16;
const Ui_DefaultFont = "Arial";
const Ui_DefaultBackgroundcolor = Base.RGBA(195, 75, 114);
const Ui_DefaultActiveBackgroundcolor = Base.RGB_Darken(Ui_DefaultBackgroundcolor, 0);
const Ui_DefaultHotBackgroundcolor = Base.RGB_Lighten(Ui_DefaultBackgroundcolor, 0);
const Ui_InventorySlotSize = 52;
const Ui_InventoryColumns = 5;
const Ui_DefaultBorderColor = Base.RGBA(0, 0, 0);
const Ui_DefaultTextColor = Base.RGBA(255, 255, 255);
const Ui_InventorySpacingX = 1.1;
const Ui_InventorySpacingY = 1.1;
function Ui_DrawRoundedRectagle(rect, radii, px, fill = false, stroke = true) {
    Base.assert(Base.GlobalContext !== null, "`Ui_DrawRoundedRectagle()` GlobalContext must be initialized");
    const ctx = Base.GlobalContext;
    Base.GlobalContext.lineWidth = px;
    const [r00, r01, r10, r11] = radii;
    const [x, y] = rect.position.array();
    const { width, height } = rect;
    ctx.beginPath();
    ctx.moveTo(x + r01, y);
    ctx.lineTo(x + width - r01, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r01);
    ctx.lineTo(x + width, y + height - r11);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r11, y + height);
    ctx.lineTo(x + r10, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r10);
    ctx.lineTo(x, y + r00);
    ctx.quadraticCurveTo(x, y, x + r00, y);
    ctx.closePath();
    if (stroke) {
        ctx.stroke();
    }
    if (fill) {
        ctx.fill();
    }
}
export function Ui_DrawText(text, color, x, y, font_size_px = Ui_DefaultTextSize, font = Ui_DefaultFont) {
    Base.assert(Base.GlobalContext !== null, "`Ui_DrawText()` GlobalContext must be initialized");
    Base.GlobalContext.fillStyle = Base.RGBA_to_hex_string(color);
    Base.GlobalContext.font = `${font_size_px}px ${font}`;
    Base.GlobalContext.fillText(text, x, y);
}
function Ui_WidgetDrawRect(widget) {
    //if (widget.rect.width  <= 0 ||
    //		widget.rect.height <= 0) { return; }
    //
    let color = widget.background_color;
    if (Ui_IsHot(widget.id)) {
        color = widget.hot_color;
    }
    if (Ui_IsActive(widget.id)) {
        color = widget.active_color;
    }
    if (Ui_IsFocused(widget.id)) {
        //color = Base.RGBA_FULL_RED;
    }
    Base.GlobalContext.fillStyle = Base.RGBA_to_css_string(color);
    Base.GlobalContext.strokeStyle = Base.RGBA_to_css_string(widget.border_color);
    const radii = widget.radii;
    Ui_DrawRoundedRectagle(widget.rect, radii, widget.border_size_px, Base.has_flag(widget.flags, UiDrawBackground), Base.has_flag(widget.flags, UiDrawBorder));
}
export const UiTextCenteredX = 1 << 0;
export const UiTextCenteredY = 1 << 1;
export const UiDrawText = 1 << 2;
export const UiDrawBackground = 1 << 3;
export const UiDrawBorder = 1 << 4;
export const UiClickable = 1 << 5;
export const UiDrawImage = 1 << 6;
export const UiImageCenteredX = 1 << 7;
export const UiImageCenteredY = 1 << 8;
export const UiDragabbleX = 1 << 9;
export const UiDragabbleY = 1 << 10;
export const UiResizeToContent = 1 << 11;
export const UiScroll = 1 << 12;
export const UiScrollViewX = 1 << 13;
export const UiScrollViewY = 1 << 14;
export const UiScrollView = 1 << 15;
export const UiViewClampX = 1 << 16;
export const UiViewClampY = 1 << 17;
export const UiViewClamp = 1 << 18;
export const UiPersistSize = 1 << 19;
export const UiDragabble = 1 << 20;
export const UiImageCentered = 1 << 21;
export const UiTextCentered = 1 << 22;
export const UiPersistPosition = 1 << 23;
export const UiScaleImageToBox = 1 << 24;
const UiState = {
    stack: [],
    focused: Base.u640,
    active: Base.u640,
    hot: Base.u640,
    drag_start: Base.V2.Zero(),
    is_dragging: false,
    current_frame: 0,
    delta_time: 0,
    input_instance: null,
    rounded_corner_radii_stack: [],
    active_color_stack: [],
    border_color_stack: [],
    text_offset_stack: [],
    text_color_stack: [],
    border_px_stack: [],
    hot_color_stack: [],
    bg_color_stack: [],
    padding_stack: [],
    font_stack: [],
    socket: null,
    key_press_history: new Map(),
};
export function SetInputInstance(input) {
    UiState.input_instance = input;
}
export function Init(socket) {
    UiState.socket = socket;
    Socket.add_listener(Packet.PacketKind.PacketKind_SpriteInfo, function (packet) {
        UiSpriteLoaderPushFromServer(packet);
    });
    Socket.add_connection_hook(function () {
        Socket.send_packet(socket, Packet.packet_request_sprite_info_make("sprites"));
    });
}
function Ui_Push(wid) {
    let place = -1;
    for (let i = 0; i < UiState.stack.length; i++) {
        if (!UiState.stack[i]) {
            place = i;
            break;
        }
    }
    if (place > -1) {
        UiState.stack[place] = wid;
    }
    else {
        Base.very_stupid_array_push_back(wid, UiState.stack);
    }
}
export const WidgetPTop = 0;
export const WidgetPBottom = 1;
export const WidgetPLeft = 2;
export const WidgetPRight = 3;
export const WidgetBorderRadiusTL = 0;
export const WidgetBorderRadiusTR = 1;
export const WidgetBorderRadiusBL = 2;
export const WidgetBorderRadiusBR = 3;
function Ui_Widget_new(text, rect, flags, view_width = null, view_height = null) {
    let hash_part = text;
    ;
    if (text.includes("#")) {
        //part_used_to_generate_hash#displayed_part
        const split = text.split("#");
        hash_part = split[0];
        text = split[1];
    }
    const id = Base.hash_string(hash_part);
    if (!view_width) {
        view_width = rect.width;
    }
    if (!view_height) {
        view_height = rect.height;
    }
    const from_stack = Ui_FindWidget(id);
    if (from_stack) {
        from_stack.last_rendered_frame = UiState.current_frame;
        if (!Base.has_flag(from_stack.flags, UiPersistSize)) {
            from_stack.rect.width = rect.width;
            from_stack.rect.height = rect.height;
        }
        if (!Base.has_flag(from_stack.flags, UiPersistPosition)) {
            from_stack.rect.position.set(rect.position);
        }
        from_stack.border_and_padding_increment.width = Base.Floor(Ui_WidgetHPadding(from_stack.padding) + from_stack.border_size_px * 2);
        from_stack.border_and_padding_increment.height = Base.Floor(Ui_WidgetVPadding(from_stack.padding) + from_stack.border_size_px * 2);
        from_stack.border_and_padding_increment.position.x = Base.Floor(from_stack.padding[WidgetPLeft] + from_stack.border_size_px);
        from_stack.border_and_padding_increment.position.y = Base.Floor(from_stack.padding[WidgetPTop] + from_stack.border_size_px);
        from_stack.str = text;
        from_stack.flags = flags;
        from_stack.view_width = view_width;
        from_stack.view_height = view_height;
        return (from_stack);
    }
    const widget = {
        id,
        // string used to generate id and display text if flag is set
        str: text,
        selection: Base.V2.Zero(),
        flags: flags,
        // position and fixed size of rectagle
        rect,
        // off of view content (used for scroll logic)
        view_offset: Base.V2.Zero(),
        // total view width (used for scroll logic)
        view_width,
        // total view height (used for scroll logic)
        view_height,
        // offset of displayed text if flag is set
        text_offset: Base.V2.Zero(),
        // image data to display if flag is set
        image_data: null,
        // specific area of image_data to display if flag is set
        image_rect: null,
        //TODO(rnoba): this should not be here,
        // it should be generated when the text is being rendered not before. 
        //text_rect,
        //default padding
        padding: [
            Ui_DefaultWidgetPaddingPxV,
            Ui_DefaultWidgetPaddingPxH,
            Ui_DefaultWidgetPaddingPxV,
            Ui_DefaultWidgetPaddingPxH
        ],
        // default radius of 4 corners
        radii: [
            Ui_DefaultRoundedCornersRadii,
            Ui_DefaultRoundedCornersRadii,
            Ui_DefaultRoundedCornersRadii,
            Ui_DefaultRoundedCornersRadii
        ],
        active_color: Ui_DefaultActiveBackgroundcolor,
        background_color: Ui_DefaultBackgroundcolor,
        hot_color: Ui_DefaultHotBackgroundcolor,
        border_color: Ui_DefaultBorderColor,
        text_color: Ui_DefaultTextColor,
        font: Ui_DefaultFont,
        font_size: Ui_DefaultTextSize,
        border_size_px: Ui_DefaultBorderSize,
        border_and_padding_increment: Base.Rect(Ui_DefaultWidgetPaddingPxH + Ui_DefaultBorderSize, Ui_DefaultWidgetPaddingPxV + Ui_DefaultBorderSize, Ui_DefaultWidgetPaddingPxH2 + Ui_DefaultBorderSize * 2, Ui_DefaultWidgetPaddingPxV2 + Ui_DefaultBorderSize * 2),
        initial_width: rect.width,
        initial_height: rect.height,
        initial_x: rect.position.x,
        initial_y: rect.position.y,
        last_rendered_frame: UiState.current_frame,
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
    const h = metrics.actualBoundingBoxAscent +
        metrics.actualBoundingBoxDescent;
    return Base.Rect(metrics.actualBoundingBoxLeft, metrics.actualBoundingBoxAscent, Base.Round(w), Base.Round(h));
}
function Ui_FindWidget(id) {
    let widget = null;
    let i = 0;
    for (; i < UiState.stack.length; i++) {
        if (UiState.stack[i] && UiState.stack[i].id == id) {
            widget = UiState.stack[i];
        }
    }
    return (widget);
}
function Ui_RectClear(widget) {
    Base.assert(Base.GlobalContext !== null, "`Ui_RectClear()` GlobalContext must be initialized");
    const x = widget.rect.position.x + widget.border_and_padding_increment.position.x;
    const y = widget.rect.position.y + widget.border_and_padding_increment.position.y;
    Base.GlobalContext.clearRect(x, y, widget.rect.width + widget.border_and_padding_increment.width, widget.rect.height + widget.border_and_padding_increment.height);
}
function Ui_PointInRect(widget) {
    Base.assert(UiState.input_instance !== null, "UiState must be initialized");
    let result = false;
    if (Base.point_in_rect(UiState.input_instance.cursor.position, widget.rect)) {
        result = true;
    }
    return (result);
}
function Ui_MButtonDown() {
    Base.assert(UiState.input_instance !== null, "Ui_State must be initialized");
    return (UiState.input_instance.is_down(Input.MBttn.M_LEFT));
}
function Ui_IsActive(id) {
    return (id === UiState.active);
}
function Ui_IsHot(id) {
    return (id === UiState.hot);
}
function Ui_IsFocused(id) {
    return (id === UiState.focused);
}
function Ui_SetActive(id) {
    UiState.active = id;
}
function Ui_SetFocused(id) {
    UiState.focused = id;
}
function Ui_SetHot(id) {
    UiState.hot = id;
}
function Ui_WidgetVPadding(padding) {
    return (padding[WidgetPTop] +
        padding[WidgetPBottom]);
}
function Ui_WidgetHPadding(padding) {
    return (padding[WidgetPLeft] +
        padding[WidgetPRight]);
}
// TODO(rnoba): refactor this
function Ui_DrawWidget(widget) {
    let draw_rect = widget.rect;
    let offset_x = 0;
    let offset_y = 0;
    let scale_x = 1;
    let scale_y = 1;
    if (Base.has_flag(widget.flags, UiDrawText)) {
        const text_rect = Ui_RectFromText(widget.str, widget.font_size, widget.font);
        offset_x = text_rect.position.x + widget.border_and_padding_increment.position.x;
        offset_y = text_rect.position.y + widget.border_and_padding_increment.position.y;
        if (text_rect.width > draw_rect.width + widget.border_and_padding_increment.width ||
            text_rect.height > draw_rect.height + widget.border_and_padding_increment.height) {
            if (Base.has_flag(widget.flags, UiResizeToContent)) {
                draw_rect.width = text_rect.width;
                draw_rect.height = text_rect.height;
            }
            else {
                // cut text
            }
        }
        if (Base.has_flag(widget.flags, UiTextCentered)) {
            if (Base.has_flag(widget.flags, UiTextCenteredX)) {
                offset_x += Math.floor((draw_rect.width - text_rect.width) / 2) - widget.border_and_padding_increment.position.x;
            }
            if (Base.has_flag(widget.flags, UiTextCenteredY)) {
                offset_y += Math.floor((draw_rect.height - text_rect.height) / 2) - widget.border_and_padding_increment.position.y;
            }
        }
    }
    if (Base.has_flag(widget.flags, UiDrawImage)) {
        offset_x = widget.border_and_padding_increment.position.x;
        offset_y = widget.border_and_padding_increment.position.y;
        const image_bitmap = widget.image_data;
        const image_rect = widget.image_rect;
        let rect_width = image_bitmap.width;
        let rect_height = image_bitmap.height;
        if (image_rect) {
            rect_width = image_rect.width;
            rect_height = image_rect.height;
            if (image_rect.width > draw_rect.width + widget.border_and_padding_increment.width ||
                image_rect.height > draw_rect.height + widget.border_and_padding_increment.height) {
                if (Base.has_flag(widget.flags, UiResizeToContent)) {
                    draw_rect.width = image_rect.width;
                    draw_rect.height = image_rect.height;
                }
                else if (Base.has_flag(widget.flags, UiScaleImageToBox)) {
                    scale_x = image_rect.width / draw_rect.width;
                    scale_y = image_rect.height / draw_rect.height;
                }
            }
        }
        else if (image_bitmap.width > draw_rect.width + widget.border_and_padding_increment.width ||
            image_bitmap.height > draw_rect.height + widget.border_and_padding_increment.height) {
            if (Base.has_flag(widget.flags, UiResizeToContent)) {
                draw_rect.width = image_bitmap.width;
                draw_rect.height = image_bitmap.height;
            }
            else if (Base.has_flag(widget.flags, UiScaleImageToBox)) {
                scale_x = image_bitmap.width / draw_rect.width;
                scale_y = image_bitmap.height / draw_rect.height;
            }
        }
        if (Base.has_flag(widget.flags, UiImageCentered)) {
            if (Base.has_flag(widget.flags, UiImageCenteredX)) {
                offset_x += Math.floor((draw_rect.width - rect_width) / 2) - widget.border_and_padding_increment.position.x;
            }
            if (Base.has_flag(widget.flags, UiImageCenteredY)) {
                offset_y += Math.floor((draw_rect.height - rect_height) / 2) - widget.border_and_padding_increment.position.y;
            }
        }
    }
    if (Base.has_flag(widget.flags, UiScaleImageToBox) || offset_x < 0 || offset_y < 0) {
        offset_x = 0;
        offset_y = 0;
    }
    Ui_WidgetDrawRect(widget);
    if (Base.has_flag(widget.flags, UiDrawText)) {
        Ui_DrawText(widget.str, widget.text_color, draw_rect.position.x + offset_x, draw_rect.position.y + offset_y, widget.font_size, widget.font);
    }
    if (Base.has_flag(widget.flags, UiDrawImage)) {
        const image_bitmap = widget.image_data;
        const image_rect = widget.image_rect;
        if (image_rect) {
            Base.GlobalContext.drawImage(image_bitmap, Base.Floor(image_rect.position.x), Base.Floor(image_rect.position.y), draw_rect.width, draw_rect.height, 
            //image_rect.width  * scale_x,
            //image_rect.height * scale_y,
            draw_rect.position.x + Base.Floor(offset_x), draw_rect.position.y + Base.Floor(offset_y), Base.Floor(draw_rect.width) - widget.border_and_padding_increment.width, Base.Floor(draw_rect.height) - widget.border_and_padding_increment.height);
        }
        else {
            Base.GlobalContext.drawImage(image_bitmap, 0, 0, Math.min(draw_rect.width, image_bitmap.width) * scale_x, Math.min(draw_rect.height, image_bitmap.height) * scale_y, draw_rect.position.x + offset_x, draw_rect.position.y + offset_y, Base.has_flag(widget.flags, UiScaleImageToBox) ? draw_rect.width : image_bitmap.width, Base.has_flag(widget.flags, UiScaleImageToBox) ? draw_rect.height : image_bitmap.height);
        }
    }
}
export function Ui_Cursor() {
    return (UiState.input_instance.cursor);
}
export function Ui_DragDelta() {
    return (Ui_Cursor().position
        .clone()
        .sub(UiState.drag_start));
}
export function Ui_WidgetWithInteraction(widget) {
    const interaction = {
        widget,
        clicked: false,
        dragging: false,
        double_clicked: false,
        hovering: false,
        scroll_x: 0,
        scroll_y: 0,
    };
    const mouse_in_rect = Ui_PointInRect(widget);
    if (Base.has_flag(widget.flags, UiClickable) &&
        mouse_in_rect &&
        Ui_MButtonDown() &&
        !UiState.is_dragging) {
        Ui_SetHot(widget.id);
        Ui_SetActive(widget.id);
        Ui_SetFocused(widget.id);
        UiState.drag_start.set(Ui_Cursor().position);
        const history = UiState.key_press_history.get(Input.MBttn.M_LEFT);
        if (history && (history.id === widget.id &&
            UiState.current_frame - history.frame < 10)) {
            interaction.double_clicked = true;
            history.id = Base.u640;
        }
    }
    if (Base.has_flag(widget.flags, UiClickable) &&
        mouse_in_rect &&
        !Ui_MButtonDown() &&
        Ui_IsActive(widget.id)) {
        Ui_SetActive(Base.u640);
        UiState.key_press_history.set(Input.MBttn.M_LEFT, { id: widget.id, frame: UiState.current_frame });
        interaction.clicked = true;
        UiState.is_dragging = false;
    }
    if (Base.has_flag(widget.flags, UiClickable) &&
        !mouse_in_rect &&
        !Ui_MButtonDown() &&
        Ui_IsActive(widget.id)) {
        Ui_SetActive(Base.u640);
        Ui_SetHot(Base.u640);
    }
    if (Base.has_flag(widget.flags, UiClickable) &&
        !mouse_in_rect &&
        Ui_MButtonDown() &&
        Ui_IsFocused(widget.id)) {
        Ui_SetFocused(Base.u640);
    }
    if (Base.has_flag(widget.flags, UiClickable) &&
        mouse_in_rect &&
        (Ui_IsActive(Base.u640) || Ui_IsActive(widget.id))) {
        Ui_SetHot(widget.id);
        interaction.hovering = true;
    }
    let evt = UiState.input_instance.next_event();
    if (evt && ["wheel"].includes(evt[0])) 
    //for (; evt; evt = UiState.input_instance!.next_event())
    {
        if (Base.has_flag(widget.flags, UiScroll) &&
            mouse_in_rect) {
            let { deltaX: dx, deltaY: dy } = evt[1];
            if (UiState.input_instance.is_down(Input.KKey.KEY_LShift)) {
                let tmp = dx;
                dx = dy;
                dy = tmp;
            }
            interaction.scroll_x += dx;
            interaction.scroll_y += dy;
            UiState.input_instance.consume_event();
        }
        let scrolled = false;
        if (Base.has_flag(widget.flags, UiScrollView) &&
            mouse_in_rect && !UiState.input_instance.is_down(Input.KKey.KEY_S)) {
            let { deltaX: dx, deltaY: dy } = evt[1];
            if (UiState.input_instance.is_down(Input.KKey.KEY_LShift)) {
                let tmp = dx;
                dx = dy;
                dy = tmp;
            }
            if (!Base.has_flag(widget.flags, UiScrollViewX)) {
                if (dy == 0) {
                    dy = dx;
                }
                dx = 0;
            }
            if (!Base.has_flag(widget.flags, UiScrollViewY)) {
                if (dx == 0) {
                    dx = dy;
                }
                dy = 0;
            }
            widget.view_offset.x += dx;
            widget.view_offset.y += dy;
            UiState.input_instance.consume_event();
            scrolled = true;
        }
        if (scrolled && Base.has_flag(widget.flags, UiViewClamp)) {
            const max_view_x = Math.max(0, widget.view_width - widget.rect.width);
            const max_view_y = Math.max(0, widget.view_height - widget.rect.height);
            if (Base.has_flag(widget.flags, UiViewClampX)) {
                widget.view_offset.x = Base.Clamp(widget.view_offset.x, 0, max_view_x);
            }
            if (Base.has_flag(widget.flags, UiViewClampY)) {
                widget.view_offset.y = Base.Clamp(widget.view_offset.y, 0, max_view_y);
            }
        }
    }
    interaction.dragging = (UiState.is_dragging && Ui_IsActive(widget.id));
    Ui_GetStackValues(widget);
    return (interaction);
}
export function Button(text, rect, flags = 0) {
    const widget = Ui_Widget_new(text, rect, UiTextCentered |
        UiTextCenteredX |
        UiTextCenteredY |
        UiResizeToContent |
        UiDrawBorder |
        UiDrawText |
        UiClickable |
        UiDrawBackground |
        UiPersistSize | flags);
    return (Ui_WidgetWithInteraction(widget));
}
export function Container(text, rect, flags = 0, view_width = null, view_height = null) {
    const widget = Ui_Widget_new(text, rect, UiDrawBackground | flags, view_width, view_height);
    return (Ui_WidgetWithInteraction(widget));
}
export function TextInput(state, text, rect, flags = 0) {
    const text_rect = Container(text + "#" + state.value, rect, UiClickable |
        UiDrawText |
        UiTextCentered |
        UiTextCenteredY | flags);
    let text_metrics = Ui_RectFromText(state.value, text_rect.widget.font_size, text_rect.widget.font);
    const input_selection = text_rect.widget.selection;
    if (Ui_IsFocused(text_rect.widget.id)) {
        let evt = UiState.input_instance.next_event();
        if (evt && ["keyup", "keydown"].includes(evt[0])) {
            const is_key_down = UiState.input_instance.is_down(evt[1].keyCode);
            if (is_key_down) {
                Ui_SetActive(text_rect.widget.id);
                if (UiState.input_instance.is_down(Input.KKey.KEY_Backspace)) {
                    state.value = state.value.substring(0, state.value.length - 1);
                    if (input_selection.x > 0 && input_selection.y > 0) {
                        while (text_metrics.width > 0 && text_metrics.height > 0) {
                            state.value = state.value.substring(0, state.value.length - 1);
                            text_metrics = Ui_RectFromText(state.value, text_rect.widget.font_size, text_rect.widget.font);
                        }
                        input_selection.x = 0;
                        input_selection.y = 0;
                    }
                }
                else {
                    if (input_selection.x > 0 && input_selection.y > 0) {
                        while (text_metrics.width > 0 && text_metrics.height > 0) {
                            state.value = state.value.substring(0, state.value.length - 1);
                            text_metrics = Ui_RectFromText(state.value, text_rect.widget.font_size, text_rect.widget.font);
                        }
                        input_selection.x = 0;
                        input_selection.y = 0;
                    }
                    state.value += evt[1].key;
                }
            }
        }
        if (input_selection.x === 0 && input_selection.y === 0) {
            const sine_wave = 0.5 * (1 + Math.sin(UiState.current_frame * (1 / 60) * 10));
            PushGeneralBackgroundColor(Base.RGBA(0, 0, 0, sine_wave));
            PushPadding(0, 0, 0, 0);
            PushBorderPx(0);
            PushRoundedCorners(0, 0, 0, 0);
            const selection = CleanWidgetWithInteraction(text + "--" + "cursor", Base.Rect(rect.position.x + text_rect.widget.border_and_padding_increment.position.x + text_metrics.width + 2, rect.position.y + (rect.height - 25) / 4 + text_rect.widget.border_and_padding_increment.position.y, 2, 25), UiDrawBackground);
            PopRoundedCorners();
            PopBorderPx();
            PopPadding();
            PopGeneralBackgroundColor();
        }
    }
    else {
        input_selection.x = 0;
        input_selection.y = 0;
    }
    if (text_rect.double_clicked) {
        input_selection.x = text_metrics.width;
        input_selection.y = text_metrics.height;
    }
    if (input_selection.x > 0 && input_selection.y > 0) {
        PushGeneralBackgroundColor(Base.RGBA(0, 0, 0, 0.4));
        PushPadding(0, 0, 0, 0);
        PushBorderPx(0);
        const selection = CleanWidgetWithInteraction(text + "--" + "selection", Base.Rect(rect.position.x + text_rect.widget.border_and_padding_increment.position.x, rect.position.y + (rect.height - input_selection.y) / 4 + text_rect.widget.border_and_padding_increment.position.y, input_selection.x, input_selection.y + text_rect.widget.border_and_padding_increment.height), UiDrawBackground);
        PopBorderPx();
        PopPadding();
        PopGeneralBackgroundColor();
    }
    return (text_rect);
}
export function ImageContainer(text, rect, image, flags = 0, img_rect = null) {
    const widget = Ui_Widget_new(text, rect, UiDrawImage | flags);
    widget.image_data = image;
    widget.image_rect = img_rect;
    return (Ui_WidgetWithInteraction(widget));
}
export function CleanWidgetWithInteraction(text, rect, flags) {
    const widget = Ui_Widget_new(text, rect, flags);
    return (Ui_WidgetWithInteraction(widget));
}
export function Draggable(text, rect, flags = 0) {
    const widget = Ui_Widget_new(text, rect, UiDrawBackground |
        UiDrawBorder |
        UiDragabble |
        UiClickable | flags);
    return (Ui_WidgetWithInteraction(widget));
}
export function ScrollBar(text, rect, view_widget, flags = 0) {
    PushBorderPx(1);
    const container = CleanWidgetWithInteraction(text + "-" + "container", rect, UiScroll | UiDrawBorder | UiDrawBackground | UiClickable);
    PopBorderPx();
    const pct = Base.Clamp(rect.height / view_widget.view_height, 0, 1);
    const height = rect.height * pct;
    const draggable_offset = rect.height * view_widget.view_offset.y / view_widget.view_height;
    PushGeneralBackgroundColor(Base.RGBA(0, 0, 0, 0));
    PushBorderPx(1);
    const dragabble = Container(text + "-" + "dragabble", Base.Rect(rect.position.x + rect.width / 4, rect.position.y + draggable_offset, rect.width / 2, height), UiClickable |
        UiDrawBorder |
        (pct < 1 ? UiDragabble | UiDragabbleY : 0));
    PopBorderPx();
    PopGeneralBackgroundColor();
    const max_view_x = Math.max(0, view_widget.view_width - view_widget.rect.width);
    const max_view_y = Math.max(0, view_widget.view_height - view_widget.rect.height);
    if (dragabble.dragging) {
        const delta = Ui_DragDelta();
        if (Base.has_flag(view_widget.flags, UiViewClampX)) {
            view_widget.view_offset.x = Base.Clamp(view_widget.view_offset.x + delta.x * UiState.delta_time * 100, 0, max_view_x);
        }
        if (Base.has_flag(view_widget.flags, UiViewClampY)) {
            view_widget.view_offset.y = Base.Clamp(view_widget.view_offset.y + delta.y * UiState.delta_time * 100, 0, max_view_y);
        }
        UiState.drag_start.set(Ui_Cursor().position);
    }
    if (container.clicked) {
        const click_pos = Ui_Cursor().position;
        const offset_y = click_pos.y - rect.position.y;
        const pct = offset_y / (rect.height + height);
        const view_offset = pct * view_widget.view_height;
        view_widget.view_offset.y = Base.Clamp(view_offset, 0, max_view_y);
    }
    return (0);
}
export function FrameBegin(dt) {
    UiState.delta_time = dt;
    if (Ui_IsActive(Base.u640)) {
        Ui_SetHot(Base.u640);
        UiState.is_dragging = false;
    }
    Ui_PopStacks();
}
export function FrameEnd() {
    if (!Ui_IsActive(Base.u640)) {
        const widget = Ui_FindWidget(UiState.active);
        if (widget && Base.has_flag(widget.flags, UiDragabble)) {
            UiState.is_dragging = true;
        }
    }
    for (let i = 0; i < UiState.stack.length; i++) {
        const widget = UiState.stack[i];
        if (!widget)
            continue;
        if (UiState.current_frame - widget.last_rendered_frame > 2) {
            delete UiState.stack[i];
            continue;
        }
        Ui_DrawWidget(widget);
    }
    if (UiState.current_frame % 100 === 0) {
        window.requestIdleCallback(function () {
            UiState.stack = UiState.stack.filter(() => true);
        });
    }
    UiState.input_instance.consume_event();
    UiState.current_frame += 1;
}
export function PositionFromInteraction(interaction) {
    const x = interaction.widget.rect.position.x;
    const y = interaction.widget.rect.position.y;
    return ([
        x + interaction.widget.border_size_px + interaction.widget.border_and_padding_increment.position.x,
        y + interaction.widget.border_size_px + interaction.widget.border_and_padding_increment.position.y
    ]);
}
export function AbsolutePositionFromInteraction(interaction) {
    const x = interaction.widget.rect.position.x;
    const y = interaction.widget.rect.position.y;
    return ([x, y]);
}
export function AbsoluteSizeFromInteraction(interaction) {
    const w = interaction.widget.rect.width;
    const h = interaction.widget.rect.height;
    return ([
        w,
        h
    ]);
}
export function SizeFromInteraction(interaction) {
    const w = interaction.widget.rect.width;
    const h = interaction.widget.rect.height;
    return ([
        w + interaction.widget.border_and_padding_increment.width,
        h + interaction.widget.border_and_padding_increment.height,
    ]);
}
export function PushBackgroundColor(color) {
    Base.very_stupid_array_push_front(color, UiState.bg_color_stack);
}
export function PushRoundedCorners(tl, tr, bl, br) {
    const radii = [tl, tr, bl, br];
    Base.very_stupid_array_push_front(radii, UiState.rounded_corner_radii_stack);
}
export function PushPadding(top, bottom, left, right) {
    const padding = [top, bottom, left, right];
    Base.very_stupid_array_push_front(padding, UiState.padding_stack);
}
export function PushBorderPx(px) {
    Base.very_stupid_array_push_front(px, UiState.border_px_stack);
}
export function PushActiveBackgroundColor(color) {
    Base.very_stupid_array_push_front(color, UiState.active_color_stack);
}
export function PushFont(font, size = Ui_DefaultTextSize) {
    Base.very_stupid_array_push_front([font, size], UiState.font_stack);
}
export function PushHotBackgroundColor(color) {
    Base.very_stupid_array_push_front(color, UiState.hot_color_stack);
}
export function PushBorderColor(color) {
    Base.very_stupid_array_push_front(color, UiState.border_color_stack);
}
export function PushTextColor(color) {
    Base.very_stupid_array_push_front(color, UiState.text_color_stack);
}
export function PushTextOffset(offset) {
    Base.very_stupid_array_push_front(offset, UiState.text_offset_stack);
}
export function PopBackgroundColor() {
    return UiState.bg_color_stack.shift();
}
export function PopRoundedCorners() {
    return UiState.rounded_corner_radii_stack.shift();
}
export function PopBorderPx() {
    return UiState.border_px_stack.shift();
}
export function PopBorderColor() {
    return UiState.border_color_stack.shift();
}
export function PopPadding() {
    return UiState.padding_stack.shift();
}
export function PopFont() {
    return UiState.font_stack.shift();
}
export function PopActiveBackgroundColor() {
    return UiState.active_color_stack.shift();
}
export function PopHotBackgroundColor() {
    return UiState.hot_color_stack.shift();
}
export function PopTextColor() {
    return UiState.text_color_stack.shift();
}
export function PopTextOffset() {
    return UiState.text_offset_stack.shift();
}
export function PushGeneralBackgroundColor(color) {
    PushBackgroundColor(color);
    PushActiveBackgroundColor(color);
    PushHotBackgroundColor(color);
}
export function PopGeneralBackgroundColor() {
    PopBackgroundColor();
    PopActiveBackgroundColor();
    PopHotBackgroundColor();
}
function Ui_PopStacks() {
    PopBackgroundColor();
    PopRoundedCorners();
    PopBorderPx();
    PopActiveBackgroundColor();
    PopHotBackgroundColor();
    PopPadding();
    PopBorderColor();
    PopTextColor();
    PopFont();
    PopTextOffset();
}
function Ui_GetStackValues(widget) {
    widget.background_color = UiState.bg_color_stack[0] || widget.background_color;
    widget.active_color = UiState.active_color_stack[0] || widget.active_color;
    widget.hot_color = UiState.hot_color_stack[0] || widget.hot_color;
    widget.radii = UiState.rounded_corner_radii_stack[0] || widget.radii;
    if (UiState.border_px_stack.length > 0) {
        widget.border_size_px = UiState.border_px_stack[0];
    }
    widget.padding = UiState.padding_stack[0] || widget.padding;
    widget.border_color = UiState.border_color_stack[0] || widget.border_color;
    widget.text_color = UiState.text_color_stack[0] || widget.text_color;
    widget.text_offset = UiState.text_offset_stack[0] || widget.text_offset;
    if (UiState.font_stack[0]) {
        widget.font = UiState.font_stack[0][0];
        widget.font_size = UiState.font_stack[0][1];
    }
    if (UiState.border_px_stack[0] === 0) {
        widget.flags &= ~(UiDrawBorder);
    }
}
const Inventory = {
    selected_item: 0,
    show: true
};
export function DrawInventory(sprites) {
    if (UiState.input_instance.pressed(Input.KKey.KEY_E)) {
        Inventory.show = !Inventory.show;
    }
    if (Inventory.show) {
        PushRoundedCorners(5, 5, 5, 5);
        PushBorderPx(3);
        PushGeneralBackgroundColor(Base.RGBA(217, 237, 236, 1));
        PushBorderColor(Base.RGBA(177, 177, 177));
        PushTextColor(Base.RGBA(75, 78, 94, 0.8));
        PushFont("GamesStudios", 18);
        PushTextOffset(Base.V2.New(0, 5));
        const draggable = Draggable("INVENTORY", Base.Rect(10, 10, 500, 300), UiPersistPosition);
        const draggable_absolute_position = AbsolutePositionFromInteraction(draggable);
        const draggable_size = AbsoluteSizeFromInteraction(draggable);
        PopTextOffset();
        PopFont();
        PopTextColor();
        PopBorderColor();
        PopGeneralBackgroundColor();
        PopBorderPx();
        PopRoundedCorners();
        if (draggable.dragging) {
            const delta = Ui_DragDelta();
            draggable.widget.rect.position.add(delta.scale(UiState.delta_time * 70));
            UiState.drag_start.set(Ui_Cursor().position);
        }
        const close_button_position = [
            draggable_absolute_position[0] + draggable_size[0] - 15,
            draggable_absolute_position[1] + draggable.widget.padding[WidgetPTop]
        ];
        PushBorderColor(Base.RGBA(177, 177, 177));
        PushTextColor(Base.RGBA(177, 177, 177));
        PushTextOffset(Base.V2.New(0, 0));
        if (CleanWidgetWithInteraction("x", Base.Rect(close_button_position[0], close_button_position[1], 10, 10), UiDrawText |
            UiClickable |
            UiTextCentered).clicked) {
            Inventory.show = false;
        }
        PopTextOffset();
        PopTextColor();
        PopBorderColor();
        const inventory_slots = 40;
        const inventory_area_view_height = Base.Floor(inventory_slots / Ui_InventoryColumns) * Ui_InventorySlotSize * Ui_InventorySpacingY;
        PushGeneralBackgroundColor(Base.RGBA(255, 255, 255, 1));
        PushBorderPx(1);
        PushBorderColor(Base.RGBA(177, 177, 177));
        const offset_y = 20;
        const inventory_area_width = draggable_size[0] - draggable.widget.padding[WidgetPRight] - 1;
        const inventory_area_height = draggable_size[1] - offset_y - draggable.widget.padding[WidgetPBottom];
        const container_position = [
            draggable_absolute_position[0] + draggable.widget.padding[WidgetPLeft],
            draggable_absolute_position[1] + offset_y + draggable.widget.padding[WidgetPTop]
        ];
        const inventory_area = Container("container", Base.Rect(container_position[0], container_position[1], inventory_area_width, inventory_area_height), UiClickable | UiViewClamp | UiViewClampY | UiScrollView | UiScrollViewY, null, inventory_area_view_height);
        PopBorderColor();
        PopBorderPx();
        PopGeneralBackgroundColor();
        const scrollbar_height = inventory_area_height - inventory_area.widget.border_size_px * 2 - 2;
        const scrollbar_width = 20;
        PushRoundedCorners(3, 3, 3, 3);
        ScrollBar("inventory-scroll", Base.Rect(container_position[0] + Ui_InventorySlotSize * Ui_InventoryColumns * Ui_InventorySpacingX + 5, container_position[1] + inventory_area.widget.border_size_px * 2 + inventory_area.widget.padding[WidgetPTop], scrollbar_width, scrollbar_height), inventory_area.widget);
        PopRoundedCorners();
        const inventory_area_position = PositionFromInteraction(inventory_area);
        const inventory_area_size = SizeFromInteraction(inventory_area);
        PushBorderPx(1);
        PushGeneralBackgroundColor(Base.RGBA_FULL_BLUE);
        PushRoundedCorners(3, 3, 3, 3);
        PushPadding(1, 1, 1, 1);
        for (let x = 0; x < inventory_slots; x += 1) {
            const nx = inventory_area_position[0] + Base.Floor(x % Ui_InventoryColumns) * Ui_InventorySlotSize * Ui_InventorySpacingX;
            let ny = inventory_area_position[1] + Base.Floor(x / Ui_InventoryColumns) * Ui_InventorySlotSize * Ui_InventorySpacingY - inventory_area.widget.view_offset.y;
            if (ny + Ui_InventorySlotSize < inventory_area_position[1]) {
                continue;
            }
            if (ny > inventory_area_position[1] + inventory_area_size[1]) {
                continue;
            }
            let height = Ui_InventorySlotSize;
            if (ny < inventory_area_position[1]) {
                const offset = inventory_area_position[1] - (ny);
                height -= offset;
                ny += offset;
            }
            else if (ny + Ui_InventorySlotSize + 10 > inventory_area_position[1] + inventory_area_size[1]) {
                const offset = (ny + Ui_InventorySlotSize + 10) -
                    (inventory_area_position[1] + inventory_area_size[1]);
                height -= offset;
            }
            if (height <= 0)
                continue;
            if (ImageContainer("inventory-slot" + x, Base.Rect(nx, ny, Ui_InventorySlotSize, height), sprites[x], UiClickable | UiImageCentered | UiImageCenteredX | UiImageCenteredY | UiScaleImageToBox | UiDrawBorder).clicked) {
                console.log("select ", x);
                Inventory.selected_item = x;
            }
        }
        PopPadding();
        PopBorderPx();
        PopGeneralBackgroundColor();
        PopRoundedCorners();
        PushGeneralBackgroundColor(Base.RGBA(0, 0, 0, 0));
        PushBorderPx(0);
        const start_right_side = container_position[0] +
            Ui_InventorySlotSize *
                Ui_InventoryColumns *
                Ui_InventorySpacingX + 10;
        const left_side_width = start_right_side - container_position[0] + scrollbar_width + 5;
        const width = inventory_area_width - left_side_width;
        const height = inventory_area_height - 5;
        const inv_left_area = Container("container--left", Base.Rect(start_right_side + scrollbar_width, container_position[1] + inventory_area.widget.border_size_px * 2 + inventory_area.widget.padding[WidgetPTop], width, height), UiDrawBorder);
        const position = AbsolutePositionFromInteraction(inv_left_area);
        PopBorderPx();
        PopGeneralBackgroundColor();
        if (Inventory.selected_item != -1) {
            ImageContainer("inventory--selected-item", Base.Rect(position[0], position[1], width, height / 2), sprites[Inventory.selected_item], UiDrawBackground | UiImageCentered | UiImageCenteredX | UiImageCenteredY);
            PushGeneralBackgroundColor(Base.RGBA(0, 0, 0, 0));
            PushTextColor(Base.RGBA(0, 0, 0, 0.8));
            PushBorderPx(1);
            PushRoundedCorners(0, 0, 0, 0);
            PushPadding(1, 1, 1, 1);
            if (Button("Place", Base.Rect(position[0], position[1] + height - 20 - 10, 100, 20)).clicked) {
                console.log("place", Inventory.selected_item);
            }
            PopPadding();
            PopRoundedCorners();
            PopBorderPx();
            PopTextColor();
            PopGeneralBackgroundColor();
        }
    }
}
function FindSpriteById(id, src) {
    let found = null;
    let i = 0;
    for (i = 0; i < src.length; i += 1) {
        if (src[i] && src[i].id === id) {
            found = src[i];
            break;
        }
    }
    return [found, i];
}
function FindSpriteBySourceCoords(x, y, src) {
    let found = null;
    let i = 0;
    for (; i < src.length; i += 1) {
        if (src[i] && src[i].rect.position.x == x && src[i].rect.position.y === y) {
            found = src[i];
            break;
        }
    }
    return [found, i];
}
const sprite_loader_state = {
    selected_sprite: 0,
    scaling: 1,
    allow_overlapping_sprites: false,
    show: false,
    visualizer_visible_cols: 7,
    loaded_assets_from_server: [],
    loaded_assets_from_image: [],
    modified_assets: [],
    tile_width: 64,
    tile_height: 64,
    loaded_assets_from_image_dummy_id: 0
};
export function UiSpriteLoaderPushFromServer(packet) {
    Base.assert(packet.kind === Packet.PacketKind.PacketKind_SpriteInfo);
    const payload = packet.payload;
    const [from_id, _] = FindSpriteById(payload.id, sprite_loader_state.loaded_assets_from_server);
    if (from_id) {
        from_id.created_at = payload.created_at;
        from_id.name.value = payload.name;
        from_id.description.value = payload.descrition;
        from_id.rect.position.x = payload.offset_x;
        from_id.rect.position.y = payload.offset_y;
        from_id.rect.width = payload.width;
        from_id.rect.height = payload.height;
    }
    else {
        const sprite = {
            id: payload.id,
            name: { value: payload.name },
            description: { value: payload.descrition },
            rect: Base.Rect(payload.offset_x, payload.offset_y, payload.width, payload.height),
            created_at: payload.created_at,
            offset_x: 0,
            offset_y: 0,
        };
        sprite_loader_state.loaded_assets_from_server.push(sprite);
    }
    const [with_coords, with_coords_idx] = FindSpriteBySourceCoords(payload.offset_x, payload.offset_y, sprite_loader_state.loaded_assets_from_image);
    if (with_coords) {
        delete sprite_loader_state.loaded_assets_from_image[with_coords_idx];
    }
    const [with_id, with_id_idx] = FindSpriteById(payload.id, sprite_loader_state.loaded_assets_from_image);
    if (with_id) {
        delete sprite_loader_state.loaded_assets_from_image[with_id_idx];
    }
}
function SpriteLoaderSave() {
    console.log(sprite_loader_state.modified_assets);
    for (let i = 0; i < sprite_loader_state.modified_assets.length; i++) {
        const sprite = sprite_loader_state.modified_assets[i];
        const [a, idx] = FindSpriteById(sprite.id, sprite_loader_state.loaded_assets_from_image);
        if (a) {
            a.rect = sprite.rect;
        }
    }
}
function DrawSpriteLoaderImageContainer(source_image) {
    PushGeneralBackgroundColor(Base.RGBA(217, 237, 236, 1));
    const container = Draggable("sprite-loader-container--wrap", Base.Rect(25, 0, 1332, 700), UiDragabble | UiPersistPosition);
    PopGeneralBackgroundColor();
    if (container.dragging) {
        const delta = Ui_DragDelta();
        container.widget.rect.position.add(delta.scale(UiState.delta_time * 70));
        UiState.drag_start.set(Ui_Cursor().position);
    }
    const container_pos = AbsolutePositionFromInteraction(container);
    PushRoundedCorners(0, 0, 0, 0);
    PushBorderPx(0);
    PushGeneralBackgroundColor(Base.RGBA(255, 255, 255, 1));
    PushPadding(0, 0, 0, 0);
    const image_container = Container("sprite-loader-container", Base.Rect(container_pos[0] + 5, container_pos[1] + 10, 800, 600), UiScrollView | UiScrollViewY | UiScrollViewX | UiDrawBorder | UiDrawBackground, source_image.width / sprite_loader_state.scaling, source_image.height / sprite_loader_state.scaling);
    const image_container_visible_size = SizeFromInteraction(image_container);
    const image_container_position = PositionFromInteraction(image_container);
    const image = ImageContainer("sprite-loader-container-image", Base.Rect(image_container_position[0], image_container_position[1], image_container_visible_size[0], image_container_visible_size[1]), source_image, UiClickable | UiDragabble | UiDragabbleX | UiDragabbleY | UiScaleImageToBox | UiScroll | UiImageCenteredX | UiImageCenteredY | UiImageCentered, Base.Rect(image_container.widget.view_offset.x * sprite_loader_state.scaling, image_container.widget.view_offset.y * sprite_loader_state.scaling, image_container_visible_size[0] * sprite_loader_state.scaling, image_container_visible_size[1] * sprite_loader_state.scaling));
    PopPadding();
    PopGeneralBackgroundColor();
    PopBorderPx();
    PopRoundedCorners();
    if (image.dragging) {
        const delta = Ui_DragDelta();
        const dx = delta.x * 100 * UiState.delta_time;
        const dy = delta.y * 100 * UiState.delta_time;
        image_container.widget.view_offset.x = image_container.widget.view_offset.x - dx;
        image_container.widget.view_offset.y = image_container.widget.view_offset.y - dy;
        UiState.drag_start.set(Ui_Cursor().position);
    }
    if (UiState.input_instance.is_down(Input.KKey.KEY_S)) {
        if (image.scroll_y != 0) {
            // TODO(rnoba): fix scalling to translate view towards cursor position
            sprite_loader_state.scaling = Math.max((image.scroll_y * 0.01) * UiState.delta_time + sprite_loader_state.scaling, 0.2);
        }
    }
    return [image_container, image_container_visible_size, image_container_position];
}
function SpriteLoaderLoadFromImage(source_image) {
    const count_x = Base.Floor(source_image.width / sprite_loader_state.tile_width);
    const count_y = Base.Floor(source_image.height / sprite_loader_state.tile_height);
    for (let y = 0; y < count_y; y += 1) {
        for (let x = 0; x < count_x; x += 1) {
            const sprite_x = x * sprite_loader_state.tile_width;
            const sprite_y = y * sprite_loader_state.tile_height;
            const from_image = FindSpriteBySourceCoords(sprite_x, sprite_y, sprite_loader_state.loaded_assets_from_image)[0];
            const from_server = FindSpriteBySourceCoords(sprite_x, sprite_y, sprite_loader_state.loaded_assets_from_server)[0];
            if (from_server) {
                //@ts-ignore
                sprite_loader_state.loaded_assets_from_image[y * count_x * count_y + x] = undefined;
                continue;
            }
            if (from_image) {
                continue;
            }
            const sprite = Sprite.Sprite_new(Base.Rect(sprite_x, sprite_y, sprite_loader_state.tile_width, sprite_loader_state.tile_height), 0, 0, sprite_loader_state.loaded_assets_from_image_dummy_id--);
            sprite_loader_state.loaded_assets_from_image.push(sprite);
        }
    }
}
function DrawSpriteLoaderAssetsFromImage(source_image, x, y) {
    PushGeneralBackgroundColor(Base.RGBA_FULL_WHITE);
    PushBorderPx(0);
    PushRoundedCorners(1, 1, 1, 1);
    const loaded_container = Container("loaded-container-image", Base.Rect(x, y, Base.Round(sprite_loader_state.visualizer_visible_cols * sprite_loader_state.tile_width * Ui_InventorySpacingX), 330), UiClickable | UiDrawBorder | UiScrollViewY | UiScrollView | UiViewClamp | UiViewClampY, null, (sprite_loader_state.loaded_assets_from_image.length / sprite_loader_state.visualizer_visible_cols *
        sprite_loader_state.tile_height * Ui_InventorySpacingY) +
        sprite_loader_state.loaded_assets_from_image.length / sprite_loader_state.visualizer_visible_cols);
    PopRoundedCorners();
    PopBorderPx();
    PopGeneralBackgroundColor();
    const loaded_container_pos = PositionFromInteraction(loaded_container);
    const loaded_container_size = SizeFromInteraction(loaded_container);
    //const loaded_container_col	= Base.Floor(loaded_container_size[0] / sprite_loader_state.visualizer_cols);
    PushBorderPx(1);
    PushRoundedCorners(0, 0, 0, 0);
    PushBorderColor(Base.RGBA_FULL_BLACK);
    for (let x = 0; x < sprite_loader_state.loaded_assets_from_image.length; x++) {
        const sprite = sprite_loader_state.loaded_assets_from_image[x];
        //const prev_sprite = sprite_loader_state.loaded_assets_from_image[x - 1];
        if (!sprite)
            continue;
        const offset_x = Base.Floor(x % sprite_loader_state.visualizer_visible_cols) * (sprite_loader_state.tile_width);
        const offset_y = Base.Floor(x / sprite_loader_state.visualizer_visible_cols) * (sprite_loader_state.tile_height);
        //const offset_x = sprite.rect.position.x;
        //const offset_y = sprite.rect.position.y;
        const nx = loaded_container_pos[0] + offset_x * Ui_InventorySpacingX +
            loaded_container.widget.border_and_padding_increment.width;
        let ny = loaded_container_pos[1] + offset_y * Ui_InventorySpacingY +
            loaded_container.widget.border_and_padding_increment.height -
            loaded_container.widget.view_offset.y;
        if (ny + sprite.rect.height < loaded_container_pos[1]) {
            continue;
        }
        if (ny > loaded_container_pos[1] + loaded_container_size[1]) {
            continue;
        }
        let height = sprite.rect.height;
        if (ny < loaded_container_pos[1]) {
            const offset = loaded_container_pos[1] - (ny);
            height -= offset;
            ny += offset;
        }
        else if (ny + sprite.rect.height + 10 > loaded_container_pos[1] + loaded_container_size[1]) {
            const offset = (ny + sprite.rect.height + 10) -
                (loaded_container_pos[1] + loaded_container_size[1]);
            height -= offset;
        }
        if (height <= 0) {
            continue;
        }
        if (ImageContainer("loaded-slot-image--" + x, Base.Rect(nx, ny, sprite.rect.width, height), source_image, UiClickable | UiDrawBorder, sprite.rect).clicked) {
            sprite_loader_state.selected_sprite = x;
        }
    }
    PopBorderColor();
    PopRoundedCorners();
    PopBorderPx();
}
function DrawSpriteLoaderAssetsFromServer(source_image, x, y) {
    PushGeneralBackgroundColor(Base.RGBA_FULL_WHITE);
    PushBorderPx(0);
    PushRoundedCorners(1, 1, 1, 1);
    const loaded_container = Container("loaded-container-server", Base.Rect(x, y, sprite_loader_state.visualizer_visible_cols * sprite_loader_state.tile_width * Ui_InventorySpacingX, 250), UiClickable | UiDrawBorder | UiScrollViewY | UiScrollView | UiViewClamp | UiViewClampY, null, (sprite_loader_state.loaded_assets_from_server.length / sprite_loader_state.visualizer_visible_cols *
        sprite_loader_state.tile_height * Ui_InventorySpacingY) +
        sprite_loader_state.loaded_assets_from_server.length / sprite_loader_state.visualizer_visible_cols);
    PopRoundedCorners();
    PopBorderPx();
    PopGeneralBackgroundColor();
    const loaded_container_pos = PositionFromInteraction(loaded_container);
    const loaded_container_size = SizeFromInteraction(loaded_container);
    PushBorderPx(1);
    PushRoundedCorners(0, 0, 0, 0);
    for (let sx = 0; sx < sprite_loader_state.loaded_assets_from_server.length; sx++) {
        const sprite = sprite_loader_state.loaded_assets_from_server[sx];
        if (!sprite)
            continue;
        const nx = loaded_container_pos[0] + Base.Floor(sx % sprite_loader_state.visualizer_visible_cols) * sprite.rect.width * Ui_InventorySpacingX;
        let ny = loaded_container_pos[1] + Base.Floor(sx / sprite_loader_state.visualizer_visible_cols) * sprite.rect.height * Ui_InventorySpacingY
            + loaded_container.widget.border_and_padding_increment.position.y - loaded_container.widget.view_offset.y;
        if (ny + sprite.rect.height < loaded_container_pos[1]) {
            continue;
        }
        if (ny > loaded_container_pos[1] + loaded_container_size[1]) {
            continue;
        }
        let height = sprite.rect.height;
        if (ny < loaded_container_pos[1]) {
            const offset = loaded_container_pos[1] - (ny);
            height -= offset;
            ny += offset;
        }
        else if (ny + sprite.rect.height + 10 > loaded_container_pos[1] + loaded_container_size[1]) {
            const offset = (ny + sprite.rect.height + 10) -
                (loaded_container_pos[1] + loaded_container_size[1]);
            height -= offset;
        }
        if (ImageContainer("loaded-slot-server--" + sx, Base.Rect(nx, ny, sprite.rect.width, height), source_image, UiClickable | UiDrawBorder, sprite.rect).clicked) {
            sprite_loader_state.selected_sprite = sx;
        }
    }
    PopRoundedCorners();
    PopBorderPx();
}
export function DrawSpriteInit() {
    Socket.send_packet(UiState.socket, Packet.packet_request_sprite_info_make("sprites"));
}
export function DrawSpriteLoader(source_image) {
    if (UiState.input_instance.pressed(Input.KKey.KEY_F2)) {
        sprite_loader_state.show = !sprite_loader_state.show;
    }
    if (sprite_loader_state.show) {
        const [image_container, image_container_visible_size, image_container_position] = DrawSpriteLoaderImageContainer(source_image);
        SpriteLoaderLoadFromImage(source_image);
        DrawSpriteLoaderAssetsFromServer(source_image, image_container_visible_size[0] + image_container_position[0] + 30, image_container_position[1]);
        DrawSpriteLoaderAssetsFromImage(source_image, image_container_visible_size[0] + image_container_position[0] + 30, image_container_position[1] + 260);
        const selected_sprite = sprite_loader_state.loaded_assets_from_server[sprite_loader_state.selected_sprite] ||
            sprite_loader_state.loaded_assets_from_image[sprite_loader_state.selected_sprite];
        let [modified, midx] = FindSpriteBySourceCoords(selected_sprite.rect.position.x, selected_sprite.rect.position.y, sprite_loader_state.modified_assets);
        if (modified) {
            const mw = modified.rect.width;
            const mh = modified.rect.height;
            if (mw === selected_sprite.rect.width &&
                mh === selected_sprite.rect.height &&
                modified.description.value === selected_sprite.description.value &&
                modified.name.value === selected_sprite.name.value) {
                sprite_loader_state.modified_assets.splice(midx, 1);
            }
        }
        if (!modified) {
            modified = Sprite.Sprite_new(Base.Rect(selected_sprite.rect.position.x, selected_sprite.rect.position.y, selected_sprite.rect.width, selected_sprite.rect.height), 0, 0, selected_sprite.id, selected_sprite.description.value, selected_sprite.name.value, selected_sprite.created_at);
        }
        let selected_sprite_offset_x = (image_container_position[0] + modified.rect.position.x) - image_container.widget.view_offset.x;
        let selected_sprite_offset_y = (image_container_position[1] + modified.rect.position.y) - image_container.widget.view_offset.y;
        //
        //if ((selected_sprite_offset_x + selected_sprite.rect.width) > image_container_visible_size[0])
        //{
        //	image_container.widget.view_offset.x += 1000 * UiState.delta_time;
        //}
        //else if ((image_container_position[0] + selected_sprite.rect.position.x - selected_sprite.rect.width/2) < image_container.widget.view_offset.x)
        //{
        //	image_container.widget.view_offset.x -= 1000 * UiState.delta_time;
        //}
        //
        //if ((selected_sprite_offset_y + selected_sprite.rect.height) > image_container_visible_size[1])
        //{
        //	image_container.widget.view_offset.y += 1000 * UiState.delta_time;
        //}
        //else if ((image_container_position[1] + selected_sprite.rect.position.y - selected_sprite.rect.height/2) < image_container.widget.view_offset.y)
        //{
        //	image_container.widget.view_offset.y -= 1000 * UiState.delta_time;
        //}
        if (selected_sprite_offset_x + modified.rect.width > image_container_position[0] &&
            selected_sprite_offset_x - modified.rect.width / 2 < image_container_visible_size[0] &&
            selected_sprite_offset_y - modified.rect.width / 2 < image_container_visible_size[1] &&
            selected_sprite_offset_y + modified.rect.height > image_container_position[1]) {
            PushRoundedCorners(0, 0, 0, 0);
            PushTextColor(Base.RGBA_FULL_BLUE);
            PushGeneralBackgroundColor(Base.RGBA(155, 155, 155, 0.4));
            PushPadding(0, 0, 0, 0);
            PushBorderPx(0);
            Container(`--selected-sprite-overlay#${modified.rect.width}-${modified.rect.height}`, Base.Rect(selected_sprite_offset_x, selected_sprite_offset_y, modified.rect.width, modified.rect.height), UiTextCentered | UiTextCenteredX | UiTextCenteredY | UiDrawText);
            PopGeneralBackgroundColor();
            const dragabble_y = CleanWidgetWithInteraction("selected-sprite-overlay-drag-area--y", Base.Rect(selected_sprite_offset_x + modified.rect.width / 2 - 10, selected_sprite_offset_y + modified.rect.height - 10, 20, 10), UiClickable | UiDragabble | UiDrawBackground);
            if (dragabble_y.dragging) {
                const delta = Ui_DragDelta();
                modified.rect.height = Base.Clamp(modified.rect.height + delta.y, 0, 1232);
                UiState.drag_start.set(Ui_Cursor().position);
            }
            const dragabble_x = CleanWidgetWithInteraction("selected-sprite-overlax-drag-area--x", Base.Rect(selected_sprite_offset_x + modified.rect.width - 10, selected_sprite_offset_y + (modified.rect.height / 2) - 10, 10, 20), UiClickable | UiDrawBackground | UiDragabble);
            if (dragabble_x.dragging) {
                const delta = Ui_DragDelta();
                modified.rect.width = Base.Clamp(modified.rect.width + delta.x, 0, 1232);
                UiState.drag_start.set(Ui_Cursor().position);
            }
            PopBorderPx();
            PopPadding();
            PopTextColor();
            PopRoundedCorners();
        }
        PushRoundedCorners(1, 1, 1, 1);
        PushGeneralBackgroundColor(Base.RGBA_FULL_TRANSPARENT);
        PushTextColor(Base.RGBA_FULL_BLACK);
        PushPadding(2, 2, 4, 4);
        PushBorderPx(1);
        PushBorderColor(Base.RGBA(77, 77, 77));
        const name_input = TextInput(modified.name, "selected-sprite-overlay-name-input", Base.Rect(image_container_position[0], image_container_position[1] + image_container_visible_size[1] + 5, 200, 30), UiDrawBorder);
        PopBorderColor();
        PopBorderPx();
        PopPadding();
        PopTextColor();
        PopGeneralBackgroundColor();
        PopRoundedCorners();
        PushRoundedCorners(1, 1, 1, 1);
        PushGeneralBackgroundColor(Base.RGBA_FULL_TRANSPARENT);
        PushTextColor(Base.RGBA_FULL_BLACK);
        PushPadding(2, 2, 4, 4);
        PushBorderPx(1);
        PushBorderColor(Base.RGBA(77, 77, 77));
        TextInput(modified.description, "selected-sprite-overlay-description-input", Base.Rect(image_container_position[0] + 200 + name_input.widget.border_and_padding_increment.position.x + name_input.widget.border_and_padding_increment.width, image_container_position[1] + image_container_visible_size[1] + 5, 250, 30), UiDrawBorder);
        PopBorderColor();
        PopBorderPx();
        PopPadding();
        PopTextColor();
        PopGeneralBackgroundColor();
        PopRoundedCorners();
        PushRoundedCorners(1, 1, 1, 1);
        PushGeneralBackgroundColor(Base.RGBA(33, 33, 33));
        PushTextColor(Base.RGBA_FULL_WHITE);
        PushPadding(2, 2, 4, 4);
        PushBorderPx(1);
        PushBorderColor(Base.RGBA(99, 99, 99));
        if (sprite_loader_state.modified_assets.length > 0) {
            if (Button("selected-sprite-overlay-description-save-btn#Save", Base.Rect(image_container_position[0] + 200 + name_input.widget.border_and_padding_increment.position.x
                + name_input.widget.border_and_padding_increment.width + 270, image_container_position[1] + image_container_visible_size[1] + 5, 100, 30), UiDrawBorder).clicked) {
                window.requestIdleCallback(() => {
                    SpriteLoaderSave();
                });
            }
            if (Button("selected-sprite-overlay-description-restore-btn#Restore All", Base.Rect(image_container_position[0] + 200 + name_input.widget.border_and_padding_increment.position.x
                + name_input.widget.border_and_padding_increment.width + 270 + 130, image_container_position[1] + image_container_visible_size[1] + 5, 100, 30), UiDrawBorder).clicked) {
                sprite_loader_state.modified_assets = [];
                modified = selected_sprite;
            }
        }
        PopBorderColor();
        PopBorderPx();
        PopPadding();
        PopTextColor();
        PopGeneralBackgroundColor();
        PopRoundedCorners();
        const mw = modified.rect.width;
        const mh = modified.rect.height;
        if (mw !== selected_sprite.rect.width ||
            mh !== selected_sprite.rect.height ||
            modified.description.value !== selected_sprite.description.value ||
            modified.name.value !== selected_sprite.name.value) {
            if (!FindSpriteBySourceCoords(modified.rect.position.x, modified.rect.position.y, sprite_loader_state.modified_assets)[0]) {
                const [_, idx] = FindSpriteById(modified.id, sprite_loader_state.loaded_assets_from_image);
                sprite_loader_state.modified_assets.push(modified);
                let x = modified.rect.position.x;
                let y = modified.rect.position.x;
                const end_x = x + modified.rect.width;
                const end_y = y + modified.rect.height;
                const srow = idx % sprite_loader_state.visualizer_visible_cols;
                const scol = idx / sprite_loader_state.visualizer_visible_cols;
                for (let i = idx; i < sprite_loader_state.loaded_assets_from_image.length; i++) {
                }
            }
        }
    }
}
const debug_info_state = {
    show: false
};
const stacks = [
    "stack",
    "rounded_corner_radii_stack",
    "active_color_stack",
    "border_color_stack",
    "text_offset_stack",
    "text_color_stack",
    "border_px_stack",
    "hot_color_stack",
    "bg_color_stack",
    "padding_stack",
    "font_stack"
];
export function DrawDebugInfo() {
    if (UiState.input_instance.pressed(Input.KKey.KEY_F1)) {
        debug_info_state.show = !debug_info_state.show;
    }
    if (debug_info_state.show) {
        PushRoundedCorners(3, 3, 3, 3);
        PushGeneralBackgroundColor(Base.RGBA(0, 0, 0, 0.5));
        PushTextColor(Base.RGBA_FULL_BLACK);
        PushPadding(5, 5, 5, 5);
        PushBorderPx(1);
        const dbg_info_container = Container("debug-info--container", Base.Rect(0, 0, 500, 500), UiDrawBackground | UiDrawBorder);
        PopBorderPx();
        PopPadding();
        PopTextColor();
        PopGeneralBackgroundColor();
        PopRoundedCorners();
        const container_pos = PositionFromInteraction(dbg_info_container);
        PushTextColor(Base.RGBA_FULL_WHITE);
        PushPadding(0, 0, 0, 0);
        PushBorderPx(1);
        const text = CleanWidgetWithInteraction(`debug-info--container--current_frame#current frame: ${UiState.current_frame}`, Base.Rect(container_pos[0], container_pos[1], 0, 0), UiDrawText | UiResizeToContent);
        const text_size = SizeFromInteraction(text);
        let i = 0;
        for (i = 0; i < stacks.length; i++) {
            CleanWidgetWithInteraction(
            //@ts-ignore
            `debug-info--container--${stacks[i]}#${stacks[i]}: ${UiState[stacks[i]].length}`, Base.Rect(container_pos[0], container_pos[1] + text_size[1] + ((i + 1) * 20), 0, 0), UiDrawText | UiResizeToContent);
        }
        CleanWidgetWithInteraction(
        //@ts-ignore
        `debug-info--dt#delta time: ${Base.Floor(UiState.delta_time * 1000, 2)} ms, ${Base.Fixed(1 / UiState.delta_time, 1)} fps`, Base.Rect(container_pos[0], container_pos[1] + text_size[1] + ((i + 1) * 20), 0, 0), UiDrawText | UiResizeToContent);
        CleanWidgetWithInteraction(
        //@ts-ignore
        `debug-info--connetion-info#connection: ${Socket.get_connection_state_string(UiState.socket)}`, Base.Rect(container_pos[0], container_pos[1] + text_size[1] + ((i + 2) * 20), 0, 0), UiDrawText | UiResizeToContent);
        PopBorderPx();
        PopPadding();
        PopTextColor();
    }
}
