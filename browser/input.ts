import * as Base from "./base.js";

export enum MBttn {
	M_LEFT	= 0,
	M_RIGHT = 1,
	M_WHEEL = 2
}

type Btn = number;

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
] as const; 

const _EVENT_FIELDS: Record<typeof _EVENTS[number], Array<string>> = {
	"pointermove": ["clientX", "clientY"],
	"pointerdown": ["buttons"],
	"pointerup": ["buttons"],
	"wheel": ["deltaX", "deltaY"],
}

type mEvent = Array<[typeof _EVENTS[number], Record<string, any>]>;
const event_queue: mEvent = [];

function attach_listeners()
{
	for (const _evt of _EVENTS)
	{
		document.body.addEventListener(_evt, (evt) => {
			evt.preventDefault();
			evt.stopPropagation();
			const evt_data: Record<string, any> = {};
			for (const field of _EVENT_FIELDS[_evt])
			{
				evt_data[field] = (evt as any)[field];
			}
			const btn_data: Record<string, any> = {};
			if (_evt == "pointermove")
			{
				btn_data["buttons"] = (evt as PointerEvent).buttons;
				event_queue.unshift(["pointerdown", btn_data]);
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
	cursor: Cursor;
	is_down: (btn: Btn) => boolean;
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
		is_down: function(btn: Btn): boolean {
			let r = false;
			switch (btn)
			{
				case MBttn.M_LEFT:
				case MBttn.M_RIGHT:
				case MBttn.M_WHEEL:
				{
						r = cursor.buttons[btn];
				} break;
				default: break;
			}
			return (r);
		},
		pool: function(): void {
			while (event_queue.length)
		{
				const evt = event_queue.shift()!;
				switch (evt[0])
					{
					case "pointermove":
					{
							cursor.position.x = (evt[1].clientX as number);
							cursor.position.y = (evt[1].clientY as number);
						} break;
					case "pointerdown":
					case "pointerup":
					{
							const buttons = evt[1].buttons as number;
							cursor.buttons[MBttn.M_LEFT]	= !!(buttons & 1);
							cursor.buttons[MBttn.M_RIGHT] = !!(buttons & 2);
							cursor.buttons[MBttn.M_WHEEL] = !!(buttons & 4);
						} break;
					default: 
						break;
				}
			}
		}
	}
}
