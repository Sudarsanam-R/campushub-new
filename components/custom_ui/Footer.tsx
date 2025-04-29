import ASCIIText from "../ReactBits/ASCIIText";
import DecryptedText from "../ReactBits/DecryptedText";

export default function Footer() {
  return (
    <footer className="w-full mt-24 mb-12 flex justify-center items-center">
      <div className="w-full mx-4 rounded-2xl bg-white/90 dark:bg-zinc-900/80 shadow-lg flex flex-col md:flex-row gap-6 md:gap-0 px-8 py-12">
        {/* ASCIIText CampusHub block */}
        <div className="flex-[2.5] flex flex-col items-center md:items-start justify-center mb-4 md:mb-0 min-w-[600px] min-h-[260px]" style={{ position: 'relative', width: '100%', height: 260 }}>
          {/* ASCII effect for CampusHub */}
          {/* ASCII effect for CampusHub */}
          {/* ASCII effect for CampusHub */}
          {/* ASCII effect for CampusHub */}
          <ASCIIText
            text="CampusHub"
            asciiFontSize={3}
            textFontSize={500}
            textColor="#4f46e5"
            planeBaseHeight={8}
            enableWaves={true}
          />
        </div>
        {/* Extended project info block */}
        <div className="flex-[2] flex flex-col gap-4 justify-between">
          <div className="mb-2">
            <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-1">About CampusHub</h1>
            <div className="mt-5">
              <DecryptedText
                className="text-md text-zinc-600 dark:text-zinc-300 max-w-2xl"
                text="CampusHub is a platform designed to help students and organizers"
                animateOn="view"
                revealDirection="start"
                speed={5}
                useOriginalCharsOnly={true}
                sequential={true}
              />
            </div>
            <div className="mt-1">
              <DecryptedText
                className="text-md text-zinc-600 dark:text-zinc-300 max-w-2xl"
                text="discover, register, and participate in the best campus events, hackathons,"
                animateOn="view"
                revealDirection="start"
                speed={5}
                useOriginalCharsOnly={true}
                sequential={true}
              />
            </div>
            <div className="mt-1">
              <DecryptedText
                className="text-md text-zinc-600 dark:text-zinc-300 max-w-2xl"
                text="and workshops across India. Our mission is to empower student communities"
                animateOn="view"
                revealDirection="start"
                speed={5}
                useOriginalCharsOnly={true}
                sequential={true}
              />
            </div>
            <div className="mt-1">
              <DecryptedText
                className="text-md text-zinc-600 dark:text-zinc-300 max-w-2xl"
                text="by making event discovery seamless and accessible."
                animateOn="view"
                revealDirection="start"
                speed={5}
                useOriginalCharsOnly={true}
                sequential={true}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2">
            <span>© 2025 CampusHub. All rights reserved.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-indigo-600 transition">TERMS</a>
              <a href="#" className="hover:text-indigo-600 transition">PRIVACY</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
