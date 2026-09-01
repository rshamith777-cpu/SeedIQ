import { useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";

import natureImg from "@/assets/login-nature.jpg";
import quantumImg from "@/assets/login-quantum.jpg";

export function InteractiveBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const springConfig = { damping: 25, stiffness: 120 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to -1 to 1
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
      {/* Background Images with Parallax */}
      <motion.img 
        src={natureImg} 
        alt="" 
        className="absolute -inset-10 left-0 h-[calc(100%+80px)] w-[calc(50%+40px)] object-cover opacity-[0.35] contrast-[1.2] saturate-[1.2] drop-shadow-2xl"
        style={{
          x: mouseX.get() * -20,
          y: mouseY.get() * -20,
        }}
      />
      <motion.img 
        src={quantumImg} 
        alt="" 
        className="absolute -inset-10 right-0 h-[calc(100%+80px)] w-[calc(50%+40px)] object-cover opacity-[0.35] contrast-[1.2] saturate-[1.2] drop-shadow-2xl" 
        style={{
          x: mouseX.get() * 20, // Opposite direction
          y: mouseY.get() * 20,
        }}
      />
      
      {/* Layered gradients for deep forest depth and morning sunlight */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#020B06]/90 via-[#03150b]/75 to-[#020B06]/90" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020B06]/40 via-transparent to-[#020B06]" />
      
      {/* Interactive Glowing Orbs that follow mouse */}
      <motion.div 
        className="absolute top-1/2 left-1/2 h-[60vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-emerald-500/10 to-transparent blur-[120px]"
        style={{
          x: mouseX.get() * 100,
          y: mouseY.get() * 100,
        }}
      />
      
      <motion.div 
        className="absolute top-1/2 left-1/2 h-[40vh] w-[40vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-sky-400/10 to-transparent blur-[100px]"
        style={{
          x: mouseX.get() * -150, // Floating in opposite direction
          y: mouseY.get() * -150,
        }}
      />

      {/* Static corner glows */}
      <div className="absolute top-0 left-0 w-[50vw] h-[50vh] bg-gradient-radial from-emerald-400/5 to-transparent blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[50vw] h-[50vh] bg-gradient-radial from-sky-400/5 to-transparent blur-[120px]" />
    </div>
  );
}
