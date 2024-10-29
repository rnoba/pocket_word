import { Vector2 } from "./base.js";
const SPRITES = {
    floor: [
        {
            start: new Vector2(0, 0),
            size: new Vector2(32, 32),
            offset: new Vector2(-16, -16)
        },
        {
            start: new Vector2(64, 0),
            size: new Vector2(16, 16),
            offset: new Vector2(-8, -8)
        },
        {
            start: new Vector2(64, 16),
            size: new Vector2(15, 32),
            offset: new Vector2(-8, -23)
        },
        {
            start: new Vector2(80, 0),
            size: new Vector2(32, 48),
            offset: new Vector2(-16, -32)
        },
        {
            start: new Vector2(112, 0),
            size: new Vector2(32, 32),
            offset: new Vector2(-16, -16)
        },
        {
            start: new Vector2(144, 0),
            size: new Vector2(32, 16),
            offset: new Vector2(-15, -2)
        },
        {
            start: new Vector2(144, 16),
            size: new Vector2(32, 16),
            offset: new Vector2(-15, -2)
        },
        {
            start: new Vector2(144, 32),
            size: new Vector2(32, 16),
            offset: new Vector2(-15, -2)
        },
    ],
    cleiton: [
        {
            start: new Vector2(32, 0),
            size: new Vector2(31, 31),
            offset: new Vector2(-16, -16)
        },
    ],
};
export default SPRITES;
