import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: { extend: {
    colors: {
      brand:{50:"#EFFCF6",100:"#D6F5E8",200:"#A8EAD0",300:"#6DD9B1",400:"#34C48E",500:"#0FA46E",600:"#0D7356",700:"#0B5E47",800:"#094A38",900:"#073D2E",950:"#032118"},
      gold:{50:"#FFFCF0",100:"#FFF6D4",200:"#FFECAA",300:"#FFDD73",400:"#FFCC3D",500:"#E6AD00",600:"#C49200",700:"#9A7200",800:"#7A5A00",900:"#5C4400"},
      surface:{light:"#FAFBFC",DEFAULT:"#F3F4F6",dark:"#0F1117","dark-raised":"#1A1D27"},
    },
    animation:{"fade-in":"fadeIn 0.3s ease-out","slide-up":"slideUp 0.3s cubic-bezier(0.16,1,0.3,1)","pulse-soft":"pulseSoft 2.5s ease-in-out infinite"},
    keyframes:{fadeIn:{from:{opacity:"0",transform:"translateY(6px)"},to:{opacity:"1",transform:"translateY(0)"}},slideUp:{from:{transform:"translateY(100%)"},to:{transform:"translateY(0)"}},pulseSoft:{"0%,100%":{opacity:"1"},"50%":{opacity:"0.5"}}},
  }},
  plugins: [],
};
export default config;
