import * as Base from "./base.js";
export var MBttn;
(function (MBttn) {
    MBttn[MBttn["M_LEFT"] = 0] = "M_LEFT";
    MBttn[MBttn["M_RIGHT"] = 1] = "M_RIGHT";
    MBttn[MBttn["M_WHEEL"] = 2] = "M_WHEEL";
})(MBttn || (MBttn = {}));
const _EVENTS = [
    "pointerdown",
    "pointerup",
    "wheel",
    "pointermove",
    "mouseout",
];
const _EVENT_FIELDS = {
    "pointermove": ["clientX", "clientY"],
    "pointerdown": ["buttons"],
    "pointerup": ["buttons"],
    "wheel": ["deltaX", "deltaY"],
    "mouseout": ["relatedTarget", "toElement"],
};
const event_queue = [];
function attach_listeners() {
    for (const _evt of _EVENTS) {
        document.body.addEventListener(_evt, (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
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
                default: break;
            }
            return (r);
        },
        pool: function () {
            while (event_queue.length) {
                const evt = event_queue.shift();
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
                    case "mouseout":
                        {
                            //if (!evt[1].relatedTarget && !evt[1].toElement) 
                            //{
                            cursor.buttons[MBttn.M_LEFT] = false;
                            cursor.buttons[MBttn.M_RIGHT] = false;
                            cursor.buttons[MBttn.M_WHEEL] = false;
                        }
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
