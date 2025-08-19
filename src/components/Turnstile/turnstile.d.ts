interface Turnstile {
  render: (container: HTMLElement, options: {
    sitekey: string;
    callback: (token: string) => void;
    theme?: 'light' | 'dark';
  }) => number;
  remove: (widgetId: number) => void;
}

interface Window {
  turnstile: Turnstile;
}
