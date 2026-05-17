import '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    ayahBlock: {
      setAyahBlock: () => ReturnType;
    };
    hadithBlock: {
      setHadithBlock: () => ReturnType;
    };
    commentaryBlock: {
      setCommentaryBlock: () => ReturnType;
    };
  }
}

declare module 'html2pdf.js';
