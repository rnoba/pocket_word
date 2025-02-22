import * as Ui from "./ui.js";
import * as Base from "./base.js";
export function palette(background_color, border_color, border_size, rouded_corners, font, font_size, text_color, hot_background_color, active_background_color, hot_border_color, active_border_color, hot_border_size, active_border_size, hot_rouded_corners, active_rouded_corners, hot_font, active_font, hot_font_size, active_font_size, hot_text_color, active_text_color) {
    return {
        border_color,
        background_color,
        border_size,
        rouded_corners,
        font,
        font_size,
        text_color,
        hot_background_color: hot_background_color || background_color,
        active_background_color: active_background_color || background_color,
        hot_border_color: hot_border_color || border_color,
        active_border_color: active_border_color || border_color,
        hot_border_size: hot_border_size || border_size,
        active_border_size: active_border_size || border_size,
        hot_rouded_corners: hot_rouded_corners || rouded_corners,
        active_rouded_corners: active_rouded_corners || rouded_corners,
        hot_font: hot_font || font,
        active_font: active_font || font,
        hot_font_size: hot_font_size || font_size,
        active_font_size: active_font_size || font_size,
        hot_text_color: hot_text_color || text_color,
        active_text_color: active_text_color || text_color,
    };
}
export function custom(palette, settings, purge = false) {
    const n = { ...palette, ...settings };
    if (purge) {
        for (const k of Object.keys(settings)) {
            const hot_k = `hot_${k}`;
            const active_k = `active_${k}`;
            // @ts-ignore
            if (hot_k in palette) {
                n[hot_k] = settings[k];
            }
            // @ts-ignore
            if (active_k in palette) {
                n[active_k] = settings[k];
            }
        }
    }
    return n;
}
export const standard = palette(Base.Hex("#7c183c"), Base.Hex("#ff8274"), 5, Ui.rouded_corners(4, 4, 4, 4), "Monitorica", 20, Base.Hex("#FFFFFF"));
// ChatGPT palettes
// Oceanic theme – a cool, deep-sea inspired palette.
export const ocean = palette(Base.Hex("#0a2e40"), // Deep navy background
Base.Hex("#4db8ff"), // Vibrant sky blue border
4, Ui.rouded_corners(5, 5, 5, 5), "Roboto", 16, Base.Hex("#ffffff"));
// Sunset theme – warm and glowing with soft contrasts.
export const sunset = palette(Base.Hex("#ffcc66"), // Warm, glowing background
Base.Hex("#ff6666"), // Soft coral border
3, Ui.rouded_corners(6, 6, 6, 6), "Montserrat", 18, Base.Hex("#333333"));
// Forest theme – earthy and natural with a hint of green.
export const forest = palette(Base.Hex("#2e8b57"), // Lush green background
Base.Hex("#556b2f"), // Earthy, dark olive border
4, Ui.rouded_corners(7, 7, 7, 7), "Georgia", 17, Base.Hex("#f0f0f0"));
// Neon theme – bold, modern, and energetic.
export const neon = palette(Base.Hex("#1a1a1a"), // Dark background to let neon pop
Base.Hex("#39ff14"), // Neon green border for a vibrant look
2, Ui.rouded_corners(10, 10, 10, 10), "Courier New", 14, Base.Hex("#e0e0e0"));
// Deepseek palettes
// Midnight Aurora - Deep space with vibrant accents
export const midnight_aura = palette(Base.Hex("#1A1B26"), // Cosmic navy background
Base.Hex("#2AC3DE"), // Electric teal border
3, Ui.rouded_corners(8, 8, 8, 8), "Inter", 16, Base.Hex("#FFFFFF"));
// Modern Minimalist - Clean and sophisticated
export const minimalist = palette(Base.Hex("#F5F5F5"), // Crisp white background
Base.Hex("#CCCCCC"), // Subtle gray border
2, Ui.rouded_corners(6, 6, 6, 6), "Poppins", 15, Base.Hex("#333333"));
// Warm Desert - Earthy and inviting
export const desert = palette(Base.Hex("#EDCBB1"), // Sunbaked clay background
Base.Hex("#C44536"), // Terracotta border
4, Ui.rouded_corners(12, 12, 12, 12), "Lora", 17, Base.Hex("#4A2B21"));
// Cyberpunk - Futuristic neon contrast
export const cyberpunk = palette(Base.Hex("#0A0F2C"), // Deep space blue background
Base.Hex("#FF007F"), // Neon pink border
4, Ui.rouded_corners(10, 10, 10, 10), // Angular cyberpunk style
"Fira Code", 14, Base.Hex("#E0E0E0"));
// Soft Pastels - Friendly and approachable
export const pastel = palette(Base.Hex("#D1F0E8"), // Mint cream background
Base.Hex("#B19CD9"), // Lavender border
3, Ui.rouded_corners(16, 16, 16, 16), "Quicksand", 16, Base.Hex("#4A4A4A"));
// High Contrast - Maximum accessibility
export const accessible = palette(Base.Hex("#FFD700"), // Vivid yellow background
Base.Hex("#000080"), // Navy blue border
4, Ui.rouded_corners(8, 8, 8, 8), "Open Sans", 18, Base.Hex("#000080"));
// Retro/Vaporwave - 80s inspired nostalgia
export const vaporwave = palette(Base.Hex("#FF9A8B"), // Peach glow background
Base.Hex("#00CED1"), // Retro teal border
5, Ui.rouded_corners(20, 20, 20, 20), "Bebas Neue", 20, Base.Hex("#2A2A2A"));
// Professional Dark Mode - Modern workspace
export const professional = palette(Base.Hex("#2D2D2D"), // Deep gray background
Base.Hex("#4A90E2"), // Corporate blue border
3, Ui.rouded_corners(6, 6, 6, 6), "Segoe UI", 16, Base.Hex("#F0F0F0"));
