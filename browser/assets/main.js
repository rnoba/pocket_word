import * as Base from "./base.js";
import * as Input from "./input.js";
import * as Ui from "./ui.js";
(async () => {
    const canvas = document.getElementById("canvas");
    if (canvas === null) {
        throw new Error("Could not find canvas element");
    }
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
        throw new Error("Canvas 2D context not supported");
    }
    ctx.imageSmoothingEnabled = false;
    Base.set_global_ctx(ctx);
    const { width, height } = document.body.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    let current_frame = 0;
    //const camera: Base.Camera = {
    //	width,
    //	height,
    //	x: 0,
    //	y: 0,
    //	z: 0,
    //	word_position: Base.V2.Zero(),
    //	scaling: 1,
    //	is_locked: true,
    //};
    //
    const ipt = Input.init();
    Ui.SetInputInstance(ipt);
    function draw(dt) {
        ipt.pool();
        Ui.FrameBegin(dt);
        const parent = Ui.Container("container", Ui.Rect([0, 0], [300, 600]));
        if (Ui.Button("btx", Ui.Rect(Ui.ParentP(parent), Ui.TextS())).clicked) {
            console.log("btx");
        }
        if (Ui.Button("btx", Ui.Rect([0, 0], [0, 0])).clicked) {
            console.log("btx");
        }
        for (let i = 0; i < 10; i++) {
            if (Ui.Button("button " + i, Ui.Rect([90, 20 + i * 65], [100, 40])).clicked) {
                console.log("clicked " + i);
            }
        }
        Ui.FrameEnd();
    }
    let prev_timestamp = 0;
    const frame = (timestamp) => {
        const dt = (timestamp - prev_timestamp) / 1000;
        prev_timestamp = timestamp;
        draw(dt);
        window.requestAnimationFrame(frame);
    };
    window.requestAnimationFrame((timestamp) => {
        prev_timestamp = timestamp;
        window.requestAnimationFrame(frame);
    });
})();
