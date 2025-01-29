import * as Base from "./base.js";

export enum MBttn {
	M_LEFT	= 0,
	M_RIGHT = 1,
	M_WHEEL = 2
}

export enum KKey {
	KEY_LShift = 16,
	KEY_LCtrl = 17,
	KEY_Backspace = 8,
	KEY_Tab = 9,
	KEY_Enter = 13,
	KEY_Shift = 16,
	KEY_Ctrl = 17,
	KEY_Alt = 18,
	KEY_PauseBreak = 19,
	KEY_CapsLock = 20,
	KEY_Escape = 27,
	KEY_PageUp = 33,
	KEY_Space = 32,
	KEY_PageDown = 34,
	KEY_End = 35,
	KEY_Home = 36,
	KEY_ArrowLeft = 37,
	KEY_ArrowUp = 38,
	KEY_ArrowRight = 39,
	KEY_ArrowDown = 40,
	KEY_PrintScreen = 44,
	KEY_Insert = 45,
	KEY_Delete = 46,
	KEY_0 = 48,
	KEY_1 = 49,
	KEY_2 = 50,
	KEY_3 = 51,
	KEY_4 = 52,
	KEY_5 = 53,
	KEY_6 = 54,
	KEY_7 = 55,
	KEY_8 = 56,
	KEY_9 = 57,
	KEY_A = 65,
	KEY_B = 66,
	KEY_C = 67,
	KEY_D = 68,
	KEY_E = 69,
	KEY_F = 70,
	KEY_G = 71,
	KEY_H = 72,
	KEY_I = 73,
	KEY_J = 74,
	KEY_K = 75,
	KEY_L = 76,
	KEY_M = 77,
	KEY_N = 78,
	KEY_O = 79,
	KEY_P = 80,
	KEY_Q = 81,
	KEY_R = 82,
	KEY_S = 83,
	KEY_T = 84,
	KEY_U = 85,
	KEY_V = 86,
	KEY_W = 87,
	KEY_X = 88,
	KEY_Y = 89,
	KEY_Z = 90,
	KEY_LeftWindowKey = 91,
	KEY_RightWindowKey = 92,
	KEY_SelectKey = 93,
	KEY_Numpad0 = 96,
	KEY_Numpad1 = 97,
	KEY_Numpad2 = 98,
	KEY_Numpad3 = 99,
	KEY_Numpad4 = 100,
	KEY_Numpad5 = 101,
	KEY_Numpad6 = 102,
	KEY_Numpad7 = 103,
	KEY_Numpad8 = 104,
	KEY_Numpad9 = 105,
	KEY_Multiply = 106,
	KEY_Add = 107,
	KEY_Subtract = 109,
	KEY_DecimalPoint = 110,
	KEY_Divide = 111,
	KEY_F1 = 112,
	KEY_F2 = 113,
	KEY_F3 = 114,
	KEY_F4 = 115,
	KEY_F5 = 116,
	KEY_F6 = 117,
	KEY_F7 = 118,
	KEY_F8 = 119,
	KEY_F9 = 120,
	KEY_F10 = 121,
	KEY_F11 = 122,
	KEY_F12 = 123,
	KEY_NumLock = 144,
	KEY_ScrollLock = 145,
	KEY_MyComputer = 182,
	KEY_MyCalculator = 183,
	KEY_SemiColon = 186,
	KEY_EqualSign = 187,
	KEY_Comma = 188,
	KEY_Dash = 189,
	KEY_Period = 190,
	KEY_ForwardSlash = 191,
	KEY_OpenBracket = 219,
	KEY_BackSlash = 220,
	KEY_CloseBracket = 221,
	KEY_SingleQuote = 222
}

const KEYBOARD_STATE_MAP: Map<number, boolean> = new Map();
const KEYBOARD_PRESSED_MAP: Map<number, boolean> = new Map();

export type Key = number;

type Cursor = {
	position: Base.V2,
	buttons: [boolean, boolean, boolean];
	wheel: Base.V2 
}

const _EVENTS = [
	"pointerdown",
	"pointerup",
	"wheel",
	"pointermove",
	"mouseout",
	"keydown",
	"keyup",
	"resize",
	"drop",
] as const; 

const _EVENT_FIELDS: Record<typeof _EVENTS[number], Array<string>> = {
	"pointermove": ["clientX", "clientY"],
	"pointerdown": ["buttons"],
	"pointerup": ["buttons"],
	"wheel": ["deltaX", "deltaY"],
	"mouseout": ["relatedTarget", "toElement"],
	"keydown": ["code", "keyCode", "repeat", "key"],
	"keyup": ["code", "keyCode", "repeat", "key"],
	"resize": [],
	"drop": [],
}

type mEvent = Array<[typeof _EVENTS[number], Record<string, any>]>;
const event_queue: mEvent = [];
let free_evt: mEvent = [];

function attach_listeners()
{
	window.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
	});

	window.addEventListener("drop", (e) => {
		e.preventDefault();
		const data: File[] = [];

		const files = e.dataTransfer?.files;
		if (files)
		{
			for (const file of files) { data.push(file); }
		}
		const evt_data = { files: data };
		event_queue.unshift(["drop", evt_data]);
	})

	for (const _evt of _EVENTS)
	{
		if (_evt === "drop") { continue; }

		window.addEventListener(_evt, (evt) => {
			//evt.preventDefault();
			//evt.stopPropagation();
			const evt_data: Record<string, any> = {};
			for (const field of _EVENT_FIELDS[_evt])
			{
				evt_data[field] = (evt as any)[field];
			}
			event_queue.unshift([_evt, evt_data]);
		});
	}
}

function dettach_listeners()
{
	for (const evt of _EVENTS) {
		document.body.removeEventListener(evt, () => {});
	}
}

export interface InputInstance {
	pool: () => void;
	consume_event: () => void;
	next_event: () => null | mEvent[number]
	cursor: Cursor;
	is_down: (btn: Key) => boolean;
	pressed: (btn: Key) => boolean;
	deinit: () => void;
}

export function init(): InputInstance
{
	attach_listeners();
	const cursor: Cursor = {
		position: Base.V2.Zero(),
		buttons: [false, false, false],
		wheel: Base.V2.Zero(),
	}

	return {
		cursor,
		deinit: dettach_listeners,
		pressed: function(btn: Key): boolean {
			let r = false;
			switch (btn)
			{
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
					if (r) { KEYBOARD_PRESSED_MAP.set(btn, false); }
				} break;
				default:
					break;
			}
			return (r);
		},
		is_down: function(btn: Key): boolean {
			let r = false;
			switch (btn)
			{
				case MBttn.M_LEFT:
				case MBttn.M_RIGHT:
				case MBttn.M_WHEEL:
				{
					r = cursor.buttons[btn];
				} break;
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
				} break;
				default:
					break;
			}
			return (r);
		},
		next_event: function()
		{
			return free_evt[0];
		},
		consume_event: function()
		{
			free_evt.shift();
		},
		pool: function(): void {
			KEYBOARD_PRESSED_MAP.clear();
			while (event_queue.length)
			{
				free_evt.shift();
				const evt = event_queue.shift()!;
				free_evt.unshift(evt);
				switch (evt[0])
				{
					case "pointerdown":
					case "pointerup":
					{
							const buttons = evt[1].buttons as number;
							cursor.buttons[MBttn.M_LEFT]	= !!(buttons & 1);
							cursor.buttons[MBttn.M_RIGHT] = !!(buttons & 2);
							cursor.buttons[MBttn.M_WHEEL] = !!(buttons & 4);
					} break;
					case "keyup":
					case "keydown":
					{
						const name			= evt[0] as string;
						const key_code	= evt[1].keyCode as number;
						const repeat		= evt[1].repeat as boolean;
						const is_key_down = (name === "keydown");

						if (repeat === false)
						{
							if (!is_key_down && KEYBOARD_STATE_MAP.get(key_code))
							{
								KEYBOARD_PRESSED_MAP.set(key_code, true);
							}
							KEYBOARD_STATE_MAP.set(key_code, is_key_down);
						}
					} break;
					case "mouseout":
					{ 
						//if (!evt[1].relatedTarget && !evt[1].toElement) 
						//{
						cursor.buttons[MBttn.M_LEFT]	= false; 
						cursor.buttons[MBttn.M_RIGHT] = false; 
						cursor.buttons[MBttn.M_WHEEL] = false; 
					} break;
					case "pointermove":
					{
							cursor.position.x = (evt[1].clientX as number);
							cursor.position.y = (evt[1].clientY as number);
					} break;
					default: 
						break;
				}
			}
		}
	}
}
