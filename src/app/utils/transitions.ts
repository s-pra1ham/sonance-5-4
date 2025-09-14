// Animation variants for consistent transitions across the app
import { Variants } from 'framer-motion';

// Page transition variants
export const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: 'easeInOut',
      when: 'beforeChildren',
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

// Card transition variants
export const cardVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  hover: {
    y: -5,
    scale: 1.03,
    transition: { 
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  tap: {
    scale: 0.98,
    transition: { 
      duration: 0.1
    }
  }
};

// Popup/modal transition variants
export const popupVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 10
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1] // Custom ease curve for natural feel
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    transition: { 
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

// List item staggered animation variants
export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.2
    }
  }
};

// Fade in animation variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.25
    }
  }
};

// Slide up animation variants
export const slideUpVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: 'easeOut'
    }
  }
}; 