import * as Base from "./base.js";
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
})(KKey || (KKey = {}));
const KEYBOARD_STATE_MAP = new Map();
const KEYBOARD_PRESSED_MAP = new Map();
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
function attach_listeners() {
    for (const _evt of _EVENTS) {
        document.body.addEventListener(_evt, (evt) => {
            //evt.preventDefault();
            //evt.stopPropagation();
            const evt_data = {};
            for (const field of _EVENT_FIELDS[_evt]) {
                evt_data[field] = evt[field];
            }
            //const btn_data: Record<string, any> = {};
            //if (_evt == "pointermove")
            //{
            //	btn_data["buttons"] = (evt as PointerEvent).buttons;
            //	event_queue.unshift(["pointerup", btn_data]);
            //}
            event_queue.unshift([_evt, evt_data]);
        });
    }
}
function dettach_listeners() {
    for (const evt of _EVENTS) {
        document.body.removeEventListener(evt, () => { });
    }
}
export function init() {
    attach_listeners();
    const cursor = {
        position: Base.V2.Zero(),
        buttons: [false, false, false],
        wheel: Base.V2.Zero(),
    };
    return {
        cursor,
        deinit: dettach_listeners,
        pressed: function (btn) {
            let r = false;
            switch (btn) {
                case KKey.KEY_W:
                case KKey.KEY_A:
                case KKey.KEY_S:
                case KKey.KEY_D:
                case KKey.KEY_E:
                case KKey.KEY_LShift:
                case KKey.KEY_LCtrl:
                case KKey.KEY_Backspace:
                case KKey.KEY_Tab:
                case KKey.KEY_Enter:
                case KKey.KEY_Shift:
                case KKey.KEY_Ctrl:
                case KKey.KEY_Alt:
                case KKey.KEY_PauseBreak:
                case KKey.KEY_CapsLock:
                case KKey.KEY_Escape:
                case KKey.KEY_PageUp:
                case KKey.KEY_Space:
                case KKey.KEY_PageDown:
                case KKey.KEY_End:
                case KKey.KEY_Home:
                case KKey.KEY_ArrowLeft:
                case KKey.KEY_ArrowUp:
                case KKey.KEY_ArrowRight:
                case KKey.KEY_ArrowDown:
                case KKey.KEY_PrintScreen:
                case KKey.KEY_Insert:
                case KKey.KEY_Delete:
                case KKey.KEY_0:
                case KKey.KEY_1:
                case KKey.KEY_2:
                case KKey.KEY_3:
                case KKey.KEY_4:
                case KKey.KEY_5:
                case KKey.KEY_6:
                case KKey.KEY_7:
                case KKey.KEY_8:
                case KKey.KEY_9:
                case KKey.KEY_A:
                case KKey.KEY_B:
                case KKey.KEY_C:
                case KKey.KEY_D:
                case KKey.KEY_E:
                case KKey.KEY_F:
                case KKey.KEY_G:
                case KKey.KEY_H:
                case KKey.KEY_I:
                case KKey.KEY_J:
                case KKey.KEY_K:
                case KKey.KEY_L:
                case KKey.KEY_M:
                case KKey.KEY_N:
                case KKey.KEY_O:
                case KKey.KEY_P:
                case KKey.KEY_Q:
                case KKey.KEY_R:
                case KKey.KEY_S:
                case KKey.KEY_T:
                case KKey.KEY_U:
                case KKey.KEY_V:
                case KKey.KEY_W:
                case KKey.KEY_X:
                case KKey.KEY_Y:
                case KKey.KEY_Z:
                case KKey.KEY_LeftWindowKey:
                case KKey.KEY_RightWindowKey:
                case KKey.KEY_SelectKey:
                case KKey.KEY_Numpad0:
                case KKey.KEY_Numpad1:
                case KKey.KEY_Numpad2:
                case KKey.KEY_Numpad3:
                case KKey.KEY_Numpad4:
                case KKey.KEY_Numpad5:
                case KKey.KEY_Numpad6:
                case KKey.KEY_Numpad7:
                case KKey.KEY_Numpad8:
                case KKey.KEY_Numpad9:
                case KKey.KEY_Multiply:
                case KKey.KEY_Add:
                case KKey.KEY_Subtract:
                case KKey.KEY_DecimalPoint:
                case KKey.KEY_Divide:
                case KKey.KEY_F1:
                case KKey.KEY_F2:
                case KKey.KEY_F3:
                case KKey.KEY_F4:
                case KKey.KEY_F5:
                case KKey.KEY_F6:
                case KKey.KEY_F7:
                case KKey.KEY_F8:
                case KKey.KEY_F9:
                case KKey.KEY_F10:
                case KKey.KEY_F11:
                case KKey.KEY_F12:
                case KKey.KEY_NumLock:
                case KKey.KEY_ScrollLock:
                case KKey.KEY_MyComputer:
                case KKey.KEY_MyCalculator:
                case KKey.KEY_SemiColon:
                case KKey.KEY_EqualSign:
                case KKey.KEY_Comma:
                case KKey.KEY_Dash:
                case KKey.KEY_Period:
                case KKey.KEY_ForwardSlash:
                case KKey.KEY_OpenBracket:
                case KKey.KEY_BackSlash:
                case KKey.KEY_CloseBracket:
                case KKey.KEY_SingleQuote:
                    {
                        r = KEYBOARD_PRESSED_MAP.get(btn) || false;
                        if (r) {
                            KEYBOARD_PRESSED_MAP.set(btn, false);
                        }
                    }
                    break;
                default:
                    break;
            }
            return (r);
        },
        is_down: function (btn) {
            let r = false;
            switch (btn) {
                case MBttn.M_LEFT:
                case MBttn.M_RIGHT:
                case MBttn.M_WHEEL:
                    {
                        r = cursor.buttons[btn];
                    }
                    break;
                case KKey.KEY_W:
                case KKey.KEY_A:
                case KKey.KEY_S:
                case KKey.KEY_D:
                case KKey.KEY_E:
                case KKey.KEY_LShift:
                case KKey.KEY_LCtrl:
                case KKey.KEY_Backspace:
                case KKey.KEY_Tab:
                case KKey.KEY_Enter:
                case KKey.KEY_Shift:
                case KKey.KEY_Ctrl:
                case KKey.KEY_Alt:
                case KKey.KEY_PauseBreak:
                case KKey.KEY_CapsLock:
                case KKey.KEY_Escape:
                case KKey.KEY_PageUp:
                case KKey.KEY_Space:
                case KKey.KEY_PageDown:
                case KKey.KEY_End:
                case KKey.KEY_Home:
                case KKey.KEY_ArrowLeft:
                case KKey.KEY_ArrowUp:
                case KKey.KEY_ArrowRight:
                case KKey.KEY_ArrowDown:
                case KKey.KEY_PrintScreen:
                case KKey.KEY_Insert:
                case KKey.KEY_Delete:
                case KKey.KEY_0:
                case KKey.KEY_1:
                case KKey.KEY_2:
                case KKey.KEY_3:
                case KKey.KEY_4:
                case KKey.KEY_5:
                case KKey.KEY_6:
                case KKey.KEY_7:
                case KKey.KEY_8:
                case KKey.KEY_9:
                case KKey.KEY_A:
                case KKey.KEY_B:
                case KKey.KEY_C:
                case KKey.KEY_D:
                case KKey.KEY_E:
                case KKey.KEY_F:
                case KKey.KEY_G:
                case KKey.KEY_H:
                case KKey.KEY_I:
                case KKey.KEY_J:
                case KKey.KEY_K:
                case KKey.KEY_L:
                case KKey.KEY_M:
                case KKey.KEY_N:
                case KKey.KEY_O:
                case KKey.KEY_P:
                case KKey.KEY_Q:
                case KKey.KEY_R:
                case KKey.KEY_S:
                case KKey.KEY_T:
                case KKey.KEY_U:
                case KKey.KEY_V:
                case KKey.KEY_W:
                case KKey.KEY_X:
                case KKey.KEY_Y:
                case KKey.KEY_Z:
                case KKey.KEY_LeftWindowKey:
                case KKey.KEY_RightWindowKey:
                case KKey.KEY_SelectKey:
                case KKey.KEY_Numpad0:
                case KKey.KEY_Numpad1:
                case KKey.KEY_Numpad2:
                case KKey.KEY_Numpad3:
                case KKey.KEY_Numpad4:
                case KKey.KEY_Numpad5:
                case KKey.KEY_Numpad6:
                case KKey.KEY_Numpad7:
                case KKey.KEY_Numpad8:
                case KKey.KEY_Numpad9:
                case KKey.KEY_Multiply:
                case KKey.KEY_Add:
                case KKey.KEY_Subtract:
                case KKey.KEY_DecimalPoint:
                case KKey.KEY_Divide:
                case KKey.KEY_F1:
                case KKey.KEY_F2:
                case KKey.KEY_F3:
                case KKey.KEY_F4:
                case KKey.KEY_F5:
                case KKey.KEY_F6:
                case KKey.KEY_F7:
                case KKey.KEY_F8:
                case KKey.KEY_F9:
                case KKey.KEY_F10:
                case KKey.KEY_F11:
                case KKey.KEY_F12:
                case KKey.KEY_NumLock:
                case KKey.KEY_ScrollLock:
                case KKey.KEY_MyComputer:
                case KKey.KEY_MyCalculator:
                case KKey.KEY_SemiColon:
                case KKey.KEY_EqualSign:
                case KKey.KEY_Comma:
                case KKey.KEY_Dash:
                case KKey.KEY_Period:
                case KKey.KEY_ForwardSlash:
                case KKey.KEY_OpenBracket:
                case KKey.KEY_BackSlash:
                case KKey.KEY_CloseBracket:
                case KKey.KEY_SingleQuote:
                    {
                        r = KEYBOARD_STATE_MAP.get(btn) || false;
                    }
                    break;
                default:
                    break;
            }
            return (r);
        },
        next_event: function () {
            return free_evt[0];
        },
        consume_event: function () {
            free_evt.shift();
        },
        pool: function () {
            while (event_queue.length) {
                //free_evt.shift();
                const evt = event_queue.shift();
                free_evt.unshift(evt);
                switch (evt[0]) {
                    case "pointerdown":
                    case "pointerup":
                        {
                            const buttons = evt[1].buttons;
                            cursor.buttons[MBttn.M_LEFT] = !!(buttons & 1);
                            cursor.buttons[MBttn.M_RIGHT] = !!(buttons & 2);
                            cursor.buttons[MBttn.M_WHEEL] = !!(buttons & 4);
                        }
                        break;
                    case "keyup":
                    case "keydown":
                        {
                            const name = evt[0];
                            const key_code = evt[1].keyCode;
                            const repeat = evt[1].repeat;
                            const is_key_down = (name === "keydown");
                            if (repeat === false) {
                                if (!is_key_down && KEYBOARD_STATE_MAP.get(key_code)) {
                                    KEYBOARD_PRESSED_MAP.set(key_code, !is_key_down);
                                }
                                KEYBOARD_STATE_MAP.set(key_code, is_key_down);
                            }
                        }
                        break;
                    case "mouseout":
                        {
                            //if (!evt[1].relatedTarget && !evt[1].toElement) 
                            //{
                            cursor.buttons[MBttn.M_LEFT] = false;
                            cursor.buttons[MBttn.M_RIGHT] = false;
                            cursor.buttons[MBttn.M_WHEEL] = false;
                        }
                        break;
                    case "pointermove":
                        {
                            cursor.position.x = evt[1].clientX;
                            cursor.position.y = evt[1].clientY;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    };
}
