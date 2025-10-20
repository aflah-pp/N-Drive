import React, { useState } from 'react'
import {
  FaBook,
  FaSearch,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaGitlab,
  FaYoutube,
} from 'react-icons/fa'
import Sidebar from '../../components/SideBar'
import mainLogo from '../../assets/logo.png'
import { docsSections } from '../../components/DocData'

function DocumentationPage() {
  const [query, setQuery] = useState('')

  const filteredDocs = docsSections.filter(
    section =>
      section.title.toLowerCase().includes(query.toLowerCase()) ||
      section.content.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dbc2a6]/50 via-[#e8d8c0]/40 to-[#f8f2e7]/70 flex">
      <Sidebar />

      <main className="flex-1 ml-[260px] p-6 md:p-10 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[#414a37] flex items-center gap-2">
              <FaBook className="text-[#99744a]" /> N-Drive Documentation
            </h1>
            <p className="text-[#6b5b43] mt-1">
              Learn how to make the most out of your AI-powered cloud
              experience.
            </p>
          </div>

          {/* Search */}
          <div className="relative mt-4 md:mt-0">
            <FaSearch className="absolute left-3 top-3 text-[#99744a]" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/70 border border-[#99744a]/30 rounded-lg focus:ring-2 focus:ring-[#99744a] outline-none w-72 text-sm text-[#414a37]"
            />
          </div>
        </header>

        {/* Filtered Sections */}
        {filteredDocs.length ? (
          filteredDocs.map(({ id, title, content, icon: Icon }) => (
            <section key={id} id={id} className="mb-12">
              <h2 className="text-2xl font-semibold text-[#414a37] mb-4 flex items-center gap-2">
                <Icon className="text-[#99744a]" /> {title}
              </h2>
              <div className="bg-white/70 border border-[#99744a]/30 rounded-xl p-6 shadow leading-relaxed text-[#6b5b43]">
                <p className="whitespace-pre-line">{content}</p>
              </div>
            </section>
          ))
        ) : (
          <p className="text-center text-[#6b5b43] mt-10">
            No results found 😢
          </p>
        )}

        <footer className="mt-12 text-center text-[#6b5b43] text-sm">
          <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8 bg-[#dbc2a6]/40 border-t border-[#99744a]/30 rounded-t-2xl shadow-inner">
            <div className="md:flex md:justify-between md:items-center flex-col md:flex-row">
              {/* Logo */}
              <div className="mb-6 md:mb-0 flex items-center gap-3">
                <img
                  src={mainLogo}
                  className="h-16 md:h-20 rounded-full"
                  alt="N-Drive Logo"
                />
                <span className="self-center text-2xl md:text-3xl font-semibold text-[#414a37]">
                  N-Drive
                </span>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4 md:mt-0">
                <a
                  href="https://www.instagram.com/afl_4h/"
                  className="flex items-center gap-2 text-[#99744a] hover:text-[#414a37] transition text-lg"
                >
                  <FaInstagram className="text-2xl" />
                  <span>Instagram</span>
                </a>
                <a
                  href="https://www.youtube.com/@TengenUzui00"
                  className="flex items-center gap-2 text-[#99744a] hover:text-[#414a37] transition text-lg"
                >
                  <FaYoutube className="text-2xl" />
                  <span>YouTube</span>
                </a>
                <a
                  href="https://gitlab.com/aflah-pp"
                  className="flex items-center gap-2 text-[#99744a] hover:text-[#414a37] transition text-lg"
                >
                  <FaGitlab className="text-2xl" />
                  <span>Gitlab</span>
                </a>
                <a
                  href="https://github.com/aflah-pp/"
                  className="flex items-center gap-2 text-[#99744a] hover:text-[#414a37] transition text-lg"
                >
                  <FaGithub className="text-2xl" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/muhammed-aflahpp/"
                  className="flex items-center gap-2 text-[#99744a] hover:text-[#414a37] transition text-lg"
                >
                  <FaLinkedin className="text-2xl" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Copyright */}
            <span className="block mt-6 text-sm text-[#6b5b43]">
              © {new Date().getFullYear()} N-Drive™ — Built by Aflah
            </span>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default DocumentationPage
