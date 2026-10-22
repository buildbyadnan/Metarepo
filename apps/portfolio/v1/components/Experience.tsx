import { motion } from 'framer-motion';

function Experience() {
  // Data array based on the image
  const experiences = [
    {
      id: 1,
      period: "7-25 - Now",
      company: "NavigoRides",
      role: "Founding Engineer",
      description: "Actively building and scaling a robust, productiondeployed backend using edge computing and serverless architecture. Designing custom components like load balancers and request routers to ensure low latency, reliability, and seamless integration across the stack.",
      additionalInfo: ""
    },
    {
      id: 2,
      period: "8-21 - Now",
      company: "Electroplix",
      role: "FOUNDER & CEO",
      description: "Building Electroplix.com, A platform with robust global network-based serverless infrastructure and helping businesses tap in the digital world.",
      additionalInfo: "Keeping sustainable solutions to drive business growth which are secure, efficient and scalable."
    },
    {
      id: 3,
      period: "10-24 - 07-25",
      company: "Entrepreneurship Cell, MJCET",
      role: "TECH CAPTAIN",
      description: "Developed and refactored Web technologies"
    },
    {
      id: 4,
      period: "5-22 - 9-24",
      company: "Freelance",
      role: "FULL STACK WEB DEVELOPER",
      description: "Built 6+ Web Projects and Optimized website builds for businesses"
    },
    {
      id: 5,
      period: "8-22 - 10-24",
      company: "Hobby Master",
      role: "PYTHON DEVELOPER",
      description: "Developed a complete desktop assistant with Graphical user interface.",
      additionalInfo: "Built on Python and tkinter GUI, has more than 25+ features, Inspired From Iron man Jarvis."
    }
  ];

  return (
    <section id="experience" className="py-20 md:py-32 opacity-90 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            <span className="text-cyan-400">Experience</span>
          </h2>
        </motion.div>
        <div className="max-w-3xl mx-auto relative">
          {/* Timeline line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-800 ml-4"></div>
          {/* Experience items */}
          {experiences.map((exp, index) => (
            <motion.div 
              key={exp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="relative mb-12 pl-16"
            >
              {/* Timeline dot */}
              <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-gray-900 border-4 border-orange-500 ml-0.5"></div>
              {/* Period indicator */}
              <div className="absolute left-[-80px] top-1 text-xs text-gray-400 font-medium w-20 text-right">
                {exp.period}
              </div>
              {/* Content */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-800 p-6">
                <h3 className="text-xl font-bold text-white mb-1">{exp.company}</h3>
                <p className="text-lg text-orange-500 font-bold mb-3">{exp.role}</p>
                <p className="text-gray-300 mb-2">{exp.description}</p>
                {exp.additionalInfo && (
                  <p className="text-gray-400 text-sm">{exp.additionalInfo}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;