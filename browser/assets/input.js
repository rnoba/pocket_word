import * as Base from "./base.js";
import * as Ui from "./ui.js";
import * as Palette from "./palette.js";
export var MBttn;
(function (MBttn) {
    MBttn[MBttn["M_LEFT"] = 0] = "M_LEFT";
    MBttn[MBttn["M_RIGHT"] = 1] = "M_RIGHT";
    MBttn[MBttn["M_WHEEL"] = 2] = "M_WHEEL";
})(MBttn || (MBttn = {}));
export var KKey;
(function (KKey) {
    KKey[KKey["KEY_LShift"] = 16] = "KEY_LShift";
    KKey[KKey["KEY_LCtrl"] = 17] = "KEY_LCtrl";
    KKey[KKey["KEY_Backspace"] = 8] = "KEY_Backspace";
    KKey[KKey["KEY_Tab"] = 9] = "KEY_Tab";
    KKey[KKey["KEY_Enter"] = 13] = "KEY_Enter";
    KKey[KKey["KEY_Shift"] = 16] = "KEY_Shift";
    KKey[KKey["KEY_Ctrl"] = 17] = "KEY_Ctrl";
    KKey[KKey["KEY_Alt"] = 18] = "KEY_Alt";
    KKey[KKey["KEY_PauseBreak"] = 19] = "KEY_PauseBreak";
    KKey[KKey["KEY_CapsLock"] = 20] = "KEY_CapsLock";
    KKey[KKey["KEY_Escape"] = 27] = "KEY_Escape";
    KKey[KKey["KEY_PageUp"] = 33] = "KEY_PageUp";
    KKey[KKey["KEY_Space"] = 32] = "KEY_Space";
    KKey[KKey["KEY_PageDown"] = 34] = "KEY_PageDown";
    KKey[KKey["KEY_End"] = 35] = "KEY_End";
    KKey[KKey["KEY_Home"] = 36] = "KEY_Home";
    KKey[KKey["KEY_ArrowLeft"] = 37] = "KEY_ArrowLeft";
    KKey[KKey["KEY_ArrowUp"] = 38] = "KEY_ArrowUp";
    KKey[KKey["KEY_ArrowRight"] = 39] = "KEY_ArrowRight";
    KKey[KKey["KEY_ArrowDown"] = 40] = "KEY_ArrowDown";
    KKey[KKey["KEY_PrintScreen"] = 44] = "KEY_PrintScreen";
    KKey[KKey["KEY_Insert"] = 45] = "KEY_Insert";
    KKey[KKey["KEY_Delete"] = 46] = "KEY_Delete";
    KKey[KKey["KEY_0"] = 48] = "KEY_0";
    KKey[KKey["KEY_1"] = 49] = "KEY_1";
    KKey[KKey["KEY_2"] = 50] = "KEY_2";
    KKey[KKey["KEY_3"] = 51] = "KEY_3";
    KKey[KKey["KEY_4"] = 52] = "KEY_4";
    KKey[KKey["KEY_5"] = 53] = "KEY_5";
    KKey[KKey["KEY_6"] = 54] = "KEY_6";
    KKey[KKey["KEY_7"] = 55] = "KEY_7";
    KKey[KKey["KEY_8"] = 56] = "KEY_8";
    KKey[KKey["KEY_9"] = 57] = "KEY_9";
    KKey[KKey["KEY_A"] = 65] = "KEY_A";
    KKey[KKey["KEY_B"] = 66] = "KEY_B";
    KKey[KKey["KEY_C"] = 67] = "KEY_C";
    KKey[KKey["KEY_D"] = 68] = "KEY_D";
    KKey[KKey["KEY_E"] = 69] = "KEY_E";
    KKey[KKey["KEY_F"] = 70] = "KEY_F";
    KKey[KKey["KEY_G"] = 71] = "KEY_G";
    KKey[KKey["KEY_H"] = 72] = "KEY_H";
    KKey[KKey["KEY_I"] = 73] = "KEY_I";
    KKey[KKey["KEY_J"] = 74] = "KEY_J";
    KKey[KKey["KEY_K"] = 75] = "KEY_K";
    KKey[KKey["KEY_L"] = 76] = "KEY_L";
    KKey[KKey["KEY_M"] = 77] = "KEY_M";
    KKey[KKey["KEY_N"] = 78] = "KEY_N";
    KKey[KKey["KEY_O"] = 79] = "KEY_O";
    KKey[KKey["KEY_P"] = 80] = "KEY_P";
    KKey[KKey["KEY_Q"] = 81] = "KEY_Q";
    KKey[KKey["KEY_R"] = 82] = "KEY_R";
    KKey[KKey["KEY_S"] = 83] = "KEY_S";
    KKey[KKey["KEY_T"] = 84] = "KEY_T";
    KKey[KKey["KEY_U"] = 85] = "KEY_U";
    KKey[KKey["KEY_V"] = 86] = "KEY_V";
    KKey[KKey["KEY_W"] = 87] = "KEY_W";
    KKey[KKey["KEY_X"] = 88] = "KEY_X";
    KKey[KKey["KEY_Y"] = 89] = "KEY_Y";
    KKey[KKey["KEY_Z"] = 90] = "KEY_Z";
    KKey[KKey["KEY_LeftWindowKey"] = 91] = "KEY_LeftWindowKey";
    KKey[KKey["KEY_RightWindowKey"] = 92] = "KEY_RightWindowKey";
    KKey[KKey["KEY_SelectKey"] = 93] = "KEY_SelectKey";
    KKey[KKey["KEY_Numpad0"] = 96] = "KEY_Numpad0";
    KKey[KKey["KEY_Numpad1"] = 97] = "KEY_Numpad1";
    KKey[KKey["KEY_Numpad2"] = 98] = "KEY_Numpad2";
    KKey[KKey["KEY_Numpad3"] = 99] = "KEY_Numpad3";
    KKey[KKey["KEY_Numpad4"] = 100] = "KEY_Numpad4";
    KKey[KKey["KEY_Numpad5"] = 101] = "KEY_Numpad5";
    KKey[KKey["KEY_Numpad6"] = 102] = "KEY_Numpad6";
    KKey[KKey["KEY_Numpad7"] = 103] = "KEY_Numpad7";
    KKey[KKey["KEY_Numpad8"] = 104] = "KEY_Numpad8";
    KKey[KKey["KEY_Numpad9"] = 105] = "KEY_Numpad9";
    KKey[KKey["KEY_Multiply"] = 106] = "KEY_Multiply";
    KKey[KKey["KEY_Add"] = 107] = "KEY_Add";
    KKey[KKey["KEY_Subtract"] = 109] = "KEY_Subtract";
    KKey[KKey["KEY_DecimalPoint"] = 110] = "KEY_DecimalPoint";
    KKey[KKey["KEY_Divide"] = 111] = "KEY_Divide";
    KKey[KKey["KEY_F1"] = 112] = "KEY_F1";
    KKey[KKey["KEY_F2"] = 113] = "KEY_F2";
    KKey[KKey["KEY_F3"] = 114] = "KEY_F3";
    KKey[KKey["KEY_F4"] = 115] = "KEY_F4";
    KKey[KKey["KEY_F5"] = 116] = "KEY_F5";
    KKey[KKey["KEY_F6"] = 117] = "KEY_F6";
    KKey[KKey["KEY_F7"] = 118] = "KEY_F7";
    KKey[KKey["KEY_F8"] = 119] = "KEY_F8";
    KKey[KKey["KEY_F9"] = 120] = "KEY_F9";
    KKey[KKey["KEY_F10"] = 121] = "KEY_F10";
    KKey[KKey["KEY_F11"] = 122] = "KEY_F11";
    KKey[KKey["KEY_F12"] = 123] = "KEY_F12";
    KKey[KKey["KEY_NumLock"] = 144] = "KEY_NumLock";
    KKey[KKey["KEY_ScrollLock"] = 145] = "KEY_ScrollLock";
    KKey[KKey["KEY_MyComputer"] = 182] = "KEY_MyComputer";
    KKey[KKey["KEY_MyCalculator"] = 183] = "KEY_MyCalculator";
    KKey[KKey["KEY_SemiColon"] = 186] = "KEY_SemiColon";
    KKey[KKey["KEY_EqualSign"] = 187] = "KEY_EqualSign";
    KKey[KKey["KEY_Comma"] = 188] = "KEY_Comma";
    KKey[KKey["KEY_Dash"] = 189] = "KEY_Dash";
    KKey[KKey["KEY_Period"] = 190] = "KEY_Period";
    KKey[KKey["KEY_ForwardSlash"] = 191] = "KEY_ForwardSlash";
    KKey[KKey["KEY_OpenBracket"] = 219] = "KEY_OpenBracket";
    KKey[KKey["KEY_BackSlash"] = 220] = "KEY_BackSlash";
    KKey[KKey["KEY_CloseBracket"] = 221] = "KEY_CloseBracket";
    KKey[KKey["KEY_SingleQuote"] = 222] = "KEY_SingleQuote";
    KKey[KKey["_KEY_COUNT"] = 223] = "_KEY_COUNT";
})(KKey || (KKey = {}));
const KEYBOARD_STATE_MAP = new Map();
const KEYBOARD_PRESSED_MAP = new Map();
export var IptEventKind;
(function (IptEventKind) {
    IptEventKind[IptEventKind["PointerMove"] = 0] = "PointerMove";
    IptEventKind[IptEventKind["PointerDown"] = 1] = "PointerDown";
    IptEventKind[IptEventKind["PointerUp"] = 2] = "PointerUp";
    IptEventKind[IptEventKind["Wheel"] = 3] = "Wheel";
    IptEventKind[IptEventKind["MouseOut"] = 4] = "MouseOut";
    IptEventKind[IptEventKind["KeyDown"] = 5] = "KeyDown";
    IptEventKind[IptEventKind["KeyUp"] = 6] = "KeyUp";
    IptEventKind[IptEventKind["Resize"] = 7] = "Resize";
    IptEventKind[IptEventKind["Drop"] = 8] = "Drop";
})(IptEventKind || (IptEventKind = {}));
const _JS_EVENT_TO_EVENT_KIND = {
    "pointermove": IptEventKind.PointerMove,
    "pointerdown": IptEventKind.PointerDown,
    "pointerup": IptEventKind.PointerUp,
    "mouseout": IptEventKind.MouseOut,
    "keydown": IptEventKind.KeyDown,
    "resize": IptEventKind.Resize,
    "wheel": IptEventKind.Wheel,
    "keyup": IptEventKind.KeyUp,
    "drop": IptEventKind.Drop
};
function ipt_event_make(kind, payload) {
    return { kind, payload };
}
function attach_listeners() {
    window.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    window.addEventListener("drop", (e) => {
        e.preventDefault();
        const data = [];
        const files = e.dataTransfer?.files;
        if (files)
            for (const file of files) {
                data.push(file);
            }
        const evt = ipt_event_make(IptEventKind.Drop, { data });
        event_queue.unshift(evt);
    });
    window.addEventListener("resize", (_) => {
        const data = document.body.getBoundingClientRect();
        const evt = ipt_event_make(IptEventKind.Resize, { width: data.width, height: data.height });
        event_queue.unshift(evt);
    });
    for (const js_evt of _EVENTS) {
        const kind = _JS_EVENT_TO_EVENT_KIND[js_evt];
        if (kind === IptEventKind.Drop ||
            kind === IptEventKind.Resize) {
            continue;
        }
        window.addEventListener(js_evt, (evt_data) => {
            //evt.preventDefault();
            //evt.stopPropagation();
            const evt = ipt_event_make(kind, {});
            for (const field of _EVENT_FIELDS[js_evt]) {
                evt.payload[field] = evt_data[field];
            }
            event_queue.unshift(evt);
        });
    }
}
const _EVENTS = [
    "pointerdown",
    "pointerup",
    "wheel",
    "pointermove",
    "mouseout",
    "keydown",
    "keyup",
];
const _EVENT_FIELDS = {
    "pointermove": ["clientX", "clientY"],
    "pointerdown": ["buttons"],
    "pointerup": ["buttons"],
    "wheel": ["deltaX", "deltaY"],
    "mouseout": ["relatedTarget", "toElement"],
    "keydown": ["code", "keyCode", "repeat", "key"],
    "keyup": ["code", "keyCode", "repeat", "key"],
};
const event_queue = [];
let free_evt = [];
const _Cursor = {
    position: Base.V2.Zero(),
    buttons: [false, false, false],
    wheel: Base.V2.Zero(),
};
export function next_event() {
    return free_evt[0];
}
export function next_event_of(kind) {
    if (next_event()?.kind === kind) {
        return next_event();
    }
    return null;
}
export function consume_event() {
    return free_evt.shift() || null;
}
export function consume_specific(kind) {
    if (next_event()?.kind === kind) {
        return consume_event();
    }
    return null;
}
export function cursor() {
    return _Cursor;
}
export function is_pressed(btn) {
    return KEYBOARD_PRESSED_MAP.get(btn) || false;
}
export function is_down(btn) {
    let down = false;
    switch (btn) {
        case MBttn.M_LEFT:
        case MBttn.M_RIGHT:
        case MBttn.M_WHEEL:
            {
                down = _Cursor.buttons[btn];
            }
            break;
        default:
            {
                down = KEYBOARD_STATE_MAP.get(btn) || false;
            }
            break;
    }
    return (down);
}
export function pool() {
    KEYBOARD_PRESSED_MAP.clear();
    while (event_queue.length) {
        free_evt.shift();
        const evt = event_queue.shift();
        free_evt.unshift(evt);
        switch (evt.kind) {
            case IptEventKind.PointerDown:
            case IptEventKind.PointerUp:
                {
                    const payload = evt.payload;
                    const buttons = payload.buttons;
                    _Cursor.buttons[MBttn.M_LEFT] = !!(buttons & 1);
                    _Cursor.buttons[MBttn.M_RIGHT] = !!(buttons & 2);
                    _Cursor.buttons[MBttn.M_WHEEL] = !!(buttons & 4);
                }
                break;
            case IptEventKind.KeyUp:
            case IptEventKind.KeyDown:
                {
                    const payload = evt.payload;
                    const key_code = payload.keyCode;
                    const repeat = payload.repeat;
                    const is_key_down = evt.kind === IptEventKind.KeyDown;
                    if (repeat === false) {
                        if (!is_key_down && KEYBOARD_STATE_MAP.get(key_code)) {
                            KEYBOARD_PRESSED_MAP.set(key_code, true);
                        }
                        KEYBOARD_STATE_MAP.set(key_code, is_key_down);
                    }
                }
                break;
            case IptEventKind.MouseOut:
                {
                    _Cursor.buttons[MBttn.M_LEFT] = false;
                    _Cursor.buttons[MBttn.M_RIGHT] = false;
                    _Cursor.buttons[MBttn.M_WHEEL] = false;
                }
                break;
            case IptEventKind.PointerMove:
                {
                    const payload = evt.payload;
                    _Cursor.position.x = payload.clientX;
                    _Cursor.position.y = payload.clientY;
                }
                break;
            default:
                break;
        }
    }
}
export function init() {
    attach_listeners();
}
export function deinit() {
    for (const evt of _EVENTS) {
        document.body.removeEventListener(evt, () => { });
    }
}
export function debug_dump() {
    Ui.push_next_width(Ui.size_fixed(300, 1));
    Ui.push_next_height(Ui.size_fixed(300, 1));
    Ui.push_next_palette(Palette.pastel);
    Ui.push_next_text_alignment(Ui.UiTextAlignment.Left);
    Ui.push_next_child_axis(Ui.AxisY);
    const wid = Ui.widget_make(`input-debug--dump`, Ui.UiDrawBackground | Ui.UiDrawBorder);
    Ui.push_parent(wid);
    Ui.push_font_size(20);
    Ui.column_begin();
    Ui.row_begin();
    Ui.spacer(Ui.size_fixed(10));
    Ui.push_next_width(Ui.size_text_content());
    Ui.push_next_height(Ui.size_fixed(30));
    Ui.widget_make(`input-debug--dump--event--qeue#events: ${event_queue.length}`, Ui.UiDrawText);
    Ui.row_end();
    Ui.column_end();
    Ui.column_begin();
    Ui.row_begin();
    Ui.spacer(Ui.size_fixed(10));
    Ui.push_next_width(Ui.size_text_content());
    Ui.push_next_height(Ui.size_fixed(30));
    Ui.widget_make(`input-debug--dump--free--event--qeue#free events: ${free_evt.length}`, Ui.UiDrawText);
    Ui.row_end();
    Ui.column_end();
    Ui.pop_font_size();
    Ui.pop_parent();
}
