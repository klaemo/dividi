import "preact/devtools";
import "./index.css"
import { h, render } from "preact";
import { ClassGrouperApp } from "./ClassGrouper";

const grouperRoot = document.getElementById("klassenteiler-app");

if (grouperRoot) {
  render(<ClassGrouperApp />, grouperRoot);
}
