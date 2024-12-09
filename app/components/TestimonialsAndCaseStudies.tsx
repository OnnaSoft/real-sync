import { Building, ShoppingCart, Factory, GraduationCap, CreditCard, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    icon: Building,
    company: "Global Freight Solutions",
    industry: "Transportation and Logistics",
    problem: "Difficulties synchronizing data between local servers at different branches and cloud-based applications, causing update delays and customer complaints.",
    solution: "Real Sync securely and efficiently connected local servers with cloud tools, implementing fallback capabilities to keep systems operational during network failures.",
    results: [
      "Reduced data update time from 15 minutes to real-time.",
      "25% increase in customer satisfaction.",
      "Lower VPN dependency, saving on configuration and maintenance costs."
    ]
  },
  {
    icon: ShoppingCart,
    company: "QuickMart Online",
    industry: "E-commerce",
    problem: "Overloaded local servers during traffic spikes, causing delays in order processing.",
    solution: "Real Sync implemented a load-balancing system and exclusive virtual domains for secure access without VPNs.",
    results: [
      "Ability to handle up to 40% more traffic without interruptions.",
      "Reduced server response time by 35%.",
      "Increased sales during promotional events."
    ]
  },
  {
    icon: Factory,
    company: "Precision Tools Inc.",
    industry: "Manufacturing",
    problem: "Need to monitor and control PLCs from a cloud-based management system without compromising security.",
    solution: "Real Sync securely connected PLCs to the cloud management system, hiding internal services and establishing secure tunnels.",
    results: [
      "20% improvement in operational efficiency.",
      "Increased security by eliminating direct device exposure.",
      "Reduced equipment downtime."
    ]
  },
  {
    icon: GraduationCap,
    company: "EduTech Systems",
    industry: "EdTech",
    problem: "Need for secure remote access to administrative tools hosted on local servers, with costly and complex VPN solutions.",
    solution: "Real Sync created exclusive virtual domains for simple and secure access to local administrative services from anywhere.",
    results: [
      "50% reduction in VPN-associated costs.",
      "Simplified access management for administrative staff.",
      "Improved productivity for remote staff."
    ]
  },
  {
    icon: CreditCard,
    company: "SwiftPay Solutions",
    industry: "Financial Services",
    problem: "VPN-based connection to a partner bank for transaction processing, causing latency issues and high maintenance costs.",
    solution: "Real Sync established secure tunnels for direct and protected connections with the bank, eliminating the need for traditional VPNs.",
    results: [
      "Reduced payment processing time by 20%.",
      "30% savings on infrastructure maintenance costs.",
      "Improved security and reliability of the payment system."
    ]
  }
];

export default function TestimonialsAndCaseStudies() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-12 bg-clip-text">
          Testimonials and Case Studies
        </h2>
        <p className="text-center text-gray-600 mb-12">
          <em>Note: The following success stories are simulated to illustrate the potential impact of Real Sync across various industries.</em>
        </p>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-wrap">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.company}
                className={`flex-1 py-6 px-4 text-center font-medium transition-all duration-300 relative ${index === activeTestimonial
                    ? 'bg-blue-600 text-white shadow-inner'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                onClick={() => setActiveTestimonial(index)}
              >
                <testimonial.icon className="h-8 w-8 mx-auto mb-2" />
                <span className="text-sm">{testimonial.company}</span>
                {index === activeTestimonial && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400"
                    layoutId="underline"
                  />
                )}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              <div className="flex items-center mb-6">
                {React.createElement(testimonials[activeTestimonial].icon, { className: "h-16 w-16 text-blue-600 mr-4 p-3 bg-blue-100 rounded-full" })}
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">{testimonials[activeTestimonial].company}</h3>
                  <p className="text-blue-600 font-medium text-lg">Industry: {testimonials[activeTestimonial].industry}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-red-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-xl mb-2 text-red-900">Problem:</h4>
                  <p className="text-red-700 leading-relaxed">{testimonials[activeTestimonial].problem}</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-xl mb-2 text-blue-900">Solution with Real Sync:</h4>
                  <p className="text-blue-800 leading-relaxed">{testimonials[activeTestimonial].solution}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-xl mb-4 text-green-900">Results:</h4>
                  <ul className="space-y-3">
                    {testimonials[activeTestimonial].results.map((result) => (
                      <li key={result} className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-green-700">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between p-4 bg-gray-100">
            <button onClick={prevTestimonial} className="p-2 rounded-full bg-white shadow hover:bg-gray-200 transition-colors">
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button onClick={nextTestimonial} className="p-2 rounded-full bg-white shadow hover:bg-gray-200 transition-colors">
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
