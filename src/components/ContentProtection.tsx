import { useEffect } from 'react';

const ContentProtection = () => {
  useEffect(() => {
    // Console uyarı mesajı
    console.clear();
    console.log('%c⚠️ DUR!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log(
      '%cBu konsolu kullanarak içerik kopyalamaya çalışmak yasaktır!',
      'color: red; font-size: 20px;'
    );
    console.log(
      '%cYetkisiz erişim tespit edildi. IP adresiniz kaydedildi.',
      'color: orange; font-size: 16px;'
    );

    // Sağ tık engelleme
    const preventContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // Kopyalama engelleme
    const preventCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // Kesme engelleme
    const preventCut = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // Keyboard shortcuts engelleme
    const preventShortcuts = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Ctrl/Cmd + C (kopyala)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && !isInput) {
        e.preventDefault();
        return false;
      }

      // Ctrl/Cmd + X (kes)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x' && !isInput) {
        e.preventDefault();
        return false;
      }

      // Ctrl/Cmd + A (tümünü seç)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && !isInput) {
        e.preventDefault();
        return false;
      }

      // Ctrl/Cmd + P (yazdır)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        return false;
      }

      // Ctrl/Cmd + S (kaydet)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        return false;
      }

      // Ctrl + U (kaynak kodu görüntüle)
      if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        return false;
      }

      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I/J/C (DevTools)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        ['i', 'j', 'c'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        return false;
      }

      // Mac: Cmd+Option+I/J/C (DevTools)
      if (
        e.metaKey &&
        e.altKey &&
        ['i', 'j', 'c'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Drag engelleme
    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Seçim engelleme (mobile ve desktop)
    const preventSelection = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // Mobile touch engelleme
    const preventLongPress = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
        return false;
      }
    };

    // Seçim değişikliği engelleme (Android için)
    const clearSelection = () => {
      const active = document.activeElement as HTMLElement | null;
      if (active && (
        active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.tagName === 'SELECT' ||
        active.isContentEditable
      )) {
        return; // Form alanlarında seçim serbest
      }

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const element = container.nodeType === 1 
          ? (container as HTMLElement) 
          : (container.parentElement as HTMLElement);
        
        if (element && 
          element.tagName !== 'INPUT' && 
          element.tagName !== 'TEXTAREA' &&
          element.tagName !== 'SELECT' &&
          !element.isContentEditable
        ) {
          selection.removeAllRanges();
        }
      }
    };

    // Event listener'ları ekle
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCut);
    document.addEventListener('keydown', preventShortcuts);
    document.addEventListener('dragstart', preventDrag);
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('touchstart', preventLongPress, { passive: false });
    document.addEventListener('selectionchange', clearSelection);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCut);
      document.removeEventListener('keydown', preventShortcuts);
      document.removeEventListener('dragstart', preventDrag);
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('touchstart', preventLongPress);
      document.removeEventListener('selectionchange', clearSelection);
    };
  }, []);

  return null;
};

export default ContentProtection;
