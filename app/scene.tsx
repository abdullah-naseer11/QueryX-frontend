 "use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, OrbitControls, Stars } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function DataCore() {
  const group = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * .16;
    if (rings.current) rings.current.rotation.z -= delta * .08;
  });
  return <group>
    <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.25}>
      <group ref={group}>
        <mesh><icosahedronGeometry args={[1.05, 1]}/><meshPhysicalMaterial color="#101923" metalness={0.92} roughness={0.2} clearcoat={1} wireframe={false}/></mesh>
        <mesh><icosahedronGeometry args={[1.08, 1]}/><meshBasicMaterial color="#29baff" wireframe transparent opacity={0.23}/></mesh>
        {[0,1,2,3,4,5].map(i=><mesh key={i} position={[Math.cos(i*Math.PI/3)*1.12,Math.sin(i*Math.PI/3)*.8,Math.sin(i*1.7)*.4]}><sphereGeometry args={[.075,16,16]}/><meshBasicMaterial color={i%2?"#ecf8ff":"#25b9ff"}/></mesh>)}
        <mesh position={[0,0,1.12]}><circleGeometry args={[.28,48]}/><meshBasicMaterial color="#39c8ff" transparent opacity={.22}/></mesh>
      </group>
    </Float>
    <group ref={rings}>
      {[1.55,1.9,2.22].map((r,i)=><mesh key={r} rotation={[Math.PI/2 + i*.25, i*.16, 0]}><torusGeometry args={[r,.008,8,140]}/><meshBasicMaterial color={i===1?"#eaf8ff":"#22aaff"} transparent opacity={i===1?.72:.42}/></mesh>)}
    </group>
    <mesh rotation={[0,0,Math.PI/4]}><boxGeometry args={[3.9,3.9,3.9]}/><meshPhysicalMaterial color="#83dfff" metalness={.4} roughness={.1} transmission={.92} thickness={.15} transparent opacity={.12} wireframe/></mesh>
    {Array.from({length:18},(_,i)=>{const a=i*Math.PI/9; return <Line key={i} points={[[0,0,0],[Math.cos(a)*2.4,Math.sin(a)*2.4,Math.sin(a*2)*.6]]} color="#47bfff" transparent opacity={.28} lineWidth={1}/>})}
  </group>;
}
export default function Scene({mode="space"}:{mode?:"space"|"studio"}) {
  return <Canvas camera={{position:[4.3,2.4,5.2],fov:43}} dpr={[1,1.7]} gl={{antialias:true,alpha:true}}>
    <color attach="background" args={[mode==="space"?"#07111c":"#dbe5ec"]}/>
    <ambientLight intensity={mode==="space"?.65:1.3}/>
    <directionalLight position={[4,5,4]} intensity={2.3} color="#e8f7ff"/>
    <pointLight position={[-4,1,-3]} intensity={9} color="#149cff"/>
    <pointLight position={[2,-2,3]} intensity={3} color="#77e3ff"/>
    {mode==="space"&&<Stars radius={45} depth={30} count={950} factor={2.3} saturation={.2} fade speed={.4}/>}
    <DataCore/>
    <OrbitControls enablePan={false} minDistance={4.2} maxDistance={9} autoRotate autoRotateSpeed={.35} />
  </Canvas>;
}
