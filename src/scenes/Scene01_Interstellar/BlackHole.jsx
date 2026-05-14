import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════
//  모든 패스가 공유하는 버텍스 셰이더
//  RawShaderMaterial → position, uv 직접 선언 필수
// ═══════════════════════════════════════════════════════════
const VERT = /* glsl */ `
  in vec3 position;
  in vec2 uv;
  out vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// ═══════════════════════════════════════════════════════════
//  Buffer A — 블랙홀 레이마칭
//  iChannel0 = noise.png
//  iChannel1 = rock.jpg
// ═══════════════════════════════════════════════════════════
const FRAG_A = /* glsl */ `
  precision highp float;

  uniform float     iTime;
  uniform vec2      iResolution;
  uniform vec4      iMouse;
  uniform sampler2D iChannel0;
  uniform sampler2D iChannel1;
  uniform float     uBHScale;  // 블랙홀 크기 (1.0 = 기본, 2.0 = 2배 크게)

  in  vec2 vUv;
  out vec4 fragColor;

  #define ITERATIONS 50
  const vec3  MainColor = vec3(1.0);
  const float pi        = 3.14159265;

  float saturate(float x) { return clamp(x, 0.0, 1.0); }
  vec3  sat3(vec3 x)      { return clamp(x, vec3(0.0), vec3(1.0)); }

  float rand(vec2 coord) {
    return saturate(fract(sin(dot(coord, vec2(12.9898, 78.223))) * 43758.5453));
  }
  float pcurve(float x, float a, float b) {
    float k = pow(a + b, a + b) / (pow(a, a) * pow(b, b));
    return k * pow(x, a) * pow(1.0 - x, b);
  }

  float noise(in vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    vec2 uv = (p.xy + vec2(37.0, 17.0) * p.z) + f.xy;
    vec2 rg = texture(iChannel0, (uv + 0.5) / 256.0).yx;
    return -1.0 + 2.0 * mix(rg.x, rg.y, f.z);
  }

  float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
  }

  void Haze(inout vec3 color, vec3 pos, float alpha) {
    float td = length(sdTorus(pos + vec3(0.0, -0.05, 0.0), vec2(1.0, 0.01)));
    float bd = 1.0 / (td * td + 0.001);
    bd *= length(pos) < 0.5 ? 0.0 : 1.0;
    color += MainColor * bd * (2.9 / float(ITERATIONS)) * (1.0 - alpha);
  }

  void GasDisc(inout vec3 color, inout float alpha, vec3 pos) {
    float discRadius    = 3.2;
    float discWidth     = 5.3;
    float discInner     = discRadius - discWidth * 0.5;
    float discThickness = 0.1;
    vec3  discNormal    = vec3(0.0, 1.0, 0.0);

    float dC = length(pos);
    float dD = dot(discNormal, pos);
    float rG = 1.0 - saturate((dC - discInner) / discWidth * 0.5);
    float cv = pcurve(rG, 4.0, 0.9);

    discThickness *= rG;
    cv *= saturate(1.0 - abs(dD) / discThickness);

    float dg = 1.0 / (pow(1.0 - rG, 2.0) * 290.0 + 0.002);
    vec3  dc = MainColor * dg * 8.2;
    cv = saturate(cv * 0.7);

    float fade = pow(abs(dC - discInner) + 0.4, 4.0) * 0.04;
    float bf   = 1.0 / (dD * dD * 40.0 + fade + 0.00002);
    vec3  b    = MainColor * pow(bf, 1.5);
    b *= mix(vec3(1.7, 1.1, 1.0), vec3(0.5, 0.6, 1.0), vec3(pow(rG, 2.0)));
    b *= mix(vec3(1.7, 0.5, 0.1), vec3(1.0),            vec3(pow(rG, 0.5)));

    dc = mix(dc, b * 150.0, sat3(vec3(1.0 - cv)));
    cv = saturate(cv + bf * bf * 0.1);
    if (cv < 0.01) { return; }

    vec3 rc;
    rc.x = dC * 1.5 + 0.55;
    rc.y = atan(-pos.x, -pos.z) * 1.5;
    rc.z = dD * 1.5;
    rc  *= 0.95;

    float sp = 0.06;
    float n1 = 1.0;
    vec3  r  = rc;
    r.y += iTime*sp; n1 *= noise(r*3.0)  *0.5+0.5;
    r.y -= iTime*sp; n1 *= noise(r*6.0)  *0.5+0.5;
    r.y += iTime*sp; n1 *= noise(r*12.0) *0.5+0.5;
    r.y -= iTime*sp; n1 *= noise(r*24.0) *0.5+0.5;

    float n2 = 2.0;
    r = rc + 30.0;
    r.y += iTime*sp; n2 *= noise(r*3.0)  *0.5+0.5;
    r.y -= iTime*sp; n2 *= noise(r*6.0)  *0.5+0.5;
    r.y += iTime*sp; n2 *= noise(r*12.0) *0.5+0.5;
    r.y -= iTime*sp; n2 *= noise(r*24.0) *0.5+0.5;
    r.y += iTime*sp; n2 *= noise(r*48.0) *0.5+0.5;
    r.y -= iTime*sp; n2 *= noise(r*92.0) *0.5+0.5;

    dc *= n1 * 0.998 + 0.002;
    cv *= n2;

    rc.y += iTime * sp * 0.5;
    dc *= pow(texture(iChannel1, rc.yx * vec2(0.15, 0.27)).rgb, vec3(2.0)) * 4.0;

    cv = saturate(cv * 1200.0 / float(ITERATIONS));
    dc = max(vec3(0.0), dc);
    cv *= pcurve(rG, 4.0, 0.9);

    color = (1.0 - alpha) * dc * cv + color;
    alpha = (1.0 - alpha) * cv + alpha;
  }

  vec3 rotate(vec3 p, float x, float y, float z) {
    mat3 rx = mat3(1,0,0, 0,cos(x),sin(x), 0,-sin(x),cos(x));
    mat3 ry = mat3(cos(y),0,-sin(y), 0,1,0, sin(y),0,cos(y));
    mat3 rz = mat3(cos(z),sin(z),0, -sin(z),cos(z),0, 0,0,1);
    return ry*(rz*(rx*p));
  }

  void main() {
    vec2  uv     = vUv;
    float aspect = iResolution.x / iResolution.y;

    // uBHScale 클수록 FOV 넓어져 블랙홀이 크게 보임
    vec3 eyevec = normalize(vec3((uv*2.0-1.0)*vec2(aspect,1.0), 6.0 / uBHScale));
    vec3 eyepos = vec3(0.0, 0.0, -10.0);

    vec2 mp = iMouse.xy / iResolution.xy;
    if (mp.x == 0.0) mp.x = 0.35;
    eyepos.x += mp.x * 3.0 - 1.5;

    vec3 angle = vec3(mp.y*0.05+0.05, 1.0+mp.x*1.0, -0.45);
    eyevec = rotate(eyevec, angle.x, angle.y, angle.z);
    eyepos = rotate(eyepos, angle.x, angle.y, angle.z);

    vec3  color  = vec3(0.0);
    float dither = rand(uv) * 2.0;
    float alpha  = 0.0;
    vec3  raypos = eyepos + eyevec * dither * 15.0 / float(ITERATIONS);

    for (int i = 0; i < ITERATIONS; i++) {
      float dist = length(raypos);
      float warp = 1.0 / (dist*dist + 0.000001);
      eyevec = normalize(eyevec + normalize(-raypos)*warp*5.0/float(ITERATIONS));
      raypos += eyevec * 15.0 / float(ITERATIONS);
      GasDisc(color, alpha, raypos);
      Haze(color, raypos, alpha);
    }

    color *= 0.0001;
    fragColor = vec4(sat3(color), 1.0);
  }
`;

// ═══════════════════════════════════════════════════════════
//  Buffer B — Bloom mipmap tree (1st bloom pass)
//  iChannel0 = Buffer A 결과
// ═══════════════════════════════════════════════════════════
const FRAG_B = /* glsl */ `
  precision highp float;

  uniform sampler2D iChannel0;
  uniform vec2      iResolution;

  in  vec2 vUv;
  out vec4 fragColor;

  vec3 Fetch(vec2 coord) {
    return texture(iChannel0, coord).rgb;
  }

  // octave 개수별 오버샘플링 (원본 동일)
  vec3 Grab1(vec2 coord, float octave, vec2 offset) {
    float scale = exp2(octave);
    coord = (coord + offset) * scale;
    if (coord.x<0.0||coord.x>1.0||coord.y<0.0||coord.y>1.0) return vec3(0.0);
    return Fetch(coord);
  }

  vec3 GrabN(vec2 coord, float octave, vec2 offset, int N) {
    float scale = exp2(octave);
    coord = (coord + offset) * scale;
    if (coord.x<0.0||coord.x>1.0||coord.y<0.0||coord.y>1.0) return vec3(0.0);
    vec3  col = vec3(0.0);
    float w   = 0.0;
    for (int i = 0; i < N; i++) {
      for (int j = 0; j < N; j++) {
        vec2 off = vec2(float(i), float(j)) / iResolution.xy * scale / float(N);
        col += Fetch(coord + off);
        w   += 1.0;
      }
    }
    return col / w;
  }

  vec2 CalcOffset(float octave) {
    vec2 pad = vec2(10.0) / iResolution.xy;
    vec2 off = vec2(0.0);
    off.x  = -min(1.0, floor(octave/3.0)) * (0.25 + pad.x);
    off.y  = -(1.0 - (1.0/exp2(octave))) - pad.y * octave;
    off.y += min(1.0, floor(octave/3.0)) * 0.35;
    return off;
  }

  void main() {
    vec2 uv    = vUv;
    vec3 color = vec3(0.0);
    color += Grab1(uv, 1.0, vec2(0.0));
    color += GrabN(uv, 2.0, CalcOffset(1.0),  4);
    color += GrabN(uv, 3.0, CalcOffset(2.0),  8);
    color += GrabN(uv, 4.0, CalcOffset(3.0), 16);
    color += GrabN(uv, 5.0, CalcOffset(4.0), 16);
    color += GrabN(uv, 6.0, CalcOffset(5.0), 16);
    color += GrabN(uv, 7.0, CalcOffset(6.0), 16);
    color += GrabN(uv, 8.0, CalcOffset(7.0), 16);
    fragColor = vec4(color, 1.0);
  }
`;

// ═══════════════════════════════════════════════════════════
//  Buffer C — 수평 가우시안 블러
//  iChannel0 = Buffer B 결과
// ═══════════════════════════════════════════════════════════
const FRAG_C = /* glsl */ `
  precision highp float;

  uniform sampler2D iChannel0;
  uniform vec2      iResolution;

  in  vec2 vUv;
  out vec4 fragColor;

  void main() {
    vec2  uv = vUv;
    vec3  color     = vec3(0.0);
    float weightSum = 0.0;

    float weights[5];
    float offsets[5];
    weights[0] = 0.19638062; offsets[0] = 0.00000000;
    weights[1] = 0.29675293; offsets[1] = 1.41176471;
    weights[2] = 0.09442139; offsets[2] = 3.29411765;
    weights[3] = 0.01037598; offsets[3] = 5.17647059;
    weights[4] = 0.00025940; offsets[4] = 7.05882353;

    // 좌측 52% 영역만 블러 (mipmap tree 영역)
    if (uv.x < 0.52) {
      color     += texture(iChannel0, uv).rgb * weights[0];
      weightSum += weights[0];
      for (int i = 1; i < 5; i++) {
        vec2 off = vec2(offsets[i], 0.0) / iResolution.xy;
        color     += texture(iChannel0, uv + off * vec2(0.5, 0.0)).rgb * weights[i];
        color     += texture(iChannel0, uv - off * vec2(0.5, 0.0)).rgb * weights[i];
        weightSum += weights[i] * 2.0;
      }
      color /= weightSum;
    }
    fragColor = vec4(color, 1.0);
  }
`;

// ═══════════════════════════════════════════════════════════
//  Buffer D — 수직 가우시안 블러
//  iChannel0 = Buffer C 결과
// ═══════════════════════════════════════════════════════════
const FRAG_D = /* glsl */ `
  precision highp float;

  uniform sampler2D iChannel0;
  uniform vec2      iResolution;

  in  vec2 vUv;
  out vec4 fragColor;

  void main() {
    vec2  uv = vUv;
    vec3  color     = vec3(0.0);
    float weightSum = 0.0;

    float weights[5];
    float offsets[5];
    weights[0] = 0.19638062; offsets[0] = 0.00000000;
    weights[1] = 0.29675293; offsets[1] = 1.41176471;
    weights[2] = 0.09442139; offsets[2] = 3.29411765;
    weights[3] = 0.01037598; offsets[3] = 5.17647059;
    weights[4] = 0.00025940; offsets[4] = 7.05882353;

    if (uv.x < 0.52) {
      color     += texture(iChannel0, uv).rgb * weights[0];
      weightSum += weights[0];
      for (int i = 1; i < 5; i++) {
        vec2 off = vec2(0.0, offsets[i]) / iResolution.xy;
        color     += texture(iChannel0, uv + off * vec2(0.0, 0.5)).rgb * weights[i];
        color     += texture(iChannel0, uv - off * vec2(0.0, 0.5)).rgb * weights[i];
        weightSum += weights[i] * 2.0;
      }
      color /= weightSum;
    }
    fragColor = vec4(color, 1.0);
  }
`;

// ═══════════════════════════════════════════════════════════
//  Image 패스 — 최종 합성 + 톤매핑 (Stage 5)
//  iChannel0 = Buffer A (레이마칭 원본)
//  iChannel1 = Buffer D (bloom 결과)
// ═══════════════════════════════════════════════════════════
const FRAG_FINAL = /* glsl */ `
  precision highp float;

  uniform sampler2D iChannel0;      // Buffer A
  uniform sampler2D iChannel1;      // Buffer D (bloom)
  uniform vec2      iResolution;
  uniform float     uBloomStrength; // bloom 세기 (기본 0.08)

  in  vec2 vUv;
  out vec4 fragColor;

  vec3 saturate3(vec3 x) { return clamp(x, vec3(0.0), vec3(1.0)); }

  // Buffer D 에서 mipmap tree의 각 옥타브를 읽어 bloom 합산
  vec2 CalcOffset(float octave) {
    vec2 pad = vec2(10.0) / iResolution.xy;
    vec2 off = vec2(0.0);
    off.x  = -min(1.0, floor(octave/3.0)) * (0.25 + pad.x);
    off.y  = -(1.0 - (1.0/exp2(octave))) - pad.y * octave;
    off.y += min(1.0, floor(octave/3.0)) * 0.35;
    return off;
  }

  vec3 GrabBloom(vec2 coord, float octave, vec2 offset) {
    float scale = exp2(octave);
    // ⚠️ 핵심: Buffer B의 역변환 (순방향 쓰면 밉맵 트리가 그대로 보임)
    // Buffer B 쓰기: fboB[uv] = fboA[(uv + offset) * scale]
    // Image 읽기:   bloom[uv] += fboD[uv / scale - offset]  ← 역변환
    vec2 tc = coord / scale - offset;
    if (tc.x<0.0||tc.x>1.0||tc.y<0.0||tc.y>1.0) return vec3(0.0);
    return texture(iChannel1, tc).rgb;
  }

  vec3 GetBloom(vec2 coord) {
    vec3 bloom = vec3(0.0);
    bloom += GrabBloom(coord, 1.0, vec2(0.0));
    bloom += GrabBloom(coord, 2.0, CalcOffset(1.0)) * 1.5;
    bloom += GrabBloom(coord, 3.0, CalcOffset(2.0)) * 1.5;
    bloom += GrabBloom(coord, 4.0, CalcOffset(3.0)) * 1.5;
    bloom += GrabBloom(coord, 5.0, CalcOffset(4.0)) * 1.8;
    bloom += GrabBloom(coord, 6.0, CalcOffset(5.0)) * 1.0;
    bloom += GrabBloom(coord, 7.0, CalcOffset(6.0)) * 1.0;
    bloom += GrabBloom(coord, 8.0, CalcOffset(7.0)) * 1.0;
    return bloom;
  }

  void main() {
    vec2 uv    = vUv;
    vec3 color = texture(iChannel0, uv).rgb;   // Buffer A 원본

    color += GetBloom(uv) * uBloomStrength;    // Bloom 합산
    color *= 200.0;                            // 전체 밝기 부스트

    // Tonemapping & color grading (원본 Image 패스 동일)
    color = pow(color, vec3(1.5));
    color = color / (1.0 + color);
    color = pow(color, vec3(1.0 / 1.5));
    color = mix(color, color*color*(3.0-2.0*color), vec3(1.0));
    color = pow(color, vec3(1.3, 1.20, 1.0));
    color = saturate3(color * 1.01);
    color = pow(color, vec3(0.7 / 2.2));

    fragColor = vec4(color, 1.0);
  }
`;

// ═══════════════════════════════════════════════════════════
//  유틸: FBO 생성
// ═══════════════════════════════════════════════════════════
function makeFBO(w, h) {
  return new THREE.WebGLRenderTarget(w, h, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType, // HDR 값 클램핑 방지
  });
}

// ═══════════════════════════════════════════════════════════
//  유틸: 오프스크린 씬 생성
// ═══════════════════════════════════════════════════════════
function makePass(fragShader, uniforms) {
  const mat = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: VERT,
    fragmentShader: fragShader,
    uniforms,
    depthTest: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  const scene = new THREE.Scene();
  scene.add(mesh);
  return { scene, mat };
}

// ═══════════════════════════════════════════════════════════
//  BlackHole 컴포넌트
// ═══════════════════════════════════════════════════════════
export default function BlackHole() {
  const { gl, size } = useThree();

  const [noiseTexture, rockTexture] = useTexture([
    "/textures/noise.png",
    "/textures/rock.jpg",
  ]);
  noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;
  rockTexture.wrapS = rockTexture.wrapT = THREE.RepeatWrapping;

  // 씬, FBO, 머티리얼을 한 번만 생성
  const pipeline = useMemo(() => {
    const w = size.width;
    const h = size.height;

    // ── FBO ────────────────────────────────────
    const fboA = makeFBO(w, h);
    const fboB = makeFBO(w, h);
    const fboC = makeFBO(w, h);
    const fboD = makeFBO(w, h);

    // ── 각 패스 ────────────────────────────────
    const A = makePass(FRAG_A, {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(w, h) },
      iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
      iChannel0: { value: noiseTexture },
      iChannel1: { value: rockTexture },
      uBHScale: { value: 1.0 }, // ← 여기서 조절 (0.5 = 절반, 2.0 = 2배)
    });

    const B = makePass(FRAG_B, {
      iChannel0: { value: null },
      iResolution: { value: new THREE.Vector2(w, h) },
    });

    const C = makePass(FRAG_C, {
      iChannel0: { value: null },
      iResolution: { value: new THREE.Vector2(w, h) },
    });

    const D = makePass(FRAG_D, {
      iChannel0: { value: null },
      iResolution: { value: new THREE.Vector2(w, h) },
    });

    // ── 최종 합성 머티리얼 ─────────────────────
    const finalMat = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: VERT,
      fragmentShader: FRAG_FINAL,
      uniforms: {
        iChannel0: { value: null },
        iChannel1: { value: null },
        iResolution: { value: new THREE.Vector2(w, h) },
        uBloomStrength: { value: 0.08 }, // ← 여기서 조절 (원본: 0.08)
      },
      depthTest: false,
    });

    // 오소 카메라 (풀스크린 쿼드용)
    const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    return { fboA, fboB, fboC, fboD, A, B, C, D, finalMat, ortho };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noiseTexture, rockTexture]);

  useFrame(({ clock }) => {
    const { fboA, fboB, fboC, fboD, A, B, C, D, finalMat, ortho } = pipeline;
    const t = clock.getElapsedTime();
    const w = size.width;
    const h = size.height;

    // ── Buffer A: 레이마칭 → fboA ──────────────
    A.mat.uniforms.iTime.value = t;
    A.mat.uniforms.iResolution.value.set(w, h);
    gl.setRenderTarget(fboA);
    gl.render(A.scene, ortho);

    // ── Buffer B: Bloom mipmap → fboB ──────────
    B.mat.uniforms.iChannel0.value = fboA.texture;
    B.mat.uniforms.iResolution.value.set(w, h);
    gl.setRenderTarget(fboB);
    gl.render(B.scene, ortho);

    // ── Buffer C: 수평 블러 → fboC ─────────────
    C.mat.uniforms.iChannel0.value = fboB.texture;
    C.mat.uniforms.iResolution.value.set(w, h);
    gl.setRenderTarget(fboC);
    gl.render(C.scene, ortho);

    // ── Buffer D: 수직 블러 → fboD ─────────────
    D.mat.uniforms.iChannel0.value = fboC.texture;
    D.mat.uniforms.iResolution.value.set(w, h);
    gl.setRenderTarget(fboD);
    gl.render(D.scene, ortho);

    // ── 최종: 화면에 합성 출력 ─────────────────
    finalMat.uniforms.iChannel0.value = fboA.texture;
    finalMat.uniforms.iChannel1.value = fboD.texture;
    finalMat.uniforms.iResolution.value.set(w, h);
    gl.setRenderTarget(null);
    // R3F 가 아래 <mesh>를 normal render loop 으로 그림
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <primitive object={pipeline.finalMat} attach="material" />
    </mesh>
  );
}
