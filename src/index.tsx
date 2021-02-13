// import "preact/debug";
import rosetta from "rosetta";
import { h, render } from "preact";
import { ClassGrouperApp } from "./ClassGrouper";
import { RosettaContext } from "./RosettaContext";

const grouperRoot = document.getElementById("klassenteiler-app");
const appMessages = JSON.parse(
  document.getElementById("app-messages")?.textContent as string
);

const ctx = rosetta(appMessages);
ctx.locale(document.documentElement.lang);

if (grouperRoot) {
  render(
    <RosettaContext.Provider value={ctx}>
      <ClassGrouperApp />
    </RosettaContext.Provider>,
    grouperRoot
  );
}
