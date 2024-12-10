import { motion } from "framer-motion";

export default function OurStory() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 items-center gap-12">
        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Our Journey: From Vision to Innovation
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 leading-loose mb-4">
            RealSync was founded with a clear mission: to revolutionize how businesses manage traffic and connectivity. 
            Our journey began when we recognized the challenges of integrating hybrid infrastructures seamlessly.
          </p>
          <p className="text-lg sm:text-xl text-gray-700 leading-loose mb-4">
            We started by designing a platform that not only simplifies these processes but also empowers businesses to grow without limitations. 
            RealSync has always been about creating solutions that adapt to the evolving needs of the modern enterprise.
          </p>
          <p className="text-lg sm:text-xl text-gray-700 leading-loose">
            Today, we are committed to pushing the boundaries of innovation, ensuring our clients experience unmatched reliability, scalability, and simplicity in connectivity management.
            Our vision for the future is to continue leading the way in smart, efficient, and secure network solutions.
          </p>
        </motion.div>
        {/* Visual Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="w-full h-auto overflow-hidden rounded-lg shadow-xl bg-gradient-to-r from-blue-600 to-blue-400 p-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full text-white"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2v20M2 12h20" />
              <path d="M12 8l4 4-4 4M8 12h8" />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

