import { h } from "preact";
import { useRef, useState } from "preact/hooks";
import type { FennelResult } from "./fennel";
import { PARTITION_COLORS } from "./util";

function getPartitionIndex(result: FennelResult, id: number) {
  return result.partions.findIndex((partition) => partition.includes(id));
}

const inputClasses =
  "number-input-no-arrows w-12 mr-2 border rounded border-gray-300 py-1 text-center focus:ring-indigo-300 focus:border-indigo-300 shadow-none";

export function StudentRow({
  id,
  contacts,
  onChange,
  result,
  maxStudents,
}: {
  id: number;
  contacts: number[];
  onChange: (contacts: number[]) => void;
  result: FennelResult | null;
  maxStudents: number;
}) {
  const color =
    result !== null ? PARTITION_COLORS[getPartitionIndex(result, id)] : "";
  const [additionalInputs, setAdditionalInputs] = useState(0);
  const numberOfInputs = Math.max(0, 5 - contacts.length + additionalInputs);
  const inputs = [...contacts, ...new Array(numberOfInputs)];
  const lastInputRef = useRef<HTMLInputElement>();

  return (
    <tr class="focus-within:bg-indigo-50 transition-colors">
      <td
        class={`px-6 py-2 whitespace-nowrap ${color}`}
        aria-label="Schüler ID"
      >
        {id}
      </td>
      <td class="px-6 pt-2 flex items-center flex-wrap">
        {inputs.map((contact, index) => (
          <input
            ref={index === inputs.length - 1 ? lastInputRef : undefined}
            class={`${inputClasses} mb-2 ${
              result ? PARTITION_COLORS[getPartitionIndex(result, contact)] : ""
            }`}
            key={index}
            type="number"
            min={1}
            max={maxStudents}
            value={contact || ""}
            onInput={(event) => {
              if (event.target instanceof HTMLInputElement) {
                const value = parseInt(event.target.value);

                // remove contact
                if (!event.target.value) {
                  const newContacts = [...contacts];
                  newContacts.splice(index, 1);
                  onChange(newContacts);
                  return;
                }

                if (
                  !Number.isInteger(value) ||
                  value < parseInt(event.target.min) ||
                  value > parseInt(event.target.max)
                ) {
                  event.target.reportValidity();
                  return;
                }

                if (Number.isInteger(value) && value >= 0) {
                  const newContacts = [...contacts];
                  newContacts[index] = value;
                  onChange(newContacts);
                }
              }
            }}
          />
        ))}

        {numberOfInputs < maxStudents / 2 && (
          <button
            type="button"
            class="text-gray-300 hover:text-gray-500 focus:text-indigo-500 py-1 px-1 focus:outline-none mb-2"
            onClick={() => {
              setAdditionalInputs(
                (prevAdditionalInputs) => prevAdditionalInputs + 1
              );
              requestAnimationFrame(() => lastInputRef.current.focus());
            }}
          >
            <svg
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        )}
      </td>
    </tr>
  );
}
