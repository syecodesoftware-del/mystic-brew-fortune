const MysticalBackground = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const elementCount = isMobile ? 12 : 25;

  // Random mistik emojiler
  const mysticalEmojis = ['🌙', '⭐', '✨', '🌟', '💫'];
  
  // Random pozisyonlar ve animasyon ayarları
  const elements = Array.from({ length: elementCount }).map((_, i) => ({
    emoji: mysticalEmojis[Math.floor(Math.random() * mysticalEmojis.length)],
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${8 + Math.random() * 4}s`,
    size: isMobile ? 'text-3xl' : ['text-3xl', 'text-4xl', 'text-5xl'][Math.floor(Math.random() * 3)]
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floating emojiler */}
      {elements.map((el, i) => (
        <div
          key={i}
          className={`absolute ${el.size} animate-float opacity-10`}
          style={{
            top: el.top,
            left: el.left,
            animationDelay: el.delay,
            animationDuration: el.duration
          }}
        >
          {el.emoji}
        </div>
      ))}
      
      {/* Subtle gradient circles (blur efekti) */}
      <div 
        className="absolute w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow"
        style={{ top: '40%', left: '30%' }}
      />
      <div 
        className="absolute w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse-slower"
        style={{ top: '60%', right: '30%' }}
      />
      <div 
        className="absolute w-48 h-48 bg-yellow-500/5 rounded-full blur-2xl animate-pulse-slow"
        style={{ top: '10%', right: '40%' }}
      />
    </div>
  );
};

export default MysticalBackground;
