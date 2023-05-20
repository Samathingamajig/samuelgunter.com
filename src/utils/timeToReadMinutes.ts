const WORDS_PER_MINUTE = 265; // https://medium.com/blogging-guide/how-is-medium-article-read-time-calculated-924420338a85
export const timeToReadMinutes = (content: string) =>
  Math.ceil(content.trim().split(/\s+/).length / WORDS_PER_MINUTE);
