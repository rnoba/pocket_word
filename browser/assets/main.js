import * as Sprite from "./sprite.js";
import * as Base from "./base.js";
import * as Input from "./input.js";
import * as Packet from "./packet.js";
import * as Widget from "./widgets.js";
function user_is_anonymous(user_id) {
    return user_id === Packet.ANONYMOUS_ID;
}
function user_is_offline(user) {
    return user.socket === null;
}
(async () => {
    const canvas = document.getElementById("canvas");
    if (canvas === null) {
        throw new Error("Could not find canvas element");
    }
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
        throw new Error("Canvas 2D context not supported");
    }
    const { width, height } = document.body.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    Base.set_global_ctx(ctx);
    await Base.load_fonts();
    await Sprite.load_sources();
    const pocket_world = {
        camera: Base.camera_zero(),
    };
    pocket_world.camera.width = width;
    pocket_world.camera.height = height;
    Input.init();
    function draw(dt) {
        Input.pool();
        const evt = Input.consume_specific(Input.IptEventKind.Resize);
        if (evt) {
            const { width, height } = evt.payload;
            pocket_world.camera.width = width;
            pocket_world.camera.height = height;
            canvas.width = width;
            canvas.height = height;
        }
        Widget.editor(dt, pocket_world);
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
