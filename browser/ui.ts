import * as Base from "./base.js"

type UiRect = {
	rect:		Base.Rect,
	color:	Base.RGBA
}

enum UiEvent {
	REDRAW,
}

const _MAX_UI_ELEMENTS = 100;

export class UI
{
	ctx: CanvasRenderingContext2D | null = null;
	rects: Array<UiRect> = [];
	draw_qeue: Array<number> = [];

	constructor(ctx: CanvasRenderingContext2D)
	{
		this.ctx = ctx;
	}

	draw_rect(rect: Base.Rect, color: Base.RGBA)
	{
		this.ctx!.fillStyle = Base.RGBA_to_css_string(color);
		this.ctx!.beginPath();
		this.ctx!.fillRect(
			rect.position.x,
			rect.position.y,
			rect.width,
			rect.height);
		this.ctx!.fill();
	}

	add_rect(rect: Base.Rect, color: Base.RGBA)
	{
		const size = this.rects.unshift({rect, color});
		this.draw_qeue.unshift(size-1);
	}

	prepare_redraw_all()
	{
		for (let i = 0; i < this.rects.length; i++)
		{
			this.draw_qeue.push(i);
		}
	}

	update()
	{
		this.prepare_redraw_all();
		while (this.draw_qeue.length)
		{
			const ui_rect_idx = this.draw_qeue.shift()!;
			const ui_rect			= this.rects[ui_rect_idx];
			this.draw_rect(ui_rect.rect, ui_rect.color);
		}
	}
}


