import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Bot, Cpu, Database, Network, ShieldCheck, Zap } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const TechBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.domElement);

        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 5000; i++) {
            vertices.push(THREE.MathUtils.randFloatSpread(2000)); // x
            vertices.push(THREE.MathUtils.randFloatSpread(2000)); // y
            vertices.push(THREE.MathUtils.randFloatSpread(2000)); // z
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        // Desert Titanium Color for Particles
        const material = new THREE.PointsMaterial({ color: 0xC7B496, size: 2, transparent: true, opacity: 0.5 });
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        camera.position.z = 1000;

        const animate = () => {
            requestAnimationFrame(animate);
            points.rotation.x += 0.0005;
            points.rotation.y += 0.0005;
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            containerRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 -z-10 bg-black" />;
};

export default function Welcome({ auth }: PageProps) {
    return (
        <div className="relative min-h-screen overflow-hidden font-sans text-white selection:bg-[#C7B496] selection:text-black">
            <Head title="TPS Online - Desert Titanium Edition" />

            <TechBackground />

            {/* Glowing Orbs for Depth - Desert Titanium Nuance */}
            <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[#C7B496]/10 blur-[128px]" />
            <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-[#A2A2A2]/10 blur-[128px]" />

            <div className="relative flex min-h-screen flex-col">
                {/* Header */}
                <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8">
                    <div className="flex items-center gap-3">
                        <div className="flex animate-pulse items-center justify-center rounded-xl bg-[#C7B496] p-2 shadow-[0_0_20px_rgba(199,180,150,0.4)]">
                            <Network size={32} className="text-black" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase italic">
                            TPS<span className="text-[#C7B496]">Online</span>
                        </span>
                    </div>

                    <nav className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="group relative overflow-hidden rounded-full border border-[#C7B496]/30 bg-white/5 px-6 py-2 font-medium transition-all hover:bg-[#C7B496] hover:text-black"
                            >
                                <span className="relative z-10 font-bold tracking-wider">DASHBOARD</span>
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-[#C7B496] px-8 py-3 text-black transition-all hover:bg-[#E3D1B5] hover:shadow-[0_0_25px_rgba(199,180,150,0.6)]"
                            >
                                <Zap size={18} className="animate-bounce" />
                                <span className="font-black tracking-widest uppercase">Access Core</span>
                            </Link>
                        )}
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="flex flex-1 items-center px-6">
                    <div className="mx-auto w-full max-w-7xl">
                        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#C7B496]/20 bg-[#C7B496]/5 px-4 py-1 text-sm font-medium backdrop-blur-md">
                                    <ShieldCheck size={16} className="text-[#C7B496]" />
                                    <span className="text-[#C7B496]/80 uppercase tracking-widest text-[10px] font-bold">Secure Protocol Active</span>
                                </div>

                                <h1 className="text-6xl font-black leading-tight tracking-tighter lg:text-8xl">
                                    TPS ONLINE <br />
                                    <span className="bg-gradient-to-r from-[#C7B496] via-[#E3D1B5] to-[#A2A2A2] bg-clip-text text-transparent">
                                        sorakv2-merak
                                    </span> <br />
                                    beacukai.go.id
                                </h1>

                                <p className="max-w-xl text-lg leading-relaxed text-white/40">
                                    Ultimate TPS Online 4.0 inspired by iPhone 17 Pro craftsmanship. Experience fluid analytics and robust customs integration in titanium elegance.
                                </p>

                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-xl">
                                        <div className="rounded-lg bg-[#C7B496]/20 p-2 text-[#C7B496]">
                                            <Cpu size={24} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#C7B496]/60">Engine</div>
                                            <div className="text-sm font-bold text-white/90">A19 Pro Neural Core</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-xl">
                                        <div className="rounded-lg bg-[#A2A2A2]/20 p-2 text-[#A2A2A2]">
                                            <Database size={24} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#A2A2A2]/60">Storage</div>
                                            <div className="text-sm font-bold text-white/90">Natural Titanium Vault</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                {/* Abstract Visual Representation */}
                                <div className="relative mx-auto aspect-square max-w-md">
                                    <div className="absolute inset-0 animate-[spin_20s_linear_infinite] rounded-full border border-dashed border-[#C7B496]/20" />
                                    <div className="absolute inset-8 animate-[spin_15s_linear_infinite_reverse] rounded-full border border-dashed border-[#A2A2A2]/20" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative group">
                                            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#C7B496] to-[#A2A2A2] blur opacity-50 transition duration-1000 group-hover:opacity-100"></div>
                                            <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-[#121212] border border-[#2C2C2C]">
                                                <Bot size={80} className="text-[#C7B496]" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Data Nodes */}
                                    <div className="absolute left-0 top-1/4 h-3 w-3 animate-ping rounded-full bg-[#C7B496] shadow-[0_0_15px_#C7B496]" />
                                    <div className="absolute right-10 bottom-1/4 h-2 w-2 animate-ping rounded-full bg-[#A2A2A2] delay-300 shadow-[0_0_15px_#A2A2A2]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer Section (Minimal) */}
                <footer className="mx-auto w-full max-w-7xl px-6 py-12">
                    <div className="flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 md:flex-row">
                        <div className="flex gap-8 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">
                            <span className="hover:text-[#C7B496] cursor-pointer transition-colors">Titanium Core</span>
                            <span className="hover:text-[#C7B496] cursor-pointer transition-colors">Neural Sync</span>
                            <span className="hover:text-[#C7B496] cursor-pointer transition-colors">Vector Hub</span>
                        </div>
                        <div className="text-[10px] font-mono text-white/10 uppercase tracking-widest">
                            SYS_VER :: 17.1.PRO
                        </div>
                    </div>
                </footer>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .tracking-tighter { letter-spacing: -0.05em; }
                .tracking-widest { letter-spacing: 0.15em; }
            `}</style>
        </div>
    );
}
