import rosetta from "rosetta";
import { createContext } from "preact";
import { useContext } from "preact/hooks";

export const RosettaContext = createContext(rosetta());

export function useRosetta() {
  const ctx = useContext(RosettaContext);
  return ctx;
}
