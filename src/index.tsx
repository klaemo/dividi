import "preact/devtools";
import { h, render } from "preact";
import { ClassGrouperApp } from "./ClassGrouper";

const grouperRoot = document.getElementById("klassenteiler-app");

if (grouperRoot) {
  render(<ClassGrouperApp />, grouperRoot);
}
