// pages/page/[id].js
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useEffect, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const OwlModel = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <Canvas>
      <Owl />
      <ambientLight intensity={1.5} />
      <spotLight position={[10, 10, 10]} angle={0.20} penumbra={1} />
      <OrbitControls />
    </Canvas>
  )
}

const Owl = () => {
  const { scene } = useGLTF('/owl.glb')

  const owlRef = useRef()
  const startPosition = [0, 0, 0]
  const endPosition = [5, 0, 0]

  useFrame(() => {
    if (owlRef.current) {
      const time = performance.now() / 1000
      const t = (Math.sin(time) + 1) / 2
      owlRef.current.position.lerp(
        new THREE.Vector3(...startPosition).lerp(new THREE.Vector3(...endPosition), t),
        0.1
      )
    }
  })

  return <primitive object={scene} ref={owlRef} />
}

export async function getStaticPaths() {
  // Fetch dynamic paths for your page
  const paths = [
    { params: { id: '1' } },
    { params: { id: '2' } },
  ]

  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const data = { id: params.id }
  return {
    props: {
      data,
    },
  }
}

export default OwlModel
