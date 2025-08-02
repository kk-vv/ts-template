export type EmptyCallback = () => void
export type ResultCallback<T> = () => T
export type InputCallback<T> = (inputs: T) => void
export type InputAndReturnCallback<T, U> = (inputs: T) => U