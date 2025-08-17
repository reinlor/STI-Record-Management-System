import React from 'react';

function App() {
  return (
    // Main container with a dark background and full-screen centering
    <div
      className="flex flex-col items-center justify-center min-h-screen text-center bg-[#0172B9] font-sans text-white p-4 overflow-hidden"
    >
      
      {/* Container for the main 404 message */}
      <div 
        className="relative z-10"
      >
        {/* Use a CSS variable to control the font size */}
        <style jsx>{`
          .four-oh-four {
            font-size: clamp(10rem, 25vw, 25rem);
          }
        `}</style>
        <h1 className="four-oh-four font-bold text-[#FFFC6C] drop-shadow-lg leading-none">
          404
        </h1>
      </div>

      {/* The OOOPS! PAGE NOT FOUND sub-heading */}
      <h2 
        className="mt-8 text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow"
      >
        OOOPS! PAGE NOT FOUND
      </h2>
      
      {/* The description text */}
      <p 
        className="mt-4 text-base md:text-lg lg:text-xl text-white/80 max-w-sm"
      >
        This page has gone missing. We found a note saying it's 'too emotionally drained to be a URL right now'.
      </p>

    </div>
  );
}

export default App;
