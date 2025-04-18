export interface IApps {
  appId: string;
  icon: string;
  iconColor?: string; // Optional: set a color like '#FF5722' or use theme colors
  name: string;
  x: number;
  y: number;
  status?: string;
}

export interface IAppFrame {
  frame: HTMLElement;
  appId: string;
}
