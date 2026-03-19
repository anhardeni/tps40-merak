import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

interface TankVisualizationProps {
    kapasitas: number // Total capacity in liters
    jumlahIsi: number // Current fill in liters
    width?: number
    height?: number
    jenis?: string // Type of content (e.g., "MINYAK", "SOLAR", etc.)
}

export default function TankVisualization({
    kapasitas,
    jumlahIsi,
    width = 300,
    height = 400,
    jenis = "LIQUID"
}: TankVisualizationProps) {
    const mountRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

    useEffect(() => {
        if (!mountRef.current) return

        // Scene setup
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf8fafc)
        sceneRef.current = scene

        // Camera
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
        camera.position.set(0, 0, 8)
        camera.lookAt(0, 0, 0)

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(width, height)
        renderer.shadowMap.enabled = true
        rendererRef.current = renderer
        mountRef.current.appendChild(renderer.domElement)

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(5, 10, 7)
        directionalLight.castShadow = true
        scene.add(directionalLight)

        // Tank container (cylinder)
        const tankRadius = 1.5
        const tankHeight = 4
        const tankGeometry = new THREE.CylinderGeometry(tankRadius, tankRadius, tankHeight, 32)

        // Tank material (semi-transparent)
        const tankMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x4a5568,
            transparent: true,
            opacity: 0.2,
            metalness: 0.5,
            roughness: 0.3,
            side: THREE.DoubleSide
        })

        const tank = new THREE.Mesh(tankGeometry, tankMaterial)
        tank.castShadow = true
        tank.receiveShadow = true
        scene.add(tank)

        // Tank outline
        const edges = new THREE.EdgesGeometry(tankGeometry)
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x334155, linewidth: 2 })
        )
        scene.add(line)

        // Liquid fill calculation
        const fillPercentage = Math.min((jumlahIsi / kapasitas) * 100, 100)
        const fillHeight = (tankHeight * fillPercentage) / 100

        // Liquid color based on type
        const getLiquidColor = (type: string) => {
            const colors: { [key: string]: number } = {
                'MINYAK': 0xfbbf24, // Yellow/Gold for oil
                'SOLAR': 0xef4444,  // Red for diesel
                'BENSIN': 0x3b82f6, // Blue for gasoline
                'PREMIUM': 0x10b981, // Green
                'PERTAMAX': 0x8b5cf6, // Purple
                'DEFAULT': 0x06b6d4  // Cyan
            }
            return colors[type.toUpperCase()] || colors['DEFAULT']
        }

        // Liquid inside tank
        const liquidGeometry = new THREE.CylinderGeometry(
            tankRadius * 0.98,
            tankRadius * 0.98,
            fillHeight,
            32
        )

        const liquidMaterial = new THREE.MeshPhysicalMaterial({
            color: getLiquidColor(jenis),
            transparent: true,
            opacity: 0.7,
            metalness: 0.1,
            roughness: 0.4,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        })

        const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial)
        liquid.position.y = -tankHeight / 2 + fillHeight / 2
        liquid.castShadow = true
        liquid.receiveShadow = true
        scene.add(liquid)

        // Add measurement lines
        const createMeasurementLine = (yPos: number, label: string) => {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-tankRadius * 1.3, yPos, 0),
                new THREE.Vector3(-tankRadius * 1.1, yPos, 0)
            ])
            const lineMat = new THREE.LineBasicMaterial({ color: 0x64748b })
            const measureLine = new THREE.Line(lineGeometry, lineMat)
            scene.add(measureLine)
        }

        // Top and bottom measurement lines
        createMeasurementLine(tankHeight / 2, '100%')
        createMeasurementLine(-tankHeight / 2, '0%')
        createMeasurementLine(-tankHeight / 2 + fillHeight, `${fillPercentage.toFixed(1)}%`)

        // Animation
        let animationFrameId: number
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate)

            // Rotate tank slowly
            tank.rotation.y += 0.002
            line.rotation.y += 0.002
            liquid.rotation.y += 0.002

            renderer.render(scene, camera)
        }
        animate()

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId)
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement)
            }
            renderer.dispose()
        }
    }, [kapasitas, jumlahIsi, width, height, jenis])

    const fillPercentage = Math.min((jumlahIsi / kapasitas) * 100, 100)
    const isOverCapacity = jumlahIsi > kapasitas

    return (
        <div className="relative">
            {/* 3D Canvas */}
            <div
                ref={mountRef}
                className="rounded-lg shadow-lg overflow-hidden border border-slate-200"
                style={{ width, height }}
            />

            {/* Info Panel */}
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg shadow border border-slate-200">
                    <div className="text-sm text-slate-600">Kapasitas</div>
                    <div className="text-2xl font-bold text-slate-900">
                        {kapasitas.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">Liter</div>
                </div>

                <div className="bg-white p-3 rounded-lg shadow border border-slate-200">
                    <div className="text-sm text-slate-600">Jumlah Isi</div>
                    <div className={`text-2xl font-bold ${isOverCapacity ? 'text-red-600' : 'text-blue-600'}`}>
                        {jumlahIsi.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">Liter</div>
                </div>

                <div className="col-span-2 bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Fill Level</span>
                        <span className={`text-lg font-bold ${fillPercentage > 90 ? 'text-red-600' :
                                fillPercentage > 70 ? 'text-yellow-600' :
                                    'text-green-600'
                            }`}>
                            {fillPercentage.toFixed(1)}%
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${fillPercentage > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                    fillPercentage > 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                        'bg-gradient-to-r from-green-500 to-green-600'
                                }`}
                            style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                        />
                    </div>

                    {isOverCapacity && (
                        <div className="mt-2 text-xs text-red-600 font-medium">
                            ⚠️ Over Capacity!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
