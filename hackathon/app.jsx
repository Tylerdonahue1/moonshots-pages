/* App entrypoint */

function App() {
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
      <Faq />
      <CTA />
      <Footer />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
