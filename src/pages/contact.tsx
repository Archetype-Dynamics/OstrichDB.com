/**
 * =================================================
 * Author: Marshall A Burns
 * GitHub: @SchoolyB
 *           
 * Contributors:
 *           Everyone who has contributed to OstrichDB :)
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *     Contact page for getting in touch with Archetype Dynamics
 * =================================================
 **/

import React, { useState } from 'react';
import { Mail, MessageCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact Form - ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    window.location.href = `mailto:admin@archetype-dynamics.com?subject=${subject}&body=${body}`;
  };

  return (
    <div 
      className="min-h-screen py-16"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span style={{ color: 'var(--text-primary)' }}>Get In </span>
            <span style={{ color: 'var(--logo-primary)' }}>Touch</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Have questions about OstrichDB? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Send us a message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color, #e5e7eb)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color, #e5e7eb)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              
              <div>
                <label 
                  htmlFor="message" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-vertical"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color, #e5e7eb)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: '#e08a2c',
                  color: 'white'
                }}
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Other ways to reach us
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" 
                     style={{ backgroundColor: 'rgba(224, 138, 44, 0.15)' }}>
                  <Mail size={24} style={{ color: 'var(--logo-primary)' }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Email
                  </h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Send us an email directly
                  </p>
                  <a 
                    href="mailto:admin@archetype-dynamics.com"
                    className="text-sm hover:underline"
                    style={{ color: 'var(--logo-primary)' }}
                  >
                    admin@archetype-dynamics.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" 
                     style={{ backgroundColor: 'rgba(224, 138, 44, 0.15)' }}>
                  <MessageCircle size={24} style={{ color: 'var(--logo-primary)' }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Discord
                  </h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Join our community for support and discussions
                  </p>
                  <a 
                    href="https://discord.gg/FPd7SmMMmk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                    style={{ color: 'var(--logo-primary)' }}
                  >
                    Join Discord Server
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 rounded-lg border" 
                 style={{ 
                   backgroundColor: 'var(--bg-primary)',
                   borderColor: 'var(--border-color, #e5e7eb)'
                 }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--logo-primary)' }}>Archetype</span> Dynamics
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                We typically respond to all inquiries within 24 hours during business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;