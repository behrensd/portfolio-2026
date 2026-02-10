export interface ExplorePlanet {
  id: string;
  projectId: number;
  position: [number, number, number];
  radius: number;
  rotationSpeed: number;
  colors: {
    primary: string;
    secondary: string;
    atmosphere: string;
  };
  noise: {
    scale: number;
    speed: number;
    octaves: number;
    distortion: number;
  };
  title: string;
  description: string;
  tags: string[];
  url: string;
  date: string;
}

export const explorePlanets: ExplorePlanet[] = [
  {
    id: 'findusfilmt',
    projectId: 3,
    position: [0, 10, -100],
    radius: 6,
    rotationSpeed: 0.08,
    colors: {
      primary: '#1a3a5c',
      secondary: '#4a9ead',
      atmosphere: '#6bc5d2',
    },
    noise: { scale: 2.5, speed: 0.02, octaves: 5, distortion: 0.3 },
    title: 'FINDUSFILMT Portfolio',
    description: 'Digitales Portfolio für einen Creative Director und Videographen aus Hamburg.',
    tags: ['Next.js', 'Tailwind CSS', 'Three.js'],
    url: 'https://www.findusfilmt.com',
    date: '01/2026',
  },
  {
    id: 'bandoprinz',
    projectId: 1,
    position: [45, -5, -60],
    radius: 7,
    rotationSpeed: 0.06,
    colors: {
      primary: '#4a0e0e',
      secondary: '#c43a2f',
      atmosphere: '#ff4422',
    },
    noise: { scale: 3.0, speed: 0.03, octaves: 4, distortion: 0.5 },
    title: 'Der BANDOPRINZ Onlineshop',
    description: 'Shopify-Store mit 3D-Produktviewer und Google Veo Intro-Video.',
    tags: ['Shopify Liquid', 'Three.js', 'Blender'],
    url: 'https://bandoprinz.com',
    date: '12/2025',
  },
  {
    id: 'warmanziehen',
    projectId: 0,
    position: [-50, 5, -80],
    radius: 5,
    rotationSpeed: 0.1,
    colors: {
      primary: '#0a3d2a',
      secondary: '#2d8f6f',
      atmosphere: '#44ccaa',
    },
    noise: { scale: 2.0, speed: 0.015, octaves: 5, distortion: 0.4 },
    title: 'Creator Portfolio',
    description: 'Portfolio-Seite mit maßgeschneiderter 3D-Animation für ein Hamburger Creator-Kollektiv.',
    tags: ['Next.js', 'Tailwind CSS', 'GSAP', 'Blender'],
    url: 'https://warmanziehen-v2.vercel.app',
    date: '09/2025',
  },
  {
    id: 'girodipizza',
    projectId: 2,
    position: [20, -10, -140],
    radius: 5.5,
    rotationSpeed: 0.07,
    colors: {
      primary: '#6b3410',
      secondary: '#d4822a',
      atmosphere: '#ffaa44',
    },
    noise: { scale: 2.2, speed: 0.025, octaves: 4, distortion: 0.35 },
    title: 'Girooo!',
    description: 'Online Präsenz für Giro di Pizza. SEO-optimiert mit Event-Kalendar.',
    tags: ['Next.js', 'Tailwind CSS', 'Google Analytics', 'Resend'],
    url: 'https://girodipizza.de',
    date: '07/2025',
  },
];
