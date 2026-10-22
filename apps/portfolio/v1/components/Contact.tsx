import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
// import {  FaGithub } from "react-icons/fa";
import Link from "next/link";
import { FaEnvelope, FaGithub } from "react-icons/fa";

function Contact() {
  const contactRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Subject: "",
    Message: "",
  });

  // Form status
  const [status, setStatus] = useState({
    isSubmitting: false,
    isSuccess: false,
    isError: false,
    message: "",
  });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({
      isSubmitting: true,
      isSuccess: false,
      isError: false,
      message: "",
    });

    try {
      // UI-only build: no backend is wired in this repo.

      // Reset form and show success message
      setFormData({ Name: "", Email: "", Subject: "", Message: "" });
      setStatus({
        isSubmitting: false,
        isSuccess: true,
        isError: false,
        message: "Message sent successfully!",
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, isSuccess: false, message: "" }));
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        message: "Failed to send message. Please try again.",
      });
    }
  };

  return (
    <section
      id="contact"
      ref={contactRef}
      className="py-20 md:py-32 bg-gradient-to-b from-gray-900/50 to-gray-950/50"
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Get In <span className="text-cyan-400">Touch</span>
          </h2>
          <p className="text-gray-400">
            Have a project in mind or want to collaborate? Let's talk!
          </p>
        </motion.div>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-12"
          >
            <div className="lg:col-span-2">
              <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">
                  Contact Information
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="text-cyan-400 mt-1">
                      <FaEnvelope />
                      {/* envelope */}
                    </span>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <Link
                        href="mailto:contact@adnanthecoder.com"
                        className="text-white hover:text-cyan-400 transition-colors"
                      >
                        contact@AdnanTheCoder.com
                      </Link>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-cyan-400 mt-1">
                      <FaGithub />
                      {/* github icon */}
                    </span>
                    <div>
                      <p className="text-sm text-gray-400">GitHub</p>
                      <Link
                        href="https://github.com/Adnan-The-Coder"
                        className="text-white hover:text-cyan-400 transition-colors"
                      >
                        github.com/Adnan-The-Coder
                      </Link>
                    </div>
                  </li>
                </ul>
                <div className="mt-8">
                  <h4 className="text-white font-medium mb-2">Electroplix</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Interested in my startup?
                  </p>
                  <Link
                    href="https://electroplix.com"
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Electroplix
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 17l9.2-9.2M17 17V7H7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {status.isSuccess && (
                  <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
                    {status.message}
                  </div>
                )}
                {status.isError && (
                  <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                    {status.message}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="Name"
                      className="block text-sm font-medium text-gray-400 mb-2"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="Name"
                      value={formData.Name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-900/80 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="Email"
                      className="block text-sm font-medium text-gray-400 mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="Email"
                      value={formData.Email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-900/80 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                      placeholder="Your email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="Subject"
                    className="block text-sm font-medium text-gray-400 mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="Subject"
                    value={formData.Subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900/80 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                    placeholder="Subject"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="Message"
                    className="block text-sm font-medium text-gray-400 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="Message"
                    rows={5}
                    value={formData.Message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900/80 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white resize-none"
                    placeholder="Your message"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-medium px-6 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex justify-center items-center"
                  disabled={status.isSubmitting}
                >
                  {status.isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
