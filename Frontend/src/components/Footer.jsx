import { Link } from "react-router-dom";

const Footer = () => {
  const socialLinks = [
    { name: "GitHub", href: "https://github.com" },
    { name: "LinkedIn", href: "https://www.linkedin.com" },
    { name: "Instagram", href: "https://www.instagram.com" },
  ];

  const linkClass = "text-sm text-gray-400 transition hover:text-purple-300";

  return (
    <footer className="border-t border-white/10 bg-[#07070d] text-gray-300">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-600 to-fuchsia-600 text-lg font-bold text-white">
                JP
              </div>

              <span className="text-2xl font-extrabold tracking-tight">
                <span className="text-white">Job</span>
                <span className="bg-linear-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Portal
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-gray-400">
              Discover opportunities, connect with companies, and take the next
              step towards your dream career.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-purple-400/40 hover:bg-purple-500/10 hover:text-purple-300"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-bold text-white">Quick Links</h3>

            <ul className="mt-5 space-y-3">
              <li>
                <Link to="/" className={linkClass}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/jobs" className={linkClass}>
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/companies" className={linkClass}>
                  Companies
                </Link>
              </li>
              <li>
                <Link to="/login" className={linkClass}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className={linkClass}>
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-base font-bold text-white">
              Popular Categories
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <Link to="/jobs" className={linkClass}>
                  Software Development
                </Link>
              </li>
              <li>
                <Link to="/jobs" className={linkClass}>
                  Data Science
                </Link>
              </li>
              <li>
                <Link to="/jobs" className={linkClass}>
                  Data Analytics
                </Link>
              </li>
              <li>
                <Link to="/jobs" className={linkClass}>
                  Cyber Security
                </Link>
              </li>
              <li>
                <Link to="/jobs" className={linkClass}>
                  UI/UX Design
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-bold text-white">Get in Touch</h3>

            <p className="mt-5 text-sm leading-7 text-gray-400">
              Have questions or suggestions? We would love to hear from you.
            </p>

            <a
              href="mailto:support@jobportal.example"
              className="mt-5 inline-flex break-all text-sm text-purple-300 transition hover:text-fuchsia-300"
            >
              ✉ support@jobportal.example
            </a>

            <p className="mt-4 text-sm leading-6 text-gray-400">
              Connecting talent with opportunity.
            </p>

            <Link
              to="/jobs"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-purple-300 transition hover:text-fuchsia-300"
            >
              Explore opportunities <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-center text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>© {new Date().getFullYear()} JobPortal. All rights reserved.</p>

          <p>Built to connect talent with opportunity.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
