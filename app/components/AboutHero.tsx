import { motion } from 'framer-motion';

export default function AboutHero() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50 overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 items-center gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Redefining Connectivity for the Modern Era
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 leading-loose mb-8">
            RealSync is building a smarter way to manage traffic and hybrid connections across infrastructures, making connectivity seamless and efficient for businesses of all sizes.
          </p>
          <motion.a
            href="#about"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Our Vision
          </motion.a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <svg
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
            </defs>
            <path
              fill="url(#gradient)"
              d="M44.9,-76.8C58.1,-70.1,68.9,-57.9,77.7,-44.1C86.5,-30.3,93.3,-15.1,93.1,-0.1C92.9,14.9,85.7,29.8,76.4,42.7C67.1,55.6,55.6,66.5,42.1,74.4C28.6,82.3,14.3,87.1,-0.6,88.1C-15.5,89.1,-31,86.3,-44.6,79.1C-58.2,71.9,-69.9,60.3,-77.7,46.6C-85.5,32.8,-89.4,16.4,-89.5,0C-89.6,-16.4,-85.9,-32.8,-77.8,-46.5C-69.7,-60.2,-57.2,-71.2,-43.3,-77.6C-29.4,-84,-14.7,-85.8,0.5,-86.7C15.7,-87.6,31.7,-83.5,44.9,-76.8Z"
              transform="translate(100 100)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-3/4 h-3/4 bg-white rounded-full shadow-xl flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-1/2 h-1/2 text-blue-600"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

