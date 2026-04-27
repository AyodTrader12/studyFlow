import React from 'react'
import heroImage from '../assets/heroImage.png'
import {FaCheck} from 'react-icons/fa'
import { NavLink } from 'react-router-dom';
import organize from '../assets/organizeIcon.png'
import time from '../assets/timeIcon.png'
import smart from '../assets/smartIcon.png'
import progress from '../assets/progressIcon.png'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/autoplay'
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import Testimonials from '../components/Testimonials';

const faqs = [
  {
    question: "Is StudyFlow really free to use?",
    answer: "Yes, StudyFlow is completely free for all students. You can access resources, past questions, and features without paying.",
  },
  {
    question: "What subjects are available on StudyFlow?",
    answer: "We cover all major secondary school subjects including Mathematics, English, Sciences, and Commercial subjects.",
  },
  {
    question: "Can I upload my own study materials?",
    answer: "Yes, students can share helpful notes and resources with others on the platform.",
  },
  {
    question: "How do I track my study progress?",
    answer: "Your dashboard shows your activity, saved resources, and learning progress to help you stay on track.",
  },
  {
    question: "Is StudyFlow available on mobile?",
    answer: "Yes, StudyFlow works perfectly on mobile devices, tablets, and desktops.",
  },
];

const Home = () => {
  const features = [
  {
    id: "01",
    title: "Stay Organized",
    desc: "Keep all your study materials in one intuitive place. No more scattered files across internet or platforms.",
    points: [
      "Centralized resource library",
      "Smart categorization and tagging",
      "Instant access to everything you need",
    ],
    image: organize,
    reverse: false,
  },
  {
    id: "02",
    title: "Save Time",
    desc: "Spend less time searching and more time learning. Find exactly what you need in seconds, not minutes.",
    points: [
      "Advanced search and filtering",
      "Quick access to recent materials",
      "Personalized recommendations",
    ],
    image: time,
    reverse: true,
  },
  {
    id: "03",
    title: "Study Smarter",
    desc: "Eliminate distraction and focus on what truly matters. Our platform helps you concentrate on learning, not logistics.",
    points: [
      "Distraction-free study environment",
      "Focused learning paths",
      "Evidence-based study techniques",
    ],
    image: smart,
    reverse: false,
  },
  {
    id: "04",
    title: "Track Your Progress",
    desc: "See your growth in real-time. Monitor your learning journey and stay motivated with actionable insights.",
    points: [
      "Detailed progress analytics",
      "Personalized achievement milestones",
      "Motivation through visual feedback",
    ],
    image: progress,
    reverse: true,
  },
];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <section className="bg-gray-50 py-12 sm:py-5 lg:py-5">
      <div className="max-w-6xl mx-auto px-5 ">
        
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          
          {/* LEFT */}
          <div className="flex-1 text-center lg:text-left">
            
            <p className="text-blue-600 font-medium text-md tracking-wide mt-3">
              SMART STUDY PLATFORM
            </p>

            <h1 className="
              font-semibold text-[#1a2a5e] 
              text-2xl sm:text-3xl md:text-4xl lg:text-[35px]
              leading-[1.15] 
              max-w-md sm:max-w-lg md:max-w-xl lg:max-w-[650px]
              mx-auto lg:mx-0
            ">
              Find, Organize and Master Your Study Resources in One Place.
            </h1>

            <p className="
              text-gray-600 mt-3
              text-sm sm:text-base
              max-w-md mx-auto lg:mx-0
              leading-relaxed
            ">
              Discover tutorials, notes, and past questions, save what matters,
              and keep all your learning materials neatly organized for easy access.
            </p>

            <NavLink
            to="/auth" 
            className="
             inline-block mt-6
             bg-[#1a2a5e] text-white 
             px-8 py-2.5 text-sm cursor-pointer
             rounded-md hover:bg-blue-800 transition
            ">
              Get Started
            </NavLink>
          </div>

          {/* RIGHT */}
          <div className="flex-1 flex justify-center ">
            <img
              src={heroImage}
              alt="StudyFlow Preview"
              className="w-74  sm:w-82 md:w-90 lg:w-[470px]  object-contain"
            />
          </div>
        </div>
      </div>
    </section>
        <section className="bg-white py-10">
      <div className="max-w-6xl mx-auto px-5">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#1a2a5e] mb-4">
            Why Choose StudyFlow?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Experience a smarter way to organize, learn, and grow with tools built specifically for academic excellence.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-24">
          {features.map((item, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                item.reverse ? "lg:flex-row-reverse" : ""
              }`}
            >
              
              {/* TEXT */}
              <div className={`${item.reverse ? "lg:order-2" : ""}`}>
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-blue-600 font-bold text-lg">
                    {item.id}
                  </span>
                  <h3 className="text-2xl md:text-2xl font-semibold text-[#1a2a5e]">
                    {item.title}
                  </h3>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {item.desc}
                </p>

                <ul className="space-y-4">
                  {item.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      
                      {/* Circle with check icon */}
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                        <FaCheck className="text-white text-[10px]" />
                      </div>

                      <span className="text-gray-600 text-sm">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* IMAGE PLACEHOLDER */}
              <div className={`flex justify-center ${item.reverse ? "lg:justify-start" : "lg:justify-end"}`}>
                <div className="w-72 h-72 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <img
                  src={item.image}
                  alt={item.title}
                  className="w-72 md: w-80 object-contain"
                  />
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
        <section className="max-w-6xl mx-auto py-15 px-5">
      <Testimonials/>
      </section>
  

        <section className="bg-gray-50 py-15">
      <div className="max-w-6xl mx-auto px-5">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#1a2a5e] mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Everything you need to know about using StudyFlow.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-xl shadow-sm"
            >
              
              {/* Question */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-5 py-4 text-left"
              >
                <span className="text-sm md:text-base font-semibold text-[#1a2a5e]">
                  {item.question}
                </span>

                <FaChevronDown
                  className={`text-gray-400 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Answer */}
              <div
                className={`px-5 overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-40 pb-4" : "max-h-0"
                }`}
              >
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
    </div>
  )
}

export default Home

