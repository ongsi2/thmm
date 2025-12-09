export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#home" className="text-xl font-bold text-gray-900">
            THMM
          </a>
          <div className="flex gap-8">
            <a href="#home" className="text-gray-600 hover:text-gray-900 transition">
              Home
            </a>
            <a href="#projects" className="text-gray-600 hover:text-gray-900 transition">
              Projects
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="min-h-screen flex items-center justify-center px-6 pt-16"
      >
        <div className="max-w-4xl text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            안녕하세요, 개발자 신성무입니다
          </h1>
          <div className="flex gap-4 justify-center">
            <a
              href="#projects"
              className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              View Projects
            </a>
            <a
              href="#contact"
              className="px-8 py-3 border border-gray-300 rounded-lg hover:border-gray-900 transition"
            >
              Contact Me
            </a>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        className="min-h-screen flex items-center justify-center px-6 py-20 bg-gray-50"
      >
        <div className="max-w-6xl w-full">
          <h2 className="text-4xl font-bold text-center mb-16">Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Flash Coupon Project */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition">
              <div className="text-4xl mb-4">🎟️</div>
              <h3 className="text-2xl font-bold mb-3">Flash Coupon</h3>
              <p className="text-gray-600 mb-4">
                선착순 쿠폰 발급 시스템. Redis를 활용한 고성능 분산 처리 구현.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-100 text-sm rounded">
                  Node.js
                </span>
                <span className="px-3 py-1 bg-gray-100 text-sm rounded">
                  NestJS
                </span>
                <span className="px-3 py-1 bg-gray-100 text-sm rounded">
                  Redis
                </span>
                <span className="px-3 py-1 bg-gray-100 text-sm rounded">
                  MySQL
                </span>
                <span className="px-3 py-1 bg-gray-100 text-sm rounded">
                  Next.js
                </span>
              </div>
              <div className="flex gap-3">
                <a
                  href="http://thmm.kr/flash-coupon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Live Demo →
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:underline"
                >
                  GitHub →
                </a>
              </div>
            </div>

            {/* Placeholder for future projects */}
            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-dashed border-gray-200">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-3">Coming Soon</h3>
              <p className="text-gray-600">
                More exciting projects on the way...
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-dashed border-gray-200">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-2xl font-bold mb-3">Coming Soon</h3>
              <p className="text-gray-600">
                Stay tuned for new projects!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="min-h-screen flex items-center justify-center px-6 py-20"
      >
        <div className="max-w-4xl w-full text-center">
          <h2 className="text-4xl font-bold mb-8">Get In Touch</h2>
          <p className="text-xl text-gray-600 mb-12">
            Feel free to reach out for collaborations or just a friendly hello
          </p>
          <div className="flex gap-6 justify-center">
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              GitHub
            </a>
            <a
              href="mailto:your.email@example.com"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:border-gray-900 transition"
            >
              Email
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 border-t border-gray-200">
        <p>&copy; 2024 THMM. All rights reserved.</p>
      </footer>
    </main>
  );
}
