import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type ColorBendsProps = {
    className?: string;
    style?: React.CSSProperties;
    rotation?: number;
    speed?: number;
    colors?: string[];
    transparent?: boolean;
    autoRotate?: number;
    scale?: number;
    frequency?: number;
    warpStrength?: number;
    mouseInfluence?: number;
    parallax?: number;
    noise?: number;
};

// Default colors if none provided
const DEFAULT_COLORS = ['#6366f1', '#475569', '#64748b', '#3b82f6'];

const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export default function ColorBends({
    className,
    style,
    rotation = 45,
    speed = 0.5,
    colors,
    transparent = false,
    autoRotate = 0,
    scale = 1,
    frequency = 1,
    warpStrength = 0.5,
    mouseInfluence = 0,
    parallax = 0,
    noise = 0
}: ColorBendsProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const rafRef = useRef<number | null>(null);
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const rotationRef = useRef<number>(rotation);
    const autoRotateRef = useRef<number>(autoRotate);
    const pointerTargetRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
    const pointerCurrentRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
    const pointerSmoothRef = useRef<number>(8);

    // Use provided colors or default
    const colorList = (colors && colors.length > 0) ? colors : DEFAULT_COLORS;

    useEffect(() => {
        const container = containerRef.current!;
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        camera.position.z = 1;

        const geometry = new THREE.PlaneGeometry(2, 2);

        // Convert hex to vec3 string for shader injection
        const hexToVec3String = (hex: string) => {
            const h = hex.startsWith('#') ? hex.substring(1) : hex;
            const v = h.length === 3
                ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
                : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
            return `vec3(${v[0]/255.0}, ${v[1]/255.0}, ${v[2]/255.0})`;
        };

        const colorVecs = colorList.map(hexToVec3String);
        
        // Generate Fragment Shader with injected colors
        const frag = `
            uniform vec2 uCanvas;
            uniform float uTime;
            uniform float uSpeed;
            uniform vec2 uRot;
            uniform float uScale;
            uniform float uFrequency;
            uniform float uWarpStrength;
            uniform vec2 uPointer;
            uniform float uMouseInfluence;
            uniform float uParallax;
            uniform float uNoise;
            varying vec2 vUv;

            // Injected Colors
            vec3 getPaletteColor(float t) {
                vec3 colors[${colorVecs.length}];
                ${colorVecs.map((c, i) => `colors[${i}] = ${c};`).join('\n')}
                
                float scaledT = t * ${colorVecs.length - 1}.0;
                int idx = int(floor(scaledT));
                float fractT = fract(scaledT);
                
                if (idx >= ${colorVecs.length - 1}) return colors[${colorVecs.length - 1}];
                
                // Manual mix because GLSL 1.0 arrays are tricky with non-constant index
                // But here we can just loop or use if/else since length is small
                for(int i=0; i<${colorVecs.length - 1}; i++) {
                    if (i == idx) return mix(colors[i], colors[i+1], fractT);
                }
                return colors[${colorVecs.length - 1}];
            }

            void main() {
                vec2 uv = vUv;
                float t = uTime * uSpeed * 0.2;
                
                // Fluid/Plasma distortion
                vec2 p = uv * uScale - uScale/2.0;
                float v = 0.0;
                v += sin(p.x * 10.0 + t);
                v += sin(p.y * 10.0 + t);
                v += sin((p.x + p.y) * 10.0 + t);
                v += cos(sqrt(p.x*p.x + p.y*p.y) * 10.0 + t);
                
                // Map v to 0..1 range for color lookup
                float colorT = (v + 4.0) / 8.0; 
                colorT = clamp(colorT, 0.0, 1.0);
                
                vec3 col = getPaletteColor(colorT);
                
                // Add subtle noise
                if (uNoise > 0.0) {
                    float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
                    col += (n - 0.5) * uNoise;
                }

                gl_FragColor = vec4(col, 1.0);
            }
        `;

        const material = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: frag,
            uniforms: {
                uCanvas: { value: new THREE.Vector2(1, 1) },
                uTime: { value: 0 },
                uSpeed: { value: speed },
                uRot: { value: new THREE.Vector2(1, 0) },
                uScale: { value: scale },
                uFrequency: { value: frequency },
                uWarpStrength: { value: warpStrength },
                uPointer: { value: new THREE.Vector2(0, 0) },
                uMouseInfluence: { value: mouseInfluence },
                uParallax: { value: parallax },
                uNoise: { value: noise }
            },
            transparent: transparent
        });
        materialRef.current = material;

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'high-performance',
            alpha: transparent
        });
        rendererRef.current = renderer;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        if (!transparent) renderer.setClearColor(0x000000, 1);
        
        container.appendChild(renderer.domElement);

        const clock = new THREE.Clock();

        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            renderer.setSize(w, h);
            material.uniforms.uCanvas.value.set(w, h);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Force initial size

        const loop = () => {
            const elapsed = clock.getElapsedTime();
            material.uniforms.uTime.value = elapsed;
            renderer.render(scene, camera);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', handleResize);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            if (renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [colorList.join(','), speed, transparent, scale, frequency, warpStrength, mouseInfluence, parallax, noise]);

    return <div ref={containerRef} className={`w-full h-full absolute inset-0 ${className}`} style={style} />;
}
