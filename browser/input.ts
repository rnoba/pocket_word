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
	KEY_SingleQuote = 222,
	_KEY_COUNT
}

const KEYBOARD_STATE_MAP: Map<number, boolean> = new Map();
const KEYBOARD_PRESSED_MAP: Map<number, boolean> = new Map();

export type Key = number;

type Cursor = {
	position: Base.V2,
	buttons: [boolean, boolean, boolean];
	wheel: Base.V2 
}

export enum IptEventKind {
	PointerMove,
	PointerDown,
	PointerUp,
	Wheel,
	MouseOut,
	KeyDown,
	KeyUp,
	Resize,
	Drop
}

const _JS_EVENT_TO_EVENT_KIND: Record<string, IptEventKind> = {
	"pointermove":	IptEventKind.PointerMove,
	"pointerdown":	IptEventKind.PointerDown,
	"pointerup":		IptEventKind.PointerUp,
	"mouseout":			IptEventKind.MouseOut,
	"keydown":			IptEventKind.KeyDown,
	"resize":				IptEventKind.Resize,
	"wheel":				IptEventKind.Wheel,
	"keyup":				IptEventKind.KeyUp,
	"drop":					IptEventKind.Drop
}

export type WheelEvent = {
	deltaX: number;
	deltaY: number;
}

export type KeyEvent = {
	repeat: boolean;
	keyCode: number;
}

export type DropEvent<T> = {
	data: T[],
}

export type PointerEvent = {
	clientX: number;
	clientY: number;
	buttons: number;
}

export type IptEvent<T> = {
	kind: IptEventKind;
	payload: T;
}

export type ResizeEvent = {
	width: number;
	height: number;
}

type IptEvents = KeyEvent | WheelEvent | DropEvent<unknown> | PointerEvent | ResizeEvent;

function ipt_event_make<T>(kind: IptEventKind, payload: T): IptEvent<T> {
	return { kind, payload }
}

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
		if (files) for (const file of files) { data.push(file); }
		const evt = ipt_event_make<DropEvent<File>>(IptEventKind.Drop, { data }); 
		event_queue.unshift(evt);
	});

	window.addEventListener("resize", (_) => {
		const data = document.body.getBoundingClientRect();
		const evt = ipt_event_make<ResizeEvent>(IptEventKind.Resize, { width: data.width, height: data.height }); 
		event_queue.unshift(evt);
	});

	for (const js_evt of _EVENTS)
	{
		const kind = _JS_EVENT_TO_EVENT_KIND[js_evt];
		if (kind === IptEventKind.Drop ||
				kind === IptEventKind.Resize) { continue; }

		window.addEventListener(js_evt, (evt_data) => {
			//evt.preventDefault();
			//evt.stopPropagation();
			const evt = ipt_event_make<any>(kind, {});
			for (const field of _EVENT_FIELDS[js_evt])
			{
				evt.payload[field] = (evt_data as any)[field];
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
] as const; 

const _EVENT_FIELDS: Record<typeof _EVENTS[number], Array<string>> = {
	"pointermove": ["clientX", "clientY"],
	"pointerdown": ["buttons"],
	"pointerup": ["buttons"],
	"wheel": ["deltaX", "deltaY"],
	"mouseout": ["relatedTarget", "toElement"],
	"keydown": ["code", "keyCode", "repeat", "key"],
	"keyup": ["code", "keyCode", "repeat", "key"],
}

const event_queue: Array<IptEvent<IptEvents>> = [];
let		free_evt: Array<IptEvent<IptEvents>> = [];

const _Cursor: Cursor = {
	position: Base.V2.Zero(),
	buttons: [false, false, false],
	wheel: Base.V2.Zero(),
}

export function next_event<T = IptEvents>(): null | IptEvent<T>
{
	return free_evt[0] as null | IptEvent<T>;
}

export function next_event_is<T = IptEvents>(kind: IptEventKind): null | IptEvent<T>
{
	if (next_event<T>()?.kind === kind) {
		return next_event<T>();
	}
	return null;
}

export function consume_event()
{
	return free_evt.shift() || null;
}

export function consume_specific<T = IptEvents>(kind: IptEventKind): null | IptEvent<T>
{
	if (next_event<T>()?.kind === kind) {
		return consume_event() as IptEvent<T>;
	}
	return null;
}

export function cursor()
{
	return _Cursor;
}

export function is_pressed(btn: Key): boolean {
 return KEYBOARD_PRESSED_MAP.get(btn) || false;
}

export function is_down(btn: Key): boolean {
	let down = false;
	switch (btn)
	{
		case MBttn.M_LEFT:
		case MBttn.M_RIGHT:
		case MBttn.M_WHEEL:
		{
			down = _Cursor.buttons[btn];
		} break;
		default: 
		{
			down = KEYBOARD_STATE_MAP.get(btn) || false;
		} break;
	}
	return (down);
}

export function pool()
{
	KEYBOARD_PRESSED_MAP.clear();
	while (event_queue.length)
		{
			free_evt.shift();
			const evt = event_queue.shift()!;
			free_evt.unshift(evt);

			switch (evt.kind)
			{
				case IptEventKind.PointerDown:
				case IptEventKind.PointerUp:
					{
					const payload = evt.payload as PointerEvent;

					const buttons = payload.buttons;
					_Cursor.buttons[MBttn.M_LEFT]	= !!(buttons & 1);
					_Cursor.buttons[MBttn.M_RIGHT] = !!(buttons & 2);
					_Cursor.buttons[MBttn.M_WHEEL] = !!(buttons & 4);
				} break;
				case IptEventKind.KeyUp:
					case IptEventKind.KeyDown:
					{
					const payload = evt.payload as KeyEvent;

					const key_code	= payload.keyCode;
					const repeat		= payload.repeat;
					const is_key_down = evt.kind === IptEventKind.KeyDown; 
					if (repeat === false)
						{
							if (!is_key_down && KEYBOARD_STATE_MAP.get(key_code))
								{
									KEYBOARD_PRESSED_MAP.set(key_code, true);
								}
								KEYBOARD_STATE_MAP.set(key_code, is_key_down);
						}
				} break;
				case IptEventKind.MouseOut:
					{ 
					_Cursor.buttons[MBttn.M_LEFT]	= false;
					_Cursor.buttons[MBttn.M_RIGHT] = false;
					_Cursor.buttons[MBttn.M_WHEEL] = false; 
				} break;
				case IptEventKind.PointerMove:
					{
					const payload = evt.payload as PointerEvent; 
					_Cursor.position.x = payload.clientX;
					_Cursor.position.y = payload.clientY;
				} break;
				default: 
					break;
			}
		}
}

export function init()
{
	attach_listeners();
}

export function deinit()
{
	for (const evt of _EVENTS) {
		document.body.removeEventListener(evt, () => {});
	}
}

