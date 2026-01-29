export default function Header() {
  return (
    <header className="hero">
      <h1 className="hero__title">THE FASTEST VANITY ADDRESS GENERATOR</h1>
      <p className="hero__subtitle">
        Unleash Style. Generate sleek vanity addresses with a modern twist and
        make your mark in the digital era.
      </p>
      <div className="hero__stats">
        <div className="hero__stat">
          <p className="hero__stat-value">10X</p>
          <p className="hero__stat-label">FASTER</p>
        </div>
        <div className="hero__stat">
          <p className="hero__stat-value">4+</p>
          <p className="hero__stat-label">BLOCKCHAINS</p>
        </div>
        <div className="hero__stat">
          <p className="hero__stat-value">40B</p>
          <p className="hero__stat-label">GENERATED</p>
        </div>
        <img
          className="hero__image"
          src="/images/dog.gif"
          alt="Dog animation demonstrating happiness"
          width={150}
          height={150}
        />
      </div>
    </header>
  );
}
