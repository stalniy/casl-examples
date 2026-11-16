<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow"><span class="status-dot" /> THE CASL JOURNAL</span>
        <h1>Great apps start<br />with <em>clear permissions.</em></h1>
        <p>Ideas, patterns, and practical guides for building authorization that grows with your JavaScript application.</p>
        <div class="hero-actions">
          <a class="primary-link" href="#latest">Explore the journal <span aria-hidden="true">↗</span></a>
          <a class="text-link" href="https://casl.js.org/">Meet CASL <span aria-hidden="true">→</span></a>
        </div>
        <div class="hero-note"><span aria-hidden="true">✳</span> Small rules. Powerful possibilities.</div>
      </div>
      <div class="code-scene">
        <div class="code-window">
          <div class="code-toolbar"><span class="window-dots" aria-hidden="true">● ● ●</span><span>permissions.ts</span><span>JS</span></div>
          <div class="code-caption">A LITTLE CODE. A LOT OF CONTROL.</div>
          <pre><code><span class="code-purple">const</span> { can, build } = new <span class="code-green">AbilityBuilder</span>(<br />  createMongoAbility<br />);<br /><br /><span class="code-muted">// Let your rules do the talking.</span><br />can(<span class="code-peach">'read'</span>, <span class="code-peach">'Article'</span>);<br />can(<span class="code-peach">'update'</span>, <span class="code-peach">'Article'</span>, {<br />  authorId: <span class="code-green">user.id</span><br />});<br /><br /><span class="code-purple">const</span> ability = build();</code></pre>
          <div class="code-result"><span class="status-dot" /> Your app. Your rules. <span aria-hidden="true">✓</span></div>
        </div>
        <div class="code-sticker"><span aria-hidden="true">✳</span> Permission to build better.</div>
      </div>
    </section>
    <div class="principles"><span>POWERED BY CASL.js</span><p>Expressive rules <b>·</b> Shared across your stack <b>·</b> Built for JavaScript &amp; TypeScript</p><a href="https://github.com/stalniy/casl">Explore on GitHub ↗</a></div>
    <section id="latest" class="journal-section" aria-labelledby="journal-heading">
      <div class="section-heading"><div><span class="eyebrow">THE AUTHORIZATION NOTEBOOK</span><h2 id="journal-heading">Fresh perspectives.</h2></div><p>Less guesswork. More good decisions.</p></div>
      <ArticleList />
    </section>
    <aside class="casl-banner"><span class="banner-symbol" aria-hidden="true">✳</span><div><span class="eyebrow">BUILD WITH CONFIDENCE</span><h2>Make authorization your superpower.</h2><p>Discover CASL, the isomorphic authorization library for JavaScript.</p></div><a class="primary-link" href="https://casl.js.org/">Get started with CASL ↗</a></aside>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import ArticleList from '../components/ArticleList.vue';

const store = useStore();

onMounted(() => {
  store.dispatch('setTitle', 'List of Articles');
});
</script>
