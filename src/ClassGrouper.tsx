import { h, Fragment } from "preact";
import { useRef, useState } from "preact/hooks";
import {
  exampleClass,
  StudentInformation,
  partitionClass,
  FennelResult,
} from "./fennel";

/** Experimental highlight colors for the partitions */
const PARTITION_COLORS = [
  "text-green-500",
  "text-blue-500",
  "text-pink-500",
  "text-yellow-500",
  "text-purple-500",
];

function getPartitionIndex(result: FennelResult, id: number) {
  return result.partions.findIndex((partition) => partition.includes(id));
}

function Result({ result }: { result: FennelResult }) {
  return (
    <>
      {result.partions.map((group, index) => (
        <>
          <div class={`mt-3 font-bold ${PARTITION_COLORS[index]}`}>
            Gruppe {index + 1}
          </div>
          <div>{group.join(", ")}</div>
        </>
      ))}
    </>
  );
}

function Student({
  id,
  contacts,
  onChange,
  result,
}: {
  id: number;
  contacts: number[];
  onChange: (contacts: number[]) => void;
  result: FennelResult | null;
}) {
  const inputClasses =
    "w-12 mr-2 border rounded border-gray-300 py-1 text-center focus:ring-indigo-300 focus:border-indigo-300";
  const color =
    result !== null ? PARTITION_COLORS[getPartitionIndex(result, id)] : "";
  const [nextIsFocused, setNextIsFocused] = useState(false);
  const [hasNextValue, setHasNextValue] = useState(false);
  const nextInput = useRef<HTMLInputElement>();

  return (
    <tr>
      <td
        class={`px-6 py-2 whitespace-nowrap ${color}`}
        aria-label="Schüler ID"
      >
        {id}
      </td>
      <td class="px-6 py-2 whitespace-nowrap flex items-center">
        {contacts.map((contact, index) => (
          <input
            class={`${inputClasses} ${
              result ? PARTITION_COLORS[getPartitionIndex(result, contact)] : ""
            }`}
            key={index}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            min="0"
            value={contact}
            onBlur={(event) => {
              if (event.target instanceof HTMLInputElement) {
                const value = parseInt(event.target.value);
                if (Number.isInteger(value) && value >= 0) {
                  const newContacts = [...contacts];
                  newContacts[index] = value;
                  onChange(newContacts);
                }

                // remove contact
                if (!event.target.value) {
                  const newContacts = [...contacts];
                  newContacts.splice(index, 1);
                  onChange(newContacts);
                }
              }
            }}
          />
        ))}
        <input
          ref={nextInput}
          class={inputClasses}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          min="0"
          onInput={(event) => {
            if (event.target instanceof HTMLInputElement) {
              setHasNextValue(!!event.target.value);
            }
          }}
          onFocus={(event) => {
            // We display a dummy "next" input while the user is focused on this one,
            // so they can "tab" to it.
            setNextIsFocused(true);
            if (event.target instanceof HTMLInputElement) {
              setHasNextValue(!!event.target.value);
            }
          }}
          onBlur={(event) => {
            if (event.target instanceof HTMLInputElement) {
              const value = parseInt(event.target.value);
              if (Number.isInteger(value) && value >= 0) {
                onChange([...contacts, value]);
                event.target.value = "";
                // re-focus in the next tick
                requestAnimationFrame(() => {
                  if (nextInput.current) {
                    nextInput.current.focus();
                  }
                });
              }
            }
            setNextIsFocused(false);
          }}
        />
        {nextIsFocused && (
          <input
            class={`${inputClasses} pointer-events-none`}
            inputMode="numeric"
            pattern="\d*"
            min="0"
            tabIndex={hasNextValue ? 0 : -1}
          />
        )}
      </td>
    </tr>
  );
}

const initialData = [{ id: 1, contacts: [] }];

function ClassGrouper({
  result,
  setResult,
}: {
  result: FennelResult | null;
  setResult: (result: FennelResult | null) => void;
}) {
  const [numberOfGroups, setNumberOfGroups] = useState(2);
  const [data, setData] = useState<StudentInformation[]>(() =>
    Array.from({ length: 20 }, (v, index) => ({
      id: index + 1,
      contacts: [],
    }))
  );
  const allIds = data.map((student) => student.id);
  const isValid = data.every((student) => {
    return (
      typeof student.id === "number" &&
      student.contacts.every(
        (contact) => typeof contact === "number" && allIds.includes(contact)
      )
    );
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        console.time("running fennel");
        const result = partitionClass(data, { k: numberOfGroups });
        // Some example output
        console.log("Groups:");
        console.log(result.partions);
        console.log("Number of crossing contacts:");
        console.log(result.minCutSize);
        console.timeEnd("running fennel");
        setResult(result);
      }}
    >
      <div class="sticky top-0 flex justify-end items-center p-3 bg-white">
        <div class="flex">
          <button
            type="button"
            class="mr-4 sm:mr-8 text-red-600 hover:text-red-800"
            onClick={() => {
              setResult(null);
              setData(initialData);
            }}
          >
            Zurücksetzen
          </button>
          <button
            type="submit"
            class="flex items-center justify-center px-4 sm:px-8 py-3 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow disabled:opacity-50"
            disabled={!isValid}
          >
            Teilung berechnen
          </button>
        </div>
      </div>

      <div class="lg:flex">
        <div class="lg:w-1/3">
          <h3 class="font-bold mb-4">1. Klasse anlegen</h3>
          <label class="block mb-6">
            <div class="pr-2 text-sm font-medium text-gray-700">
              Wieviele Schüler sind in der Klasse?
            </div>
            <input
              class="w-20 mt-1 rounded border border-gray-300 focus:outline-none focus:ring-indigo-300 focus:border-indigo-300"
              type="number"
              value={data.length}
              min={2}
              max={40}
              onInput={(event) => {
                if (event.target instanceof HTMLInputElement) {
                  const newLength = parseInt(event.target.value);

                  if (newLength < data.length) {
                    setData(data.slice(0, newLength));
                  } else if (newLength > data.length) {
                    const newData = data.concat(
                      Array.from(
                        { length: newLength - data.length },
                        (v, index) => ({
                          id: data.length + index + 1,
                          contacts: [],
                        })
                      )
                    );
                    setData(newData);
                  }
                }
              }}
            ></input>
          </label>

          <label class="block mb-6">
            <div class="pr-2 text-sm font-medium text-gray-700">
              In wieviele Gruppen soll die Klasse geteilt werden?
            </div>
            <input
              class="w-20 mt-1 rounded border border-gray-300 focus:outline-none focus:ring-indigo-300 focus:border-indigo-300"
              type="number"
              value={numberOfGroups}
              min={2}
              onChange={(event) => {
                if (event.target instanceof HTMLInputElement) {
                  setNumberOfGroups(parseInt(event.target.value));
                }
              }}
            ></input>
          </label>

          <button
            type="button"
            class="mr-8 font-medium text-gray-500 hover:text-gray-700 text-sm"
            onClick={() => setData(exampleClass)}
          >
            Mit Beispieldaten ausprobieren
          </button>
        </div>

        <div class="mt-5 lg:mt-0 lg:ml-10 flex-grow lg:w-2/3">
          <h3 class="font-bold mb-4">2. Schüler eintragen</h3>
          <table class="table-fixed min-w-full divide-y divide-gray-200 shadow overflow-hidden border-b border-gray-200 rounded-md ">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Schüler
                </th>
                <th
                  scope="col"
                  class="w-5/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Kontakte
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {data.map((student, index) => (
                <Student
                  key={student.id}
                  id={student.id}
                  result={result}
                  contacts={student.contacts}
                  onChange={(contacts) => {
                    const newData = [...data];
                    newData[index] = {
                      ...newData[index],
                      contacts,
                    };
                    setData(newData);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );
}

export function ClassGrouperApp() {
  const [result, setResult] = useState<FennelResult | null>(null);

  return (
    <>
      <ClassGrouper setResult={setResult} result={result} />
      {result !== null && <Result result={result} />}
    </>
  );
}
