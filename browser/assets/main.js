import * as Base from "./base.js";
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
    const { width, height } = document.body.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    const camera = {
        width,
        height,
        x: 0,
        y: 0,
        z: 0,
        word_position: Base.V2.Zero(),
        scaling: 1,
        is_locked: true,
    };
    const w = Base.camera_transform_world(camera, 0, 0, 0);
    const s = Base.camera_transform_screen(camera, w.x, w.y, 0);
    console.log(w.array(), s.array());
    //function draw()
    //{
    //}
    //
    //let prev_timestamp = 0;
    //window.requestAnimationFrame((timestamp) => {
    //	prev_timestamp = timestamp;
    //	window.requestAnimationFrame(draw);
    //});
    //
})();
