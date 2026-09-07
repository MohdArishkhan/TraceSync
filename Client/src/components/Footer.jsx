import React from "react";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";

const Footer = ({ isLightMode }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: "Docs", href: "#" },
    { label: "Blog", href: "#" },
    { label: "API", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Support", href: "#" },
  ];

  return (
    <footer
      className={`border-t transition-colors duration-300 ${
        isLightMode
          ? "bg-white border-gray-200"
          : "bg-dark-bg border-dark-border"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Left: Logo + Tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <span
              className={`font-mono text-lg font-bold ${
                isLightMode ? "text-gray-900" : "text-white"
              }`}
            >
              TraceSync
            </span>
            <p
              className={`font-mono text-xs ${
                isLightMode ? "text-gray-600" : "text-gray-400"
              }`}
            >
              Code together. Talk together.
            </p>
          </div>

          {/* Center: Links */}
          <div className="flex items-center gap-6 flex-wrap justify-center">
            {footerLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className={`font-mono text-xs transition-colors ${
                  isLightMode
                    ? "text-gray-600 hover:text-accent-violet"
                    : "text-gray-400 hover:text-accent-violet"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-tech border transition-all ${
                isLightMode
                  ? "border-gray-200 text-gray-600 hover:border-accent-violet hover:text-accent-violet"
                  : "border-dark-border text-gray-400 hover:border-accent-violet hover:text-accent-violet"
              }`}
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-tech border transition-all ${
                isLightMode
                  ? "border-gray-200 text-gray-600 hover:border-accent-violet hover:text-accent-violet"
                  : "border-dark-border text-gray-400 hover:border-accent-violet hover:text-accent-violet"
              }`}
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-tech border transition-all ${
                isLightMode
                  ? "border-gray-200 text-gray-600 hover:border-accent-violet hover:text-accent-violet"
                  : "border-dark-border text-gray-400 hover:border-accent-violet hover:text-accent-violet"
              }`}
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom: Copyright + Credits */}
        <div
          className={`mt-6 pt-6 border-t text-center ${
            isLightMode ? "border-gray-100" : "border-dark-border"
          }`}
        >
          <p
            className={`font-mono text-xs ${
              isLightMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            © {currentYear} CodeDoodle. Built by{" "}
            <button
              onClick={() =>
                window.open("", "_blank", "noopener,noreferrer")
              }
              className={`font-semibold transition-colors ${
                isLightMode
                  ? "text-gray-700 hover:text-accent-violet"
                  : "text-gray-300 hover:text-accent-violet"
              }`}
            >
              MD ARISH KHAN
            </button>
            {" & "}
            <button
              onClick={() =>
                window.open("", "_blank", "noopener,noreferrer")
              }
              className={`font-semibold transition-colors ${
                isLightMode
                  ? "text-gray-700 hover:text-accent-violet"
                  : "text-gray-300 hover:text-accent-violet"
              }`}
            >
              SALMAN KHAN
            </button>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
