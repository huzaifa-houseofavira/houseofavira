'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectInfo: '',
    categories: []
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  const categoriesList = [
    'General Inquiry',
    'Product Details',
    'Shipping Rate',
    'Shipping Process'
  ];

  const handleCheckboxChange = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.projectInfo) {
      alert("Please fill in all required fields.");
      return;
    }

    setStatus('submitting');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', projectInfo: '', categories: [] });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div id="contact-studio" className="w-full bg-white text-black font-sans border-t border-gray-200 scroll-mt-24">
      <div className="w-full h-full">
        <div className="flex flex-col lg:flex-row w-full h-full min-h-[800px] border-b border-gray-200">
          
          {/* Left: Form Side */}
          <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-16 lg:p-24 flex flex-col justify-center bg-white relative">
            
            <div className="max-w-xl mx-auto lg:mx-0 w-full">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl lg:text-6xl text-black mb-6 tracking-wide leading-[1.3]"
              >
                <span className="font-perandory font-bold block mb-3">Behind every great fit</span>
                <span className="font-perandory font-bold block">is a conversation.</span>
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-aston-script text-[#4a0000] text-2xl md:text-3xl mb-12 leading-relaxed"
              >
                Sizing, Shipping, Sourcing Or Ordering Updates - We're Here For You
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="font-dm-sans text-gray-600 mb-12 text-base md:text-lg font-medium space-y-3"
              >
                <p>
                  Email: <a href="mailto:houseofavira@gmail.com" className="text-black border-b border-black hover:border-[#4a0000] hover:text-[#4a0000] transition-colors pb-0.5">houseofavira@gmail.com</a>
                </p>
                <p>
                  WhatsApp: <a href="https://wa.me/919986742779" target="_blank" rel="noopener noreferrer" className="text-black border-b border-black hover:border-[#4a0000] hover:text-[#4a0000] transition-colors pb-0.5">+91 9986742779</a>
                </p>
                <p>
                  Instagram: <a href="https://www.instagram.com/houseof_avira/" target="_blank" rel="noopener noreferrer" className="text-black border-b border-black hover:border-[#4a0000] hover:text-[#4a0000] transition-colors pb-0.5">@houseof_avira</a>
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-12">
                
                <div className="space-y-10">
                  {/* Name Input */}
                  <div className="relative group">
                    <label className="block text-sm font-bold font-dm-sans text-gray-900 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full bg-transparent border-0 border-b-2 border-gray-200 py-3 text-black font-dm-sans placeholder:text-gray-400 focus:ring-0 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative group">
                    <label className="block text-sm font-bold font-dm-sans text-gray-900 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className="w-full bg-transparent border-0 border-b-2 border-gray-200 py-3 text-black font-dm-sans placeholder:text-gray-400 focus:ring-0 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {/* Project Info Input */}
                  <div className="relative group">
                    <label className="block text-sm font-bold font-dm-sans text-gray-900 mb-2">How can we help?</label>
                    <input
                      type="text"
                      name="projectInfo"
                      value={formData.projectInfo}
                      onChange={handleChange}
                      placeholder="Tell us a little about the project..."
                      className="w-full bg-transparent border-0 border-b-2 border-gray-200 py-3 text-black font-dm-sans placeholder:text-gray-400 focus:ring-0 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div>
                  <label className="block text-sm font-bold font-dm-sans text-gray-900 mb-6">What do you need help with?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                    {categoriesList.map((category) => (
                      <label key={category} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-colors ${formData.categories.includes(category) ? 'bg-[#4a0000] border-[#4a0000]' : 'border-gray-200 bg-white group-hover:border-gray-400'}`}>
                          {formData.categories.includes(category) && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={formData.categories.includes(category)}
                          onChange={() => handleCheckboxChange(category)}
                        />
                        <span className="text-gray-600 font-dm-sans font-medium text-sm select-none group-hover:text-black transition-colors">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Message */}
                {status === 'success' && (
                  <div className="p-4 bg-green-50 text-green-700 rounded-xl font-medium font-dm-sans text-sm border border-green-100">
                    Thanks for reaching out! We will get back to you shortly.
                  </div>
                )}
                {status === 'error' && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl font-medium font-dm-sans text-sm border border-red-100">
                    Oops! Something went wrong. Please check your console or ensure environment variables are set.
                  </div>
                )}

                {/* Submit Button - Dark Cherry Red */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-[#4a0000] text-white py-5 rounded-2xl font-bold font-dm-sans tracking-wide text-base hover:bg-[#330000] transition-colors disabled:opacity-70 flex justify-center items-center mt-8"
                >
                  {status === 'submitting' ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Get in Touch"
                  )}
                </button>

              </form>
            </div>
          </div>

          {/* Right: Image Side */}
          <div className="w-full lg:w-1/2 min-h-[400px] lg:min-h-full relative overflow-hidden bg-white flex items-center justify-center p-8">
            <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="/contact-us.png" 
                alt="House of Avira Contact" 
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
