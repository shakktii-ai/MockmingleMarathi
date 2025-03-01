import { Canvas } from '@react-three/fiber'
import { OrbitControls, ScreenSizer, useGLTF } from '@react-three/drei'
import { useEffect, useState } from 'react'

const OwlModel = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true) // Only render on the client side
  }, [])

  if (!isClient) {
    return null // Return nothing on the server side
  }

  // Load the GLTF model using useGLTF hook from @react-three/drei
  const { scene } = useGLTF('/owl.glb');  // Correct path to the model

  return (
    <Canvas>
      <ambientLight intensity={1.5} />
      <ScreenSizer scale={20} />
      <spotLight position={[10, 10, 10]} angle={0.20} penumbra={1} />
      {/* Render the loaded model scene */}
      <primitive object={scene} />
      <OrbitControls />
    </Canvas>   
  )
}

export default OwlModel


// import { Canvas } from '@react-three/fiber'
// import { OrbitControls, useGLTF } from '@react-three/drei'
// import { useEffect, useState, useRef } from 'react'
// import { useFrame } from '@react-three/fiber'
// import * as THREE from 'three'

// const OwlModel = () => {
//   const [isClient, setIsClient] = useState(false)

//   useEffect(() => {
//     setIsClient(true) // Only render on the client side
//   }, [])

//   if (!isClient) {
//     return null // Return nothing on the server side
//   }

//   // Load the GLTF model using useGLTF hook from @react-three/drei
//   const { scene } = useGLTF('/owl.glb') // Make sure the path is correct

//   // Ref for the owl model
//   const owlRef = useRef()

//   // Define the start and end positions for the animation
//   const startPosition = new THREE.Vector3(0, 0, 0)
//   const endPosition = new THREE.Vector3(5, 0, 0) // Change this to your desired position

//   // Animate the position over time
//   useFrame(() => {
//     if (owlRef.current) {
//       const time = performance.now() / 1000 // Get time in seconds
//       const t = (Math.sin(time) + 1) / 2 // Ease in and out effect between 0 and 1
//       // Update position based on the time
//       owlRef.current.position.lerp(
//         startPosition.lerp(endPosition, t),
//         0.1 // Controls how fast the transition is
//       )
//     }
//   })

//   return (
//     <Canvas>
//       <ambientLight intensity={1.5} />
//       <spotLight position={[10, 10, 10]} angle={0.20} penumbra={10} />
//       {/* Render the loaded model scene */}
//       <primitive object={scene} ref={owlRef} />
//       <OrbitControls />
//     </Canvas>
//   )
// }

// export default OwlModel
