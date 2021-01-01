import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
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
    "w-12 mr-2 border rounded border-gray-200 px-1 py-1 text-center focus:outline-none focus:ring focus:border-indigo-300";
  const color =
    result !== null ? PARTITION_COLORS[getPartitionIndex(result, id)] : "";

  return (
    <tr>
      <td
        class={`px-6 py-2 whitespace-nowrap ${color}`}
        aria-label="Schüler ID"
      >
        {id}
      </td>
      <td class="px-6 py-2 whitespace-nowrap">
        {contacts.map((contact, index) => (
          <input
            class={`${inputClasses} ${
              result ? PARTITION_COLORS[getPartitionIndex(result, contact)] : ""
            }`}
            key={index}
            inputMode="numeric"
            pattern="\d*"
            min="0"
            value={contact}
            onChange={(event) => {
              if (event.target instanceof HTMLInputElement) {
                const newContacts = [...contacts];
                newContacts[index] = parseInt(event.target.value);
                onChange(newContacts);
              }
            }}
          />
        ))}
        <input
          class={inputClasses}
          key="next"
          inputMode="numeric"
          pattern="\d*"
          min="0"
          onBlur={(event) => {
            if (event.target instanceof HTMLInputElement) {
              const value = parseInt(event.target.value);
              if (Number.isInteger(value)) {
                onChange([...contacts, value]);
                event.target.value = "";
              }
            }
          }}
        />
      </td>
    </tr>
  );
}

const initialData = [{ id: 1, contacts: [] }];

function ClassGrouper({
  result,
  setResult,
  data,
  setData,
}: {
  result: FennelResult | null;
  setResult: (result: FennelResult | null) => void;
  data: StudentInformation[];
  setData: (data: StudentInformation[]) => void;
}) {
  const [numberOfGroups, setNumberOfGroups] = useState(2);
  const isValid = data.every(
    (student) =>
      typeof student.id === "number" &&
      student.contacts.every((contact) => typeof contact === "number")
  );

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
      <div class="sticky top-0 flex justify-between items-center p-3 bg-white">
        <div>
          <label>
            <span class="pr-2">Gruppen:</span>
            <input
              class="w-12"
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
        </div>
        <div class="flex">
          <button
            type="button"
            class="mr-8 hover:text-gray-500"
            onClick={() => setData(exampleClass)}
          >
            Beispieldaten laden
          </button>
          <button
            type="button"
            class="mr-8 text-red-600 hover:text-red-800"
            onClick={() => {
              setResult(null);
              setData(initialData);
            }}
          >
            Zurücksetzen
          </button>
          <button
            type="submit"
            class="flex items-center justify-center px-8 py-3 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow disabled:opacity-50"
            disabled={!isValid}
          >
            Teilung berechnen
          </button>
        </div>
      </div>

      <div class="shadow overflow-hidden border-b border-gray-200 rounded-md mt-2">
        <table class="table-fixed min-w-full divide-y divide-gray-200">
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
                key={index}
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
    </form>
  );
}

export function ClassGrouperApp() {
  const [result, setResult] = useState<FennelResult | null>(null);
  const [data, setData] = useState<StudentInformation[]>(initialData);

  return (
    <>
      <ClassGrouper
        data={data}
        setData={setData}
        setResult={setResult}
        result={result}
      />
      {result !== null && <Result result={result} />}
    </>
  );
}
