import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// RawShaderMaterial 은 Three.js 가 아무것도 주입 안 함
// → position, uv 어트리뷰트를 직접 선언해야 함

const vertexShader = /* glsl */ `
  in vec3 position;
  in vec2 uv;
  out vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float     iTime;
  uniform vec2      iResolution;
  uniform vec4      iMouse;
  uniform sampler2D iChannel0;
  uniform sampler2D iChannel1;

  in  vec2 vUv;
  out vec4 fragColor;

  #define ITERATIONS 200

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

  float myAtan2(float y, float x) {
    return atan(y, x);
  }

  float noise(in vec3 x) {
    vec3 p  = floor(x);
    vec3 f  = fract(x);
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
    float torusDist = length(sdTorus(pos + vec3(0.0, -0.05, 0.0), vec2(1.0, 0.01)));
    float bloomDisc = 1.0 / (pow(torusDist, 2.0) + 0.001);
    bloomDisc *= length(pos) < 0.5 ? 0.0 : 1.0;
    color += MainColor * bloomDisc * (2.9 / float(ITERATIONS)) * (1.0 - alpha);
  }

  void GasDisc(inout vec3 color, inout float alpha, vec3 pos) {
    float discRadius    = 3.2;
    float discWidth     = 5.3;
    float discInner     = discRadius - discWidth * 0.5;
    float discThickness = 0.1;

    vec3 discNormal = vec3(0.0, 1.0, 0.0);

    float distFromCenter = length(pos);
    float distFromDisc   = dot(discNormal, pos);
    float radialGradient = 1.0 - saturate((distFromCenter - discInner) / discWidth * 0.5);
    float coverage       = pcurve(radialGradient, 4.0, 0.9);

    discThickness *= radialGradient;
    coverage      *= saturate(1.0 - abs(distFromDisc) / discThickness);

    float dustGlow  = 1.0 / (pow(1.0 - radialGradient, 2.0) * 290.0 + 0.002);
    vec3  dustColor = MainColor * dustGlow * 8.2;

    coverage = saturate(coverage * 0.7);

    float fade        = pow(abs(distFromCenter - discInner) + 0.4, 4.0) * 0.04;
    float bloomFactor = 1.0 / (pow(distFromDisc, 2.0) * 40.0 + fade + 0.00002);
    vec3  b           = MainColor * pow(bloomFactor, 1.5);

    b *= mix(vec3(1.7, 1.1, 1.0), vec3(0.5, 0.6, 1.0), vec3(pow(radialGradient, 2.0)));
    b *= mix(vec3(1.7, 0.5, 0.1), vec3(1.0),            vec3(pow(radialGradient, 0.5)));

    dustColor = mix(dustColor, b * 150.0, sat3(vec3(1.0 - coverage)));
    coverage  = saturate(coverage + bloomFactor * bloomFactor * 0.1);

    if (coverage < 0.01) { return; }

    vec3 radialCoords;
    radialCoords.x = distFromCenter * 1.5 + 0.55;
    radialCoords.y = myAtan2(-pos.x, -pos.z) * 1.5;
    radialCoords.z = distFromDisc * 1.5;
    radialCoords  *= 0.95;

    float speed = 0.06;

    float noise1 = 1.0;
    vec3 rc = radialCoords;
    rc.y += iTime * speed; noise1 *= noise(rc * 3.0)  * 0.5 + 0.5;
    rc.y -= iTime * speed; noise1 *= noise(rc * 6.0)  * 0.5 + 0.5;
    rc.y += iTime * speed; noise1 *= noise(rc * 12.0) * 0.5 + 0.5;
    rc.y -= iTime * speed; noise1 *= noise(rc * 24.0) * 0.5 + 0.5;

    float noise2 = 2.0;
    rc = radialCoords + 30.0;
    rc.y += iTime * speed; noise2 *= noise(rc * 3.0)  * 0.5 + 0.5;
    rc.y -= iTime * speed; noise2 *= noise(rc * 6.0)  * 0.5 + 0.5;
    rc.y += iTime * speed; noise2 *= noise(rc * 12.0) * 0.5 + 0.5;
    rc.y -= iTime * speed; noise2 *= noise(rc * 24.0) * 0.5 + 0.5;
    rc.y += iTime * speed; noise2 *= noise(rc * 48.0) * 0.5 + 0.5;
    rc.y -= iTime * speed; noise2 *= noise(rc * 92.0) * 0.5 + 0.5;

    dustColor *= noise1 * 0.998 + 0.002;
    coverage  *= noise2;

    radialCoords.y += iTime * speed * 0.5;
    dustColor *= pow(texture(iChannel1, radialCoords.yx * vec2(0.15, 0.27)).rgb, vec3(2.0)) * 4.0;

    coverage  = saturate(coverage * 1200.0 / float(ITERATIONS));
    dustColor = max(vec3(0.0), dustColor);
    coverage *= pcurve(radialGradient, 4.0, 0.9);

    color = (1.0 - alpha) * dustColor * coverage + color;
    alpha = (1.0 - alpha) * coverage + alpha;
  }

  vec3 rotate(vec3 p, float x, float y, float z) {
    mat3 matx = mat3(1.0,    0.0,    0.0,
                     0.0,    cos(x), sin(x),
                     0.0,   -sin(x), cos(x));
    mat3 maty = mat3(cos(y), 0.0,   -sin(y),
                     0.0,    1.0,    0.0,
                     sin(y), 0.0,    cos(y));
    mat3 matz = mat3(cos(z), sin(z), 0.0,
                    -sin(z), cos(z), 0.0,
                     0.0,    0.0,    1.0);
    return maty * (matz * (matx * p));
  }

  void RotateCamera(inout vec3 eyevec, inout vec3 eyepos) {
    float mousePosY = iMouse.y / iResolution.y;
    float mousePosX = iMouse.x / iResolution.x;
    vec3  angle     = vec3(mousePosY * 0.05 + 0.05, 1.0 + mousePosX * 1.0, -0.45);
    eyevec = rotate(eyevec, angle.x, angle.y, angle.z);
    eyepos = rotate(eyepos, angle.x, angle.y, angle.z);
  }

  void WarpSpace(inout vec3 eyevec, inout vec3 raypos) {
    float dist   = length(raypos);
    float warp   = 1.0 / (pow(dist, 2.0) + 0.000001);
    vec3  toward = normalize(-raypos);
    eyevec = normalize(eyevec + toward * warp * 5.0 / float(ITERATIONS));
  }

  void main() {
    vec2  fragCoord = vUv * iResolution;
    vec2  uv        = fragCoord / iResolution.xy;
    float aspect    = iResolution.x / iResolution.y;

    vec3 eyevec = normalize(vec3((uv * 2.0 - 1.0) * vec2(aspect, 1.0), 6.0));
    vec3 eyepos = vec3(0.0, 0.0, -10.0);

    vec2 mousepos = iMouse.xy / iResolution.xy;
    if (mousepos.x == 0.0) { mousepos.x = 0.35; }
    eyepos.x += mousepos.x * 3.0 - 1.5;

    RotateCamera(eyevec, eyepos);

    vec3  color  = vec3(0.0);
    float dither = rand(uv) * 2.0;
    float alpha  = 0.0;
    vec3  raypos = eyepos + eyevec * dither * 15.0 / float(ITERATIONS);

    for (int i = 0; i < ITERATIONS; i++) {
      WarpSpace(eyevec, raypos);
      raypos += eyevec * 15.0 / float(ITERATIONS);
      GasDisc(color, alpha, raypos);
      Haze(color, raypos, alpha);
    }

    color *= 0.0001;
    fragColor = vec4(sat3(color), 1.0);
  }
`;

export default function BlackHole() {
  const materialRef = useRef();
  const { size } = useThree();

  const [noiseTexture, rockTexture] = useTexture([
    "/textures/noise.png",
    "/textures/rock.jpg",
  ]);

  noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;
  rockTexture.wrapS = rockTexture.wrapT = THREE.RepeatWrapping;

  const uniforms = useRef({
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2(size.width, size.height) },
    iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
    iChannel0: { value: noiseTexture },
    iChannel1: { value: rockTexture },
  });

  useFrame(({ clock, size }) => {
    const u = materialRef.current?.uniforms;
    if (!u) return;
    u.iTime.value = clock.getElapsedTime();
    u.iResolution.value.set(size.width, size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <rawShaderMaterial
        ref={materialRef}
        glslVersion={THREE.GLSL3}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        depthTest={false}
      />
    </mesh>
  );
}
