const Footer = () => (
  <footer
    style={{
      flexShrink: 0,
      borderTop: "1px solid #e2e8f0",
      background: "#f8fafc",
      padding: "12px 16px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        fontSize: "12px",
        color: "#94a3b8",
        lineHeight: 1.5,
      }}
    >
      <span>Powered by</span>
      <a
        href="https://technovahub.in/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "#2563eb",
          textDecoration: "none",
          fontWeight: 500,
        }}
        onMouseEnter={(event) => {
          event.target.style.textDecoration =
            "underline";
          event.target.style.opacity =
            "0.8";
        }}
        onMouseLeave={(event) => {
          event.target.style.textDecoration =
            "none";
          event.target.style.opacity =
            "1";
        }}
      >
        TechnovaHub
      </a>
    </div>
  </footer>
);

export default Footer;
