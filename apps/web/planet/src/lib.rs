//! Neuronaut's hero planet, drawn with WebGL2.
//!
//! A language model reads text as tokens, so this planet is made of them: every word on its
//! surface comes from Neuronaut's own lessons, sized by how often the course uses it, glowing
//! like city lights seen from orbit. Orange flashes are next-word picks firing.
//!
//! Two parts:
//! - `SurfacePainter` paints the word surface from the course text. It runs once, ahead of time
//!   (scripts/make-planet-assets.mjs), and the result ships as public/hero/word-surface-*.webp,
//!   so visitors' devices never rasterise thousands of words.
//! - `Planet` takes that image and draws the turning sphere with WebGL2. JavaScript calls
//!   `resize` and `frame`; it owns the animation loop so it can pause the planet off-screen.

use std::collections::{HashMap, HashSet};
use std::f32::consts::PI;

use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{
    CanvasRenderingContext2d as Ctx2d, HtmlCanvasElement, HtmlImageElement, WebGl2RenderingContext as GL, WebGlBuffer, WebGlProgram,
    WebGlShader, WebGlTexture, WebGlUniformLocation, WebGlVertexArrayObject,
};

/* ------------------------------------------------------------------ words ------------------------------------------------------------------ */

/// Data-structure keys in the serialised lessons; not course words.
const KEYS: &[&str] = &[
    "id", "kind", "choice", "truefalse", "order", "passage", "prompt", "options", "answer", "explain", "body", "title",
    "tiles", "statement", "cards", "exercises", "minutes", "lessons", "true", "false", "null", "http", "https", "www",
    "com", "org", "png", "jpg", "webp",
];

/// Filler words are tokens too, so they stay on the planet, but small: the dust between cities.
const FILLER: &str = "the and of to a in is it that for you on with as are be this or your can an by not from at its if what but they do does how when so more than about like has have was will one all which their them there these those then into out up use used using may might could would should just also only some any each other such very most make makes get gets you're it's don't isn't can't i'm we our us he she his her him who why where";

/// Every word in the text, most frequent first (2+ letters, case-folded).
fn count_words(text: &str) -> Vec<(String, u32)> {
    let mut counts: HashMap<String, u32> = HashMap::new();
    let chars: Vec<char> = text.chars().collect();
    let mut i = 0;
    while i < chars.len() {
        if chars[i].is_ascii_alphabetic() {
            let start = i;
            i += 1;
            while i < chars.len() && (chars[i].is_ascii_alphabetic() || matches!(chars[i], '\'' | '’' | '-')) {
                i += 1;
            }
            let mut w: String = chars[start..i].iter().collect();
            while w.ends_with(['\'', '’', '-']) {
                w.pop();
            }
            if w.chars().count() >= 2 {
                let k = w.to_lowercase();
                if !KEYS.contains(&k.as_str()) {
                    *counts.entry(k).or_insert(0) += 1;
                }
            }
        } else {
            i += 1;
        }
    }
    let mut v: Vec<(String, u32)> = counts.into_iter().collect();
    v.sort_by(|a, b| b.1.cmp(&a.1).then_with(|| a.0.cmp(&b.0)));
    v
}

/// Deterministic random (mulberry32), so the planet and its still poster look the same every visit.
struct Rng(u32);
impl Rng {
    fn next(&mut self) -> f64 {
        self.0 = self.0.wrapping_add(0x6d2b_79f5);
        let mut t = self.0;
        t = (t ^ (t >> 15)).wrapping_mul(t | 1);
        t ^= t.wrapping_add((t ^ (t >> 7)).wrapping_mul(t | 61));
        ((t ^ (t >> 14)) as f64) / 4_294_967_296.0
    }
}

/// Paints the surface (clusters of words on black, equirectangular, stretched toward the poles)
/// a slice at a time, so no single call blocks the page: `step` stops once its time budget is spent.
struct Painter {
    canvas: HtmlCanvasElement,
    g: Ctx2d,
    words: Vec<(String, u32)>,
    content: Vec<usize>,
    top_c: f64,
    centres: Vec<(f64, f64, f64)>,
    r: Rng,
    w: f64,
    h: f64,
    k: f64,
    phase: u8,
    i: u32,
    orange: Option<bool>,
}

/// Words are drawn from one parsed font, sized with the transform: re-parsing a CSS font for
/// every word is what made painting slow.
const BASE_PX: f64 = 32.0;
const DUST: u32 = 4200;
const CITIES: u32 = 4600;
const CAPITALS: u32 = 520;

impl Painter {
    fn new(width: u32, font: &str, text: &str) -> Result<Painter, JsValue> {
        let doc = web_sys::window().ok_or("no window")?.document().ok_or("no document")?;
        let canvas: HtmlCanvasElement = doc.create_element("canvas")?.dyn_into()?;
        canvas.set_width(width);
        canvas.set_height(width / 2);
        let g: Ctx2d = canvas.get_context("2d")?.ok_or("no 2d context")?.dyn_into()?;
        let (w, h) = (width as f64, (width / 2) as f64);
        g.set_fill_style_str("#000");
        g.fill_rect(0.0, 0.0, w, h);
        g.set_font(&format!("{BASE_PX}px {font}"));

        let words = count_words(text);
        let filler: HashSet<&str> = FILLER.split(' ').collect();
        let content: Vec<usize> = (0..words.len()).filter(|&i| !filler.contains(words[i].0.as_str())).collect();
        let top_c = content.first().map(|&i| words[i].1).unwrap_or(1) as f64;
        let mut r = Rng(7);
        // "Continents": clusters of words around a few centres, kept off the poles.
        let centres = (0..16).map(|_| (r.next() * 360.0, -45.0 + r.next() * 90.0, 10.0 + r.next() * 22.0)).collect();
        Ok(Painter { canvas, g, words, content, top_c, centres, r, w, h, k: w / 2048.0, phase: 0, i: 0, orange: None })
    }

    fn any(&mut self) -> usize {
        let n = self.words.len().min(1200).max(1);
        ((self.r.next().powf(1.4) * n as f64) as usize).min(self.words.len().saturating_sub(1))
    }

    fn gauss(&mut self) -> f64 {
        (-2.0 * (1.0 - self.r.next() * 0.999).ln()).sqrt()
    }

    fn place(&self, lon: f64, lat: f64, word: &str, px: f64, alpha: f64) {
        let la = lat.clamp(-72.0, 72.0);
        let x = lon.rem_euclid(360.0) / 360.0 * self.w;
        let y = (90.0 - la) / 180.0 * self.h;
        let s = px / BASE_PX;
        let sx = s / la.to_radians().cos();
        self.g.set_global_alpha(alpha);
        let _ = self.g.set_transform(sx, 0.0, 0.0, s, x, y);
        let _ = self.g.fill_text(word, 0.0, 0.0);
        if x > self.w - 140.0 * self.k {
            let _ = self.g.set_transform(sx, 0.0, 0.0, s, x - self.w, y);
            let _ = self.g.fill_text(word, 0.0, 0.0);
        }
    }

    fn word(&self, i: usize) -> &str {
        self.words.get(i).map(|w| w.0.as_str()).unwrap_or("token")
    }

    /// Paint until `deadline_ms` (Date.now() time). Returns true when the surface is finished.
    fn step(&mut self, deadline_ms: f64) -> bool {
        let k = self.k;
        loop {
            // check the clock every 8 words: on slow devices a single word can take milliseconds
            if self.i % 8 == 0 && js_sys::Date::now() >= deadline_ms {
                return false;
            }
            match self.phase {
                // background dust: tiny, dim, everywhere
                0 => {
                    if self.i == 0 {
                        self.g.set_fill_style_str("rgb(255, 226, 190)");
                    }
                    let (lon, lat) = (self.r.next() * 360.0, -62.0 + self.r.next() * 124.0);
                    let wi = self.any();
                    let px = (5.5 + self.r.next() * 2.5) * k;
                    let a = 0.08 + self.r.next() * 0.12;
                    self.place(lon, lat, &self.word(wi).to_owned(), px, a);
                    self.advance(DUST);
                }
                // cities: dense clusters of small bright words
                1 => {
                    if self.i == 0 {
                        self.g.set_fill_style_str("rgb(255, 236, 205)");
                    }
                    let c = self.centres[(self.r.next() * self.centres.len() as f64) as usize];
                    let ang = self.r.next() * std::f64::consts::TAU;
                    let d = self.gauss() * c.2 * 0.55;
                    let wi = self.any();
                    let px = (6.0 + self.r.next() * 3.0) * k;
                    let a = 0.3 + self.r.next() * 0.4;
                    self.place(c.0 + ang.cos() * d * 1.6, c.1 + ang.sin() * d, &self.word(wi).to_owned(), px, a);
                    self.advance(CITIES);
                }
                // capitals: the course's key words, larger; one in eight in orange
                2 => {
                    let c = self.centres[(self.r.next() * self.centres.len() as f64) as usize];
                    let ang = self.r.next() * std::f64::consts::TAU;
                    let d = self.gauss() * c.2 * 0.35;
                    let n = self.content.len().min(260).max(1);
                    let pick = (self.r.next().powf(2.2) * n as f64) as usize;
                    let (wi, count) = self.content.get(pick).map(|&i| (i, self.words[i].1)).unwrap_or((0, 1));
                    let big = (count as f64 / self.top_c).sqrt();
                    let px = (9.0 + big * 13.0 + self.r.next() * 2.0) * k;
                    let orange = self.r.next() < 0.12;
                    let a = if orange { 0.75 + self.r.next() * 0.2 } else { 0.6 + big * 0.35 };
                    if self.orange != Some(orange) {
                        self.g.set_fill_style_str(if orange { "rgb(255, 150, 80)" } else { "rgb(255, 244, 228)" });
                        self.orange = Some(orange);
                    }
                    self.place(c.0 + ang.cos() * d * 1.6, c.1 + ang.sin() * d, &self.word(wi).to_owned(), px, a);
                    self.advance(CAPITALS);
                }
                _ => {
                    let _ = self.g.set_transform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
                    self.g.set_global_alpha(1.0);
                    return true;
                }
            }
        }
    }

    fn advance(&mut self, total: u32) {
        self.i += 1;
        if self.i >= total {
            self.i = 0;
            self.phase += 1;
        }
    }
}

/// The surface painter, exported for the build-time script: paint in time-boxed steps, then
/// read the finished canvas.
#[wasm_bindgen]
pub struct SurfacePainter {
    painter: Painter,
}

#[wasm_bindgen]
impl SurfacePainter {
    #[wasm_bindgen(constructor)]
    pub fn new(text: &str, font: &str, width: u32) -> Result<SurfacePainter, JsValue> {
        Ok(SurfacePainter { painter: Painter::new(width, font, text)? })
    }

    /// Paint for at most `budget_ms`. Returns true when the surface is finished.
    pub fn step(&mut self, budget_ms: f64) -> bool {
        self.painter.step(js_sys::Date::now() + budget_ms)
    }

    pub fn canvas(&self) -> HtmlCanvasElement {
        self.painter.canvas.clone()
    }
}

/* ------------------------------------------------------------------ shaders ------------------------------------------------------------------ */

const SPHERE_VS: &str = r#"#version 300 es
in vec3 aPos;
in vec2 aUv;
uniform mat3 uRot;
uniform vec2 uView; // (centre y, half height) of the visible slice
out vec2 vUv;
out vec3 vN;
void main() {
  vec3 p = uRot * aPos;
  vUv = aUv;
  vN = p;
  gl_Position = vec4(p.x, (p.y - uView.x) / uView.y, -p.z * 0.5, 1.0);
}"#;

const SPHERE_FS: &str = r#"#version 300 es
precision highp float;
uniform sampler2D uMap;
in vec2 vUv;
in vec3 vN;
out vec4 outColor;
void main() {
  vec3 n = normalize(vN);
  vec3 words = texture(uMap, vUv).rgb;
  float light = clamp(dot(n, normalize(vec3(-0.3, 0.6, 0.75))), 0.0, 1.0);
  vec3 col = vec3(0.028, 0.034, 0.048) * (0.5 + 1.2 * light) + words * (0.75 + 0.35 * light);
  float rim = pow(1.0 - max(n.z, 0.0), 2.4);
  col = mix(col, vec3(1.0, 0.62, 0.36), rim * 0.5);
  outColor = vec4(col, 1.0);
}"#;

/// Next-word picks: orange points that flash and fade, riding on the surface.
const PULSE_VS: &str = r#"#version 300 es
in vec3 aPos;
in float aSeed;
uniform mat3 uRot;
uniform vec2 uView;
uniform float uTime;
uniform float uDpr;
out float vA;
void main() {
  vec3 p = uRot * aPos;
  float t = fract(uTime * 0.18 + aSeed);
  vA = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.05, 0.35, t)) * smoothstep(0.0, 0.15, p.z);
  p *= 1.002;
  gl_Position = vec4(p.x, (p.y - uView.x) / uView.y, 0.0, 1.0);
  gl_PointSize = (5.0 + 9.0 * vA) * uDpr;
}"#;

const PULSE_FS: &str = r#"#version 300 es
precision mediump float;
in float vA;
out vec4 outColor;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float core = smoothstep(0.5, 0.0, r);
  outColor = vec4(1.0, 0.48, 0.16, vA * core);
}"#;

fn compile(gl: &GL, kind: u32, src: &str) -> Result<WebGlShader, JsValue> {
    let s = gl.create_shader(kind).ok_or("create_shader failed")?;
    gl.shader_source(&s, src);
    gl.compile_shader(&s);
    if gl.get_shader_parameter(&s, GL::COMPILE_STATUS).as_bool().unwrap_or(false) {
        Ok(s)
    } else {
        Err(gl.get_shader_info_log(&s).unwrap_or_default().into())
    }
}

fn link(gl: &GL, vs: &str, fs: &str) -> Result<WebGlProgram, JsValue> {
    let p = gl.create_program().ok_or("create_program failed")?;
    gl.attach_shader(&p, &compile(gl, GL::VERTEX_SHADER, vs)?);
    gl.attach_shader(&p, &compile(gl, GL::FRAGMENT_SHADER, fs)?);
    gl.link_program(&p);
    if gl.get_program_parameter(&p, GL::LINK_STATUS).as_bool().unwrap_or(false) {
        Ok(p)
    } else {
        Err(gl.get_program_info_log(&p).unwrap_or_default().into())
    }
}

fn buffer_f32(gl: &GL, data: &[f32]) -> Result<WebGlBuffer, JsValue> {
    let b = gl.create_buffer().ok_or("create_buffer failed")?;
    gl.bind_buffer(GL::ARRAY_BUFFER, Some(&b));
    // SAFETY: the view is consumed by buffer_data before any Rust allocation can move `data`.
    unsafe { gl.buffer_data_with_array_buffer_view(GL::ARRAY_BUFFER, &js_sys::Float32Array::view(data), GL::STATIC_DRAW) };
    Ok(b)
}

fn attrib(gl: &GL, prog: &WebGlProgram, name: &str, size: i32) {
    let loc = gl.get_attrib_location(prog, name);
    if loc >= 0 {
        gl.enable_vertex_attrib_array(loc as u32);
        gl.vertex_attrib_pointer_with_i32(loc as u32, size, GL::FLOAT, false, 0, 0);
    }
}

/* ------------------------------------------------------------------ planet ------------------------------------------------------------------ */

/// One turn every five minutes, west to east.
const SPIN: f32 = PI * 2.0 / 300.0;
/// Tilt that brings the northern mid-latitudes onto the crest.
const TILT: f32 = 16.0 * PI / 180.0;
/// Where the turn starts, so a word city sits on the crest at first paint.
const START: f32 = -0.6;

#[wasm_bindgen]
pub struct Planet {
    gl: GL,
    canvas: HtmlCanvasElement,
    sphere: WebGlProgram,
    pulse: WebGlProgram,
    sphere_vao: WebGlVertexArrayObject,
    pulse_vao: WebGlVertexArrayObject,
    texture: WebGlTexture,
    index_count: i32,
    pulse_count: i32,
    u_rot: [Option<WebGlUniformLocation>; 2],
    u_view: [Option<WebGlUniformLocation>; 2],
    u_time: Option<WebGlUniformLocation>,
    u_dpr: Option<WebGlUniformLocation>,
    angle: f32,
    last_ms: f64,
    dpr: f32,
}

#[wasm_bindgen]
impl Planet {
    /// `surface`: the decoded word-surface image (equirectangular, 2:1).
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: HtmlCanvasElement, surface: &HtmlImageElement) -> Result<Planet, JsValue> {
        let opts = js_sys::Object::new();
        js_sys::Reflect::set(&opts, &"antialias".into(), &true.into())?;
        js_sys::Reflect::set(&opts, &"alpha".into(), &true.into())?;
        js_sys::Reflect::set(&opts, &"premultipliedAlpha".into(), &true.into())?;
        js_sys::Reflect::set(&opts, &"powerPreference".into(), &"high-performance".into())?;
        // No GPU, no planet: the page keeps its still image rather than drawing on the CPU.
        js_sys::Reflect::set(&opts, &"failIfMajorPerformanceCaveat".into(), &true.into())?;
        let gl: GL = canvas.get_context_with_context_options("webgl2", &opts)?.ok_or("WebGL2 unavailable")?.dyn_into()?;

        let sphere = link(&gl, SPHERE_VS, SPHERE_FS)?;
        let pulse = link(&gl, PULSE_VS, PULSE_FS)?;

        // Sphere: the same layout as three.js's SphereGeometry (128 × 96), so the poster lines up.
        let (ws, hs) = (128u32, 96u32);
        let mut pos = Vec::with_capacity(((ws + 1) * (hs + 1) * 3) as usize);
        let mut uv = Vec::with_capacity(((ws + 1) * (hs + 1) * 2) as usize);
        for iy in 0..=hs {
            let v = iy as f32 / hs as f32;
            let theta = v * PI;
            for ix in 0..=ws {
                let u = ix as f32 / ws as f32;
                let phi = u * 2.0 * PI;
                pos.extend_from_slice(&[-phi.cos() * theta.sin(), theta.cos(), phi.sin() * theta.sin()]);
                uv.extend_from_slice(&[u, 1.0 - v]);
            }
        }
        let mut idx: Vec<u32> = Vec::new();
        for iy in 0..hs {
            for ix in 0..ws {
                let a = iy * (ws + 1) + ix + 1;
                let b = iy * (ws + 1) + ix;
                let c = (iy + 1) * (ws + 1) + ix;
                let d = (iy + 1) * (ws + 1) + ix + 1;
                if iy != 0 {
                    idx.extend_from_slice(&[a, b, d]);
                }
                if iy != hs - 1 {
                    idx.extend_from_slice(&[b, c, d]);
                }
            }
        }
        let sphere_vao = gl.create_vertex_array().ok_or("vao failed")?;
        gl.bind_vertex_array(Some(&sphere_vao));
        buffer_f32(&gl, &pos)?;
        attrib(&gl, &sphere, "aPos", 3);
        buffer_f32(&gl, &uv)?;
        attrib(&gl, &sphere, "aUv", 2);
        let ib = gl.create_buffer().ok_or("index buffer failed")?;
        gl.bind_buffer(GL::ELEMENT_ARRAY_BUFFER, Some(&ib));
        // SAFETY: as in buffer_f32.
        unsafe {
            gl.buffer_data_with_array_buffer_view(GL::ELEMENT_ARRAY_BUFFER, &js_sys::Uint32Array::view(&idx), GL::STATIC_DRAW)
        };

        // Pulses: 90 points spread over the sphere.
        let mut r = Rng(11);
        let n = 90usize;
        let mut ppos = Vec::with_capacity(n * 3);
        let mut seed = Vec::with_capacity(n);
        for _ in 0..n {
            let u = (r.next() * 2.0 - 1.0) as f32;
            let th = (r.next() * std::f64::consts::TAU) as f32;
            let s = (1.0 - u * u).sqrt();
            ppos.extend_from_slice(&[s * th.cos(), u * 0.9, s * th.sin()]);
            seed.push(r.next() as f32);
        }
        let pulse_vao = gl.create_vertex_array().ok_or("vao failed")?;
        gl.bind_vertex_array(Some(&pulse_vao));
        buffer_f32(&gl, &ppos)?;
        attrib(&gl, &pulse, "aPos", 3);
        buffer_f32(&gl, &seed)?;
        attrib(&gl, &pulse, "aSeed", 1);
        gl.bind_vertex_array(None);

        // Surface texture: uploaded once, mipmapped, anisotropic where available.
        let texture = gl.create_texture().ok_or("texture failed")?;
        gl.bind_texture(GL::TEXTURE_2D, Some(&texture));
        gl.pixel_storei(GL::UNPACK_FLIP_Y_WEBGL, 1);
        gl.tex_image_2d_with_u32_and_u32_and_html_image_element(GL::TEXTURE_2D, 0, GL::RGBA as i32, GL::RGBA, GL::UNSIGNED_BYTE, surface)?;
        gl.pixel_storei(GL::UNPACK_FLIP_Y_WEBGL, 0);
        gl.generate_mipmap(GL::TEXTURE_2D);
        gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_MIN_FILTER, GL::LINEAR_MIPMAP_LINEAR as i32);
        gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_MAG_FILTER, GL::LINEAR as i32);
        gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_WRAP_S, GL::REPEAT as i32);
        gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_WRAP_T, GL::CLAMP_TO_EDGE as i32);
        if gl.get_extension("EXT_texture_filter_anisotropic").ok().flatten().is_some() {
            const MAX_ANISOTROPY: u32 = 0x84FE;
            gl.tex_parameterf(GL::TEXTURE_2D, MAX_ANISOTROPY, 8.0);
        }

        Ok(Planet {
            u_rot: [gl.get_uniform_location(&sphere, "uRot"), gl.get_uniform_location(&pulse, "uRot")],
            u_view: [gl.get_uniform_location(&sphere, "uView"), gl.get_uniform_location(&pulse, "uView")],
            u_time: gl.get_uniform_location(&pulse, "uTime"),
            u_dpr: gl.get_uniform_location(&pulse, "uDpr"),
            index_count: idx.len() as i32,
            pulse_count: n as i32,
            angle: START,
            last_ms: -1.0,
            dpr: 1.0,
            gl,
            canvas,
            sphere,
            pulse,
            sphere_vao,
            pulse_vao,
            texture,
        })
    }

    /// Size the drawing buffer to the canvas's CSS box at this device pixel ratio.
    pub fn resize(&mut self, css_width: f64, css_height: f64, dpr: f64) {
        self.dpr = dpr as f32;
        self.canvas.set_width((css_width * dpr).round().max(1.0) as u32);
        self.canvas.set_height((css_height * dpr).round().max(1.0) as u32);
    }

    /// Advance the turn to `now_ms` (a requestAnimationFrame timestamp) and draw.
    pub fn frame(&mut self, now_ms: f64) {
        let dt = if self.last_ms < 0.0 { 0.0 } else { ((now_ms - self.last_ms) / 1000.0).min(0.1) as f32 };
        self.last_ms = now_ms;
        self.angle += SPIN * dt;

        let gl = &self.gl;
        let (w, h) = (self.canvas.width() as i32, self.canvas.height() as i32);
        gl.viewport(0, 0, w, h);
        gl.clear_color(0.0, 0.0, 0.0, 0.0);
        gl.clear_depth(1.0);
        gl.clear(GL::COLOR_BUFFER_BIT | GL::DEPTH_BUFFER_BIT);

        // The canvas covers only the top of the planet: a unit sphere spans its full width,
        // its crest touches the top edge, and the slice runs down `2·h/w` sphere-units.
        let bottom = 1.0 - 2.0 * (h as f32 / w.max(1) as f32);
        let view = [(1.0 + bottom) / 2.0, (1.0 - bottom) / 2.0];

        // Rotation: spin about Y, then tilt about X (column-major for GLSL).
        let (sy, cy) = self.angle.sin_cos();
        let (sx, cx) = TILT.sin_cos();
        let rot = [cy, sx * sy, -cx * sy, 0.0, cx, sx, sy, -sx * cy, cx * cy];

        gl.enable(GL::DEPTH_TEST);
        gl.disable(GL::BLEND);
        gl.use_program(Some(&self.sphere));
        gl.uniform_matrix3fv_with_f32_array(self.u_rot[0].as_ref(), false, &rot);
        gl.uniform2fv_with_f32_array(self.u_view[0].as_ref(), &view);
        gl.active_texture(GL::TEXTURE0);
        gl.bind_texture(GL::TEXTURE_2D, Some(&self.texture));
        gl.bind_vertex_array(Some(&self.sphere_vao));
        gl.draw_elements_with_i32(GL::TRIANGLES, self.index_count, GL::UNSIGNED_INT, 0);

        gl.disable(GL::DEPTH_TEST);
        gl.enable(GL::BLEND);
        gl.blend_func(GL::SRC_ALPHA, GL::ONE);
        gl.use_program(Some(&self.pulse));
        gl.uniform_matrix3fv_with_f32_array(self.u_rot[1].as_ref(), false, &rot);
        gl.uniform2fv_with_f32_array(self.u_view[1].as_ref(), &view);
        gl.uniform1f(self.u_time.as_ref(), (now_ms / 1000.0) as f32);
        gl.uniform1f(self.u_dpr.as_ref(), self.dpr);
        gl.bind_vertex_array(Some(&self.pulse_vao));
        gl.draw_arrays(GL::POINTS, 0, self.pulse_count);
        gl.bind_vertex_array(None);
    }
}

impl Drop for Planet {
    fn drop(&mut self) {
        let gl = &self.gl;
        gl.delete_texture(Some(&self.texture));
        gl.delete_vertex_array(Some(&self.sphere_vao));
        gl.delete_vertex_array(Some(&self.pulse_vao));
        gl.delete_program(Some(&self.sphere));
        gl.delete_program(Some(&self.pulse));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn counts_words_most_frequent_first_and_skips_keys() {
        let v = count_words(r#"{"title":"AI and AI","body":"Check the source. Don't trust AI-"}"#);
        assert_eq!(v[0], ("ai".to_string(), 3));
        assert!(v.iter().all(|(w, _)| w != "title" && w != "body"));
        assert!(v.iter().any(|(w, _)| w == "don't"));
    }

    #[test]
    fn rng_is_deterministic_and_in_range() {
        let (mut a, mut b) = (Rng(7), Rng(7));
        for _ in 0..1000 {
            let x = a.next();
            assert_eq!(x, b.next());
            assert!((0.0..1.0).contains(&x));
        }
    }
}
