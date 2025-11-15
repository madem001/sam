namespace JSX {
  interface Element {}
  interface ElementClass {}
  interface ElementAttributesProperty {}
  interface ElementChildrenAttribute {}
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface IntrinsicClassAttributes<T> {}
}

declare namespace React {
  export type FC<P = {}> = (props: P) => JSX.Element;
  export type CSSProperties = any;
  export function useState<T>(initial: T): [T, (value: T) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useContext<T>(context: any): T;
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initial: S): [S, (action: A) => void];
}
