import * as React from "react";
import { defaultAppState } from "../appState";
import { Canvas } from "./Canvas";

export function App() {
    const state = defaultAppState();
    return <Canvas {...state} />;
}
