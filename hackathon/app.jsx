/* App entrypoint */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "showFaq": true
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  return (
    <>
      <Nav />
      <Hero />
      <Moonshot />
      <Categories />
      <GoogleStack />
      <Demo />
      <AboutXPRIZE />
      <Prize />
      {tweaks.showFaq && <Faq />}
      <CTA />
      <Footer />

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Sections" />
        <window.TweakToggle
          label="Show FAQ"
          value={tweaks.showFaq}
          onChange={v => setTweak("showFaq", v)}
        />
      </window.TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
