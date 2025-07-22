
'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface FormStepProps {
  currentStep: number;
  children: React.ReactNode;
}

export default function FormStep({ currentStep, children }: FormStepProps) {
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  // The custom prop will be passed to variants.
  // We can use it to determine the direction of the animation.
  // The key prop is essential for AnimatePresence to work correctly.
  return (
    <motion.div
      key={currentStep}
      initial="enter"
      animate="center"
      exit="exit"
      variants={variants}
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
}
