import './App.css';

import * as THREE from 'three';
import { useRef, useState } from 'react';
import { Canvas, ThreeElements, useThree } from '@react-three/fiber';

import { IOctreeNode, IOctreeRoot } from './data';

function Box(props: ThreeElements['mesh'] & { size: number, color: string }) {
  console.log('render');
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  // useFrame((state, delta) => (meshRef.current.rotation.x += delta))
  const { size, color } = props;
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : color} />
    </mesh>
  )
}

function RenderOctree({ nodes, size, position }: { nodes: IOctreeNode[], size: number, position: { x: number, y: number, z: number } }) {
  const cubesToRender: { x: number, y: number, z: number, size: number, color: string }[] = [];

  const queue: (IOctreeNode & { size: number, xShift: number, yShift: number, zShift: number })[] = [...nodes.map(s => ({
    ...s,
    xShift: s.x,
    yShift: s.y,
    zShift: s.z,
    size: size,
  }))];

  while (queue.length > 0) {
    const node = queue.pop();

    if (node!.children.length > 0) {
      queue.push(...node!.children.map(s => ({
        ...s,
        xShift: node!.xShift + s.x * node!.size / 2,
        yShift: node!.yShift + s.y * node!.size / 2,
        zShift: node!.zShift + s.z * node!.size / 2,
        size: node!.size / 2
      })));
    } else if (node!.point) {
      cubesToRender.push({ x: node!.xShift, y: node!.yShift, z: node!.zShift, size: node!.size, color: node!.point.color });
    }
  }

  return (
    <>
      {cubesToRender.map(s => (
        <Box key={`${s.x}${s.y}${s.z}`} position={[s.x - size + position.x, s.y - size + position.y, s.z - size + position.z]} size={s.size} color={s.color} />
      ))}
    </>
  )
}

function Hok({ data, size, position }: { data: IOctreeRoot, size: number, position: { x: number, y: number, z: number } }) {
  useThree(({ camera }) => {
    camera.rotation.set(THREE.MathUtils.degToRad(0), THREE.MathUtils.degToRad(0), THREE.MathUtils.degToRad(0));
  });

  return (
    <RenderOctree nodes={data.nodes} size={size} position={position} />
  )
}

function App() {

  const [octree, setOctree] = useState<string>('');
  const [data, setData] = useState<IOctreeRoot | undefined>(undefined);
  const [size, setSize] = useState<number>(1);
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);
  const [z, setZ] = useState<number>(0);
  return (
    <>
      <div style={{ display: 'flex', marginTop: '20px' }}>
        <div style={{ width: '20%' }}>
          <textarea style={{ width: '300px', height: '300px' }} onChange={(e) => setOctree(e.currentTarget.value)}></textarea>
          <p>size<input style={{ height: '30px' }} type='number' defaultValue={1} onChange={(e) => setSize(+e.currentTarget.value)} /></p>

          <p>x<input style={{ height: '30px' }} type='number' defaultValue={0} onChange={(e) => setX(+e.currentTarget.value)} /></p>
          <p>y<input style={{ height: '30px' }} type='number' defaultValue={0} onChange={(e) => setY(+e.currentTarget.value)} /></p>
          <p>z<input style={{ height: '30px' }} type='number' defaultValue={0} onChange={(e) => setZ(+e.currentTarget.value)} /></p>

          <button onClick={() => setData(JSON.parse(octree) as IOctreeRoot)}>Render</button>
        </div>
        <Canvas style={{ height: '1000px' }} >
          <ambientLight />
          <pointLight position={[10, 10, 10]} />


          {data && <Hok data={data} size={size} position={{ x, y, z }} />}
        </Canvas>
      </div>
    </>
  );
}

export default App;
