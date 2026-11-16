import React from 'react';
import { Container } from '@mui/material';
import Articles from './Articles';
import { useAppTitle } from '../hooks/useAppTitle';

export default () => {
  useAppTitle('Articles');

  return (
    <Container maxWidth="lg" className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="status-dot" /> THE CASL JOURNAL</span>
          <h1>Great apps start<br />with <em>clear permissions.</em></h1>
          <p>Ideas, patterns, and practical guides for building authorization that grows with your JavaScript application.</p>
          <div className="hero-actions">
            <a className="primary-link" href="#latest">Explore the journal <span aria-hidden="true">↗</span></a>
            <a className="text-link" href="https://casl.js.org/">Meet CASL <span aria-hidden="true">→</span></a>
          </div>
          <div className="hero-note"><span aria-hidden="true">✳</span> Small rules. Powerful possibilities.</div>
        </div>
        <div className="code-scene">
          <div className="code-window">
            <div className="code-toolbar"><span className="window-dots" aria-hidden="true">● ● ●</span><span>permissions.ts</span><span>JS</span></div>
            <div className="code-caption">A LITTLE CODE. A LOT OF CONTROL.</div>
            <pre><code><span className="code-purple">const</span> {'{ can, build }'} = new <span className="code-green">AbilityBuilder</span>(<br />{'  '}createMongoAbility<br />);<br /><br /><span className="code-muted">// Let your rules do the talking.</span><br />can(<span className="code-peach">'read'</span>, <span className="code-peach">'Article'</span>);<br />can(<span className="code-peach">'update'</span>, <span className="code-peach">'Article'</span>, {'{'}<br />{'  '}authorId: <span className="code-green">user.id</span><br />{'}'});<br /><br /><span className="code-purple">const</span> ability = build();</code></pre>
            <div className="code-result"><span className="status-dot" /> Your app. Your rules. <span aria-hidden="true">✓</span></div>
          </div>
          <div className="code-sticker"><span aria-hidden="true">✳</span> Permission to build better.</div>
        </div>
      </section>
      <div className="principles"><span>POWERED BY CASL.js</span><p>Expressive rules <b>·</b> Shared across your stack <b>·</b> Built for JavaScript & TypeScript</p><a href="https://github.com/stalniy/casl">Explore on GitHub ↗</a></div>
      <section id="latest" className="journal-section" aria-labelledby="journal-heading">
        <div className="section-heading"><div><span className="eyebrow">THE AUTHORIZATION NOTEBOOK</span><h2 id="journal-heading">Fresh perspectives.</h2></div><p>Less guesswork. More good decisions.</p></div>
        <Articles />
      </section>
      <aside className="casl-banner"><span className="banner-symbol" aria-hidden="true">✳</span><div><span className="eyebrow">BUILD WITH CONFIDENCE</span><h2>Make authorization your superpower.</h2><p>Discover CASL, the isomorphic authorization library for JavaScript.</p></div><a className="primary-link" href="https://casl.js.org/">Get started with CASL ↗</a></aside>
    </Container>
  );
};
